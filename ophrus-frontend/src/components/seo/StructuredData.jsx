import React from 'react';
import { Helmet } from 'react-helmet-async';

// Composant pour les données structurées spécifiques aux pages
const StructuredData = ({ data }) => {
  if (!data) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

// Données structurées pour la page d'accueil
export const HomeStructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ophrus Immobilier",
    "url": "https://ophrus-immobilier.com",
    "description": "Plateforme immobilière de luxe pour l'achat, la vente et la location de propriétés exceptionnelles",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ophrus-immobilier.com/properties?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://ophrus-immobilier.com/#organization"
    }
  };

  return <StructuredData data={data} />;
};

// Données structurées pour la liste des propriétés
export const PropertiesListStructuredData = ({ properties }) => {
  if (!properties || properties.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Propriétés de luxe - Ophrus Immobilier",
    "description": "Liste des propriétés de luxe disponibles à l'achat et à la location",
    "numberOfItems": properties.length,
    "itemListElement": properties.map((property, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "RealEstate",
        "@id": `https://ophrus-immobilier.com/properties/${property.id}`,
        "name": property.title || property.titre,
        "description": property.description,
        "image": property.images?.[0] || property.image,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": property.location || property.ville,
          "addressCountry": "FR"
        },
        "offers": {
          "@type": "Offer",
          "price": property.price || property.prix,
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  return <StructuredData data={data} />;
};

// Données structurées pour les pages de contenu (À propos, Contact)
export const WebPageStructuredData = ({ title, description, url }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "isPartOf": {
      "@type": "WebSite",
      "@id": "https://ophrus-immobilier.com/#website"
    },
    "about": {
      "@type": "Organization",
      "@id": "https://ophrus-immobilier.com/#organization"
    }
  };

  return <StructuredData data={data} />;
};

// Données structurées pour les avis et témoignages
export const ReviewsStructuredData = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://ophrus-immobilier.com/#organization",
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5
      },
      "reviewBody": review.text,
      "datePublished": review.date
    }))
  };

  return <StructuredData data={data} />;
};

export default StructuredData;

