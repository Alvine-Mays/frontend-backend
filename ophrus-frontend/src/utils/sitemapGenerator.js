// Générateur de sitemap dynamique pour l'application React
export const generateSitemap = (properties = []) => {
  const baseUrl = 'https://ophrus-immobilier.com';
  const currentDate = new Date().toISOString().split('T')[0];

  // Pages statiques
  const staticPages = [
    {
      url: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: '/home',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: '/properties',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: '/about',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: '/contact',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.8'
    }
  ];

  // Pages dynamiques des propriétés
  const propertyPages = properties.map(property => ({
    url: `/properties/${property.id}`,
    lastmod: property.updated_at ? new Date(property.updated_at).toISOString().split('T')[0] : currentDate,
    changefreq: 'weekly',
    priority: '0.8'
  }));

  const allPages = [...staticPages, ...propertyPages];

  // Génération du XML
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

  const xmlFooter = `</urlset>`;

  const xmlUrls = allPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  return xmlHeader + xmlUrls + '\n' + xmlFooter;
};

// Configuration des routes pour le sitemap
export const sitemapRoutes = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'daily'
  },
  {
    path: '/home',
    priority: 0.9,
    changefreq: 'daily'
  },
  {
    path: '/properties',
    priority: 0.9,
    changefreq: 'daily'
  },
  {
    path: '/about',
    priority: 0.7,
    changefreq: 'monthly'
  },
  {
    path: '/contact',
    priority: 0.8,
    changefreq: 'monthly'
  }
];

// Fonction pour télécharger le sitemap généré
export const downloadSitemap = (properties = []) => {
  const sitemapContent = generateSitemap(properties);
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Fonction pour valider le sitemap
export const validateSitemap = (sitemapContent) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemapContent, 'application/xml');
    
    // Vérifier s'il y a des erreurs de parsing
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      return {
        valid: false,
        error: 'Erreur de syntaxe XML'
      };
    }

    // Vérifier la structure de base
    const urlset = xmlDoc.getElementsByTagName('urlset');
    if (urlset.length === 0) {
      return {
        valid: false,
        error: 'Élément urlset manquant'
      };
    }

    const urls = xmlDoc.getElementsByTagName('url');
    if (urls.length === 0) {
      return {
        valid: false,
        error: 'Aucune URL trouvée'
      };
    }

    return {
      valid: true,
      urlCount: urls.length
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

