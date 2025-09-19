import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Eye, Edit, Trash2, Heart, Star, TrendingUp, 
  Home, Users, MessageSquare, Calendar 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import PropertyCard from '../components/properties/PropertyCard';
import {Button} from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '../lib/utils';

const DashboardPage = () => {
  const { user } = useAuth();
  const { properties, loading, fetchProperties, deleteProperty } = useProperty();
  const [userProperties, setUserProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalFavorites: 0,
    averageRating: 0,
  });

  useEffect(() => {
    // Fetch user's properties
    fetchProperties(1, { owner: user?.id });
  }, [user]);

  useEffect(() => {
    // Filter properties by current user
    const filtered = properties.filter(p => p.proprietaire?._id === user?.id);
    setUserProperties(filtered);

    // Calculate stats
    const totalViews = filtered.reduce((sum, p) => sum + (p.vues || 0), 0);
    const totalFavorites = filtered.reduce((sum, p) => sum + (p.favoris?.length || 0), 0);
    const avgRating = filtered.length > 0 
      ? filtered.reduce((sum, p) => sum + (p.noteMoyenne || 0), 0) / filtered.length 
      : 0;

    setStats({
      totalProperties: filtered.length,
      totalViews,
      totalFavorites,
      averageRating: avgRating,
    });
  }, [properties, user]);

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      await deleteProperty(propertyId);
    }
  };

  const statCards = [
    {
      title: 'Mes Propriétés',
      value: stats.totalProperties,
      icon: Home,
      color: 'bg-blue-primary',
      change: '+2 ce mois',
    },
    {
      title: 'Vues Totales',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-green-500',
      change: '+12% ce mois',
    },
    {
      title: 'Favoris',
      value: stats.totalFavorites,
      icon: Heart,
      color: 'bg-red-500',
      change: '+5 cette semaine',
    },
    {
      title: 'Note Moyenne',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'bg-blue-500',
      change: '+0.2 ce mois',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bonjour {user?.nom}, voici un aperçu de vos propriétés
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/add-property">
              <Button className="w-full flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Ajouter une propriété</span>
              </Button>
            </Link>
            <Link to="/favorites">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Mes favoris</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Mon profil</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mes propriétés</h2>
            <Link to="/add-property">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : userProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune propriété
              </h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore ajouté de propriété. Commencez dès maintenant !
              </p>
              <Link to="/add-property">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter ma première propriété
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userProperties.map((property) => (
                <div key={property._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={property.images?.[0]?.url || '/placeholder-property.jpg'}
                        alt={property.titre}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{property.titre}</h3>
                        <p className="text-sm text-gray-600">{property.ville}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(property.prix)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm text-gray-500 mr-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{property.vues || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>{property.noteMoyenne?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <Link to={`/properties/${property._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/edit-property/${property._id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProperty(property._id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activité récente</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Votre propriété "Villa Moderne" a été vue 5 fois aujourd'hui</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Nouvelle note 5/5 pour "Appartement Centre-ville"</p>
                <p className="text-xs text-gray-500">Il y a 1 jour</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">3 nouveaux favoris cette semaine</p>
                <p className="text-xs text-gray-500">Il y a 2 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

