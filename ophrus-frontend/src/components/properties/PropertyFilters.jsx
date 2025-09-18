import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useProperty } from '../../contexts/PropertyContext';
import {Input} from '../ui/Input';
import {Select} from '../ui/Select';
import {Button} from '../ui/Button';
import { cn } from '../../lib/utils';

const PropertyFilters = ({ className }) => {
  const { filters, setFilters, resetFilters, fetchProperties } = useProperty();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const categoryOptions = [
    { value: 'Appartement', label: 'Appartement' },
    { value: 'Maison', label: 'Maison' },
    { value: 'Terrain', label: 'Terrain' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Autre', label: 'Autre' },
  ];

  const bedroomOptions = [
    { value: '1', label: '1+ chambre' },
    { value: '2', label: '2+ chambres' },
    { value: '3', label: '3+ chambres' },
    { value: '4', label: '4+ chambres' },
    { value: '5', label: '5+ chambres' },
  ];

  const bathroomOptions = [
    { value: '1', label: '1+ salle de bain' },
    { value: '2', label: '2+ salles de bain' },
    { value: '3', label: '3+ salles de bain' },
    { value: '4', label: '4+ salles de bain' },
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setFilters(localFilters);
    fetchProperties(1, localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      bedrooms: '',
      bathrooms: '',
    });
    resetFilters();
    fetchProperties(1, {});
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '');

  return (
    <div className={cn('bg-white rounded-xl shadow-lg p-6', className)}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher par titre, ville, adresse..."
          value={localFilters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-700 hover:text-yellow-600 transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span>Filtres avancés</span>
          {hasActiveFilters && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              {Object.values(localFilters).filter(v => v !== '').length}
            </span>
          )}
        </button>

        <div className="flex space-x-2">
          <Button onClick={handleSearch} size="sm">
            Rechercher
          </Button>
          {hasActiveFilters && (
            <Button onClick={handleReset} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 animate-fade-in">
          {/* Category */}
          <Select
            label="Type de propriété"
            value={localFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            options={categoryOptions}
            placeholder="Tous les types"
          />

          {/* City */}
          <Input
            label="Ville"
            value={localFilters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Entrez une ville"
          />

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Prix (CFA)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={localFilters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min"
              />
              <Input
                type="number"
                value={localFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <Select
            label="Chambres"
            value={localFilters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            options={bedroomOptions}
            placeholder="Nombre de chambres"
          />

          {/* Bathrooms */}
          <Select
            label="Salles de bain"
            value={localFilters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            options={bathroomOptions}
            placeholder="Nombre de salles de bain"
          />

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <Button onClick={handleSearch} className="flex-1">
              Appliquer
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Réinitialiser
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;

