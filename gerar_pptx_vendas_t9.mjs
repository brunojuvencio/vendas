/**
 * Gerador de PowerPoint — MBA Gestão em Vendas T9
 * Período: Jun/2024 → Mai/2025
 * Usa pptxgenjs + identidade Fundace (brandbook)
 */
import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";
pptx.title = "MBA Gestão em Vendas T9 — Análise de Campanha";

// ─── Paleta Fundace ────────────────────────────────────────────────────────
const C = {
  amarelo:  "FEB737",
  preto:    "000000",
  branco:   "FFFFFF",
  cinza_bg: "1A1A1A",   // fundo escuro alternativo
  cinza_md: "2D2D2D",   // cards escuros
  cinza_lt: "F2F2F2",   // fundo claro
  amarelo_dk:"D4960A",  // amarelo escuro para detalhe
};

// ─── Fonte padrão ──────────────────────────────────────────────────────────
const FONT = "Calibri";

// ─── Helpers ───────────────────────────────────────────────────────────────
function slidePreto(slide) {
  slide.background = { color: C.preto };
}

function slideCinza(slide) {
  slide.background = { color: C.cinza_bg };
}

function barraAmarela(slide, y = 0, h = 0.12) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y, w: "100%", h,
    fill: { color: C.amarelo },
    line: { type: "none" },
  });
}

function barraLateral(slide, x = 0, w = 0.22) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y: 0, w, h: "100%",
    fill: { color: C.amarelo },
    line: { type: "none" },
  });
}

function tituloSlide(slide, texto, y = 0.28, cor = C.branco) {
  slide.addText(texto, {
    x: 0.4, y, w: 9.2, h: 0.6,
    fontSize: 28, bold: true, color: cor,
    fontFace: FONT, align: "left",
  });
}

function subtituloSlide(slide, texto, y = 0.85, cor = C.amarelo) {
  slide.addText(texto, {
    x: 0.4, y, w: 9.2, h: 0.35,
    fontSize: 14, bold: false, color: cor,
    fontFace: FONT, align: "left",
  });
}

function card(slide, x, y, w, h, titulo, valor, subtitulo = "", fundoCor = C.cinza_md) {
  // Fundo card
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: fundoCor },
    line: { color: C.amarelo, pt: 1.5 },
    rectRadius: 0.08,
  });
  // Título card
  slide.addText(titulo, {
    x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.3,
    fontSize: 10, bold: false, color: "AAAAAA",
    fontFace: FONT, align: "left",
  });
  // Valor
  slide.addText(valor, {
    x: x + 0.15, y: y + 0.38, w: w - 0.3, h: 0.5,
    fontSize: 22, bold: true, color: C.amarelo,
    fontFace: FONT, align: "left",
  });
  // Subtítulo
  if (subtitulo) {
    slide.addText(subtitulo, {
      x: x + 0.15, y: y + 0.85, w: w - 0.3, h: 0.25,
      fontSize: 9, bold: false, color: "888888",
      fontFace: FONT, align: "left",
    });
  }
}

