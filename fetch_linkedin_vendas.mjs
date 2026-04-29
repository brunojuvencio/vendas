/**
 * LinkedIn Ads — MBA Gestão Vendas T9
 * Período: Jun/2024 → Mai/2025
 */
import { readFileSync, writeFileSync } from "fs";

const env = {};
readFileSync(".env", "utf8").split("\n").forEach(l => {
  const m = l.match(/^([^=]+)=["']?([^"'\n]+)["']?/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REFRESH_TOKEN, LINKEDIN_AD_ACCOUNT_ID } = env;

const r2 = v => Math.round(Number(v || 0) * 100) / 100;

// 1. Obter access token via refresh token
console.log("⏳ Obtendo token LinkedIn...");
const tkRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type:    "refresh_token",
    refresh_token: LINKEDIN_REFRESH_TOKEN,
    client_id:     LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  }),
});
const tkData = await tkRes.json();
if (!tkData.access_token) { console.error("❌ Token falhou:", tkData); process.exit(1); }
console.log("✅ Token OK");

const TOKEN = tkData.access_token;
const H = { Authorization: `Bearer ${TOKEN}`, "X-Restli-Protocol-Version": "2.0.0" };
const ACCOUNT_ID = LINKEDIN_AD_ACCOUNT_ID;

// 2. Buscar campanhas via v2
console.log("\n⏳ Buscando campanhas LinkedIn (v2)...");
const campRes = await fetch(
  `https://api.linkedin.com/v2/adCampaignsV2?q=search&search.account.values[0]=urn%3Ali%3AsponsoredAccount%3A${ACCOUNT_ID}&search.status.values[0]=ACTIVE&search.status.values[1]=PAUSED&search.status.values[2]=ARCHIVED&count=100`,
  { headers: H }
);
const campData = await campRes.json();
console.log("Campanhas:", JSON.stringify(campData).slice(0,500));
const campaigns = campData.elements || [];
console.log(`  Total: ${campaigns.length}`);
campaigns.forEach(c => console.log(`  [${c.status}] ${c.name} (${c.id})`));

// 3. Analytics da conta toda — Jun/2024-Mai/2025
console.log("\n⏳ Buscando analytics (v2)...");
const anaRes = await fetch(
  `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&pivot=ACCOUNT&dateRange.start.year=2024&dateRange.start.month=6&dateRange.start.day=1&dateRange.end.year=2025&dateRange.end.month=5&dateRange.end.day=31&timeGranularity=ALL&accounts[0]=urn%3Ali%3AsponsoredAccount%3A${ACCOUNT_ID}&fields=externalWebsiteConversions,impressions,landingPageClicks,clicks,costInLocalCurrency`,
  { headers: H }
);
const anaData = await anaRes.json();
console.log("Analytics:", JSON.stringify(anaData).slice(0,500));

// 4. Analytics mensal
console.log("\n⏳ Buscando mensal (v2)...");
const monRes = await fetch(
  `https://api.linkedin.com/v2/adAnalyticsV2?q=analytics&pivot=ACCOUNT&dateRange.start.year=2024&dateRange.start.month=6&dateRange.start.day=1&dateRange.end.year=2025&dateRange.end.month=5&dateRange.end.day=31&timeGranularity=MONTHLY&accounts[0]=urn%3Ali%3AsponsoredAccount%3A${ACCOUNT_ID}&fields=externalWebsiteConversions,impressions,clicks,costInLocalCurrency,dateRange`,
  { headers: H }
);
const monData = await monRes.json();
console.log("Mensal:", JSON.stringify(monData).slice(0,500));

// Salvar raw
writeFileSync("linkedin_vendas_t9.json", JSON.stringify({ campaigns, analytics: anaData, monthly: monData }, null, 2));
console.log("\n✅ linkedin_vendas_t9.json salvo");
