const fs = require('fs');
const path = require('path');
const { specs } = require('../docs/swagger');

// Générer la documentation JSON
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

// Sauvegarder la spécification OpenAPI
const outputPath = path.join(docsDir, 'api-spec.json');
fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log('✅ Documentation API générée avec succès !');
console.log(`📄 Fichier: ${outputPath}`);
console.log('🌐 Pour voir la documentation interactive, démarrez le serveur et visitez /api-docs');

// Générer un fichier README pour la documentation
const readmeContent = `# Documentation API Ophrus Immobilier

## Accès à la documentation

### Documentation interactive (Swagger UI)
- **URL de développement**: http://localhost:5000/api-docs
- **URL de production**: https://api.ophrus.com/api-docs

### Fichier de spécification OpenAPI
- **Fichier JSON**: \`docs/api-spec.json\`

## Authentification

L'API utilise l'authentification JWT (JSON Web Token). Pour accéder aux endpoints protégés :

1. Obtenez un token via \`POST /api/auth/login\`
2. Incluez le token dans l'en-tête Authorization : \`Bearer <votre-token>\`

## Endpoints principaux

### Authentification
- \`POST /api/auth/register\` - Inscription
- \`POST /api/auth/login\` - Connexion
- \`POST /api/auth/forgot-password\` - Demande de réinitialisation
- \`POST /api/auth/reset-password\` - Réinitialisation du mot de passe

### Propriétés
- \`GET /api/properties\` - Liste des propriétés (avec filtres)
- \`GET /api/properties/:id\` - Détails d'une propriété
- \`POST /api/properties\` - Créer une propriété (authentifié)
- \`PUT /api/properties/:id\` - Modifier une propriété (authentifié)
- \`DELETE /api/properties/:id\` - Supprimer une propriété (authentifié)

### Messages
- \`POST /api/messages\` - Envoyer un message de contact
- \`GET /api/messages\` - Liste des messages (admin)

### Administration
- \`GET /api/admin/stats\` - Statistiques générales (admin)
- \`GET /api/admin/users\` - Liste des utilisateurs (admin)

## Codes de réponse

- \`200\` - Succès
- \`201\` - Créé avec succès
- \`400\` - Erreur de validation
- \`401\` - Non authentifié
- \`403\` - Non autorisé
- \`404\` - Ressource non trouvée
- \`429\` - Trop de requêtes (rate limiting)
- \`500\` - Erreur serveur

## Exemples d'utilisation

### Inscription
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "motDePasse": "MonMotDePasse123!",
    "telephone": "+242 06 123 45 67"
  }'
\`\`\`

### Connexion
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "jean.dupont@example.com",
    "motDePasse": "MonMotDePasse123!"
  }'
\`\`\`

### Créer une propriété
\`\`\`bash
curl -X POST http://localhost:5000/api/properties \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <votre-token>" \\
  -d '{
    "titre": "Belle maison moderne",
    "description": "Une magnifique maison avec jardin",
    "prix": 150000000,
    "type": "maison",
    "statut": "vente",
    "adresse": "123 Avenue de la Paix",
    "ville": "Brazzaville"
  }'
\`\`\`

## Support

Pour toute question concernant l'API, contactez l'équipe de développement à contact@ophrus.com
`;

const readmePath = path.join(docsDir, 'README.md');
fs.writeFileSync(readmePath, readmeContent);

console.log(`📖 README généré: ${readmePath}`);
console.log('✨ Documentation complète générée !');

