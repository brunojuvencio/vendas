/**
 * MBA Gestão Vendas T9 — Levantamento completo
 * Período: junho/2024 a maio/2025
 * Fontes: Google Ads + Meta Ads + Ploomes
 */

import { readFileSync, writeFileSync } from "fs";

// ── .env ──────────────────────────────────────────────────────────────────────
const env = {};
readFileSync(".env", "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const {
  GOOGLE_ADS_DEVELOPER_TOKEN: DEV_TOKEN,
  GOOGLE_ADS_CLIENT_ID: CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET: CLIENT_SECRET,
  GOOGLE_ADS_REFRESH_TOKEN: REFRESH_TOKEN,
  GOOGLE_ADS_CUSTOMER_ID: CUSTOMER_ID,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: LOGIN_CID,
  PLOOMES_API_KEY: PLOOMES_KEY,
  META_ACCESS_TOKEN: META_TOKEN,
  META_AD_ACCOUNT_ID: META_ACCOUNT,
} = env;

const DATE_START = "2024-06-01";
const DATE_END   = "2025-05-31";

const r2 = v => Math.round(Number(v || 0) * 100) / 100;
const n  = v => Number(v || 0);
const mu = v => r2(n(v) / 1_000_000);

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE ADS
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════");
console.log("  1. GOOGLE ADS");
console.log("══════════════════════════════════════");

const CID = CUSTOMER_ID.replace(/-/g, "");

// Obter access token
const tkRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
                              refresh_token: REFRESH_TOKEN, grant_type: "refresh_token" }),
});
const { access_token } = await tkRes.json();
if (!access_token) { console.error("❌ Token Google falhou"); process.exit(1); }
console.log("✅ Token Google OK");

const STREAM_URL = `https://googleads.googleapis.com/v20/customers/${CID}/googleAds:searchStream`;
const G_HEADERS = {
  Authorization:       `Bearer ${access_token}`,
  "developer-token":   DEV_TOKEN,
  "login-customer-id": LOGIN_CID,
  "Content-Type":      "application/json",
};

