// ELITE GAME$ - Cloudflare Worker ("eegs").  Deploy: Cloudflare -> Workers & Pages -> eegs -> Edit code -> paste -> Deploy.
// This file is NOT served by GitHub Pages; it only lives in the repo as the source of truth.
//
// Roblox APIs do not allow browser calls from other sites (CORS), so this Worker relays a small ALLOWLIST of public,
// read-only Roblox endpoints and adds CORS headers. No API keys, nothing is stored.
//
// IMPORTANT: the workers.dev address must be PUBLIC. If "Cloudflare Access" is turned on for it, every request is
// redirected to a login page and the live numbers on eegs.blog stop working.
//
// URL scheme:  https://<worker>/<service>/<roblox path>   service = games | groups | users | thumbnails
//   GET  /games/v2/groups/{id}/games?accessFilter=Public&limit=100&sortOrder=Asc
//   GET  /games/v1/games?universeIds=1,2,3
//   GET  /groups/v1/groups/{id}
//   GET  /groups/v1/users/{userId}/groups/roles
//   GET  /users/v1/users/{userId}
//   GET  /thumbnails/v1/users/avatar-headshot?userIds={id}
//   GET  /thumbnails/v1/games/multiget/thumbnails?universeIds=1,2,3
//   POST /users/v1/usernames/users   body {"usernames":["Name"]}
//   GET  /img?u=<https://*.rbxcdn.com/...>
//   GET  /health

const ORIGINS = ['https://eegs.blog', 'https://www.eegs.blog'];
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/; // local testing

const ROUTES = [
  // [method, service, path regex, query builder, cache seconds]
  ['GET', 'games', /^\/v2\/groups\/\d{1,12}\/games$/, () => 'accessFilter=Public&limit=100&sortOrder=Asc', 60],
  ['GET', 'games', /^\/v1\/games$/, q => need(ids(q.get('universeIds'), 50), v => 'universeIds=' + v), 5],
  ['GET', 'groups', /^\/v1\/groups\/\d{1,12}$/, () => '', 5],
  ['GET', 'groups', /^\/v1\/users\/\d{1,15}\/groups\/roles$/, () => '', 300],
  ['GET', 'users', /^\/v1\/users\/\d{1,15}$/, () => '', 300],
  ['GET', 'thumbnails', /^\/v1\/users\/avatar-headshot$/, q => need(ids(q.get('userIds'), 10), v => 'userIds=' + v + '&size=150x150&format=Png&isCircular=false'), 300],
  ['GET', 'thumbnails', /^\/v1\/games\/multiget\/thumbnails$/, q => need(ids(q.get('universeIds'), 20), v => 'universeIds=' + v + '&countPerUniverse=1&size=768x432&format=Webp'), 3600],
  ['POST', 'users', /^\/v1\/usernames\/users$/, () => '', 0],
];

// returns null when a required query value is missing or invalid
const need = (v, f) => (v ? f(v) : null);

function ids(v, max) {
  if (!v || !/^\d{1,15}(,\d{1,15})*$/.test(v)) return '';
  const a = v.split(',');
  return a.length <= max ? a.join(',') : '';
}

function cors(req) {
  const o = req.headers.get('Origin') || '';
  const allow = ORIGINS.includes(o) || LOCAL.test(o) ? o : ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function out(req, body, status, extra) {
  return new Response(body, { status, headers: { ...cors(req), 'X-Content-Type-Options': 'nosniff', ...extra } });
}
const json = (req, obj, status = 200, maxAge = 0) =>
  out(req, JSON.stringify(obj), status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': maxAge ? `public, max-age=${maxAge}` : 'no-store' });

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return out(req, null, 204);
    if (url.pathname === '/health') return json(req, { ok: true, time: new Date().toISOString() });

    // image proxy (ID card avatar) so the canvas is not tainted
    if (url.pathname === '/img' && req.method === 'GET') {
      let u;
      try { u = new URL(url.searchParams.get('u') || ''); } catch { return json(req, { error: 'bad url' }, 400); }
      if (u.protocol !== 'https:' || !/(^|\.)rbxcdn\.com$/.test(u.hostname)) return json(req, { error: 'host' }, 400);
      const r = await fetch(u.toString(), { cf: { cacheTtl: 3600, cacheEverything: true } });
      const ct = r.headers.get('content-type') || '';
      if (!r.ok || !/^image\//i.test(ct)) return json(req, { error: 'upstream' }, 502);
      return out(req, r.body, 200, { 'Content-Type': ct, 'Cache-Control': 'public, max-age=3600' });
    }

    const m = url.pathname.match(/^\/(games|groups|users|thumbnails)(\/.*)$/);
    if (!m) return json(req, { error: 'not found' }, 404);
    const [, svc, path] = m;
    const route = ROUTES.find(r => r[0] === req.method && r[1] === svc && r[2].test(path));
    if (!route) return json(req, { error: 'not found' }, 404);
    const q = route[3](url.searchParams);
    if (q === null) return json(req, { error: 'bad query' }, 400);
    const target = `https://${svc}.roblox.com${path}${q ? '?' + q : ''}`;
    const ttl = route[4];

    let init = { method: req.method, headers: { 'Accept': 'application/json', 'User-Agent': 'eegs.blog worker' } };
    if (req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch { return json(req, { error: 'bad body' }, 400); }
      const n = Array.isArray(b && b.usernames) && b.usernames.length === 1 ? String(b.usernames[0]) : '';
      if (!/^[A-Za-z0-9_]{3,20}$/.test(n)) return json(req, { error: 'bad username' }, 400);
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify({ usernames: [n], excludeBannedUsers: true });
    } else if (ttl) {
      init.cf = { cacheTtl: ttl, cacheEverything: true };
    }

    let r;
    try { r = await fetch(target, init); } catch { return json(req, { error: 'upstream' }, 502); }
    const text = await r.text();
    return out(req, text, r.status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': r.ok && ttl ? `public, max-age=${Math.min(ttl, 60)}` : 'no-store',
    });
  },
};
