import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/common/Toast';

// Hook pour les appels API avec gestion d'état et d'erreurs
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const {
    immediate = true,
    onSuccess = () => {},
    onError = () => {},
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Opération réussie'
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      setData(result);
      onSuccess(result);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(errorMessage);
      onError(err);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showErrorToast, showSuccessToast, successMessage, toast]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    retry
  };
};

// Hook pour les mutations (POST, PUT, DELETE)
export const useMutation = (apiFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const {
    onSuccess = () => {},
    onError = () => {},
    showErrorToast = true,
    showSuccessToast = true,
    successMessage = 'Opération réussie'
  } = options;

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      onSuccess(result);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
      setError(errorMessage);
      onError(err);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showErrorToast, showSuccessToast, successMessage, toast]);

  return {
    mutate,
    loading,
    error
  };
};

// Hook pour la pagination
export const usePagination = (apiFunction, options = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const {
    initialPage = 1,
    limit = 10,
    showErrorToast = true
  } = options;

  const fetchPage = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction({
        page,
        limit,
        ...filters
      });
      
      setData(result.data || result.items || []);
      setPagination(result.pagination || {
        currentPage: page,
        totalPages: Math.ceil((result.total || 0) / limit),
        totalItems: result.total || 0,
        hasNextPage: page < Math.ceil((result.total || 0) / limit),
        hasPrevPage: page > 1
      });
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, limit, showErrorToast, toast]);

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchPage(pagination.currentPage + 1);
    }
  }, [fetchPage, pagination.hasNextPage, pagination.currentPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      fetchPage(pagination.currentPage - 1);
    }
  }, [fetchPage, pagination.hasPrevPage, pagination.currentPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchPage(page);
    }
  }, [fetchPage, pagination.totalPages]);

  useEffect(() => {
    fetchPage(initialPage);
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    refresh: () => fetchPage(pagination.currentPage)
  };
};

// Hook pour la recherche avec debounce
export const useSearch = (apiFunction, options = {}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const {
    debounceMs = 300,
    minQueryLength = 2,
    showErrorToast = true
  } = options;

  const search = useCallback(async (searchQuery) => {
    if (searchQuery.length < minQueryLength) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(searchQuery);
      setResults(result.data || result || []);
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la recherche';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, minQueryLength, showErrorToast, toast]);

  // Debounce de la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query !== '') {
        search(query);
      } else {
        setResults([]);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, search, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    clearSearch
  };
};

// Hook pour la gestion du cache local
export const useLocalCache = (key, apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    immediate = true
  } = options;

  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          return cachedData;
        }
      }
    } catch (err) {
      console.warn('Erreur lors de la lecture du cache:', err);
    }
    return null;
  }, [key, ttl]);

  const setCachedData = useCallback((data) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn('Erreur lors de la sauvegarde du cache:', err);
    }
  }, [key]);

  const fetchData = useCallback(async (force = false) => {
    // Vérifier le cache d'abord
    if (!force) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction();
      
      setData(result);
      setCachedData(result);
      
      return result;
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, getCachedData, setCachedData]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    clearCache,
    refresh: () => fetchData(true)
  };
};

export default useApi;

