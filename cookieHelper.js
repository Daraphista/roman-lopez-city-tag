// cookieHelper.js

/**
 * Normalize cookies from any format into a Playwright-ready array.
 *
 * Accepts:
 * - [{...}, {...}]
 * - { cookies: [...] }
 * - { data: [...] }
 * - { anything: [...] }
 */
export function loadCookiesFromEnv(envName = "FOLLOWUPBOSS_LOGIN_COOKIE") {
  const raw = process.env[envName];

  if (!raw) {
    throw new Error(`Missing cookie environment variable: ${envName}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Cookie JSON is invalid for ${envName}: ${err.message}`);
  }

  const cookies = Array.isArray(parsed)
    ? parsed
    : parsed.cookies || parsed.data || Object.values(parsed)[0];

  if (!cookies || !Array.isArray(cookies)) {
    throw new Error(`Could not normalize cookies for ${envName}`);
  }

  console.log(`Loaded ${cookies.length} cookies from ${envName}`);
  return cookies;
}
