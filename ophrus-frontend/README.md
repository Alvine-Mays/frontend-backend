# Ophrus Immobilier - Frontend (Vite + React + Tailwind v4)

Ce frontend est prêt pour Vercel et consomme l'API Render avec authentification Access + Refresh via cookie httpOnly.

## Configuration rapide
1) Copiez `.env.example` → `.env` puis définissez:
```
VITE_API_URL=https://<render-service>.onrender.com/api
```
2) Installez et lancez
```
npm install
npm run dev
```

## Auth: Access + Refresh (cookie httpOnly)
- L'API place un cookie httpOnly `rt` (secure en prod) au login/register.
- Le client stocke uniquement l'access token (`localStorage.token`).
- Axios est configuré avec `withCredentials: true` et un intercepteur 401 qui tente `POST /users/refresh-token` (sans payload), met à jour le token et rejoue la requête. En échec: purge et redirection /login.

Endpoints utilisés:
- POST /api/users/login, /api/users/register, GET /api/users/profil, POST /api/users/refresh-token, POST /api/users/logout

## Tailwind CSS (v4)
- Plugin PostCSS: `@tailwindcss/postcss` (déjà configuré dans `postcss.config.js`).
- Les directives Tailwind sont importées via `src/App.css` (et ce fichier est importé dans `src/main.jsx`).
- Thème et couleurs custom via `@theme inline` dans `src/App.css`.

Notes importantes:
- Vite 7 requiert Node.js >= 20.19 (ou >= 22.12). Si le build échoue localement, mettez Node à jour. La CI utilise Node 20.x récent.
- Si les classes Tailwind ne s’appliquent pas:
  - Assurez-vous que `src/App.css` contient bien `@tailwind base; @tailwind components; @tailwind utilities;` et qu’il est importé par `main.jsx` (c’est le cas ici).
  - Vérifiez que les fichiers sources sont inclus (cf. `tailwind.config.js` > content).

## Déploiement Vercel
- Framework: Vite React
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://<render-service>.onrender.com/api`

---

Une application immobilière de luxe développée avec React, Tailwind CSS et les meilleures pratiques du secteur.

## 🌟 Caractéristiques

### Design Luxueux & Moderne
- Interface inspirée des leaders du marché (Safti, Barnes, Knight Frank, Christie's)
- Palette de couleurs dorées et élégantes
- Animations subtiles et transitions fluides
- Design responsive optimisé mobile-first

### Fonctionnalités Complètes
- **Authentification** : Inscription, connexion, gestion de profil
- **Propriétés** : Recherche avancée, filtres intelligents, favoris
- **Tableau de bord** : Gestion des propriétés, statistiques, activité
- **Pages** : Accueil, propriétés, détails, contact, à propos
- **Responsive** : Optimisé pour tous les appareils

### Technologies Utilisées
- **React 19** avec hooks modernes
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- **Lucide Icons** pour les icônes
- **Framer Motion** pour les animations
- **React Hot Toast** pour les notifications
- **Axios** pour les appels API

## 🚀 Installation

### Prérequis
- Node.js 20.19+ recommandé (ou 22.12+)
- npm

### Installation des dépendances
```bash
npm install
```

### Configuration
1. Copiez le fichier `.env.example` vers `.env`
2. Configurez l'URL de votre backend :
```env
VITE_API_URL=http://localhost:5000/api
```

### Démarrage en développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔧 Configuration Backend

### Structure API Attendue

Le frontend est conçu pour fonctionner avec le backend Ophrus-immo. Voici les endpoints requis :

#### Authentification
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `POST /api/users/logout` - Déconnexion
- `GET /api/users/profil` - Profil utilisateur
- `PUT /api/users/:id` - Mise à jour profil

#### Propriétés
- `GET /api/properties` - Liste des propriétés
- `GET /api/properties/:id` - Détail d'une propriété
- `POST /api/properties` - Créer une propriété
- `PUT /api/properties/:id` - Modifier une propriété
- `DELETE /api/properties/:id` - Supprimer une propriété
- `POST /api/properties/favoris/:id` - Toggle favori
- `POST /api/properties/rate/:id` - Noter une propriété

#### Messages
- `GET /api/messages` - Liste des messages
- `POST /api/messages` - Créer un message

#### Réservations (location)
- `POST /api/reservations` - Créer une réservation (body: { propertyId, date })
- `GET /api/reservations/my` - Mes réservations
- `GET /api/reservations/owner` - Réservations reçues pour mes biens
- `PATCH /api/reservations/:id/cancel` - Annuler
- `PATCH /api/reservations/:id/confirm` - Confirmer (propriétaire/admin)

### Configuration CORS

Assurez-vous que votre backend autorise les requêtes CORS depuis `http://localhost:5173` :

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Composants d'authentification
│   ├── layout/         # Layout (Navbar, Footer)
│   ├── properties/     # Composants liés aux propriétés
│   └── ui/             # Composants UI de base
├── contexts/           # Contextes React (Auth, Property)
├── hooks/              # Hooks personnalisés
├── lib/                # Utilitaires et API
├── pages/              # Pages de l'application
└── assets/             # Assets statiques
```

## 🔐 Authentification

Le système d'authentification utilise :
- **JWT Token** d'accès dans localStorage
- **Cookie httpOnly** pour le refresh géré côté serveur
- **Intercepteur Axios** pour le refresh automatique sur 401
- **Routes protégées** et redirection automatique

## 🐛 Dépannage Tailwind
- Mettre à jour Node à ≥ 20.19 si Vite refuse de builder.
- Vérifier que `@tailwindcss/postcss` est bien présent dans `postcss.config.js`.
- Confirmer que `src/App.css` est importé par `src/main.jsx`.
- Si vous avez ajouté des fichiers, vérifiez que `tailwind.config.js` couvre bien leurs chemins dans `content`.
