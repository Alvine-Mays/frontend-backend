import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  fallback = null,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setIsError(true);
    onError();
  };

  // Placeholder par défaut
  const defaultPlaceholder = (
    <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  );

  // Fallback par défaut en cas d'erreur
  const defaultFallback = (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="text-center text-gray-500">
        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Image non disponible</p>
      </div>
    </div>
  );

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder pendant le chargement */}
      {!isLoaded && !isError && (placeholder || defaultPlaceholder)}
      
      {/* Image principale */}
      {isInView && !isError && (
        <img
          src={src}
          alt={alt}
          className={`
            transition-opacity duration-300 
            ${isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}
            ${className}
          `}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Fallback en cas d'erreur */}
      {isError && (fallback || defaultFallback)}
    </div>
  );
};

// Composant spécialisé pour les images de propriétés
export const PropertyImage = ({ 
  src, 
  alt, 
  className = '',
  showOverlay = false,
  overlayContent = null,
  ...props 
}) => {
  return (
    <div className={`relative group ${className}`}>
      <LazyImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        {...props}
      />
      
      {/* Overlay au survol */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {overlayContent}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour les avatars avec lazy loading
export const LazyAvatar = ({ 
  src, 
  alt, 
  size = 'md',
  fallbackText = '',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const fallback = (
    <div className={`
      ${sizes[size]} 
      bg-blue-500 text-white rounded-full 
      flex items-center justify-center font-semibold
      ${className}
    `}>
      {fallbackText.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover ${className}`}
      fallback={fallback}
      {...props}
    />
  );
};

export default LazyImage;

