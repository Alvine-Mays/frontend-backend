# Déploiement sur Vercel (Ophrus Frontend)

Ce guide explique comment déployer le frontend React/Vite sur Vercel.

## Prérequis
- Repository GitHub connecté
- URL publique de l'API Render

## Étapes
1. Sur Vercel, créez un nouveau projet depuis le repo `Alvine-Mays/frontend-backend`.
2. Répertoire racine du projet: `ophrus-frontend`.
3. Framework Preset: `Vite` (React).
4. Variables d'environnement (Vercel → Settings → Environment Variables):
   - `VITE_API_URL=https://<render-service>.onrender.com/api`
   - Ne commitez jamais ces variables dans le code; utilisez .env.local pour du dev local (voir `.env.local.example`).
5. Commandes de build:
   - Build Command: `npm run build` (alias de `vite build`)
   - Output Directory: `dist`
6. Activer les déploiements automatiques sur push/PR vers `main`.

## Notes
- Axios est configuré avec `withCredentials: true` pour envoyer le cookie httpOnly de refresh.
- Un intercepteur tente automatiquement un refresh (`POST /users/refresh-token`) en cas de 401, puis rejoue la requête.
- Le logout appelle `POST /users/logout` sans payload; le backend nettoie le cookie et la DB.