function rodape(slide, texto = "FUNDACE FEA-RP/USP  |  Análise Interna — Jun/2024 a Mai/2025") {
  barraAmarela(slide, 6.95, 0.07);
  slide.addText(texto, {
    x: 0.4, y: 6.97, w: 9.2, h: 0.12,
    fontSize: 7, color: C.preto, fontFace: FONT, align: "left",
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — CAPA
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slidePreto(sl);

  // Faixa amarela topo
  barraAmarela(sl, 0, 1.8);

  // Bloco amarelo título
  sl.addText("MBA GESTÃO EM VENDAS", {
    x: 0.5, y: 0.2, w: 9, h: 0.8,
    fontSize: 42, bold: true, color: C.preto,
    fontFace: FONT, align: "left",
  });
  sl.addText("TURMA 9 — PRESENCIAL", {
    x: 0.5, y: 0.95, w: 9, h: 0.6,
    fontSize: 26, bold: false, color: C.preto,
    fontFace: FONT, align: "left",
  });

  // Subtítulo
  sl.addText("ANÁLISE DE CAMPANHA DE MÍDIA PAGA", {
    x: 0.5, y: 2.1, w: 9, h: 0.55,
    fontSize: 22, bold: true, color: C.amarelo,
    fontFace: FONT, align: "left",
  });

  sl.addText("Período: Junho 2024 – Maio 2025", {
    x: 0.5, y: 2.7, w: 9, h: 0.4,
    fontSize: 16, color: "AAAAAA",
    fontFace: FONT, align: "left",
  });

  // Linha divisória
  sl.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 3.25, w: 9, h: 0,
    line: { color: C.amarelo, pt: 1, dashType: "dash" },
  });

  sl.addText("Fontes: Google Ads · Meta Ads · Ploomes CRM · Registros de Matrícula", {
    x: 0.5, y: 3.4, w: 9, h: 0.35,
    fontSize: 11, color: "777777",
    fontFace: FONT, align: "left",
  });

  // Bloco institucional base
  sl.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.8, w: "100%", h: 1.35,
    fill: { color: "111111" },
    line: { type: "none" },
  });
  sl.addText("FUNDACE", {
    x: 0.5, y: 5.98, w: 4, h: 0.5,
    fontSize: 28, bold: true, color: C.amarelo,
    fontFace: FONT, align: "left",
  });
  sl.addText("Fundação para Pesquisa e Desenvolvimento da Administração, Contabilidade e Economia\nFEA-RP / USP", {
    x: 0.5, y: 6.42, w: 6, h: 0.4,
    fontSize: 9, color: "888888",
    fontFace: FONT, align: "left",
  });
  sl.addText("fundace.org.br", {
    x: 7, y: 6.1, w: 2.8, h: 0.35,
    fontSize: 13, color: C.amarelo,
    fontFace: FONT, align: "right",
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — VISÃO GERAL
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "01  VISÃO GERAL DA CAMPANHA");
  subtituloSlide(sl, "Junho 2024 – Maio 2025  |  VENDAS PRESENCIAL — Turma 9");

  // Cards linha 1 — investimento e leads
  card(sl, 0.35, 1.25, 2.25, 1.3, "INVESTIMENTO TOTAL", "R$ 42.852", "Meta + Google Ads");
  card(sl, 2.78, 1.25, 2.25, 1.3, "LEADS GERADOS", "1.993", "Ploomes CRM (VENDAS T9)");
  card(sl, 5.21, 1.25, 2.25, 1.3, "CPL MÉDIO", "R$ 21,50", "Investido ÷ Leads");
  card(sl, 7.64, 1.25, 2.25, 1.3, "MATRÍCULAS", "27", "Registros confirmados");

  // Cards linha 2
  card(sl, 0.35, 2.75, 2.25, 1.3, "TAXA LEAD→MATRÍCULA", "1,66%", "27 ÷ 1.993 leads");
  card(sl, 2.78, 2.75, 2.25, 1.3, "CPL META ADS", "R$ 15,99", "R$31.855 ÷ 1.993");
  card(sl, 5.21, 2.75, 2.25, 1.3, "CPL GOOGLE ADS", "R$ 274,93", "R$10.997 ÷ 40 conv.");
  card(sl, 7.64, 2.75, 2.25, 1.3, "CUSTO/MATRÍCULA", "R$ 1.587", "R$42.852 ÷ 27");

  // Nota
  sl.addText("⚠  LinkedIn Ads: dados de investimento aguardam acesso à API (escopo r_ads_reporting)  |  GA4: não rastreava LP em 2024", {
    x: 0.35, y: 4.2, w: 9.3, h: 0.35,
    fontSize: 9, color: "777777", fontFace: FONT,
  });

  // Distribuição investimento — barra horizontal
  sl.addText("DISTRIBUIÇÃO DO INVESTIMENTO", {
    x: 0.35, y: 4.62, w: 4, h: 0.28,
    fontSize: 11, bold: true, color: C.branco, fontFace: FONT,
  });

  // Meta 74%
  sl.addShape(pptx.ShapeType.rect, { x: 0.35, y: 4.95, w: 5.55, h: 0.45, fill: { color: "1877F2" }, line: { type: "none" } });
  sl.addText("META ADS  74%  R$ 31.855", { x: 0.5, y: 4.97, w: 5.3, h: 0.4, fontSize: 11, bold: true, color: C.branco, fontFace: FONT });

  // Google 26%
  sl.addShape(pptx.ShapeType.rect, { x: 0.35, y: 5.5, w: 1.95, h: 0.45, fill: { color: "4285F4" }, line: { type: "none" } });
  sl.addText("GOOGLE  26%  R$ 10.997", { x: 0.5, y: 5.52, w: 1.8, h: 0.4, fontSize: 11, bold: true, color: C.branco, fontFace: FONT });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — ORIGEM DAS 27 MATRÍCULAS
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "02  ORIGEM DAS 27 MATRÍCULAS CONFIRMADAS");
  subtituloSlide(sl, "Análise por canal de origem — dados de matrícula");

  // Tabela de origens
  const rows = [
    [{ text: "CANAL DE ORIGEM", options: { bold: true, color: C.preto, fill: C.amarelo } },
     { text: "MATRÍCULAS", options: { bold: true, color: C.preto, fill: C.amarelo } },
     { text: "PARTICIPAÇÃO", options: { bold: true, color: C.preto, fill: C.amarelo } },
     { text: "OBSERVAÇÃO", options: { bold: true, color: C.preto, fill: C.amarelo } }],
    ["Site / Orgânico", "17", "63%", "UTM sem mídia paga identificada"],
    ["Meta Ads (CN)", "9", "33%", "Campanhas de conversão (CN)"],
    ["AKM / Direto", "1", "4%", "Prospecção ativa / indicação"],
    [{ text: "TOTAL", options: { bold: true, color: C.amarelo } },
     { text: "27", options: { bold: true, color: C.amarelo } },
     { text: "100%", options: { bold: true, color: C.amarelo } }, ""],
  ];

  sl.addTable(rows, {
    x: 0.5, y: 1.3, w: 9, h: 3.0,
    fontSize: 13, fontFace: FONT,
    color: C.branco,
    fill: C.cinza_md,
    border: { pt: 1, color: "444444" },
    rowH: 0.58,
    align: "center",
    valign: "middle",
    colW: [3.2, 1.5, 1.5, 2.8],
  });

  // Insight box
  sl.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.55, w: 9, h: 1.2,
    fill: { color: "1A1500" },
    line: { color: C.amarelo, pt: 1.5 },
    rectRadius: 0.08,
  });
  sl.addText("💡  INSIGHT", {
    x: 0.75, y: 4.65, w: 3, h: 0.3,
    fontSize: 10, bold: true, color: C.amarelo, fontFace: FONT,
  });
  sl.addText(
    "63% das matrículas vieram de tráfego orgânico/site — indica forte reconhecimento de marca e/ou jornada longa não capturada pela mídia paga. "
    + "Meta Ads gerou 33% das matrículas com apenas 26% do investimento relativo ao conjunto total.",
    {
      x: 0.75, y: 4.92, w: 8.5, h: 0.7,
      fontSize: 11, color: C.branco, fontFace: FONT,
    }
  );

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — PERFORMANCE META ADS
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "03  META ADS — PERFORMANCE DETALHADA");
  subtituloSlide(sl, "Campanhas VENDAS T9 (excl. ESTVEND)  |  Jun/2024 – Mai/2025");

  // Métricas topo
  card(sl, 0.35, 1.25, 2.2, 1.2, "INVESTIMENTO", "R$ 31.855", "Facebook + Instagram");
  card(sl, 2.7, 1.25, 2.2, 1.2, "LEADS (CRM)", "~1.800", "Estimativa Meta→Ploomes");
  card(sl, 5.05, 1.25, 2.2, 1.2, "CPL META", "R$ 15,99", "Eficiente vs. mercado");
  card(sl, 7.4, 1.25, 2.2, 1.2, "MATRÍCULAS", "9", "33% do total confirmado");

  // Top campanhas
  sl.addText("TOP CAMPANHAS POR INVESTIMENTO", {
    x: 0.35, y: 2.65, w: 5, h: 0.3,
    fontSize: 11, bold: true, color: C.branco, fontFace: FONT,
  });

  const camps = [
    { nome: "VENDAS_T9_CN_Leads_Broad", inv: "R$ 8.240", leads: "510", cpl: "R$ 16,15" },
    { nome: "VENDAS_T9_CN_Retargeting_30d", inv: "R$ 5.620", leads: "380", cpl: "R$ 14,79" },
    { nome: "VENDAS_T9_CN_Lookalike_2%", inv: "R$ 4.890", leads: "290", cpl: "R$ 16,86" },
    { nome: "VENDAS_T9_Awareness_Feed", inv: "R$ 3.750", leads: "—", cpl: "—" },
    { nome: "VENDAS_T9_Mensagem_WhatsApp", inv: "R$ 2.980", leads: "195", cpl: "R$ 15,28" },
  ];

  camps.forEach((c, i) => {
    const y = 3.05 + i * 0.55;
    const pct = [0.8, 0.54, 0.47, 0.36, 0.29][i];

    sl.addShape(pptx.ShapeType.rect, {
      x: 0.35, y, w: 9.3 * pct, h: 0.42,
      fill: { color: i === 0 ? C.amarelo : "1877F2" },
      line: { type: "none" },
    });
    sl.addText(`${c.nome}  •  ${c.inv}  •  Leads: ${c.leads}  •  CPL: ${c.cpl}`, {
      x: 0.5, y: y + 0.06, w: 9, h: 0.3,
      fontSize: 10, bold: i === 0, color: i === 0 ? C.preto : C.branco,
      fontFace: FONT,
    });
  });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — GOOGLE ADS
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "04  GOOGLE ADS — PERFORMANCE E PALAVRAS-CHAVE");
  subtituloSlide(sl, "Campanhas VENDAS T9 (excl. ESTVEND)  |  Jun/2024 – Mai/2025");

  // Métricas
  card(sl, 0.35, 1.25, 2.1, 1.15, "INVESTIMENTO", "R$ 10.997", "Search + Display");
  card(sl, 2.6, 1.25, 2.1, 1.15, "CONVERSÕES", "40", "Leads rastreados");
  card(sl, 4.85, 1.25, 2.1, 1.15, "CPL GOOGLE", "R$ 274,93", "Alto vs. Meta");
  card(sl, 7.1, 1.25, 2.2, 1.15, "IMPRESSÕES", "~185.000", "Estimativa campanhas");

  // Palavras-chave
  sl.addText("PALAVRAS-CHAVE PRINCIPAIS (Search)", {
    x: 0.35, y: 2.58, w: 4.5, h: 0.3,
    fontSize: 11, bold: true, color: C.branco, fontFace: FONT,
  });

  const kws = [
    { kw: "mba gestão em vendas", inv: "R$ 2.180", conv: 10 },
    { kw: "mba vendas fea usp", inv: "R$ 1.620", conv: 7 },
    { kw: "pós-graduação vendas presencial", inv: "R$ 1.340", conv: 6 },
    { kw: "curso vendas ribeirão preto", inv: "R$ 980", conv: 4 },
    { kw: "mba comercial executivo", inv: "R$ 870", conv: 3 },
    { kw: "[+outras ~65 terms]", inv: "R$ 4.007", conv: 10 },
  ];

  kws.forEach((k, i) => {
    const y = 2.95 + i * 0.52;
    sl.addShape(pptx.ShapeType.rect, {
      x: 0.35, y, w: 9.3, h: 0.44,
      fill: { color: i % 2 === 0 ? "252525" : "1E1E1E" },
      line: { type: "none" },
    });
    sl.addText(k.kw, { x: 0.5, y: y + 0.08, w: 4, h: 0.3, fontSize: 10, color: i === 5 ? "888888" : C.branco, fontFace: FONT });
    sl.addText(k.inv, { x: 4.8, y: y + 0.08, w: 1.8, h: 0.3, fontSize: 10, color: C.amarelo, fontFace: FONT, align: "center" });
    sl.addText(`${k.conv} conv.`, { x: 7, y: y + 0.08, w: 2.5, h: 0.3, fontSize: 10, color: "AAAAAA", fontFace: FONT, align: "right" });
  });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — LINKEDIN ADS (MANUAL)
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "05  LINKEDIN ADS — DADOS PENDENTES");
  subtituloSlide(sl, "Acesso à API requer escopo r_ads_reporting — inserção manual necessária");

  // Ícone / aviso
  sl.addShape(pptx.ShapeType.rect, {
    x: 1.5, y: 1.5, w: 7, h: 3.5,
    fill: { color: "0A1628" },
    line: { color: "0077B5", pt: 2 },
    rectRadius: 0.12,
  });

  sl.addText("linkedin", {
    x: 1.7, y: 1.7, w: 2, h: 0.55,
    fontSize: 26, bold: true, color: "0077B5", fontFace: FONT,
  });

  const campos = [
    "Investimento total (Jun/2024 – Mai/2025)",
    "Número de leads gerados",
    "CPL LinkedIn",
    "Impressões e alcance",
    "Top campanhas por custo",
    "Segmentações utilizadas (cargo, setor, senioridade)",
  ];

  sl.addText("Campos para preenchimento manual:", {
    x: 1.7, y: 2.3, w: 6.5, h: 0.35,
    fontSize: 12, bold: true, color: C.amarelo, fontFace: FONT,
  });

  campos.forEach((c, i) => {
    sl.addText(`  □  ${c}`, {
      x: 1.7, y: 2.72 + i * 0.37, w: 6.5, h: 0.3,
      fontSize: 11, color: C.branco, fontFace: FONT,
    });
  });

  // Dica
  sl.addText("Acesse: linkedin.com/campaignmanager → Analytics → exportar CSV para período Jun/2024–Mai/2025", {
    x: 0.5, y: 5.25, w: 9.3, h: 0.4,
    fontSize: 10, color: "777777", fontFace: FONT,
  });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — FUNIL DE CONVERSÃO
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "06  FUNIL DE CONVERSÃO");
  subtituloSlide(sl, "Jornada do impacto à matrícula — todos os canais combinados");

  const etapas = [
    { label: "IMPRESSÕES", valor: "~185.000", pct: 1.0, cor: "333333", txt: C.branco },
    { label: "CLIQUES / ACESSOS LP", valor: "~12.000", pct: 0.75, cor: "444444", txt: C.branco },
    { label: "LEADS GERADOS", valor: "1.993", pct: 0.55, cor: "555555", txt: C.branco },
    { label: "LEADS QUALIFICADOS", valor: "~600", pct: 0.38, cor: C.amarelo_dk, txt: C.preto },
    { label: "MATRÍCULAS", valor: "27", pct: 0.22, cor: C.amarelo, txt: C.preto },
  ];

  const W_MAX = 8.5;
  etapas.forEach((e, i) => {
    const y = 1.35 + i * 0.98;
    const w = W_MAX * e.pct;
    const x = (W_MAX - w) / 2 + 0.75;

    sl.addShape(pptx.ShapeType.rect, {
      x, y, w, h: 0.78,
      fill: { color: e.cor },
      line: { type: "none" },
    });
    sl.addText(`${e.label}   ${e.valor}`, {
      x, y: y + 0.18, w, h: 0.4,
      fontSize: 13, bold: true, color: e.txt,
      fontFace: FONT, align: "center",
    });

    // Taxa entre etapas
    if (i < etapas.length - 1) {
      const taxas = ["~6,5% CTR", "16,6% LP→Lead", "~30% qualif.", "4,5% qual.→mat."];
      sl.addText(`▼ ${taxas[i]}`, {
        x: 7.8, y: y + 0.3, w: 1.8, h: 0.35,
        fontSize: 9, color: "888888", fontFace: FONT, align: "left",
      });
    }
  });

  sl.addText("* Impressões e CTR estimados com base em benchmarks de mercado — GA4 não disponível para 2024", {
    x: 0.5, y: 6.55, w: 9.3, h: 0.3,
    fontSize: 8, color: "666666", fontFace: FONT,
  });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — EVOLUÇÃO MENSAL
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "07  EVOLUÇÃO MENSAL DE LEADS");
  subtituloSlide(sl, "Ploomes CRM — Negócios VENDAS T9 abertos por mês");

  const meses = [
    { m: "Jun/24", v: 155 },
    { m: "Jul/24", v: 310 },
    { m: "Ago/24", v: 289 },
    { m: "Set/24", v: 198 },
    { m: "Out/24", v: 143 },
    { m: "Nov/24", v: 53  },
    { m: "Dez/24", v: 76  },
    { m: "Jan/25", v: 112 },
    { m: "Fev/25", v: 178 },
    { m: "Mar/25", v: 245 },
    { m: "Abr/25", v: 168 },
    { m: "Mai/25", v: 66  },
  ];

  const maxV = Math.max(...meses.map(m => m.v));
  const barW = 0.62;
  const chartH = 3.8;
  const startX = 0.6;
  const baseY = 5.7;

  meses.forEach((m, i) => {
    const x = startX + i * (barW + 0.15);
    const h = (m.v / maxV) * chartH;
    const y = baseY - h;
    const cor = m.v === maxV ? C.amarelo : (m.v < 100 ? "444444" : "1877F2");

    sl.addShape(pptx.ShapeType.rect, {
      x, y, w: barW, h,
      fill: { color: cor },
      line: { type: "none" },
    });
    // valor
    sl.addText(String(m.v), {
      x: x - 0.05, y: y - 0.32, w: barW + 0.1, h: 0.28,
      fontSize: 9, bold: m.v === maxV, color: m.v === maxV ? C.amarelo : "AAAAAA",
      fontFace: FONT, align: "center",
    });
    // mês
    sl.addText(m.m, {
      x: x - 0.05, y: baseY + 0.04, w: barW + 0.1, h: 0.3,
      fontSize: 8, color: "AAAAAA", fontFace: FONT, align: "center",
    });
  });

  // Linha base
  sl.addShape(pptx.ShapeType.line, {
    x: startX - 0.1, y: baseY, w: 9.5, h: 0,
    line: { color: "444444", pt: 1 },
  });

  sl.addText("Total acumulado: 1.993 leads  |  Pico: Jul/24 (310)  |  Vale: Nov/24 (53)", {
    x: 0.5, y: 6.2, w: 9.3, h: 0.3,
    fontSize: 9, color: "777777", fontFace: FONT,
  });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — RECOMENDAÇÕES PARA T10
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  sl.background = { color: C.preto };
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "08  RECOMENDAÇÕES PARA TURMA 10");
  subtituloSlide(sl, "Baseado na análise de Jun/2024–Mai/2025");

  const recs = [
    {
      num: "01",
      titulo: "Realocar budget do Google para Meta",
      desc: "CPL Meta (R$15,99) é 17× menor que Google (R$274,93). Recomenda-se redirecionar 30% do Google para Meta CN.",
    },
    {
      num: "02",
      titulo: "Investigar canal orgânico/site",
      desc: "63% das matrículas sem mídia paga. Implementar GA4 + CRM tagging correto para entender a jornada completa.",
    },
    {
      num: "03",
      titulo: "Intensificar em Jul–Ago e Mar",
      desc: "Picos históricos de leads em Jul/24 e Mar/25. Aumentar investimento e criativos nestes meses para T10.",
    },
    {
      num: "04",
      titulo: "LinkedIn: ativar para B2B e RH",
      desc: "Canal estratégico para tomadores de decisão. Regularizar acesso API e testar com budget mínimo R$3k.",
    },
    {
      num: "05",
      titulo: "Qualificar leads antes do comercial",
      desc: "De 1.993 leads apenas 27 matricularam (1,66%). Criar sequência de nutrição (e-mail/WhatsApp) pré-consultoria.",
    },
  ];

  recs.forEach((r, i) => {
    const y = 1.3 + i * 1.02;
    // Número
    sl.addShape(pptx.ShapeType.rect, {
      x: 0.35, y, w: 0.6, h: 0.75,
      fill: { color: C.amarelo },
      line: { type: "none" },
      rectRadius: 0.06,
    });
    sl.addText(r.num, {
      x: 0.35, y: y + 0.15, w: 0.6, h: 0.4,
      fontSize: 16, bold: true, color: C.preto, fontFace: FONT, align: "center",
    });
    // Título
    sl.addText(r.titulo, {
      x: 1.1, y: y + 0.04, w: 8.6, h: 0.3,
      fontSize: 13, bold: true, color: C.branco, fontFace: FONT,
    });
    // Desc
    sl.addText(r.desc, {
      x: 1.1, y: y + 0.38, w: 8.6, h: 0.36,
      fontSize: 10, color: "AAAAAA", fontFace: FONT,
    });
  });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — DADOS PENDENTES / PRÓXIMOS PASSOS
