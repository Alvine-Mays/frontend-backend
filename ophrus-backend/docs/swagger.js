const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ophrus Immobilier API',
      version: '1.0.0',
      description: 'API REST pour la plateforme immobilière Ophrus',
      contact: {
        name: 'Équipe Ophrus',
        email: 'contact@ophrus.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.ophrus.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['nom', 'prenom', 'email', 'motDePasse'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur'
            },
            nom: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Nom de famille'
            },
            prenom: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Prénom'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email unique'
            },
            telephone: {
              type: 'string',
              pattern: '^\\+242\\s?\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}$',
              description: 'Numéro de téléphone au format +242 XX XXX XX XX'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              description: 'Rôle de l\'utilisateur'
            },
            dateInscription: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'inscription'
            }
          }
        },
        Property: {
          type: 'object',
          required: ['titre', 'description', 'prix', 'type', 'statut', 'adresse', 'ville'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique de la propriété'
            },
            titre: {
              type: 'string',
              minLength: 5,
              maxLength: 200,
              description: 'Titre de la propriété'
            },
            description: {
              type: 'string',
              minLength: 20,
              maxLength: 2000,
              description: 'Description détaillée'
            },
            prix: {
              type: 'number',
              minimum: 0,
              description: 'Prix en CFA'
            },
            type: {
              type: 'string',
              enum: ['maison', 'appartement', 'terrain', 'bureau', 'commerce'],
              description: 'Type de propriété'
            },
            statut: {
              type: 'string',
              enum: ['vente', 'location'],
              description: 'Statut de la propriété'
            },
            superficie: {
              type: 'number',
              minimum: 0,
              description: 'Superficie en m²'
            },
            nombreChambres: {
              type: 'integer',
              minimum: 0,
              maximum: 20,
              description: 'Nombre de chambres'
            },
            nombreSallesBain: {
              type: 'integer',
              minimum: 0,
              maximum: 10,
              description: 'Nombre de salles de bain'
            },
            adresse: {
              type: 'string',
              minLength: 10,
              maxLength: 200,
              description: 'Adresse complète'
            },
            ville: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Ville'
            },
            quartier: {
              type: 'string',
              maxLength: 100,
              description: 'Quartier'
            },
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
              description: 'Latitude GPS'
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
              description: 'Longitude GPS'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'URLs des images'
            },
            proprietaire: {
              type: 'string',
              description: 'ID du propriétaire'
            },
            dateCreation: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            },
            dateModification: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        Message: {
          type: 'object',
          required: ['nom', 'email', 'sujet', 'message'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID unique du message'
            },
            nom: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Nom de l\'expéditeur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'expéditeur'
            },
            telephone: {
              type: 'string',
              pattern: '^\\+242\\s?\\d{2}\\s?\\d{3}\\s?\\d{2}\\s?\\d{2}$',
              description: 'Téléphone de l\'expéditeur'
            },
            sujet: {
              type: 'string',
              minLength: 5,
              maxLength: 100,
              description: 'Sujet du message'
            },
            message: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              description: 'Contenu du message'
            },
            dateEnvoi: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'envoi'
            },
            lu: {
              type: 'boolean',
              default: false,
              description: 'Message lu ou non'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Champ concerné par l\'erreur'
                  },
                  message: {
                    type: 'string',
                    description: 'Message d\'erreur spécifique'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Message de succès'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Gestion de l\'authentification'
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs'
      },
      {
        name: 'Properties',
        description: 'Gestion des propriétés'
      },
      {
        name: 'Messages',
        description: 'Gestion des messages de contact'
      },
      {
        name: 'Admin',
        description: 'Fonctionnalités d\'administration'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Ophrus API Documentation'
  })
};

