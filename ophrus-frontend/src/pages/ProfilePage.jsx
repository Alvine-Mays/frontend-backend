import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Save, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {Button} from '../components/ui/Button';
import {Input} from '../components/ui/Input';
import { validateEmail, validatePhone } from '../lib/utils';

const ProfilePage = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await updateProfile({ ...formData, id: user.id });
    
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user?.nom}</h2>
                <p className="text-yellow-100">{user?.email}</p>
                <p className="text-yellow-100 text-sm">
                  Membre depuis {new Date(user?.createdAt).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Informations personnelles
              </h3>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Modifier
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="relative">
                <Input
                  label="Nom complet"
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  error={errors.nom}
                  disabled={!isEditing}
                  className="pl-10"
                />
                <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>

              {/* Email */}
              <div className="relative">
                <Input
                  label="Adresse email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={!isEditing}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>

              {/* Phone */}
              <div className="relative">
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  error={errors.telephone}
                  disabled={!isEditing}
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Security Section */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sécurité
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Mot de passe</p>
                    <p className="text-sm text-gray-600">Dernière modification il y a 3 mois</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques du compte
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-600">Propriétés publiées</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-600">Favoris ajoutés</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

