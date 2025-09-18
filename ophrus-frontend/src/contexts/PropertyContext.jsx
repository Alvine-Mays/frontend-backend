import React, { createContext, useContext, useReducer } from 'react';
import propertyAPI from '../lib/api'; // ✅ correct
import toast from 'react-hot-toast';

const PropertyContext = createContext();

const initialState = {
  properties: [],
  currentProperty: null,
  favorites: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
  },
};

const propertyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: action.payload.properties,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_PROPERTY':
      return { ...state, currentProperty: action.payload, loading: false };
    case 'ADD_PROPERTY':
      return {
        ...state,
        properties: [action.payload, ...state.properties],
        loading: false,
      };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p =>
          p._id === action.payload._id ? action.payload : p
        ),
        currentProperty: state.currentProperty?._id === action.payload._id 
          ? action.payload 
          : state.currentProperty,
        loading: false,
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p._id !== action.payload),
        loading: false,
      };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'TOGGLE_FAVORITE':
      const propertyId = action.payload;
      const isFavorite = state.favorites.includes(propertyId);
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(id => id !== propertyId)
          : [...state.favorites, propertyId],
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const PropertyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  const fetchProperties = async (page = 1, filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await propertyAPI.getAll({ page, ...filters });
      dispatch({
        type: 'SET_PROPERTIES',
        payload: {
          properties: response.data.properties,
          pagination: response.data.pagination,
        },
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors du chargement des propriétés';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  };

  const fetchPropertyById = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await propertyAPI.getById(id);
      dispatch({ type: 'SET_CURRENT_PROPERTY', payload: response.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Propriété non trouvée';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  };

  const createProperty = async (propertyData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await propertyAPI.create(propertyData);
      dispatch({ type: 'ADD_PROPERTY', payload: response.data });
      toast.success('Propriété créée avec succès');
      return { success: true, property: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la création';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProperty = async (id, propertyData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await propertyAPI.update(id, propertyData);
      dispatch({ type: 'UPDATE_PROPERTY', payload: response.data });
      toast.success('Propriété mise à jour avec succès');
      return { success: true, property: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteProperty = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await propertyAPI.delete(id);
      dispatch({ type: 'DELETE_PROPERTY', payload: id });
      toast.success('Propriété supprimée avec succès');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const toggleFavorite = async (propertyId) => {
    try {
      await propertyAPI.toggleFavorite(propertyId);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: propertyId });
      toast.success('Favoris mis à jour');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour des favoris';
      toast.error(message);
    }
  };

  const rateProperty = async (propertyId, rating) => {
    try {
      const response = await propertyAPI.rate(propertyId, rating);
      dispatch({ type: 'UPDATE_PROPERTY', payload: response.data });
      toast.success('Note ajoutée avec succès');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la notation';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchProperties,
    fetchPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    toggleFavorite,
    rateProperty,
    setFilters,
    resetFilters,
    clearError,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

