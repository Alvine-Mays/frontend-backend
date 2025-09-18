import React, { useEffect, useState } from 'react';
import { Heart, Grid, List } from 'lucide-react';
import { useProperty } from '../contexts/PropertyContext';
import PropertyCard from '../components/properties/PropertyCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {Button} from '../components/ui/Button';
import { cn } from '../lib/utils';

const FavoritesPage = () => {
  const { properties, favorites, loading, fetchProperties } = useProperty();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    const filtered = properties.filter(property => favorites.includes(property._id));
    setFavoriteProperties(filtered);
  }, [properties, favorites]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
          </div>
          <p className="text-gray-600">
            Retrouvez toutes les propriétés que vous avez ajoutées à vos favoris
          </p>
        </div>

        {/* Toolbar */}
        {favoriteProperties.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-gray-600">
                {favoriteProperties.length} propriété{favoriteProperties.length > 1 ? 's' : ''} en favoris
              </div>
              
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-yellow-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-yellow-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : favoriteProperties.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explorez nos propriétés et ajoutez celles qui vous intéressent à vos favoris 
              en cliquant sur l'icône cœur.
            </p>
            <Button onClick={() => window.location.href = '/properties'}>
              Découvrir les propriétés
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {favoriteProperties.map((property, index) => (
              <div
                key={property._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PropertyCard
                  property={property}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

