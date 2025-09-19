# Déploiement sur Render (API Ophrus Backend)

Ce guide explique comment déployer l'API Node/Express/Mongo sur Render en tant que Web Service.

## Prérequis
- Repository GitHub connecté
- Variables d'environnement prêtes (voir `.env.example`)
- Node 20.x

## Étapes
1. Sur Render, créez un nouveau Web Service et connectez le repo `Alvine-Mays/frontend-backend`.
2. Répertoire racine du service: `ophrus-backend`.
3. Paramètres de build et démarrage:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Runtime:
   - Node version: `20.x`
5. Variables d'environnement (Render → Settings → Environment):
   - `PORT=5000` (Render fournit PORT automatiquement; Express utilise `process.env.PORT`)
   - `NODE_ENV=production`
   - `MONGO_URI=...` (Atlas)
   - `JWT_SECRET=...`
   - `FRONTEND_URL=https://<votre-front-vercel>`
   - Optionnel: `DASHBOARD_URL=...`
   - Optionnels (fail‑soft): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

Notes sécurité & logs
- Ne commitez jamais vos secrets dans le code.
- En l'absence de Cloudinary, l'API logue un avertissement et l'upload d'images renvoie une erreur 503 explicite (le reste de l'API fonctionne).
- En l'absence de JWT_SECRET, la génération de token renvoie une erreur claire.

6. Activer Auto-Deploy depuis GitHub (sur push/PR vers `main`).

## Notes
- Les cookies httpOnly de refresh (`rt`) sont configurés automatiquement en production avec `secure: true` et `sameSite: 'lax'`.
- CORS est configuré avec `credentials: true` et une whitelist basée sur `FRONTEND_URL`.
- La connexion MongoDB est établie uniquement dans `server.js` avant `app.listen`.
