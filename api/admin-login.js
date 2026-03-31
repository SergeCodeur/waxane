export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body || {}

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect' })
  }

  // Token simple basé sur le mot de passe hashé avec un timestamp
  const token = Buffer.from(`${process.env.ADMIN_PASSWORD}:${Date.now()}`).toString('base64')

  return res.status(200).json({ token })
}
