// Configuration SEO pour chaque page de l'application
export const seoConfig = {
  home: {
    title: 'Accueil - Ophrus Immobilier',
    description: 'Découvrez les plus belles propriétés de luxe avec Ophrus Immobilier. Achat, vente et location de biens immobiliers exceptionnels.',
    keywords: 'immobilier luxe, propriétés haut de gamme, achat maison, vente appartement, location villa',
    image: '/images/og/og-home.jpg'
  },
  properties: {
    title: 'Propriétés - Ophrus Immobilier',
    description: 'Parcourez notre sélection exclusive de propriétés de luxe. Maisons, appartements et villas d\'exception à vendre et à louer.',
    keywords: 'propriétés luxe, maisons vente, appartements location, villas haut de gamme, immobilier prestige',
    image: '/images/og/og-properties.jpg'
  },
  propertyDetail: (property) => ({
    title: `${property?.titre || 'Propriété'} - Ophrus Immobilier`,
    description: property?.description || 'Découvrez cette propriété exceptionnelle avec Ophrus Immobilier.',
    keywords: `${property?.categorie || 'propriété'}, ${property?.ville || 'immobilier'}, ${property?.prix ? 'prix ' + property.prix : 'luxe'}`,
    image: (property?.images?.[0]?.url) || '/images/og/og-property.jpg',
    type: 'article'
  }),
  about: {
    title: 'À Propos - Ophrus Immobilier',
    description: 'Découvrez l\'histoire et l\'expertise d\'Ophrus Immobilier, votre partenaire de confiance pour l\'immobilier de luxe.',
    keywords: 'ophrus immobilier, agence immobilière, expertise luxe, équipe professionnelle',
    image: '/images/og/og-about.jpg'
  },
  contact: {
    title: 'Contact - Ophrus Immobilier',
    description: 'Contactez nos experts en immobilier de luxe. Nous sommes là pour vous accompagner dans tous vos projets immobiliers.',
    keywords: 'contact ophrus, expert immobilier, conseil achat, accompagnement vente',
    image: '/images/og/og-contact.jpg'
  },
  login: {
    title: 'Connexion - Ophrus Immobilier',
    description: 'Connectez-vous à votre espace personnel Ophrus Immobilier pour gérer vos propriétés et favoris.',
    keywords: 'connexion, espace client, compte ophrus',
    image: '/images/og/og-login.jpg'
  },
  register: {
    title: 'Inscription - Ophrus Immobilier',
    description: 'Créez votre compte Ophrus Immobilier et accédez à nos services exclusifs d\'immobilier de luxe.',
    keywords: 'inscription, créer compte, services exclusifs',
    image: '/images/og/og-login.jpg'
  },
  dashboard: {
    title: 'Tableau de Bord - Ophrus Immobilier',
    description: 'Gérez vos propriétés, consultez vos statistiques et accédez à tous vos outils immobiliers.',
    keywords: 'tableau de bord, gestion propriétés, statistiques',
    image: '/images/og/og-default.jpg'
  },
  profile: {
    title: 'Mon Profil - Ophrus Immobilier',
    description: 'Gérez vos informations personnelles et préférences sur votre profil Ophrus Immobilier.',
    keywords: 'profil utilisateur, informations personnelles, préférences',
    image: '/images/og/og-default.jpg'
  },
  favorites: {
    title: 'Mes Favoris - Ophrus Immobilier',
    description: 'Retrouvez toutes vos propriétés favorites sauvegardées sur Ophrus Immobilier.',
    keywords: 'favoris, propriétés sauvegardées, sélection personnelle',
    image: '/images/og/og-properties.jpg'
  },
  addProperty: {
    title: 'Ajouter une Propriété - Ophrus Immobilier',
    description: 'Ajoutez votre propriété sur Ophrus Immobilier et bénéficiez de notre expertise pour la vendre ou la louer.',
    keywords: 'ajouter propriété, vendre maison, louer appartement, publier annonce',
    image: '/images/og/og-default.jpg'
  },
  messages: {
    title: 'Messages - Ophrus Immobilier',
    description: 'Consultez et gérez vos messages avec les autres utilisateurs et agents Ophrus Immobilier.',
    keywords: 'messages, communication, contact agents',
    image: '/images/og/og-contact.jpg'
  }
};

// Données structurées par défaut pour l'organisation
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Ophrus Immobilier",
  "description": "Agence immobilière spécialisée dans les propriétés de luxe",
  "url": "https://ophrus-immobilier.com",
  "logo": "https://ophrus-immobilier.com/images/logo.png",
  "image": "https://ophrus-immobilier.com/images/og-default.jpg",
  "telephone": "+33 1 23 45 67 89",
  "email": "contact@ophrus-immobilier.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Avenue des Champs-Élysées",
    "addressLocality": "Paris",
    "postalCode": "75008",
    "addressCountry": "FR"
  },
  "openingHours": "Mo-Fr 09:00-18:00",
  "sameAs": [
    "https://www.facebook.com/ophrus.immobilier",
    "https://www.instagram.com/ophrus_immobilier",
    "https://www.linkedin.com/company/ophrus-immobilier"
  ]
};

// Fonction pour générer les données structurées d'une propriété
export const generatePropertyStructuredData = (property) => {
  if (!property) return null;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstate",
    "name": property.titre,
    "description": property.description,
    "image": (property.images || []).map(img => img?.url).filter(Boolean),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.ville,
      "addressCountry": "CG"
    },
    "offers": {
      "@type": "Offer",
      "price": property.prix,
      "priceCurrency": "XAF",
      "availability": "https://schema.org/InStock"
    },
    "floorSize": property.superficie ? {
      "@type": "QuantitativeValue",
      "value": property.superficie,
      "unitCode": "MTK"
    } : undefined,
    "numberOfBedrooms": property.nombre_chambres,
    "numberOfBathroomsTotal": property.nombre_salles_bain
  };
};

