import { loadEnv } from 'vite'

export function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server) {
      // Charger les variables .env dans process.env
      const env = loadEnv('development', process.cwd(), '')
      Object.assign(process.env, env)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()

        const route = req.url.replace('/api/', '').split('?')[0]

        try {
          // Parser le body pour les POST
          if (req.method === 'POST') {
            req.body = await new Promise((resolve) => {
              let data = ''
              req.on('data', (chunk) => (data += chunk))
              req.on('end', () => {
                try { resolve(JSON.parse(data || '{}')) }
                catch { resolve({}) }
              })
            })
          }

          // Simuler l'API Vercel (res.status / res.json)
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }

          const mod = await server.ssrLoadModule(`/api/${route}.js`)
          await mod.default(req, res)
        } catch (e) {
          console.error(`API error [${route}]:`, e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}
