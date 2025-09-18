import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../utils/accessibility';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  ...props
}) => {
  const focusTrapRef = useFocusTrap(isOpen);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Gérer la fermeture avec Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Empêcher le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      {...props}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={focusTrapRef}
        className={`
          relative bg-white rounded-lg shadow-xl w-full ${sizes[size]}
          transform transition-all duration-200 ease-out
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer la modal"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal de confirmation
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
  loading = false
}) => {
  const variants = {
    danger: {
      button: "bg-red-600 hover:bg-red-700 text-white",
      icon: "text-red-600"
    },
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700 text-white",
      icon: "text-yellow-600"
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: "text-blue-600"
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // L'erreur sera gérée par le composant parent
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="text-center">
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex space-x-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`
              px-4 py-2 rounded-lg transition-colors disabled:opacity-50
              ${variants[variant].button}
              ${loading ? 'cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Chargement...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;

