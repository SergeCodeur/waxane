import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { numero, siteChoice } = req.body || {}

  if (!numero || typeof numero !== 'string' || !numero.trim()) {
    return res.status(400).json({ error: 'missing_numero' })
  }

  if (siteChoice !== 'siteA' && siteChoice !== 'siteB') {
    return res.status(400).json({ error: 'invalid_site_choice' })
  }

  // Vérifier si ce numéro a déjà voté
  const alreadyVoted = await redis.get(`voted:${numero}`)
  if (alreadyVoted) {
    return res.status(403).json({ error: 'already_voted' })
  }

  // Générer un code OTP à 6 chiffres
  const code = String(Math.floor(100000 + Math.random() * 900000))

  // Stocker dans Redis avec TTL 24h
  await redis.set(`otp:${numero}`, code, { ex: 86400 })

  // Envoyer via WaChap
  try {
    const wachapRes = await fetch('https://app.wachap.com/api/v1/message/send-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WACHAP_API_KEY}`,
      },
      body: JSON.stringify({
        phoneNumberId: process.env.WACHAP_PHONE_ID,
        to: numero,
        text: `Votre code de vote Waxané est : ${code}. Valable 24h.`,
      }),
    })

    if (!wachapRes.ok) {
      return res.status(500).json({ error: 'send_failed' })
    }
  } catch {
    return res.status(500).json({ error: 'send_failed' })
  }

  return res.status(200).json({ success: true })
}
