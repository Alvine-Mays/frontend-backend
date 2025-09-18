import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title = 'Ophrus Immobilier - Propriétés de Luxe',
  description = 'Ophrus Immobilier - Plateforme immobilière de luxe pour l\'achat, la vente et la location de propriétés exceptionnelles',
  keywords = 'immobilier, luxe, propriétés, achat, vente, location, maison, appartement',
  image = '/images/og/og-default.jpg',
  url = window.location.href,
  type = 'website',
  author = 'Ophrus Immobilier',
  siteName = 'Ophrus Immobilier',
  locale = 'fr_FR',
  twitterHandle = '@ophrus_immo',
  structuredData = null,
  canonical = null,
  noIndex = false,
  article = null
}) => {
  const fullTitle = title.includes('Ophrus') ? title : `${title} | Ophrus Immobilier`;
  const canonicalUrl = canonical || url;
  const baseUrl = 'https://ophrus-immobilier.com';
  const fullImageUrl = image?.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Helmet>
      {/* Métadonnées de base */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Métadonnées de langue */}
      <meta httpEquiv="content-language" content="fr" />
      <meta name="language" content="French" />

      {/* Open Graph optimisé */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Cards optimisées */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:domain" content="ophrus-immobilier.com" />

      {/* Métadonnées spécifiques aux articles */}
      {article && (
        <>
          <meta property="article:author" content={article.author || author} />
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:section" content={article.section || 'Immobilier'} />
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Métadonnées additionnelles */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="msapplication-TileImage" content="/images/ms-icon-144x144.png" />
      
      {/* Métadonnées pour les moteurs de recherche */}
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

      {/* Métadonnées pour les réseaux sociaux */}
      <meta property="fb:app_id" content="your-facebook-app-id" />
      <meta name="pinterest-rich-pin" content="true" />

      {/* Données structurées JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Préconnexions pour améliorer les performances */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//connect.facebook.net" />

      {/* Liens alternatifs */}
      <link rel="alternate" type="application/rss+xml" title="Ophrus Immobilier - Nouvelles Propriétés" href="/feed.xml" />
      <link rel="alternate" hrefLang="fr" href={url} />
      <link rel="alternate" hrefLang="en" href={url.replace('ophrus-immobilier.com', 'ophrus-immobilier.com/en')} />
      <link rel="alternate" hrefLang="x-default" href={url} />
    </Helmet>
  );
};

export default SEOHead;

