// performAutomation.js
import Steel from "steel-sdk";
import { chromium } from "playwright";

export async function performAutomation() {
  const STEEL_API_KEY = process.env.STEEL_API_KEY;
  const COOKIE_SECRET = process.env.FOLLOWUPBOSS_LOGIN_COOKIE;

  if (!STEEL_API_KEY) throw new Error("Missing STEEL_API_KEY");
  if (!COOKIE_SECRET) throw new Error("Missing FOLLOWUPBOSS_LOGIN_COOKIE");

  const cookiesRaw = JSON.parse(COOKIE_SECRET);
  const cookies = Array.isArray(cookiesRaw)
    ? cookiesRaw
    : cookiesRaw.cookies || cookiesRaw.data || Object.values(cookiesRaw)[0];

  console.log("Loaded cookies:", cookies.length);

  const client = new Steel({ steelAPIKey: STEEL_API_KEY });

  console.log("Creating Steel session...");
  const session = await client.sessions.create();
  console.log("Session:", session.id);

  const wsUrl = session.websocketUrl.includes("apiKey=")
    ? session.websocketUrl
    : `${session.websocketUrl}&apiKey=${encodeURIComponent(STEEL_API_KEY)}`;

  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0] || (await browser.newContext());

  await context.addCookies(cookies);
  console.log("Cookies applied.");

  const page = await context.newPage();

  // Example URL (replace per automation)
  const url = "https://example.com";
  await page.goto(url);

  await page.waitForTimeout(2000);

  // Example: get page title
  const title = await page.title();

  // Cleanup
  await browser.close();
  await client.sessions.release(session.id);

  console.log("Automation finished");

  return { title };
}
