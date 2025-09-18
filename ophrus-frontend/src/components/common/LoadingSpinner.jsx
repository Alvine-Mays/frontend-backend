import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Chargement...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className={`${sizeClasses.xl} text-blue-600 animate-spin mx-auto mb-4`} />
          <p className={`${textSizeClasses.lg} text-gray-600 font-medium`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin mx-auto mb-2`} />
        {text && (
          <p className={`${textSizeClasses[size]} text-gray-600`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Composant pour les boutons avec état de chargement
export const LoadingButton = ({ 
  loading, 
  children, 
  disabled, 
  className = '',
  loadingText = 'Chargement...',
  ...props 
}) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`relative ${className} ${loading ? 'cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
};

// Composant pour les cartes avec état de chargement
export const LoadingCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
};

// Composant pour les listes avec état de chargement
export const LoadingList = ({ items = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;

