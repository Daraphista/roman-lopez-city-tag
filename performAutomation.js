import { loadCookiesFromEnv } from "./cookieHelper.js";
import { preloadCookies } from "./cookiePreloader.js";
import Steel from "steel-sdk";
import { chromium } from "playwright";
import { steelConfig } from "./steelConfig.js";

export async function performAutomation({ url }) {
  const STEEL_API_KEY = process.env.STEEL_API_KEY;
  if (!STEEL_API_KEY) throw new Error("Missing STEEL_API_KEY");

  // Create Steel session
  const client = new Steel({ steelAPIKey: STEEL_API_KEY });
  const session = await client.sessions.create({ config: steelConfig });

  const wsUrl = session.websocketUrl.includes("apiKey=")
    ? session.websocketUrl
    : `${session.websocketUrl}&apiKey=${encodeURIComponent(STEEL_API_KEY)}`;

  const browser = await chromium.connectOverCDP(wsUrl);

  // Create ONE unified context
  const context = await browser.newContext();

  // 🚀 Load ALL cookies into this context, uncomment needed cookies and comment unneeded cookies
  await preloadCookies(context, [
    "FOLLOWUPBOSS_LOGIN_COOKIE",
    // "YLOPO_LOGIN_COOKIE",
    // "ZILLOW_LOGIN_COOKIE"
  ]);

  // You're logged into all sites instantly
  const page = await context.newPage();

  // Force open mode on all shadow DOMs
  await page.addInitScript(() => {
    const orig = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(init) {
      return orig.call(this, { ...init, mode: 'open' }); // force open mode
    };
  });
  
  await page.goto(url);

  const formSubmissionNoteData = await page.evaluate(() => {
    // Deep search through light DOM + shadow DOM
    function deepSearch(node) {
      if (!node) return null;
  
      // Check this node's textContent
      if (node.textContent && node.textContent.includes('A new lead has been submitted')) {
        return node.innerHTML || node.textContent;
      }
  
      // Traverse shadow DOM if present
      if (node.shadowRoot) {
        for (const child of node.shadowRoot.children) {
          const found = deepSearch(child);
          if (found) return found;
        }
      }
  
      // Traverse normal DOM children
      for (const child of node.children) {
        const found = deepSearch(child);
        if (found) return found;
      }
  
      return null;
    }
  
    return deepSearch(document.body);
  });
  console.log(formSubmissionNoteData);
  
  await page.waitForTimeout(2000);

  // Example: get page title
  const title = await page.title();

  await browser.close();
  await client.sessions.release(session.id);

  return { done: true, pageTitle: title, formSubmissionNoteData: formSubmissionNoteData };
}
