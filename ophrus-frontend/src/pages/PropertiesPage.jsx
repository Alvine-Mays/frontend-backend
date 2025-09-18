import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SortAsc, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProperty } from '../contexts/PropertyContext';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilters from '../components/properties/PropertyFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {Button} from '../components/ui/Button';
import {Select} from '../components/ui/Select';
import { cn } from '../lib/utils';
import SEOHead from '../components/seo/SEOHead';
import { PropertiesListStructuredData } from '../components/seo/StructuredData';
import { seoConfig } from '../utils/seoData';

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    properties, 
    loading, 
    pagination, 
    filters,
    fetchProperties, 
    setFilters 
  } = useProperty();
  
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-desc');

  const sortOptions = [
    { value: 'date-desc', label: 'Plus récent' },
    { value: 'date-asc', label: 'Plus ancien' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating-desc', label: 'Mieux notés' },
    { value: 'surface-desc', label: 'Plus grande surface' },
  ];

  useEffect(() => {
    // Initialize filters from URL params
    const initialFilters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      city: searchParams.get('city') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      bathrooms: searchParams.get('bathrooms') || '',
    };

    setFilters(initialFilters);
    fetchProperties(1, initialFilters);
  }, [searchParams]); // Add searchParams as a dependency

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handlePageChange = (page) => {
    fetchProperties(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    // Note: In a real app, you'd send this to the backend
    // For now, we'll just update the local state
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map(page => (
          <Button
            key={page}
            variant={page === pagination.page ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handlePageChange(page)}
            className="min-w-[40px]"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEOHead 
        title={seoConfig.properties.title}
        description={seoConfig.properties.description}
        keywords={seoConfig.properties.keywords}
        image={seoConfig.properties.image}
      />
      <PropertiesListStructuredData properties={properties} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos Propriétés
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez notre sélection de {pagination.total} propriétés exceptionnelles
          </p>
        </div>

        {/* Filters */}
        <PropertyFilters className="mb-8" />

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Results Count */}
            <div className="text-gray-600">
              {loading ? (
                'Chargement...'
              ) : (
                `${pagination.total} propriété${pagination.total > 1 ? 's' : ''} trouvée${pagination.total > 1 ? 's' : ''}`
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                options={sortOptions}
                className="min-w-[200px]"
              />

              {/* View Mode */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-blue-primary shadow-sm'
                      : 'text-gray-600 hover:text-blue-primary'
                  )}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-blue-primary shadow-sm'
                      : 'text-gray-600 hover:text-blue-primary'
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune propriété trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche pour voir plus de résultats.
            </p>
            <Button onClick={() => window.location.reload()}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              )}
            >
              {properties.map((property, index) => (
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

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Load More Button (Alternative to pagination) */}
        {!loading && properties.length > 0 && pagination.page < pagination.totalPages && (
          <div className="text-center mt-8">
            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              size="lg"
              variant="outline"
            >
              Charger plus de propriétés
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;



