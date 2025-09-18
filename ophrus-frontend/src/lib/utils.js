import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-property.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imagePath}`;
};

export const getPropertyTypeIcon = (category) => {
  const icons = {
    'Appartement': '🏢',
    'Maison': '🏠',
    'Terrain': '🌍',
    'Commercial': '🏪',
    'Autre': '🏘️'
  };
  return icons[category] || icons['Autre'];
};

export const getPropertyFeatures = (property) => {
  const features = [];
  
  if (property.nombre_chambres) {
    features.push(`${property.nombre_chambres} chambre${property.nombre_chambres > 1 ? 's' : ''}`);
  }
  
  if (property.nombre_salles_bain) {
    features.push(`${property.nombre_salles_bain} salle${property.nombre_salles_bain > 1 ? 's' : ''} de bain`);
  }
  
  if (property.superficie) {
    features.push(`${property.superficie} m²`);
  }
  
  if (property.garage) features.push('Garage');
  if (property.piscine) features.push('Piscine');
  if (property.jardin) features.push('Jardin');
  if (property.balcon) features.push('Balcon');
  if (property.gardien) features.push('Gardien');
  
  return features;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return d;
};

export const getStarRating = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('★');
  }
  
  if (hasHalfStar) {
    stars.push('☆');
  }
  
  while (stars.length < 5) {
    stars.push('☆');
  }
  
  return stars.join('');
};

export const sortProperties = (properties, sortBy) => {
  const sorted = [...properties];
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.prix - b.prix);
    case 'price-desc':
      return sorted.sort((a, b) => b.prix - a.prix);
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'rating-desc':
      return sorted.sort((a, b) => (b.noteMoyenne || 0) - (a.noteMoyenne || 0));
    case 'surface-desc':
      return sorted.sort((a, b) => (b.superficie || 0) - (a.superficie || 0));
    default:
      return sorted;
  }
};

export const filterProperties = (properties, filters) => {
  return properties.filter(property => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${property.titre} ${property.description} ${property.ville} ${property.adresse}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) return false;
    }
    
    // Category filter
    if (filters.category && property.categorie !== filters.category) {
      return false;
    }
    
    // Price filters
    if (filters.minPrice && property.prix < parseInt(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && property.prix > parseInt(filters.maxPrice)) {
      return false;
    }
    
    // City filter
    if (filters.city && !property.ville.toLowerCase().includes(filters.city.toLowerCase())) {
      return false;
    }
    
    // Bedrooms filter
    if (filters.bedrooms && property.nombre_chambres < parseInt(filters.bedrooms)) {
      return false;
    }
    
    // Bathrooms filter
    if (filters.bathrooms && property.nombre_salles_bain < parseInt(filters.bathrooms)) {
      return false;
    }
    
    return true;
  });
};

