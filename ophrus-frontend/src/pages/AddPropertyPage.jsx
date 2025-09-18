import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Save } from 'lucide-react';
import { useProperty } from '../contexts/PropertyContext';
import {Button} from '../components/ui/Button';
import {Input} from '../components/ui/Input';
import {Select} from '../components/ui/Select';
import {Textarea} from '../components/ui/Textarea';

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { createProperty, loading } = useProperty();
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    categorie: '',
    ville: '',
    adresse: '',
    superficie: '',
    nombre_chambres: '',
    nombre_salles_bain: '',
    garage: false,
    piscine: false,
    jardin: false,
    balcon: false,
    gardien: false,
  });
  
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    { value: 'Appartement', label: 'Appartement' },
    { value: 'Maison', label: 'Maison' },
    { value: 'Terrain', label: 'Terrain' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Autre', label: 'Autre' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Clean up object URLs
      const removed = prev.find(img => img.id === imageId);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.prix) newErrors.prix = 'Le prix est requis';
    if (!formData.categorie) newErrors.categorie = 'La catégorie est requise';
    if (!formData.ville.trim()) newErrors.ville = 'La ville est requise';
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const propertyData = {
      ...formData,
      images: images.map(img => img.file)
    };

    const result = await createProperty(propertyData);
    
    if (result.success) {
      navigate(`/properties/${result.property._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ajouter une propriété
          </h1>
          <p className="text-gray-600">
            Remplissez les informations ci-dessous pour publier votre propriété
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informations générales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Titre de l'annonce"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  error={errors.titre}
                  placeholder="Ex: Villa moderne avec piscine"
                />
              </div>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  rows={4}
                  placeholder="Décrivez votre propriété en détail..."
                />
              </div>
              
              <Input
                label="Prix (CFA)"
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                error={errors.prix}
                placeholder="250000"
              />
              
              <Select
                label="Catégorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                error={errors.categorie}
                options={categoryOptions}
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Localisation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                error={errors.ville}
                placeholder="Brazzaville"
              />
              
              <Input
                label="Adresse complète"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                error={errors.adresse}
                placeholder="123 Rue de la Paix"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Détails de la propriété
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Input
                label="Superficie (m²)"
                type="number"
                name="superficie"
                value={formData.superficie}
                onChange={handleChange}
                placeholder="120"
              />
              
              <Input
                label="Nombre de chambres"
                type="number"
                name="nombre_chambres"
                value={formData.nombre_chambres}
                onChange={handleChange}
                placeholder="3"
              />
              
              <Input
                label="Nombre de salles de bain"
                type="number"
                name="nombre_salles_bain"
                value={formData.nombre_salles_bain}
                onChange={handleChange}
                placeholder="2"
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Équipements et services
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'garage', label: 'Garage' },
                  { key: 'piscine', label: 'Piscine' },
                  { key: 'jardin', label: 'Jardin' },
                  { key: 'balcon', label: 'Balcon' },
                  { key: 'gardien', label: 'Gardien' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key]}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-primary focus:ring-blue-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Photos de la propriété
            </h2>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Glissez-déposez vos images ici ou cliquez pour sélectionner
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter des images
                </Button>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              loading={loading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Publier la propriété</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;

