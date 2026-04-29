/**
 * Busca criativos (vídeos + imagens) das campanhas VENDAS T9 no Meta Ads
 */
import { readFileSync, writeFileSync } from "fs";

const env = {};
readFileSync(".env", "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const TOKEN     = env.META_ACCESS_TOKEN;
const ACCOUNT   = env.META_AD_ACCOUNT_ID;
const BASE      = "https://graph.facebook.com/v20.0";
const H         = { "Content-Type": "application/json" };

async function api(path) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}access_token=${TOKEN}`;
  const r = await fetch(url, { headers: H });
  return r.json();
}

// 1. Buscar campanhas VENDAS (sem ESTVEND)
console.log("⏳ Buscando campanhas VENDAS T9...");
const campRes = await api(
  `/act_${ACCOUNT}/campaigns?fields=id,name,status&limit=200`
);

const campaigns = (campRes.data || []).filter(c => {
  const n = c.name.toLowerCase();
  return n.includes("vend") && !n.includes("estvend");
});
console.log(`  ${campaigns.length} campanhas VENDAS encontradas`);
campaigns.forEach(c => console.log(`  [${c.status}] ${c.name}`));

// 2. Buscar ads de cada campanha
console.log("\n⏳ Buscando ads e criativos...");
const allAds = [];

for (const camp of campaigns) {
  const adsRes = await api(
    `/act_${ACCOUNT}/ads?fields=id,name,status,creative{id,name,video_id,thumbnail_url,image_url,object_story_spec,call_to_action_type}&filtering=[{"field":"campaign.id","operator":"EQUAL","value":"${camp.id}"}]&limit=50`
  );
  const ads = adsRes.data || [];
  for (const ad of ads) {
    allAds.push({ ...ad, campaign_name: camp.name, campaign_id: camp.id });
  }
}

console.log(`  Total de ads: ${allAds.length}`);

// 3. Para ads com video_id, buscar URL do vídeo
console.log("\n⏳ Buscando URLs de vídeos...");
const videoCache = {};

for (const ad of allAds) {
  const vid = ad.creative?.video_id;
  if (vid && !videoCache[vid]) {
    const vRes = await api(`/${vid}?fields=source,thumbnails,description,title,length`);
    videoCache[vid] = {
      id: vid,
      source: vRes.source || null,
      thumbnail: vRes.thumbnails?.data?.[0]?.uri || ad.creative?.thumbnail_url || null,
      title: vRes.title || ad.name,
      length: vRes.length || null,
    };
    console.log(`  Vídeo ${vid}: ${vRes.source ? "✅ URL obtida" : "⚠ sem source"}`);
  }
}

// 4. Montar resultado final
const criativos = allAds.map(ad => {
  const cr = ad.creative || {};
  const vid = cr.video_id;
  const videoInfo = vid ? videoCache[vid] : null;

  return {
    ad_id:         ad.id,
    ad_name:       ad.name,
    ad_status:     ad.status,
    campaign_name: ad.campaign_name,
    creative_id:   cr.id,
    tipo:          vid ? "video" : "imagem",
    video_id:      vid || null,
    video_url:     videoInfo?.source || null,
    thumbnail_url: videoInfo?.thumbnail || cr.thumbnail_url || cr.image_url || null,
    video_title:   videoInfo?.title || null,
    video_length:  videoInfo?.length || null,
    cta:           ad.creative?.call_to_action_type || null,
  };
});

const videoAds  = criativos.filter(c => c.tipo === "video");
const imagemAds = criativos.filter(c => c.tipo === "imagem");

console.log(`\n📊 Resumo:`);
console.log(`  Vídeos:  ${videoAds.length}`);
console.log(`  Imagens: ${imagemAds.length}`);
console.log(`  Com URL de vídeo: ${criativos.filter(c => c.video_url).length}`);

// 5. Salvar
writeFileSync("meta_criativos_t9.json", JSON.stringify(criativos, null, 2));
console.log("\n✅ meta_criativos_t9.json salvo");

// 6. Mostrar preview dos vídeos com URL
const comUrl = criativos.filter(c => c.video_url);
if (comUrl.length > 0) {
  console.log("\n🎬 Vídeos com URL disponível:");
  comUrl.forEach(c => {
    console.log(`\n  [${c.campaign_name}]`);
    console.log(`  Ad: ${c.ad_name}`);
    console.log(`  URL: ${c.video_url}`);
    console.log(`  Thumb: ${c.thumbnail_url}`);
  });
}
