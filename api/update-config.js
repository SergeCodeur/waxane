import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Vérifier le token admin
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const token = auth.replace('Bearer ', '')
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const password = decoded.split(':')[0]
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Token invalide' })
    }
  } catch {
    return res.status(401).json({ error: 'Token invalide' })
  }

  const { siteA, siteB, resultsPublished } = req.body || {}

  if (!siteA || !siteB) {
    return res.status(400).json({ error: 'Configuration incomplète' })
  }

  const config = {
    siteA: {
      previewUrl: siteA.previewUrl || '#',
      imageUrl: siteA.imageUrl || '',
    },
    siteB: {
      previewUrl: siteB.previewUrl || '#',
      imageUrl: siteB.imageUrl || '',
    },
  }

  await Promise.all([
    redis.set('config:sites', config),
    redis.set('config:resultsPublished', resultsPublished ? '1' : '0'),
  ])

  return res.status(200).json({ success: true, config, resultsPublished: !!resultsPublished })
}
