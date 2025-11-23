export default async function handler(req, res) {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if(!url || !token) return res.status(500).json({ error: 'Missing Upstash env vars' });

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const headers = { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` };

    await fetch(`${url}/commands`, { method:'POST', headers, body: JSON.stringify(["SADD", "visitors", ip]) });
    const scard = await fetch(`${url}/commands`, { method:'POST', headers, body: JSON.stringify(["SCARD", "visitors"]) }).then(r=>r.json());

    const count = scard.result ?? scard[0]?.result ?? 0;
    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error:'server error' });
  }
}
