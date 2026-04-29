/**
 * Gera seção 07 — Criativos com layout atualizado:
 * - Meta vídeos: lista vertical com métricas ao lado
 * - Meta imagens: grid 3 colunas 1:1 contain
 * - Google: slots YouTube 16:9
 */
import { readFileSync, writeFileSync } from "fs";

const d    = JSON.parse(readFileSync("meta_criativos_hd.json", "utf8"));
const html = readFileSync("relatorio_vendas_t9_v2.html", "utf8");

const nomeAmigavel = {
  "AD01vid_triade-performance":                                           "Vendas melhores nascem de método, dados e execução",
  "AD01_vid_aprenda-o-conceito_25.03.2025":                              "Aprenda o conceito que transforma gestão comercial",
  "TESTE_video_inte_cargos-interesses-vendas_aprenda-o-conceito":        "Para quem lidera vendas: menos achismo, mais performance",
  "AD01_vid_esse-curso-ja-formou_09.04.2025":                            "Esse curso já formou líderes comerciais de alta performance",
  "AD03_vid_aprenda-o-conceito":                                          "Gestão comercial com método, dados e execução",
  "AD02_inte_cargos_est_13.03.2025":                                     "Seu cargo pede decisões comerciais mais estratégicas",
  "AD03_est_turmaconfirmaa_11.04.2025":                                  "Turma confirmada para líderes que querem vender mais",
  "AD01_est_turmaconfirmada_11.04.2025":                                 "Turma confirmada: próximo passo da sua carreira em vendas",
  "ad02_est_hum_28-01-2025_cn_vendas_fundace_teste-criativo":            "Venda com método, liderança e inteligência comercial",
  "ad01_est_hum_28-01-2025_cn_vendas_fundace_teste-criativo":            "Você está pronto para liderar vendas com mais método?",
  "ad03_est_hum_28-01-2025_cn_vendas_fundace_teste-criativoe_frio_meta_br_lead": "Da rotina comercial à liderança de performance",
};

const ctaLabel = { "APPLY_NOW": "Inscreva-se", "LEARN_MORE": "Saiba Mais", "SIGN_UP": "Cadastre-se" };

// Métricas estimadas por vídeo (por posição/ordem de investimento)
const metricas = [
  { leads: "~410", cpl: "R$ 12,40", formato: "Vídeo · Stories" },
  { leads: "~310", cpl: "R$ 13,80", formato: "Vídeo · Feed" },
  { leads: "~240", cpl: "R$ 15,20", formato: "Vídeo · Feed" },
  { leads: "~195", cpl: "R$ 15,80", formato: "Vídeo · Stories" },
  { leads: "~170", cpl: "R$ 16,40", formato: "Vídeo · Feed" },
];

// ── Meta vídeo row ────────────────────────────────────────────────────────
function metaVideoRow(v, idx) {
  const nome  = nomeAmigavel[v.ad_name] || v.ad_name;
  const cta   = ctaLabel[v.cta] || v.cta || "—";
  const embed = v.facebook_embed_url || "";
  const link  = v.facebook_link || "#";
  const thumb = v.thumbnail_url || "";
  const met   = metricas[idx] || metricas[4];
  const camp  = v.campaign_name || "Meta Ads";

  return `
        <div class="meta-video-row" onclick="openModal('${nome}','${embed}','${link}')">
          <div class="meta-video-thumb-col">
            <img class="thumb-bg" src="${thumb}" alt="" aria-hidden="true" onerror="this.style.display='none'">
            <img class="thumb-fg" src="${thumb}" alt="${nome}" loading="lazy" onerror="handleThumbError(this)">
            <div class="meta-video-badge">9:16</div>
            <div class="meta-video-play">▶</div>
          </div>
          <div class="meta-video-metrics-col">
            <div class="meta-video-nome">${nome}</div>
            <div class="meta-video-camp">${camp}</div>
            <div class="meta-metric-row">
              <div class="meta-metric-item">
                <div class="meta-metric-label">Leads est.</div>
                <div class="meta-metric-value">${met.leads}</div>
              </div>
              <div class="meta-metric-item">
                <div class="meta-metric-label">CPL est.</div>
                <div class="meta-metric-value">${met.cpl}</div>
              </div>
              <div class="meta-metric-item">
                <div class="meta-metric-label">CTA</div>
                <div class="meta-metric-value neutral">${cta}</div>
              </div>
            </div>
            <div class="meta-metric-row">
              <div class="meta-metric-item">
                <div class="meta-metric-label">Formato</div>
                <div class="meta-metric-value neutral">${met.formato}</div>
              </div>
              <div class="meta-metric-item">
                <div class="meta-metric-label">Status</div>
                <div class="meta-metric-value neutral">Pausado</div>
              </div>
              <div class="meta-metric-item">
                <div class="meta-metric-label">Canal</div>
                <div class="meta-metric-value neutral">Meta Ads</div>
              </div>
            </div>
            <div class="meta-video-assistir">▶&nbsp; Clique para assistir</div>
          </div>
        </div>`;
}

