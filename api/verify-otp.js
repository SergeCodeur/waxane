import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { numero, code, siteChoice } = req.body || {}
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'

  if (!numero || !code) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  if (siteChoice !== 'siteA' && siteChoice !== 'siteB') {
    return res.status(400).json({ error: 'invalid_site_choice' })
  }

  // Vérifier le code OTP
  const storedCode = await redis.get(`otp:${numero}`)

  if (!storedCode || String(storedCode) !== String(code)) {
    return res.status(400).json({ error: 'invalid_code' })
  }

  // Vote valide : incrémenter, marquer numéro + IP comme votés, supprimer OTP
  await Promise.all([
    redis.incr(`votes:${siteChoice}`),
    redis.set(`voted:${numero}`, '1'),
    redis.set(`voted:ip:${ip}`, '1'),
    redis.del(`otp:${numero}`),
  ])

  return res.status(200).json({ success: true })
}
