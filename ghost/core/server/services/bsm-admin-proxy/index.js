/**
 * bsm-admin-proxy
 * ==============
 * Server-side relay for the small set of Admin API operations the backspace.fm
 * theme needs (create a draft live/archive post, invite an author).
 *
 * The Ghost Admin API key lives ONLY in the Ghost config
 * (`bsmAdminProxy.adminKey`), never in client-side JS. Routes are registered on
 * the members app, so the browser includes the member session cookies; the
 * member's uuid is resolved from the session and checked against
 * `bsmAdminProxy.memberUuids` (the same set the theme's IsAdminUser enforces in
 * the UI) before any Admin API call is made on their behalf.
 *
 * Config (in config.production.json):
 *   "bsmAdminProxy": {
 *     "adminKey": "id:secret",
 *     "memberUuids": ["<uuid>", ...],
 *     "authorRoleId": "<ghost role id>"   // optional, default = Author
 *   }
 */
const crypto = require('crypto');
const config = require('../../../shared/config');

const DEFAULT_AUTHOR_ROLE_ID = '625058cc2938e6d91d3f6f2d';
const ADMIN_JWT_TTL_SECONDS = 60 * 5; // Ghost admin tokens are valid up to 5 min

const bsmAdminProxyConfig = () => config.get('bsmAdminProxy') || {};

/** base64url encoding (URL-safe, no padding). */
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** Sign a short-lived Ghost Admin API JWT from the id:secret admin key. */
function createAdminToken(adminKey) {
  const [id, secret] = adminKey.split(':');
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({alg: 'HS256', kid: id, typ: 'JWT'}));
  const payload = base64url(JSON.stringify({iat: now, exp: now + ADMIN_JWT_TTL_SECONDS, aud: '/admin/'}));
  const signature = crypto
    .createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payload}.${signature}`;
}

/**
 * True when the requester (resolved from the member session by loadMemberSession)
 * is a logged-in member whose uuid is in bsmAdminProxy.memberUuids.
 */
function isAuthorizedAdminMember(req) {
  const cfg = bsmAdminProxyConfig();
  const member = req.member;
  if (!member) {
    return false;
  }
  const uuid = member.uuid ?? (typeof member.get === 'function' ? member.get('uuid') : null);
  return Array.isArray(cfg.memberUuids) && cfg.memberUuids.includes(uuid);
}

/** Absolute base URL of the Ghost Admin API for this instance. */
function adminBaseUrl() {
  const siteUrl = (config.get('url') || 'https://backspace.fm').replace(/\/$/, '');
  return `${siteUrl}/ghost/api/admin/`;
}

/** POST a payload to the Admin API with a freshly-signed server-side JWT. */
async function adminRequest(path, {method = 'POST', body = null} = {}) {
  const cfg = bsmAdminProxyConfig();
  if (!cfg.adminKey) {
    return {
      ok: false,
      status: 500,
      data: {errors: [{message: 'bsmAdminProxy.adminKey is not configured'}]}
    };
  }
  const response = await fetch(`${adminBaseUrl()}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Ghost ${createAdminToken(cfg.adminKey)}`
    },
    ...(body ? {body: JSON.stringify(body)} : {})
  });
  // Read the body as text and parse defensively: response.json() can throw and
  // otherwise mask a successful create when the body cannot be parsed.
  let data = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // non-JSON body; keep data = {}
    }
  }
  return {ok: response.ok, status: response.status, data, text};
}

/** Look the created post up by slug (returns the first match). */
async function findPostBySlug(slug) {
  if (!slug) {
    return null;
  }
  const res = await adminRequest(`posts/?filter=${encodeURIComponent('slug:' + slug)}&limit=1`);
  return res.ok ? (res.data?.posts?.[0] || null) : null;
}

/** Small helper to truncate raw response text for diagnostics. */
function safeSnippet(text) {
  if (typeof text !== 'string') {
    return text;
  }
  return text.length > 400 ? text.slice(0, 400) + '…' : text;
}

function reject(res, status, message) {
  return res.status(status).json({ok: false, error: message});
}

async function createPost(req, res, next) {
  try {
    if (!isAuthorizedAdminMember(req)) {
      return reject(res, 403, 'Forbidden: not an authorised admin member');
    }
    const post = req.body?.post;
    if (!post || typeof post !== 'object') {
      return reject(res, 400, 'POST body must contain { post: {...} }');
    }
    const result = await adminRequest('posts/', {body: {posts: [post]}});
    let created = result.ok ? (result.data?.posts?.[0] || null) : null;
    let lookedUp = false;
    if (result.ok && !created) {
      created = await findPostBySlug(post.slug);
      lookedUp = true;
    }
    if (!result.ok) {
      return res.status(result.status).json({ok: false, error: 'Admin API error', data: result.data, status: result.status, raw: safeSnippet(result.text)});
    }
    return res.json({
      ok: true,
      post: created,
      status: result.status,
      raw: safeSnippet(result.text),
      lookedUp
    });
  } catch (err) {
    return next(err);
  }
}

async function createInvite(req, res, next) {
  try {
    if (!isAuthorizedAdminMember(req)) {
      return reject(res, 403, 'Forbidden: not an authorised admin member');
    }
    const email = req.body?.email;
    if (typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return reject(res, 400, 'POST body must contain a valid { email }');
    }
    const cfg = bsmAdminProxyConfig();
    const roleId = cfg.authorRoleId || DEFAULT_AUTHOR_ROLE_ID;
    const result = await adminRequest('invites/', {body: {invites: [{email, role_id: roleId}]}});
    if (!result.ok) {
      return res.status(result.status).json({ok: false, error: 'Admin API error', data: result.data, text: result.text});
    }
    return res.json({ok: true, invite: result.data?.invites?.[0] || null});
  } catch (err) {
    return next(err);
  }
}

module.exports = {createPost, createInvite};
