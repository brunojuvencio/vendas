/**
 * Busca métricas reais dos anúncios de imagem Meta Ads
 * e tenta obter imagens em maior resolução
 */
import { readFileSync, writeFileSync } from "fs";

const env = {};
readFileSync(".env", "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const TOKEN = env.META_ACCESS_TOKEN;
const BASE  = "https://graph.facebook.com/v20.0";

async function api(path) {
  const sep = path.includes("?") ? "&" : "?";
  const r = await fetch(`${BASE}${path}${sep}access_token=${TOKEN}`);
  return r.json();
}

const d = JSON.parse(readFileSync("meta_criativos_hd.json", "utf8"));

console.log("⏳ Buscando métricas e imagens HD...\n");

for (const img of d.images) {
  // Métricas do ad (período máximo da campanha)
  const ins = await api(
    `/${img.ad_id}/insights?fields=spend,impressions,clicks,actions,cost_per_action_type&date_preset=maximum&level=ad`
  );

  const data = ins.data?.[0] || {};
  const actions = data.actions || [];
  const leads = actions.find(a => a.action_type === "lead")?.value
    || actions.find(a => a.action_type === "offsite_conversion.fb_pixel_lead")?.value
    || actions.find(a => a.action_type === "onsite_conversion.lead_grouped")?.value
    || "—";

  const spend = data.spend ? `R$ ${parseFloat(data.spend).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";
  const impressions = data.impressions ? parseInt(data.impressions).toLocaleString("pt-BR") : "—";
  const clicks = data.clicks || "—";
  const cpl = (data.spend && leads !== "—")
    ? `R$ ${(parseFloat(data.spend) / parseInt(leads)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : "—";
  const ctr = data.clicks && data.impressions
    ? `${((data.clicks / data.impressions) * 100).toFixed(2)}%`
    : "—";

  img.metricas = { spend, impressions, clicks, leads, cpl, ctr };

  // Tentar imagem em maior resolução via creative
  const cr = await api(`/${img.creative_id}?fields=image_url,thumbnail_url`);
  if (cr.image_url) img.thumbnail_url = cr.image_url;

  console.log(`🖼  ${img.ad_name.substring(0, 45)}`);
  console.log(`    Investimento: ${spend} | Leads: ${leads} | CPL: ${cpl} | CTR: ${ctr}`);
  const thumb = img.thumbnail_url || "";
  console.log(`    Thumb: ${thumb ? thumb.substring(0, 80) + "..." : "❌"}`);
}

writeFileSync("meta_criativos_hd.json", JSON.stringify(d, null, 2));
console.log("\n✅ meta_criativos_hd.json atualizado com métricas");
