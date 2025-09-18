# Ophrus Immobilier - Frontend Moderne

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
- Node.js 18+ 
- pnpm (recommandé) ou npm

### Installation des dépendances
```bash
cd ophrus-frontend-modern
pnpm install
```

### Configuration
1. Copiez le fichier `.env.example` vers `.env`
2. Configurez l'URL de votre backend :
```env
VITE_API_URL=http://localhost:5000/api
```

### Démarrage en développement
```bash
pnpm run dev
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

## 🎨 Design System

### Couleurs Principales
- **Primary** : Dégradé doré (#d4af37 → #b87333)
- **Secondary** : Gris élégant (#64748b)
- **Success** : Vert (#10b981)
- **Error** : Rouge (#ef4444)

### Composants UI
- **Button** : 6 variantes (primary, secondary, outline, ghost, danger, success)
- **Input** : Champs de saisie avec validation
- **Select** : Listes déroulantes stylisées
- **Modal** : Modales responsives
- **LoadingSpinner** : Indicateurs de chargement

### Classes CSS Personnalisées
- `.btn-luxury` : Boutons avec effet doré
- `.property-card` : Cartes de propriétés avec animations
- `.text-luxury` : Texte avec dégradé doré
- `.fade-in`, `.slide-up`, `.scale-in` : Animations d'entrée

## 📱 Pages Disponibles

### Pages Publiques
- **/** : Page d'accueil avec hero section et propriétés vedettes
- **/properties** : Liste des propriétés avec filtres
- **/properties/:id** : Détail d'une propriété
- **/login** : Connexion
- **/register** : Inscription
- **/contact** : Contact avec formulaire
- **/about** : À propos de l'entreprise

### Pages Protégées
- **/dashboard** : Tableau de bord utilisateur
- **/profile** : Gestion du profil
- **/favorites** : Propriétés favorites
- **/add-property** : Ajouter une propriété
- **/edit-property/:id** : Modifier une propriété

## 🔐 Authentification

Le système d'authentification utilise :
- **JWT Tokens** stockés dans localStorage
- **Contexte React** pour la gestion d'état
- **Routes protégées** avec redirection automatique
- **Intercepteurs Axios** pour l'ajout automatique des tokens

## 📊 Gestion d'État

### AuthContext
- Gestion de l'utilisateur connecté
- Fonctions de login/logout/register
- Mise à jour du profil

### PropertyContext
- Gestion des propriétés
- Filtres et recherche
- Favoris et notations
- Pagination

## 🎯 Fonctionnalités Avancées

### Recherche et Filtres
- Recherche textuelle
- Filtres par catégorie, prix, ville
- Filtres par nombre de chambres/salles de bain
- Tri par prix, date, note, surface

### Gestion des Images
- Upload multiple d'images
- Prévisualisation en temps réel
- Galerie avec modal plein écran
- Optimisation automatique

### Notifications
- Toast notifications avec React Hot Toast
- Messages de succès/erreur
- Notifications en temps réel

## 🚀 Déploiement

### Build de Production
```bash
pnpm run build
```

### Déploiement avec Manus
```bash
# Déploiement automatique
manus deploy frontend
```

### Variables d'Environnement de Production
```env
VITE_API_URL=https://votre-api.com/api
```

## 🧪 Tests

### Tests Locaux
1. Démarrez le backend sur le port 5000
2. Démarrez le frontend : `pnpm run dev`
3. Testez les fonctionnalités principales :
   - Inscription/Connexion
   - Navigation entre les pages
   - Recherche de propriétés
   - Ajout aux favoris

### Tests de Responsive
- Testez sur différentes tailles d'écran
- Vérifiez les menus mobiles
- Testez les interactions tactiles

## 📝 Personnalisation

### Modification des Couleurs
Éditez le fichier `src/App.css` pour changer les couleurs :
```css
:root {
  --color-gold: #votre-couleur;
  --color-copper: #votre-couleur;
}
```

### Ajout de Nouvelles Pages
1. Créez le composant dans `src/pages/`
2. Ajoutez la route dans `src/App.jsx`
3. Mettez à jour la navigation dans `src/components/layout/Navbar.jsx`

### Modification du Logo
Remplacez le logo dans `src/components/layout/Navbar.jsx` et `src/components/layout/Footer.jsx`

## 🐛 Dépannage

### Erreurs Communes

**Erreur CORS**
- Vérifiez la configuration CORS du backend
- Assurez-vous que l'URL de l'API est correcte

**Erreurs d'Authentification**
- Vérifiez que le token JWT est valide
- Contrôlez les intercepteurs Axios

**Images non affichées**
- Vérifiez les chemins d'images
- Assurez-vous que le serveur de fichiers fonctionne

### Logs de Debug
Activez les logs en mode développement :
```javascript
console.log('Debug info:', data);
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email : contact@ophrus-immobilier.fr
- GitHub Issues : [Créer une issue](https://github.com/votre-repo/issues)

---

**Développé avec ❤️ par l'équipe Ophrus Immobilier**

