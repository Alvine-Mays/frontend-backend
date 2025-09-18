import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const Icon = icons[toast.type];

  return (
    <div className={`
      max-w-sm w-full border rounded-lg shadow-lg p-4 mb-4
      transform transition-all duration-300 ease-in-out
      ${colors[toast.type]}
      ${toast.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${iconColors[toast.type]}`} />
        <div className="flex-1">
          {toast.title && (
            <h4 className="font-semibold mb-1">{toast.title}</h4>
          )}
          <p className="text-sm">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      isVisible: false,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Déclencher l'animation d'entrée
    setTimeout(() => {
      setToasts(prev => 
        prev.map(t => t.id === id ? { ...t, isVisible: true } : t)
      );
    }, 100);

    // Auto-suppression après la durée spécifiée
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    // Animation de sortie
    setToasts(prev => 
      prev.map(t => t.id === id ? { ...t, isVisible: false } : t)
    );

    // Suppression après l'animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Méthodes de convenance
  const toast = {
    success: (message, options = {}) => addToast({ 
      type: 'success', 
      message, 
      title: options.title || 'Succès',
      ...options 
    }),
    error: (message, options = {}) => addToast({ 
      type: 'error', 
      message, 
      title: options.title || 'Erreur',
      duration: options.duration || 7000,
      ...options 
    }),
    warning: (message, options = {}) => addToast({ 
      type: 'warning', 
      message, 
      title: options.title || 'Attention',
      ...options 
    }),
    info: (message, options = {}) => addToast({ 
      type: 'info', 
      message, 
      title: options.title || 'Information',
      ...options 
    }),
    custom: addToast,
    remove: removeToast,
    removeAll: removeAllToasts
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Container des toasts */}
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default Toast;

