import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

  // Récupérer toutes les clés voted:* (exclure voted:ip:*)
  const keys = await redis.keys('voted:*')
  const voters = keys
    .filter((k) => !k.startsWith('voted:ip:'))
    .map((k) => k.replace('voted:', ''))

  return res.status(200).json({ voters })
}