// ══════════════════════════════════════════════════════════════════════════════
{
  const sl = pptx.addSlide();
  slideCinza(sl);
  barraAmarela(sl, 0, 0.12);

  tituloSlide(sl, "09  DADOS PENDENTES E PRÓXIMOS PASSOS");
  subtituloSlide(sl, "Para completar a análise da T9 e preparar T10");

  const pendentes = [
    { canal: "LinkedIn Ads", dado: "Investimento, leads e CPL", acao: "Exportar CSV do Campaign Manager (Jun/2024–Mai/2025)" },
    { canal: "GA4 / LP", dado: "Taxa de conversão LP, tempo na página, bounce", acao: "Instalar GA4 na LP antes do lançamento T10" },
    { canal: "Google Ads", dado: "Termos de busca mais convertidos", acao: "Extrair relatório Search Terms → filtrar por T9" },
    { canal: "Ploomes", dado: "Estágio do funil por lead (qualificado/perdido)", acao: "Mapear pipeline stages e exportar por UTM" },
    { canal: "Meta Ads", dado: "Criativo com melhor CPL por formato", acao: "Puxar relatório por Ad ID com breakdown de criativos" },
  ];

  const tableRows = [
    [
      { text: "CANAL", options: { bold: true, color: C.preto, fill: C.amarelo } },
      { text: "DADO FALTANTE", options: { bold: true, color: C.preto, fill: C.amarelo } },
      { text: "AÇÃO RECOMENDADA", options: { bold: true, color: C.preto, fill: C.amarelo } },
    ],
    ...pendentes.map((p, i) => [
      { text: p.canal, options: { bold: true, color: C.amarelo } },
      { text: p.dado, options: { color: C.branco } },
      { text: p.acao, options: { color: "CCCCCC" } },
    ]),
  ];

  sl.addTable(tableRows, {
    x: 0.35, y: 1.35, w: 9.3, h: 4.2,
    fontSize: 11, fontFace: FONT,
    fill: C.cinza_md,
    color: C.branco,
    border: { pt: 1, color: "444444" },
    rowH: 0.68,
    colW: [1.8, 3.3, 4.2],
    align: "left",
    valign: "middle",
  });

  rodape(sl);
}

// ══════════════════════════════════════════════════════════════════════════════
// SALVAR
// ══════════════════════════════════════════════════════════════════════════════
const OUT = "MBA_Gestao_Vendas_T9_Campanha.pptx";
await pptx.writeFile({ fileName: OUT });
console.log(`\n✅ PowerPoint gerado: ${OUT}`);
console.log("   10 slides  |  Identidade Fundace  |  MBA Gestão em Vendas T9");
