import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { useMutation } from '../../hooks/useApi';
import api, { favoritesAPI } from '../../lib/api';

const FavoriteButton = ({ 
  propertyId, 
  className = '',
  size = 'md',
  showText = false 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Mutation pour ajouter/supprimer des favoris
  const { mutate: toggleFavorite, loading } = useMutation(
    async () => {
      if (isFavorite) {
        return await favoritesAPI.remove(propertyId);
      } else {
        return await favoritesAPI.add(propertyId);
      }
    },
    {
      onSuccess: () => {
        setIsFavorite(!isFavorite);
        toast.success(
          isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris',
          { duration: 2000 }
        );
      },
      onError: () => {
        toast.error('Erreur lors de la mise à jour des favoris');
      },
      showSuccessToast: false
    }
  );

  // Vérifier si la propriété est en favori au chargement
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && propertyId) {
        try {
          const response = await favoritesAPI.getAll();
          const favorites = response.data || [];
          // Le backend renvoie des Property peuplées; on compare par _id
          setIsFavorite(favorites.some(fav => (fav._id || fav.id) === propertyId));
        } catch (error) {
          console.error('Erreur lors de la vérification des favoris:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, propertyId]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Connectez-vous pour ajouter des favoris');
      return;
    }

    toggleFavorite();
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        flex items-center space-x-1 transition-all duration-200
        ${isFavorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart 
        className={`
          ${sizes[size]} transition-all duration-200
          ${isFavorite ? 'fill-current' : ''}
          ${loading ? 'animate-pulse' : ''}
        `}
      />
      {showText && (
        <span className="text-sm font-medium">
          {isFavorite ? 'Favori' : 'Ajouter'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;

