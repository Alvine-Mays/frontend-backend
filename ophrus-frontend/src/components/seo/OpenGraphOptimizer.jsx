import React from 'react';
import { Helmet } from 'react-helmet-async';

// Composant optimisé pour Open Graph et Twitter Cards
const OpenGraphOptimizer = ({
  title,
  description,
  image,
  url = window.location.href,
  type = 'website',
  siteName = 'Ophrus Immobilier',
  locale = 'fr_FR',
  twitterHandle = '@ophrus_immo',
  article = null, // Pour les articles/propriétés
  price = null, // Pour les propriétés avec prix
  availability = null // Pour les propriétés
}) => {
  const baseUrl = 'https://ophrus-immobilier.com';
  const fullImageUrl = image?.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Helmet>
      {/* Open Graph de base */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Open Graph optimisé pour les images */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={title} />

      {/* Twitter Cards optimisées */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />

      {/* Métadonnées spécifiques aux articles/propriétés */}
      {article && (
        <>
          <meta property="article:author" content={article.author} />
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:section" content={article.section} />
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Métadonnées spécifiques aux propriétés */}
      {price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content="EUR" />
        </>
      )}

      {availability && (
        <meta property="product:availability" content={availability} />
      )}

      {/* Métadonnées Facebook spécifiques */}
      <meta property="fb:app_id" content="your-facebook-app-id" />

      {/* Métadonnées LinkedIn */}
      <meta property="og:image:secure_url" content={fullImageUrl} />

      {/* Métadonnées WhatsApp */}
      <meta property="og:image:width" content="300" />
      <meta property="og:image:height" content="300" />
    </Helmet>
  );
};

// Composant spécialisé pour les propriétés
export const PropertyOpenGraph = ({ property }) => {
  const title = `${property.title || property.titre} - Ophrus Immobilier`;
  const description = property.description || 'Découvrez cette propriété exceptionnelle avec Ophrus Immobilier.';
  const image = property.images?.[0] || '/images/og/og-property.jpg';
  const url = `https://ophrus-immobilier.com/properties/${property.id}`;

  const article = {
    author: 'Ophrus Immobilier',
    publishedTime: property.created_at || new Date().toISOString(),
    modifiedTime: property.updated_at || new Date().toISOString(),
    section: 'Immobilier',
    tags: [
      property.type || 'Propriété',
      property.location || property.ville,
      'Immobilier de luxe'
    ].filter(Boolean)
  };

  return (
    <OpenGraphOptimizer
      title={title}
      description={description}
      image={image}
      url={url}
      type="article"
      article={article}
      price={property.price || property.prix}
      availability="in stock"
    />
  );
};

// Composant spécialisé pour les pages de listing
export const ListingOpenGraph = ({ title, description, image, itemCount }) => {
  const enhancedDescription = itemCount 
    ? `${description} ${itemCount} propriétés disponibles.`
    : description;

  return (
    <OpenGraphOptimizer
      title={title}
      description={enhancedDescription}
      image={image}
      type="website"
    />
  );
};

export default OpenGraphOptimizer;