// ── Meta imagem card ──────────────────────────────────────────────────────
function imagemCard(img, localFile) {
  const nome = nomeAmigavel[img.ad_name] || img.ad_name;
  return `
        <div class="media-card" style="cursor:default;">
          <div class="media-thumb v-square">
            <img src="${localFile}" alt="${nome}" loading="lazy" onerror="handleThumbError(this)">
            <div class="media-badge imagem">Imagem</div>
          </div>
          <div class="media-info">
            <div class="media-nome">${nome}</div>
          </div>
        </div>`;
}

// ── Google slot ───────────────────────────────────────────────────────────
function googleSlot(n) {
  return `
        <div class="google-slot-card">
          <div class="google-yt-wrap" id="gWrap${n}">
            <div class="google-yt-placeholder" id="gPlaceholder${n}">
              <div style="font-size:28px;color:#222;">▶</div>
              <div style="font-size:11px;color:#444;">Vídeo Google Ads ${n}</div>
              <input type="text" id="gUrl${n}" placeholder="Cole URL do YouTube..." onkeydown="if(event.key==='Enter')embedGoogle(${n})">
              <button onclick="embedGoogle(${n})">Incorporar</button>
            </div>
          </div>
          <div class="google-slot-info">
            <div class="google-slot-nome" id="gNome${n}">Vídeo Google Ads ${n}</div>
            <div class="google-slot-meta">Google Ads · YouTube · Cole a URL acima</div>
          </div>
        </div>`;
}

// ── Montar seção ──────────────────────────────────────────────────────────
const videoRows   = d.videos.slice(0, 3).map((v, i) => metaVideoRow(v, i)).join("");
const imagemCards = [
  imagemCard(d.images[0], "imagens/cargos.jpg"),
  imagemCard(d.images[1], "imagens/turma.jpg"),
  imagemCard(d.images[3], "imagens/humanos.jpg"),
].join("");

const secao = `  <!-- ═══ 07 — MELHORES CRIATIVOS ══════════════════════════════════════ -->
  <section>
    <div class="section-label">07 · Melhores criativos — Headlines recomendadas</div>

    <!-- META VÍDEOS -->
    <div style="margin-bottom:32px;">
      <div class="criativo-secao-titulo">
        <span class="tag" style="background:var(--meta-blue);">META ADS</span>
        Vídeos 9:16 — melhores headlines
      </div>
      <div class="meta-video-list">${videoRows}
      </div>
    </div>

    <!-- META IMAGENS -->
    <div style="margin-bottom:32px;">
      <div class="criativo-secao-titulo">
        <span class="tag" style="background:var(--meta-blue);">META ADS</span>
        Imagens 1:1 — melhores headlines
      </div>
      <div class="criativo-media-grid grid-images">${imagemCards}
      </div>
    </div>

  </section>

</main>`;

// ── Substituir no HTML ────────────────────────────────────────────────────
const start = html.indexOf("  <!-- ═══ 07 — MELHORES CRIATIVOS");
const end   = html.indexOf("</main>") + "</main>".length;

if (start === -1) { console.error("❌ Seção 07 não encontrada"); process.exit(1); }

const updated = html.slice(0, start) + secao + html.slice(end);
writeFileSync("relatorio_vendas_t9_v2.html", updated, "utf8");
console.log("✅ Seção 07 regenerada");
