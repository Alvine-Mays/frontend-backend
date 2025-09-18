import axios from 'axios';

// Récupération dynamique de l’URL de l’API depuis les variables d’environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Création de l’instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur des requêtes pour injecter le token JWT
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du token :', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur des réponses pour gérer les erreurs (notamment 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ------------------------------------------
// Authentification
// ------------------------------------------
export const authAPI = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (userData) => api.post('/users/register', userData),
  logout: () => api.post('/users/logout'),
  getProfile: () => api.get('/users/profil'),
  updateProfile: (userData) => api.put(`/users/${userData.id}`, userData),
  refreshToken: () => api.post('/users/refresh-token'),
  requestPasswordReset: (email) => api.post('/users/reset-request', { email }),
  verifyResetCode: (email, code) => api.post('/users/reset-verify', { email, code }),
  resetPassword: (email, code, newPassword) =>
    api.post('/users/reset-password', { email, code, newPassword }),
};

// ------------------------------------------
// Propriétés
// ------------------------------------------
export const propertyAPI = {
  getAll: (params = {}) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (propertyData) => {
    const formData = new FormData();

    Object.keys(propertyData).forEach((key) => {
      if (key !== 'images') {
        formData.append(key, propertyData[key]);
      }
    });

    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, propertyData) => {
    const formData = new FormData();

    Object.keys(propertyData).forEach((key) => {
      if (key !== 'images') {
        formData.append(key, propertyData[key]);
      }
    });

    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return api.put(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/properties/${id}`),
  toggleFavorite: (id) => api.patch(`/properties/${id}/favori`),
  rate: (id, rating) => api.post(`/properties/${id}/rate`, { note: rating }),
  getWithRating: (id) => api.get(`/properties/${id}/with-rating`)
};

// ------------------------------------------
// Messages
// ------------------------------------------
export const messageAPI = {
  getInbox: () => api.get('/messages/inbox'),
  getMessagesWithUser: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (receiverId, content) =>
    api.post(`/messages/${receiverId}`, { contenu: content }),
  contactOphrus: (subject, content) =>
    api.post('/messages/ophrus', { sujet: subject, contenu: content }),
  getUnreadCount: () => api.get('/messages/unread'),
  markAsRead: (messageId) => api.patch(`/messages/${messageId}/read`),
  markThreadAsRead: (userId) => api.patch(`/messages/thread/${userId}/read`),
  getAll: () => api.get('/messages'),
  getById: (id) => api.get(`/messages/${id}`),
  create: (messageData) => api.post('/messages', messageData),
  update: (id, messageData) => api.put(`/messages/${id}`, messageData),
  delete: (id) => api.delete(`/messages/${id}`),
};

// ------------------------------------------
// Favoris
// ------------------------------------------
export const favoritesAPI = {
  getAll: () => api.get('/favoris'),
  add: (propertyId) => api.post('/favoris', { propertyId }),
  remove: (propertyId) => api.delete(`/favoris/${propertyId}`),
};

// ------------------------------------------
// Utilitaires
// ------------------------------------------
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.message || "Erreur lors du téléchargement de l'image");
  }
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Accès direct aux méthodes HTTP
export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const patch = (url, data, config) => api.patch(url, data, config);
export const del = (url, config) => api.delete(url, config);

export default api;
