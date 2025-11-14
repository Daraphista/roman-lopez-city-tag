import Steel from "steel-sdk";
import { chromium } from "playwright";

export async function runAutomation(params) {
  // Read environment variables
  const STEEL_API_KEY = process.env.STEEL_API_KEY;
  const COOKIE_JSON = process.env.FOLLOWUPBOSS_LOGIN_COOKIE;

  if (!STEEL_API_KEY || !COOKIE_JSON) {
    throw new Error("Missing required environment variables");
  }

  // Parse login cookies
  const raw = JSON.parse(COOKIE_JSON);
  const cookies = Array.isArray(raw)
    ? raw
    : raw.cookies || raw.data || Object.values(raw)[0];

  const client = new Steel({ steelAPIKey: STEEL_API_KEY });
  const session = await client.sessions.create();

  console.log("Session viewer:", session.sessionViewerUrl);

  const browser = await chromium.connectOverCDP(
    `${session.websocketUrl}&apiKey=${encodeURIComponent(STEEL_API_KEY)}`
  );
  const context = browser.contexts()[0] || (await browser.newContext());
  await context.addCookies(cookies);

  // Playwright automation logic
  const page = await context.newPage();
  await page.goto(params.url || "https://example.com");
  await page.waitForTimeout(2000);
  const title = await page.title();

  // Clean up
  await browser.close();
  await client.sessions.release(session.id);

  return { title };
}
