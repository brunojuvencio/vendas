/**
 * Busca thumbnails em resolução maior para vídeos e imagens Meta Ads VENDAS T9
 */
import { readFileSync, writeFileSync } from "fs";

const env = {};
readFileSync(".env", "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const TOKEN   = env.META_ACCESS_TOKEN;
const ACCOUNT = env.META_AD_ACCOUNT_ID;
const BASE    = "https://graph.facebook.com/v20.0";

async function api(path) {
  const sep = path.includes("?") ? "&" : "?";
  const r = await fetch(`${BASE}${path}${sep}access_token=${TOKEN}`);
  return r.json();
}

// Pegar criativos existentes
const prev = JSON.parse(readFileSync("meta_criativos_completo.json", "utf8"));

console.log("⏳ Buscando thumbnails HD...\n");

const result = { videos: [], images: [] };

// ── VÍDEOS: thumbnail via creative com tamanho maior ─────────────────────
for (const v of prev.videos) {
  const r = await api(`/${v.creative_id}?fields=id,name,thumbnail_url,video_id,effective_object_story_id&thumbnail_width=560&thumbnail_height=315`);

  // Tentar também via video picture
  const vr = await api(`/${v.video_id}?fields=picture,thumbnails{uri,width,height}`);

  // Escolher melhor thumbnail disponível
  const thumb = vr.picture
    || vr.thumbnails?.data?.sort((a,b) => b.width - a.width)[0]?.uri
    || r.thumbnail_url
    || null;

  const [pageId, postId] = (v.effective_object_story_id || "_").split("_");

  result.videos.push({
    ...v,
    thumbnail_url: thumb,
    facebook_embed_url: `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F${pageId}%2Fvideos%2F${postId}&width=560&show_text=false`,
    facebook_link: `https://www.facebook.com/${pageId}/videos/${postId}`,
  });

  console.log(`✅ ${v.ad_name}`);
  console.log(`   thumb: ${thumb ? thumb.substring(0, 80) + "..." : "❌ nenhuma"}`);
}

// ── IMAGENS: buscar image_url de tamanho maior ───────────────────────────
for (const img of prev.images) {
  const r = await api(`/${img.creative_id}?fields=id,name,image_url,thumbnail_url,image_hash`);

  // image_url dá a imagem em tamanho original
  const thumb = r.image_url || r.thumbnail_url || img.thumbnail_url || null;

  result.images.push({ ...img, thumbnail_url: thumb, metricas: img.metricas });
  console.log(`🖼 ${img.ad_name}`);
  console.log(`   thumb: ${thumb ? thumb.substring(0, 80) + "..." : "❌ nenhuma"}`);
}

writeFileSync("meta_criativos_hd.json", JSON.stringify(result, null, 2));
console.log("\n✅ meta_criativos_hd.json salvo");
