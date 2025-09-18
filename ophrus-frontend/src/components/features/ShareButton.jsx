import React, { useState } from 'react';
import { Share2, Copy, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';
import { useToast } from '../common/Toast';

const ShareButton = ({ 
  url = window.location.href,
  title = 'Découvrez cette propriété',
  description = '',
  className = '',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const shareOptions = [
    {
      name: 'Copier le lien',
      icon: Copy,
      action: () => copyToClipboard(),
      color: 'text-gray-600 hover:text-gray-800'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => shareToFacebook(),
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => shareToTwitter(),
      color: 'text-blue-400 hover:text-blue-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => shareToWhatsApp(),
      color: 'text-green-600 hover:text-green-800'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => shareByEmail(),
      color: 'text-gray-600 hover:text-gray-800'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié dans le presse-papiers');
      setIsOpen(false);
    } catch (error) {
      // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Lien copié dans le presse-papiers');
      setIsOpen(false);
    }
  };

  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToTwitter = () => {
    const text = `${title} ${description}`.trim();
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToWhatsApp = () => {
    const text = `${title}\n${description}\n${url}`.trim();
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    setIsOpen(false);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\nVoir la propriété : ${url}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    setIsOpen(false);
  };

  // Utiliser l'API Web Share si disponible
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erreur lors du partage:', error);
          setIsOpen(true); // Fallback vers le menu personnalisé
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`
          flex items-center space-x-1 text-gray-600 hover:text-blue-600 
          transition-colors duration-200 ${className}
        `}
        title="Partager"
      >
        <Share2 className={sizes[size]} />
        <span className="text-sm font-medium">Partager</span>
      </button>

      {/* Menu de partage personnalisé */}
      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu de partage */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">
                Partager cette propriété
              </div>
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  <option.icon className={`w-4 h-4 ${option.color}`} />
                  <span className="text-gray-700">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;

