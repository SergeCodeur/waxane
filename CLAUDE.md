# Waxané Vote — CLAUDE.md

## Projet

Page de vote pour un 1v1 de devs web (Yapacux vs Carlos).
30 votants max, vote anonyme vérifié par OTP WhatsApp, un seul vote par numéro.

## Stack

- Frontend : React + Vite (JSX, CSS par composant)
- Package manager : Bun
- Backend : Vercel Serverless Functions (`/api`)
- DB : Upstash Redis (via `@upstash/redis`)
- WhatsApp : WaChap API
- Déploiement : Vercel

## Structure des fichiers

```
/
├── index.html
├── package.json
├── bun.lockb
├── vite.config.js
├── vercel.json
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   ├── App.css
│   └── components/
│       ├── SiteCard.jsx
│       ├── SiteCard.css
│       ├── VoteModal.jsx
│       ├── VoteModal.css
│       ├── OtpInput.jsx
│       ├── OtpInput.css
│       ├── AdminLogin.jsx
│       ├── AdminLogin.css
│       ├── AdminDashboard.jsx
│       └── AdminDashboard.css
└── api/
    ├── send-otp.js
    ├── verify-otp.js
    ├── get-results.js
    ├── admin-login.js
    ├── get-config.js
    └── update-config.js
```

## Variables d'environnement

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
WACHAP_API_KEY=
WACHAP_PHONE_ID=
ADMIN_PASSWORD=
```

## Redis — structure des clés

- `otp:{numero}` → code 6 chiffres, TTL 86400s
- `voted:{numero}` → "1", permanent
- `votes:siteA` → compteur
- `votes:siteB` → compteur
- `config:sites` → JSON `{ siteA: { previewUrl, imageUrl }, siteB: { previewUrl, imageUrl } }`

## WaChap — appel API

```
POST https://app.wachap.com/api/v1/message/send-text
Authorization: Bearer {WACHAP_API_KEY}
{
  "phoneNumberId": "{WACHAP_PHONE_ID}",
  "to": "{numero}",
  "text": "Votre code de vote Waxané est : {code}. Valable 24h."
}
```

## Flow utilisateur

1. Page affiche Site A et Site B côte à côte (aperçus images)
2. Clic sur "Voter pour ce site"
3. Modale → saisie numéro WhatsApp (format international ex: 22960000000)
4. Clic "Recevoir mon code" → backend vérifie `voted:{numero}` inexistant → génère code → stocke `otp:{numero}` TTL 86400s → envoie via WaChap
5. Saisie du code → backend valide `otp:{numero}` → incrémente `votes:siteA` ou `votes:siteB` → pose `voted:{numero}` permanent → supprime `otp:{numero}`
6. Message de confirmation

## Palette imposée

- Fond : `#FAF7F2` / `#F0EBE3`
- Texte : `#1A1A1A` / `#6B6360`
- Boutons/accents : `#C4622D`

## Règles

- Approche agile : une itération à la fois, attendre validation avant de passer à la suivante
- Ne jamais exposer les clés API côté client
- Mobile first, responsive obligatoire
- Pas de framework CSS externe
