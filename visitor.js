import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET() {
  const count = await redis.incr("portfolio_visits");
  return new Response(JSON.stringify({ count }), {
    headers: { "Content-Type": "application/json" },
  });
}
