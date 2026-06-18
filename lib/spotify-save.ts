/**
 * Save a track to the user's Spotify library in one click, via the Authorization
 * Code + PKCE flow (public client — no client secret, safe in the browser).
 *
 * Flow: click → if we already hold a valid token, PUT /me/tracks straight away;
 * otherwise redirect to Spotify's consent screen (one tap if the user has the
 * Spotify app/session), come back to /spotify/callback, exchange the code for a
 * token, save the pending track, then return to the page.
 *
 * The redirect URI is derived from the current origin, so it must be registered
 * in the Spotify dashboard for every origin used (prod + local).
 */

const CLIENT_ID = "75158b3785014e6d9d384b4206267ae3";
const SCOPE = "user-library-modify";
const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

const VERIFIER_KEY = "sp_verifier";
const PENDING_KEY = "sp_pending";
const TOKEN_KEY = "sp_token";

export type Pending = { id: string; url: string; ret: string };

export function redirectUri(): string {
  return `${window.location.origin}/spotify/callback`;
}

/** Extract the 22-char track id from an open.spotify.com/track/ID url. */
export function spotifyTrackId(url: string): string | null {
  const m = url.match(/track\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

function randomString(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ("0" + (b & 0xff).toString(16)).slice(-2)).join("").slice(0, len);
}

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(digest);
}

export function getCachedToken(): string | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as { access_token: string; expires_at: number };
    if (t.expires_at > Date.now() + 5000) return t.access_token;
  } catch {
    /* ignore */
  }
  return null;
}

/** Redirect to Spotify consent, remembering the track to save on return. */
export async function beginAuth(pending: Pending): Promise<void> {
  const verifier = randomString(96);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SCOPE,
    code_challenge_method: "S256",
    code_challenge: await codeChallenge(verifier),
  });
  window.location.href = `${AUTH_URL}?${params.toString()}`;
}

/** Exchange the auth code for an access token (PKCE; cached in sessionStorage). */
export async function exchangeCode(code: string): Promise<string | null> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) return null;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  sessionStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
    }),
  );
  return data.access_token;
}

export function readPending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}

export function clearPending(): void {
  sessionStorage.removeItem(PENDING_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
}

/** PUT /me/tracks — saves the track to "Liked Songs". */
export async function saveTrack(token: string, id: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type SaveResult = "saved" | "redirecting" | "opened" | "error";

/**
 * One-click entry point. Saves immediately if we hold a token; otherwise starts
 * the consent redirect. If the link isn't a track (e.g. an artist URL), just
 * opens it so the button never dead-ends.
 */
export async function saveToSpotify(url: string, ret: string): Promise<SaveResult> {
  const id = spotifyTrackId(url);
  if (!id) {
    window.open(url, "_blank", "noopener");
    return "opened";
  }
  const token = getCachedToken();
  if (token) {
    return (await saveTrack(token, id)) ? "saved" : "error";
  }
  await beginAuth({ id, url, ret });
  return "redirecting";
}
