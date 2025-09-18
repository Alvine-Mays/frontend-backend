import React, { useState, useEffect, useRef, useMemo } from 'react';

const VirtualizedList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = '',
  onScroll = () => {},
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();

  // Calculer les éléments visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Éléments à rendre
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const handleScroll = (e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll(e);
  };

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: top,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant spécialisé pour les listes de propriétés
export const VirtualizedPropertyList = ({ 
  properties, 
  onPropertyClick,
  className = '' 
}) => {
  const renderProperty = (property, index) => (
    <div 
      className="bg-white rounded-lg shadow-sm border p-4 mx-2 my-1 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onPropertyClick(property)}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
          {property.images && property.images[0] && (
            <img
              src={property.images[0]}
              alt={property.titre}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {property.titre}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {property.adresse}, {property.ville}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-blue-600">
              {property.prix?.toLocaleString()} CFA
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {property.type} • {property.statut}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VirtualizedList
      items={properties}
      itemHeight={100}
      containerHeight={600}
      renderItem={renderProperty}
      className={className}
    />
  );
};

// Hook pour la virtualisation avec pagination infinie
export const useInfiniteVirtualization = (
  fetchData,
  options = {}
) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const {
    threshold = 200, // Distance du bas pour déclencher le chargement
    limit = 20
  } = options;

  const loadMore = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const result = await fetchData({ page, limit });
      
      if (result.data && result.data.length > 0) {
        setItems(prev => [...prev, ...result.data]);
        setPage(prev => prev + 1);
        setHasMore(result.pagination?.hasNextPage || false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore();
    }
  };

  const reset = () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
  };

  useEffect(() => {
    loadMore();
  }, []);

  return {
    items,
    loading,
    hasMore,
    handleScroll,
    loadMore,
    reset
  };
};

export default VirtualizedList;

