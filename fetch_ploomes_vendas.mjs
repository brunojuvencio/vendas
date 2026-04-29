/**
 * Ploomes — MBA Gestão Vendas T9
 * Pagina manualmente com $skip pois o Ploomes não retorna nextLink em queries filtradas
 */
import { readFileSync, writeFileSync } from "fs";

const env = {};
readFileSync(".env", "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const KEY  = env["PLOOMES_API_KEY"];
const H    = { "User-Key": KEY, "Accept": "application/json" };
const BASE = "https://api2.ploomes.com";

const DATE_START = "2024-06-01T00:00:00Z";
const DATE_END   = new Date("2025-05-31T23:59:59Z");
const PAGE_SIZE  = 300;

// Keywords que identificam MBA Gestão Vendas
const VENDAS_KW = ["vend", "estvend", "gestão de vendas", "gestao de vendas", "mba vendas"];

function isVendas(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  return VENDAS_KW.some(k => t.includes(k));
}

// Paginar manualmente com $skip
console.log(`⏳ Buscando todos os deals a partir de Jun/2024 (com $skip)...`);
let allDeals = [];
let skip = 0;
let hasMore = true;

while (hasMore) {
  const url = `${BASE}/Deals?$filter=CreateDate ge ${DATE_START}&$orderby=CreateDate asc&$select=Id,Title,StageId,StatusId,CreateDate,Amount&$top=${PAGE_SIZE}&$skip=${skip}`;
  const r = await fetch(url, { headers: H });
  if (!r.ok) {
    const body = await r.text();
    console.log(`  Erro ${r.status} no skip=${skip}: ${body.slice(0, 150)}`);
    break;
  }
  const data = await r.json();
  const batch = data.value || [];
  allDeals.push(...batch);

  if (skip % (PAGE_SIZE * 5) === 0) {
    const last = batch[batch.length - 1];
    console.log(`  skip=${skip}: ${allDeals.length} deals | Último: ${last?.CreateDate?.slice(0,10)} | "${last?.Title?.slice(0,40)}"`);
  }

  if (batch.length < PAGE_SIZE) {
    hasMore = false;
  } else {
    // Verificar se a data do último deal ainda está no período de interesse
    const lastDate = new Date(batch[batch.length - 1].CreateDate);
    if (lastDate > DATE_END) {
      hasMore = false;
    } else {
      skip += PAGE_SIZE;
    }
  }
}

console.log(`\n✅ Total bruto a partir de Jun/24: ${allDeals.length} deals`);

// Filtrar por período de interesse
const periodDeals = allDeals.filter(d => new Date(d.CreateDate) <= DATE_END);
console.log(`📅 Deals no período (Jun/24 - Mai/25): ${periodDeals.length}`);

// Mostrar distribuição de cursos para entender o pipeline
const courseFreq = {};
periodDeals.forEach(d => {
  if (!d.Title) return;
  const match = d.Title.match(/- ([A-Z]+[A-Z0-9]*) -/);
  const code = match?.[1] || "OUTRO";
  courseFreq[code] = (courseFreq[code] || 0) + 1;
});
console.log("\n📊 Distribuição de cursos no período:");
Object.entries(courseFreq).sort((a,b)=>b[1]-a[1]).slice(0,20).forEach(([c,n]) => {
  console.log(`  ${c}: ${n} deals`);
});

// Filtrar por "vendas"
const vendasDeals = periodDeals.filter(d => isVendas(d.Title));
console.log(`\n🎯 Deals Vendas no período: ${vendasDeals.length}`);

// Títulos únicos
const vendasTitles = [...new Set(vendasDeals.map(d => d.Title?.slice(0, 80)))];
console.log(`\nTítulos Vendas (${vendasTitles.length} únicos):`);
vendasTitles.slice(0, 30).forEach(t => console.log(`  "${t}"`));

// Estatísticas
const byStatus = { total: 0, open: 0, won: 0, lost: 0, amount: 0 };
const byMonth = {};
const byStage = {};

vendasDeals.forEach(d => {
  byStatus.total++;
  if (d.StatusId === 2) { byStatus.won++; byStatus.amount += (d.Amount || 0); }
  else if (d.StatusId === 3) byStatus.lost++;
  else byStatus.open++;

  const m = d.CreateDate?.slice(0, 7) || "unknown";
  if (!byMonth[m]) byMonth[m] = { total: 0, won: 0, lost: 0, open: 0, amount: 0 };
  byMonth[m].total++;
  if (d.StatusId === 2) { byMonth[m].won++; byMonth[m].amount += (d.Amount || 0); }
  else if (d.StatusId === 3) byMonth[m].lost++;
  else byMonth[m].open++;

  byStage[d.StageId] = (byStage[d.StageId] || 0) + 1;
});

console.log("\n── FUNIL MBA GESTÃO VENDAS T9 ──────────────────────────────────");
console.log(`  Total leads/deals:   ${byStatus.total}`);
console.log(`  Matrículas (Ganhos): ${byStatus.won}`);
console.log(`  Perdidos:            ${byStatus.lost}`);
console.log(`  Em aberto:           ${byStatus.open}`);
console.log(`  Volume matriculados: R$${byStatus.amount.toFixed(2)}`);
const cvr = byStatus.total > 0 ? ((byStatus.won / byStatus.total) * 100).toFixed(1) : "—";
console.log(`  Taxa lead→matrícula: ${cvr}%`);

console.log("\n── EVOLUÇÃO MENSAL ─────────────────────────────────────────────");
Object.entries(byMonth).sort().forEach(([m, s]) => {
  const pct = s.total > 0 ? ((s.won / s.total) * 100).toFixed(1) : "0.0";
  console.log(`  ${m} | Leads:${s.total} | Ganhos:${s.won}(${pct}%) | Perdidos:${s.lost} | Abertos:${s.open}`);
});

// Salvar
const out = {
  fetchedAt: new Date().toISOString(),
  periodo: "2024-06-01 a 2025-05-31",
  totalFetched: allDeals.length,
  periodDeals: periodDeals.length,
  vendasDeals: vendasDeals.length,
  courseFreq,
  byStatus,
  byMonth,
  byStage,
  deals: vendasDeals,
};

writeFileSync("ploomes_vendas_t9.json", JSON.stringify(out, null, 2));
console.log("\n✅ ploomes_vendas_t9.json salvo");
