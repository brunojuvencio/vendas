import { readFileSync, writeFileSync } from "fs";

const env = {};
readFileSync(".env", "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const TOKEN = env.META_ACCESS_TOKEN;
const data  = JSON.parse(readFileSync("meta_criativos_t9.json", "utf8"));
const videos = data.filter(c => c.tipo === "video");

console.log("⏳ Buscando effective_object_story_id para vídeos...");

for (const v of videos) {
  const r = await fetch(
    `https://graph.facebook.com/v20.0/${v.creative_id}?fields=id,effective_object_story_id,object_story_id&access_token=${TOKEN}`
  ).then(r => r.json());

  v.effective_object_story_id = r.effective_object_story_id || null;
  v.object_story_id = r.object_story_id || null;

  // Montar embed URL
  if (v.effective_object_story_id) {
    const [pageId, postId] = v.effective_object_story_id.split("_");
    v.facebook_embed_url = `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F${pageId}%2Fvideos%2F${postId}&width=560&show_text=false`;
    v.facebook_link = `https://www.facebook.com/${pageId}/videos/${postId}`;
  }

  console.log(`  ${v.ad_name}`);
  console.log(`    story_id: ${v.effective_object_story_id}`);
  console.log(`    embed:    ${v.facebook_embed_url || "—"}`);
}

// Salvar JSON atualizado
const updated = { videos, images: data.filter(c => c.tipo === "imagem").slice(0, 6) };
writeFileSync("meta_criativos_completo.json", JSON.stringify(updated, null, 2));
console.log("\n✅ meta_criativos_completo.json salvo");
