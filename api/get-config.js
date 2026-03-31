import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const config = await redis.get('config:sites')

  const defaultConfig = {
    siteA: { previewUrl: '#', imageUrl: '' },
    siteB: { previewUrl: '#', imageUrl: '' },
  }

  return res.status(200).json(config || defaultConfig)
}
