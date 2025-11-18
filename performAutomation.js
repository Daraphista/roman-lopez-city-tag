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
    const TARGET_TEXT = "A new lead has been submitted";
  
    function elementHasOwnText(el, text) {
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(text)) {
          return true;
        }
      }
      return false;
    }
  
    function deepSearch(node) {
      if (!node) return null;
  
      // Check if this is the EXACT <div> holding the note
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName === "DIV" &&
        elementHasOwnText(node, TARGET_TEXT)
      ) {
        return node.outerHTML;
      }
  
      // search shadow root
      if (node.shadowRoot) {
        for (const child of node.shadowRoot.children) {
          const found = deepSearch(child);
          if (found) return found;
        }
      }
  
      // search normal children
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
