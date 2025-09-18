import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ Lors du chargement initial, vérifie si l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          dispatch({
            type: 'SET_USER',
            payload: { user: response.data, token },
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // ✅ Fonction de connexion
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      dispatch({ type: 'SET_USER', payload: { user, token } });

      toast.success('Connexion réussie !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message }; // ✅ Correction ici
    }
  };

  // ✅ Fonction d'inscription
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register(userData);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      dispatch({ type: 'SET_USER', payload: { user, token } });
      toast.success('Inscription réussie !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Erreur d'inscription";
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message }; // ✅ Correction ici aussi
    }
  };

  // ✅ Déconnexion
  const logout = async () => {
    try {
      await authAPI.logout?.(); // Appel API seulement s’il existe
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      toast.success('Déconnexion réussie');
    }
  };

  // ✅ Mise à jour du profil
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      dispatch({
        type: 'SET_USER',
        payload: { user: response.data, token: state.token },
      });
      toast.success('Profil mis à jour avec succès');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de mise à jour';
      toast.error(message);
      return { success: false, message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
