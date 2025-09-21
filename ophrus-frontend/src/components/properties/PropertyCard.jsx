import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProperty } from '../../contexts/PropertyContext';
import { formatPrice, getImageUrl, getPropertyTypeIcon } from '../../lib/utils';
import {Button} from '../ui/Button';
import { cn } from '../../lib/utils';
import StarRating from '../common/StarRating';

const PropertyCard = ({ property, className }) => {
  const { isAuthenticated } = useAuth();
  const { toggleFavorite, favorites } = useProperty();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isFavorite = favorites.includes(property._id);
  const mainImage = property.images?.[0]?.url || '/placeholder-property.jpg';

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleFavorite(property._id);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  return (
    <div className={cn('property-card group', className)}>
      {/* Image Container */}
      <div className="property-card-image">
        <Link to={`/properties/${property._id}`}>
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Chargement...</div>
            </div>
          )}
          <img
            src={imageError ? '/placeholder-property.jpg' : getImageUrl(mainImage)}
            alt={property.titre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div className="gradient-overlay" />
        </Link>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
              {getPropertyTypeIcon(property.categorie)} {property.categorie}
            </div>
            {isAuthenticated && (
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  'p-2 rounded-full backdrop-blur-sm transition-all duration-300',
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white bg-opacity-90 text-gray-700 hover:bg-red-500 hover:text-white'
                )}
              >
                <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
              </button>
            )}
          </div>

          {/* Bottom Row */}
          <div className="text-white">
            <div className="text-2xl font-bold mb-1">
              {formatPrice(property.prix)}
            </div>
            <div className="flex items-center space-x-1 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              <span>{property.ville}</span>
            </div>
          </div>
        </div>

        {/* View Button */}
        <Link
          to={`/properties/${property._id}`}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Button variant="primary" size="sm" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Voir</span>
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="p-6">
        <Link to={`/properties/${property._id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-primary transition-colors line-clamp-2">
            {property.titre}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Features */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          {property.nombre_chambres > 0 && (
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span>{property.nombre_chambres}</span>
            </div>
          )}
          {property.nombre_salles_bain > 0 && (
            <div className="flex items-center space-x-1">
              <Bath className="w-4 h-4" />
              <span>{property.nombre_salles_bain}</span>
            </div>
          )}
          {property.superficie > 0 && (
            <div className="flex items-center space-x-1">
              <Square className="w-4 h-4" />
              <span>{property.superficie} m²</span>
            </div>
          )}
        </div>

        {/* Rating and Actions */}
        <div className="flex items-center justify-between">
          <StarRating value={property.noteMoyenne || 0} />
          <Link to={`/properties/${property._id}`}>
            <Button variant="outline" size="sm">
              Détails
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

