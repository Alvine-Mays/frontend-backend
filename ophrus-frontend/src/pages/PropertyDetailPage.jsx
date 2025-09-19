import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, MapPin, Bed, Bath, Square, Star, Phone, Mail, 
  ArrowLeft, Share2, Calendar, Eye, Car, Waves, TreePine,
  Home, Shield, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import {Button} from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { formatPrice, formatDate, getImageUrl, getPropertyTypeIcon } from '../lib/utils';
import { cn } from '../lib/utils';
import SEOHead from '../components/seo/SEOHead';
import { seoConfig, generatePropertyStructuredData } from '../utils/seoData';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    currentProperty: property, 
    loading, 
    fetchPropertyById, 
    toggleFavorite, 
    favorites,
    rateProperty 
  } = useProperty();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyById(id);
    }
  }, [id]);

  const isFavorite = favorites.includes(id);

  const handleFavoriteClick = () => {
    if (isAuthenticated) {
      toggleFavorite(id);
    } else {
      navigate('/login');
    }
  };

  const handleRating = async (rating) => {
    if (isAuthenticated) {
      setUserRating(rating);
      await rateProperty(id, rating);
    } else {
      navigate('/login');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.titre,
          text: property.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété non trouvée</h2>
          <Button onClick={() => navigate('/properties')}>
            Retour aux propriétés
          </Button>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const features = [];
  
  if (property.nombre_chambres) features.push({ icon: Bed, label: `${property.nombre_chambres} chambre${property.nombre_chambres > 1 ? 's' : ''}` });
  if (property.nombre_salles_bain) features.push({ icon: Bath, label: `${property.nombre_salles_bain} salle${property.nombre_salles_bain > 1 ? 's' : ''} de bain` });
  if (property.superficie) features.push({ icon: Square, label: `${property.superficie} m²` });
  if (property.garage) features.push({ icon: Car, label: 'Garage' });
  if (property.piscine) features.push({ icon: Waves, label: 'Piscine' });
  if (property.jardin) features.push({ icon: TreePine, label: 'Jardin' });

  const seoData = seoConfig.propertyDetail(property);
  const structuredData = generatePropertyStructuredData(property);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        image={seoData.image}
        type={seoData.type}
        structuredData={structuredData}
      />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Partager</span>
              </button>
              
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  'flex items-center space-x-2 transition-colors',
                  isFavorite ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                )}
              >
                <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
                <span>{isFavorite ? 'Retiré des favoris' : 'Ajouter aux favoris'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {images.length > 0 ? (
                <>
                  <div 
                    className="aspect-[16/10] bg-gray-200 cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      src={getImageUrl(images[selectedImageIndex]?.url)}
                      alt={property.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={cn(
                              'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                              selectedImageIndex === index ? 'border-blue-primary' : 'border-gray-200'
                            )}
                          >
                            <img
                              src={getImageUrl(image.url)}
                              alt={`${property.titre} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[16/10] bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <Home className="w-16 h-16 mx-auto mb-4" />
                    <p>Aucune image disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {getPropertyTypeIcon(property.categorie)} {property.categorie}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.titre}</h1>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{property.adresse}, {property.ville}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(property.prix)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-blue-primary fill-current" />
                    <span className="text-sm text-gray-600">
                      {property.noteMoyenne ? property.noteMoyenne.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-600">
                    <feature.icon className="w-5 h-5" />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Rating Section */}
              {isAuthenticated && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Noter cette propriété</h3>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className={cn(
                          'w-8 h-8 transition-colors',
                          star <= userRating ? 'text-blue-primary' : 'text-gray-300 hover:text-blue-400'
                        )}
                      >
                        <Star className="w-full h-full fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {userRating > 0 ? `${userRating}/5` : 'Cliquez pour noter'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations complémentaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Publié le {formatDate(property.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Vues: {property.vues || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contacter l\u0027agent</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-primary to-blue-dark rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {property.proprietaire?.nom?.charAt(0) || 'O'}                    </span>
                  </div>             <div>
                    <div className="font-semibold text-gray-900">
                      {property.proprietaire?.nom || 'Agent Ophrus'}
                    </div>
                    <div className="text-sm text-gray-600">Agent immobilier</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{property.proprietaire?.telephone || '+242 06 123 45 67'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{property.proprietaire?.email || 'contact@ophrus-immobilier.fr'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => setShowContactModal(true)}
                >
                  Demander des informations
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = `tel:${property.proprietaire?.telephone || '+242061234567'}`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler maintenant
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pourquoi nous faire confiance ?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Transactions sécurisées</div>
                    <div className="text-sm text-gray-600">Toutes nos transactions sont protégées</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Expertise reconnue</div>
                    <div className="text-sm text-gray-600">5+ années d'expérience</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">98% de satisfaction</div>
                    <div className="text-sm text-gray-600">Clients satisfaits de nos services</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Demander des informations"
        size="md"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre nom
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom complet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+242 06 123 45 67"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Je suis intéressé(e) par cette propriété..."
              defaultValue={`Bonjour, je suis intéressé(e) par la propriété "${property.titre}" à ${property.ville}.`}
            />
          </div>
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1">
              Envoyer la demande
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowContactModal(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        size="full"
        className="p-0"
      >
        <div className="relative">
          <img
            src={getImageUrl(images[selectedImageIndex]?.url)}
            alt={property.titre}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
          >
            ×
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyDetailPage;

