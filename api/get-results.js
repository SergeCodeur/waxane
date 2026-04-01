import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const [siteA, siteB] = await Promise.all([
    redis.get('votes:siteA'),
    redis.get('votes:siteB'),
  ])

  return res.status(200).json({
    siteA: Number(siteA) || 0,
    siteB: Number(siteB) || 0,
  })
}
