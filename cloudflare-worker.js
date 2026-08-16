/**
 * cloudflare-worker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cloudflare Worker: CDN proxy in front of Supabase Storage
 *
 * This Worker:
 *   - Accepts requests to https://images.orators.workers.dev/<bucket>/<path>
 *   - Proxies them to https://axcateydvmmhukwvvvvt.supabase.co/storage/v1/object/public/<bucket>/<path>
 *   - Sets Cache-Control: public, max-age=31536000, immutable (1 year)
 *   - Cloudflare automatically caches the response at the edge
 *
 * DEPLOY:
 *   1. Install Wrangler: npm install -g wrangler
 *   2. Log in: wrangler login
 *   3. Deploy: wrangler deploy cloudflare-worker.js --name orators-images
 *   4. Your Worker URL: https://orators-images.<your-account>.workers.dev
 *
 * CUSTOM DOMAIN (optional):
 *   In Cloudflare Dashboard → Workers → orators-images → Triggers → Custom Domains
 *   Add: images.yourdomain.com
 *   (Your domain must be on Cloudflare)
 *
 * ALTERNATIVE — Direct CNAME (test first!):
 *   Add CNAME: images.yourdomain.com → axcateydvmmhukwvvvvt.supabase.co
 *   This may not work due to Supabase multi-tenant routing.
 *   Use the Worker approach if the CNAME returns 404s or wrong content.
 *
 * AFTER DEPLOYING:
 *   Set VITE_CDN_BASE_URL=https://orators-images.<your-account>.workers.dev
 *   in your .env file, then rebuild/redeploy the app.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SUPABASE_STORAGE_BASE = 'https://awgdgyfiouazirwdinni.supabase.co/storage/v1/object/public';

// 1 year — safe because all uploaded filenames are UUID-based.
// When an image is "replaced", a new UUID filename is used, so old CDN
// cache naturally becomes orphaned (unreachable), not stale.
const CACHE_TTL = 31536000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // url.pathname = "/<bucket>/<rest-of-path>"
    const upstreamUrl = SUPABASE_STORAGE_BASE + url.pathname + url.search;

    // Check Cloudflare's cache first
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from Supabase Storage
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        // Forward Accept header so Supabase returns the right content type
        Accept: request.headers.get('Accept') || '*/*',
      },
    });

    if (!upstreamResponse.ok) {
      return new Response(`Image not found: ${upstreamResponse.status}`, {
        status: upstreamResponse.status,
      });
    }

    // Build the response with CDN cache headers
    const response = new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': upstreamResponse.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': `public, max-age=${CACHE_TTL}, immutable`,
        'CDN-Cache-Control': `public, max-age=${CACHE_TTL}`,
        'Vary': 'Accept',
        // CORS — allow your frontend to load images
        'Access-Control-Allow-Origin': '*',
      },
    });

    // Store in Cloudflare cache (async, doesn't block response)
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
