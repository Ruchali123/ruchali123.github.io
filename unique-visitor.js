// Vercel Serverless Function (Node) - unique visitor counter using Upstash Redis REST API
// Deploy on Vercel and set environment variables:
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

export default async function handler(req, res) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL; // e.g. https://us1-xxxx.upstash.io
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if(!url || !token) {
      return res.status(500).json({ error: 'Upstash credentials not configured' });
    }

    // Get visitor IP (Vercel usually forwards in x-forwarded-for)
    const xf = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip = xf.split(',')[0].trim();

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Add IP to Redis set 'visitors'
    await fetch(`${url}/commands`, {
      method: 'POST',
      headers,
      body: JSON.stringify(["SADD", "visitors", ip])
    });

    // Get unique count size
    const scard = await fetch(`${url}/commands`, {
      method: 'POST',
      headers,
      body: JSON.stringify(["SCARD", "visitors"])
    }).then(r=>r.json());

    // Upstash returns array of command results, handle both shapes
    const count = Array.isArray(scard) && scard[0] && typeof scard[0].result !== 'undefined' ? scard[0].result : (scard.result || 0);

    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
