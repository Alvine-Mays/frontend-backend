import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import {Button} from '../components/ui/Button';
import {Input} from '../components/ui/Input';
import {Textarea} from '../components/ui/Textarea';
import { validateEmail } from '../lib/utils';
import SEO from '../components/layout/SEO';
import { seoConfig } from '../utils/seoData';



const ContactPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (!formData.sujet.trim()) newErrors.sujet = 'Le sujet est requis';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: '',
      });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      details: '+242 06 123 45 67',
      subtitle: 'Lun-Ven 9h-18h',
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'contact@ophrus-immobilier.cg',
      subtitle: 'Réponse sous 24h',
    },
    {
      icon: MapPin,
      title: 'Adresse',
      details: '123 Avenue des Ball',
      subtitle: '75008 Bacongo, Brazzaville',
    },
    {
      icon: Clock,
      title: 'Horaires',
      details: 'Lun-Ven: 9h-18h',
      subtitle: 'Sam: 9h-12h',
    },
  ];

  return (
    <>
      <SEO title={seoConfig.contact.title} description={seoConfig.contact.description} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Notre équipe d'experts est à votre disposition pour répondre à toutes vos questions
              et vous accompagner dans vos projets immobiliers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nom complet"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    error={errors.nom}
                    placeholder="Votre nom"
                  />

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Téléphone (optionnel)"
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+242 06 123 45 67"
                  />

                  <Input
                    label="Sujet"
                    name="sujet"
                    value={formData.sujet}
                    onChange={handleChange}
                    error={errors.sujet}
                    placeholder="Objet de votre demande"
                  />
                </div>

                <Textarea
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                  rows={6}
                  placeholder="Décrivez votre demande en détail..."
                />

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full flex items-center justify-center space-x-2"
                  size="lg"
                >
                  <Send className="w-5 h-5" />
                  <span>Envoyer le message</span>
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-primary to-blue-dark rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-gray-700 font-medium">
                          {info.details}
                        </p>
                        <p className="text-sm text-gray-500">
                          {info.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notre localisation
                </h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Carte interactive</p>
                    <p className="text-sm">123 Avenue des Champs-Élysées, Paris</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-primary to-blue-dark rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">
                  Besoin d'une réponse rapide ?
                </h3>
                <p className="mb-4 opacity-90">
                  Pour les demandes urgentes, n'hésitez pas à nous appeler directement.
                  Notre équipe est disponible du lundi au vendredi de 9h à 18h.
                </p>
                <Button
                  variant="secondary"
                  className="bg-white text-blue-primary hover:bg-gray-100"
                  onClick={() => window.location.href = 'tel:+242061234567'}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler maintenant
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Questions fréquentes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Comment publier une propriété ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Créez un compte, accédez à votre tableau de bord et cliquez sur "Ajouter une propriété".
                  Remplissez le formulaire avec les détails et photos de votre bien.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Quels sont vos frais de service ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Nos frais varient selon le type de transaction. Contactez-nous pour un devis
                  personnalisé adapté à votre projet immobilier.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Proposez-vous des visites virtuelles ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Oui, nous proposons des visites virtuelles 3D pour la plupart de nos propriétés.
                  Cette option est disponible sur la page de détail de chaque bien.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Comment obtenir une estimation ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Contactez-nous via ce formulaire ou par téléphone. Un de nos experts se déplacera
                  gratuitement pour évaluer votre bien.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;


