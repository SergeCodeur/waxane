import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const [config, resultsPublished, votingOpen] = await Promise.all([
    redis.get('config:sites'),
    redis.get('config:resultsPublished'),
    redis.get('config:votingOpen'),
  ])

  const defaultConfig = {
    siteA: { previewUrl: '#', imageUrl: '' },
    siteB: { previewUrl: '#', imageUrl: '' },
  }

  return res.status(200).json({
    ...(config || defaultConfig),
    resultsPublished: String(resultsPublished) === '1',
    votingOpen: votingOpen === null ? true : String(votingOpen) === '1',
  })
}