async function gaql(query) {
  const res = await fetch(STREAM_URL, { method: "POST", headers: G_HEADERS, body: JSON.stringify({ query }) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Google Ads API ${res.status}: ${text.slice(0, 500)}`);
  try {
    const chunks = JSON.parse(text);
    return chunks.flatMap(c => c.results || []);
  } catch { return []; }
}

// 1a. Buscar TODAS as campanhas no período (incluindo pausadas/removidas)
console.log(`\n⏳ Buscando campanhas Google (${DATE_START} → ${DATE_END})...`);
const campRows = await gaql(`
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.advertising_channel_type,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.ctr,
    metrics.average_cpc,
    metrics.conversions,
    metrics.cost_per_conversion
  FROM campaign
  WHERE segments.date BETWEEN '${DATE_START}' AND '${DATE_END}'
    AND metrics.impressions > 0
  ORDER BY metrics.cost_micros DESC
`);

const googleCampaigns = campRows.map(r => ({
  id:          r.campaign?.id,
  name:        r.campaign?.name,
  status:      r.campaign?.status,
  channel:     r.campaign?.advertisingChannelType,
  impressions: n(r.metrics?.impressions),
  clicks:      n(r.metrics?.clicks),
  cost:        mu(r.metrics?.costMicros),
  ctr:         r2(n(r.metrics?.ctr) * 100),
  avg_cpc:     mu(r.metrics?.averageCpc),
  conversions: r2(r.metrics?.conversions),
  cpl:         r2(n(r.metrics?.costPerConversion) / 1_000_000),
}));

console.log(`  Total campanhas com dados no período: ${googleCampaigns.length}`);
console.log("\n  Todas as campanhas Google no período:");
googleCampaigns.forEach(c => console.log(`    [${c.status}] ${c.name} | R$${c.cost} | clicks:${c.clicks} | convs:${c.conversions}`));

// Filtrar por "vendas"
const vendasGoogleCamps = googleCampaigns.filter(c =>
  c.name?.toLowerCase().includes("vend")
);
console.log(`\n  Campanhas com 'vend' no nome: ${vendasGoogleCamps.length}`);

// Totais Google (todos os dados do período)
const googleTotal = googleCampaigns.reduce((acc, c) => {
  acc.cost        += c.cost;
  acc.clicks      += c.clicks;
  acc.impressions += c.impressions;
  acc.conversions += c.conversions;
  return acc;
}, { cost: 0, clicks: 0, impressions: 0, conversions: 0 });
googleTotal.cpl = googleTotal.conversions > 0 ? r2(googleTotal.cost / googleTotal.conversions) : null;
googleTotal.avg_cpc = googleTotal.clicks > 0 ? r2(googleTotal.cost / googleTotal.clicks) : null;

// 1b. Palavras-chave no período
console.log("\n⏳ Buscando palavras-chave Google...");
let keywordRows = [];
try {
  keywordRows = await gaql(`
    SELECT
      campaign.name,
      ad_group.name,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM keyword_view
    WHERE segments.date BETWEEN '${DATE_START}' AND '${DATE_END}'
      AND metrics.impressions > 0
    ORDER BY metrics.cost_micros DESC
    LIMIT 200
  `);
} catch(e) { console.log("  Palavras-chave: " + e.message); }

const keywords = keywordRows.map(r => ({
  campaign:   r.campaign?.name,
  ad_group:   r.adGroup?.name,
  keyword:    r.adGroupCriterion?.keyword?.text,
  match_type: r.adGroupCriterion?.keyword?.matchType,
  impressions: n(r.metrics?.impressions),
  clicks:     n(r.metrics?.clicks),
  cost:       mu(r.metrics?.costMicros),
  conversions: r2(r.metrics?.conversions),
}));
console.log(`  ${keywords.length} palavras-chave encontradas`);

// 1c. Termos de busca
console.log("\n⏳ Buscando termos de busca...");
let searchTermRows = [];
try {
  searchTermRows = await gaql(`
    SELECT
      campaign.name,
      search_term_view.search_term,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM search_term_view
    WHERE segments.date BETWEEN '${DATE_START}' AND '${DATE_END}'
      AND metrics.clicks > 5
    ORDER BY metrics.cost_micros DESC
    LIMIT 100
  `);
} catch(e) { console.log("  Termos de busca: " + e.message); }

const searchTerms = searchTermRows.map(r => ({
  campaign:    r.campaign?.name,
  search_term: r.searchTermView?.searchTerm,
  impressions: n(r.metrics?.impressions),
  clicks:      n(r.metrics?.clicks),
  cost:        mu(r.metrics?.costMicros),
  conversions: r2(r.metrics?.conversions),
}));
console.log(`  ${searchTerms.length} termos de busca encontrados`);

// 1d. Evolução mensal
console.log("\n⏳ Buscando evolução mensal Google...");
let monthlyRows = [];
try {
  monthlyRows = await gaql(`
    SELECT
      segments.month,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${DATE_START}' AND '${DATE_END}'
      AND metrics.impressions > 0
    ORDER BY segments.month
  `);
} catch(e) { console.log("  Mensal: " + e.message); }

const monthlyGoogle = {};
monthlyRows.forEach(r => {
  const month = r.segments?.month;
  if (!monthlyGoogle[month]) monthlyGoogle[month] = { cost:0, clicks:0, impressions:0, conversions:0 };
  monthlyGoogle[month].cost        += mu(r.metrics?.costMicros);
  monthlyGoogle[month].clicks      += n(r.metrics?.clicks);
  monthlyGoogle[month].impressions += n(r.metrics?.impressions);
  monthlyGoogle[month].conversions += r2(r.metrics?.conversions);
});

// ═══════════════════════════════════════════════════════════════════════════════
// META ADS
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════");
console.log("  2. META ADS");
console.log("══════════════════════════════════════");

const META_BASE = "https://graph.facebook.com/v20.0";

async function metaFetchAll(url) {
  const rows = [];
  let next = url;
  let page = 0;
  while (next) {
    page++;
    const res = await fetch(next);
    const data = await res.json();
    if (data.error) { console.error("Meta API error:", data.error.message); break; }
    (data.data || []).forEach(r => rows.push(r));
    next = data.paging?.next || null;
    if (page > 30) break;
  }
  return rows;
}

function getAction(arr = [], type) {
  return n(arr.find(a => a.action_type === type)?.value);
}

// 2a. Insights por campanha — período específico
console.log(`\n⏳ Buscando insights Meta (${DATE_START} → ${DATE_END})...`);
const metaFields = [
  "campaign_name","campaign_id","spend","impressions","clicks","cpm","cpc","ctr",
  "actions","cost_per_action_type","frequency","reach"
].join(",");

const metaInsightUrl = `${META_BASE}/act_${META_ACCOUNT}/insights`
  + `?level=campaign`
  + `&time_range=${encodeURIComponent(JSON.stringify({ since: DATE_START, until: DATE_END }))}`
  + `&fields=${encodeURIComponent(metaFields)}`
  + `&limit=100`
  + `&access_token=${META_TOKEN}`;

const metaInsights = await metaFetchAll(metaInsightUrl);
console.log(`  ${metaInsights.length} campanhas com dados no período`);

const metaCampaigns = metaInsights.map(row => {
  const actions = row.actions || [];
  const leads = getAction(actions, "lead")
    || getAction(actions, "onsite_conversion.lead_grouped")
    || getAction(actions, "offsite_conversion.fb_pixel_lead");
  const purchases = getAction(actions, "purchase") || getAction(actions, "offsite_conversion.fb_pixel_purchase");
  const lpViews = getAction(actions, "landing_page_view");
  const spend = n(row.spend);
  return {
    campaign_id:   row.campaign_id,
    campaign_name: row.campaign_name,
    spend:         r2(spend),
    impressions:   n(row.impressions),
    clicks:        n(row.clicks),
    reach:         n(row.reach),
    cpm:           r2(row.cpm),
    cpc:           r2(row.cpc),
    ctr:           r2(row.ctr),
    frequency:     r2(row.frequency),
    leads,
    purchases,
    lp_views:      lpViews,
    cpl:           leads > 0 ? r2(spend / leads) : null,
    cpa:           purchases > 0 ? r2(spend / purchases) : null,
    all_actions:   actions,
  };
}).sort((a, b) => b.spend - a.spend);

const vendasMetaCamps = metaCampaigns.filter(c =>
  c.campaign_name?.toLowerCase().includes("vend")
);
console.log(`  Campanhas com 'vend' no nome: ${vendasMetaCamps.length}`);
console.log("\n  Todas as campanhas Meta no período:");
metaCampaigns.forEach(c => console.log(`    ${c.campaign_name} | R$${c.spend} | leads:${c.leads} | CPL:${c.cpl}`));

// Meta total
const metaTotal = metaCampaigns.reduce((acc, c) => {
  acc.spend       += c.spend;
  acc.leads       += c.leads;
  acc.purchases   += c.purchases;
  acc.clicks      += c.clicks;
  acc.impressions += c.impressions;
  return acc;
}, { spend:0, leads:0, purchases:0, clicks:0, impressions:0 });
metaTotal.cpl = metaTotal.leads > 0 ? r2(metaTotal.spend / metaTotal.leads) : null;

// 2b. Evolução mensal Meta
console.log("\n⏳ Buscando evolução mensal Meta...");
const metaMonthlyUrl = `${META_BASE}/act_${META_ACCOUNT}/insights`
  + `?level=campaign`
  + `&time_range=${encodeURIComponent(JSON.stringify({ since: DATE_START, until: DATE_END }))}`
  + `&time_increment=monthly`
  + `&fields=${encodeURIComponent("campaign_name,spend,impressions,clicks,actions")}`
  + `&limit=200`
  + `&access_token=${META_TOKEN}`;

const metaMonthlyRaw = await metaFetchAll(metaMonthlyUrl);
const metaMonthly = {};
metaMonthlyRaw.forEach(r => {
  const period = r.date_start?.substring(0,7) || "unknown";
  if (!metaMonthly[period]) metaMonthly[period] = { spend:0, leads:0, clicks:0, impressions:0 };
  const actions = r.actions || [];
  const leads = getAction(actions, "lead") || getAction(actions, "onsite_conversion.lead_grouped");
  metaMonthly[period].spend       += n(r.spend);
  metaMonthly[period].leads       += leads;
  metaMonthly[period].clicks      += n(r.clicks);
  metaMonthly[period].impressions += n(r.impressions);
});

// ═══════════════════════════════════════════════════════════════════════════════
// PLOOMES — Leads por Vendas T9
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══════════════════════════════════════");
console.log("  3. PLOOMES");
console.log("══════════════════════════════════════");

const PL_HEADERS = { "User-Key": PLOOMES_KEY, "Accept": "application/json" };
const PL_BASE = "https://api2.ploomes.com";

async function ploomesGet(path) {
  const res = await fetch(`${PL_BASE}${path}`, { headers: PL_HEADERS });
  const text = await res.text();
  if (!res.ok) return { error: res.status, body: text };
  try { return JSON.parse(text); } catch { return { error: "parse", body: text }; }
}

// Buscar deals com "vendas" no título, no período
console.log(`\n⏳ Buscando deals Ploomes com 'vendas' (${DATE_START} → ${DATE_END})...`);

// OData filter: título contém vendas E criado no período
const plFilter = `CreatedAt ge ${DATE_START}T00:00:00Z and CreatedAt le ${DATE_END}T23:59:59Z`;
const plFilterVendas = `contains(tolower(Title),'vend') and ${plFilter}`;

let plDealsVendas = [];
let plNextVendas = `${PL_BASE}/Deals?$top=200&$select=Id,Title,StageId,StatusId,CreatedAt,Amount&$filter=${encodeURIComponent(plFilterVendas)}&$orderby=CreatedAt asc`;

let plPage = 0;
while (plNextVendas && plPage < 20) {
  plPage++;
  const res = await fetch(plNextVendas, { headers: PL_HEADERS });
  const text = await res.text();
  if (!res.ok) { console.log(`  Ploomes erro: ${res.status}`); break; }
  const data = JSON.parse(text);
  (data.value || []).forEach(d => plDealsVendas.push(d));
  plNextVendas = data["@odata.nextLink"] || null;
}

console.log(`  Deals com 'vendas' no período: ${plDealsVendas.length}`);

// Também buscar todos os deals do período para ter total
console.log("\n⏳ Buscando todos os deals Ploomes no período...");
let plDealsAll = [];
let plNextAll = `${PL_BASE}/Deals?$top=200&$select=Id,Title,StageId,StatusId,CreatedAt,Amount&$filter=${encodeURIComponent(plFilter)}&$orderby=CreatedAt asc`;

let plPage2 = 0;
while (plNextAll && plPage2 < 30) {
  plPage2++;
  const res = await fetch(plNextAll, { headers: PL_HEADERS });
  const text = await res.text();
  if (!res.ok) { console.log(`  Ploomes erro: ${res.status}`); break; }
  const data = JSON.parse(text);
  (data.value || []).forEach(d => plDealsAll.push(d));
  plNextAll = data["@odata.nextLink"] || null;
}

console.log(`  Total deals no período: ${plDealsAll.length}`);

// Agrupar vendas por status
const plStatusMap = { 1: "Aberto", 2: "Ganho", 3: "Perdido" };
const vendasByStatus = { total:0, open:0, won:0, lost:0, amount:0 };
plDealsVendas.forEach(d => {
  vendasByStatus.total++;
  if (d.StatusId === 2) { vendasByStatus.won++; vendasByStatus.amount += (d.Amount || 0); }
  else if (d.StatusId === 3) vendasByStatus.lost++;
  else vendasByStatus.open++;
});

// Evolução mensal Ploomes
const plMonthly = {};
plDealsVendas.forEach(d => {
  const m = d.CreatedAt?.substring(0,7) || "unknown";
  if (!plMonthly[m]) plMonthly[m] = { total:0, won:0, lost:0, open:0 };
  plMonthly[m].total++;
  if (d.StatusId === 2) plMonthly[m].won++;
  else if (d.StatusId === 3) plMonthly[m].lost++;
  else plMonthly[m].open++;
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONSOLIDAR & SALVAR
// ═══════════════════════════════════════════════════════════════════════════════
const result = {
  meta: {
    curso: "MBA Gestão Vendas T9",
    periodo: `${DATE_START} a ${DATE_END}`,
    geradoEm: new Date().toISOString(),
  },

  // I. VISÃO GERAL
  visaoGeral: {
    investimentoTotal: {
      google: googleTotal.cost,
      meta:   metaTotal.spend,
      linkedin: null,
      total:  r2(googleTotal.cost + metaTotal.spend),
      nota: "LinkedIn: preencher manualmente",
    },
    leadsGerados: {
      google:   googleTotal.conversions,
      meta:     metaTotal.leads,
      ploomes:  vendasByStatus.total,
      linkedin: null,
      nota: "LinkedIn: preencher manualmente",
    },
    cplGeral: {
      google: googleTotal.cpl,
      meta:   metaTotal.cpl,
      combinado: r2((googleTotal.cost + metaTotal.spend) / (googleTotal.conversions + metaTotal.leads || 1)),
    },
    periodo: `${DATE_START} a ${DATE_END}`,
  },

  // II. PERFORMANCE POR CANAL
  performancePorCanal: {
    google: {
      investimento:  googleTotal.cost,
      cliques:       googleTotal.clicks,
      cpc:           googleTotal.avg_cpc,
      leads:         googleTotal.conversions,
      cpl:           googleTotal.cpl,
      campanhas:     googleCampaigns,
    },
    meta: {
      investimento:  metaTotal.spend,
      cliques:       metaTotal.clicks,
      cpc:           metaCampaigns.length > 0 ? r2(metaTotal.spend / metaTotal.clicks) : null,
      leads:         metaTotal.leads,
      cpl:           metaTotal.cpl,
      campanhas:     metaCampaigns,
    },
    linkedin: {
      nota: "Dados LinkedIn não disponíveis via API — preencher manualmente",
      investimento: null, cliques: null, cpc: null, leads: null, cpl: null,
    },
  },

  // III. TAXAS DE CONVERSÃO
  taxasConversao: {
    google: {
      ctr_medio: googleCampaigns.length > 0
        ? r2(googleCampaigns.reduce((s,c) => s + c.ctr, 0) / googleCampaigns.length)
        : null,
      cvr_clique_lead: googleTotal.clicks > 0
        ? r2((googleTotal.conversions / googleTotal.clicks) * 100)
        : null,
    },
    meta: {
      ctr_medio: metaCampaigns.length > 0
        ? r2(metaCampaigns.reduce((s,c) => s + n(c.ctr), 0) / metaCampaigns.length)
        : null,
      cvr_clique_lead: metaTotal.clicks > 0
        ? r2((metaTotal.leads / metaTotal.clicks) * 100)
        : null,
      lp_views_total: metaCampaigns.reduce((s,c) => s + c.lp_views, 0),
    },
    landingPages: {
      nota: "Métricas de landing page (taxa de saída, tempo na página, etc) não disponíveis via API — preencher com dados do Google Analytics/RD Station",
    },
  },

  // IV. CRIATIVOS E SEGMENTAÇÕES
  criativosSegmentacoes: {
    nota: "Breakdown por criativo/adset não incluído nesta versão — requer query por ad/adset. Campanhas ranqueadas por spend abaixo.",
    topCampanhasMeta: metaCampaigns.slice(0, 10),
    topCampanhasGoogle: googleCampaigns.slice(0, 10),
  },

  // V. PALAVRAS-CHAVE E TERMOS DE BUSCA
  palavrasChave: {
    keywords:    keywords,
    searchTerms: searchTerms,
  },

  // VI. LEADS POR CANAL X MATRÍCULAS
  leadsPorCanalMatriculas: {
    leadsMeta:    metaTotal.leads,
    leadsGoogle:  googleTotal.conversions,
    leadsPloomes: vendasByStatus.total,
    matriculas:   vendasByStatus.won,
    taxaConversaoLeadMatricula: vendasByStatus.total > 0
      ? r2((vendasByStatus.won / vendasByStatus.total) * 100)
      : null,
    notaLinkedin: "Leads LinkedIn: preencher manualmente",
    ploomesDetalhe: vendasByStatus,
  },

  // VII. EVOLUÇÃO TEMPORAL
  evolucaoTemporal: {
    google:  monthlyGoogle,
    meta:    metaMonthly,
    ploomes: plMonthly,
  },

  // Dados brutos para referência
  raw: {
    ploomesDealsVendas: plDealsVendas.slice(0, 50),
    allGoogleCampaigns: googleCampaigns,
    allMetaCampaigns:   metaCampaigns,
  },
};

writeFileSync("vendas_t9_data.json", JSON.stringify(result, null, 2));
console.log("\n✅ vendas_t9_data.json salvo");

// ─── Resumo no terminal ───────────────────────────────────────────────────────
console.log("\n╔══════════════════════════════════════════════════════════════╗");
console.log("  MBA GESTÃO VENDAS T9 — RESUMO EXECUTIVO");
console.log(`  Período: ${DATE_START} → ${DATE_END}`);
console.log("╚══════════════════════════════════════════════════════════════╝");

console.log("\n── I. VISÃO GERAL ──────────────────────────────────────────────");
console.log(`  Google Ads: R$${r2(googleTotal.cost).toFixed(2)} investido | ${googleTotal.conversions} leads | CPL R$${googleTotal.cpl || "—"}`);
console.log(`  Meta Ads:   R$${r2(metaTotal.spend).toFixed(2)} investido | ${metaTotal.leads} leads | CPL R$${metaTotal.cpl || "—"}`);
console.log(`  LinkedIn:   [PREENCHER MANUALMENTE]`);
console.log(`  TOTAL:      R$${r2(googleTotal.cost + metaTotal.spend).toFixed(2)} (sem LinkedIn)`);

console.log("\n── II. PERFORMANCE POR CANAL ───────────────────────────────────");
console.log(`  Google | Invest: R$${r2(googleTotal.cost).toFixed(2)} | Clicks: ${googleTotal.clicks} | CPC: R$${googleTotal.avg_cpc} | Leads: ${googleTotal.conversions} | CPL: R$${googleTotal.cpl || "—"}`);
console.log(`  Meta   | Invest: R$${r2(metaTotal.spend).toFixed(2)} | Clicks: ${metaTotal.clicks} | CPC: R$${metaTotal.clicks>0?r2(metaTotal.spend/metaTotal.clicks):"—"} | Leads: ${metaTotal.leads} | CPL: R$${metaTotal.cpl || "—"}`);
console.log(`  LinkedIn: [PREENCHER MANUALMENTE]`);

console.log("\n── III. TAXAS DE CONVERSÃO ─────────────────────────────────────");
const gCvr = googleTotal.clicks > 0 ? r2((googleTotal.conversions/googleTotal.clicks)*100) : "—";
const mCvr = metaTotal.clicks > 0 ? r2((metaTotal.leads/metaTotal.clicks)*100) : "—";
console.log(`  Google: CTR médio nos anúncios, CVR clique→lead: ${gCvr}%`);
console.log(`  Meta:   CVR clique→lead: ${mCvr}%`);
console.log(`  Landing Pages: [PREENCHER COM ANALYTICS]`);

console.log("\n── IV. CAMPANHAS POR CANAL ─────────────────────────────────────");
console.log(`  Google: ${googleCampaigns.length} campanhas encontradas no período`);
if (vendasGoogleCamps.length > 0) {
  console.log("  Campanhas Google com 'vend' no nome:");
  vendasGoogleCamps.forEach(c => console.log(`    → ${c.name} | R$${c.cost} | ${c.conversions} leads`));
} else {
  console.log("  ⚠️  Nenhuma campanha Google com 'vend' no nome — verificar nomenclatura");
}
console.log(`\n  Meta: ${metaCampaigns.length} campanhas encontradas no período`);
if (vendasMetaCamps.length > 0) {
  console.log("  Campanhas Meta com 'vend' no nome:");
  vendasMetaCamps.forEach(c => console.log(`    → ${c.campaign_name} | R$${c.spend} | ${c.leads} leads`));
} else {
  console.log("  ⚠️  Nenhuma campanha Meta com 'vend' no nome — verificar nomenclatura");
}

console.log("\n── V. PALAVRAS-CHAVE GOOGLE ────────────────────────────────────");
if (keywords.length > 0) {
  console.log(`  Top 10 palavras-chave por investimento:`);
  keywords.slice(0, 10).forEach(k =>
    console.log(`    "${k.keyword}" [${k.match_type}] | R$${k.cost} | ${k.clicks} clicks | ${k.conversions} convs`)
  );
} else {
  console.log("  Nenhuma palavra-chave encontrada no período");
}

console.log("\n── VI. LEADS x MATRÍCULAS (PLOOMES) ───────────────────────────");
console.log(`  Deals 'vendas' no Ploomes: ${vendasByStatus.total}`);
console.log(`  Matrículas (Ganhos):       ${vendasByStatus.won}`);
console.log(`  Perdidos:                  ${vendasByStatus.lost}`);
console.log(`  Em aberto:                 ${vendasByStatus.open}`);
console.log(`  Taxa lead→matrícula:       ${vendasByStatus.total>0 ? r2((vendasByStatus.won/vendasByStatus.total)*100)+"%" : "—"}`);

console.log("\n── VII. EVOLUÇÃO MENSAL ────────────────────────────────────────");
const allMonths = new Set([
  ...Object.keys(monthlyGoogle),
  ...Object.keys(metaMonthly),
  ...Object.keys(plMonthly),
]);
[...allMonths].sort().forEach(m => {
  const g = monthlyGoogle[m] || {};
  const me = metaMonthly[m] || {};
  const pl = plMonthly[m] || {};
  console.log(`  ${m} | Google: R$${r2(g.cost||0).toFixed(0)} (${g.conversions||0} leads) | Meta: R$${r2(me.spend||0).toFixed(0)} (${me.leads||0} leads) | Ploomes: ${pl.total||0} deals (${pl.won||0} ganhos)`);
});

console.log("\n✅ Análise concluída. Arquivo: vendas_t9_data.json");
