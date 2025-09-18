import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Shield, Award, ArrowRight, Star, MapPin } from 'lucide-react';
import { useProperty } from '../contexts/PropertyContext';
import PropertyCard from '../components/properties/PropertyCard';
import {Button} from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice } from '../lib/utils';
import SEOHead from '../components/seo/SEOHead';
import { HomeStructuredData } from '../components/seo/StructuredData';
import { seoConfig, organizationStructuredData } from '../utils/seoData';

const HomePage = () => {
  const { properties, loading, fetchProperties } = useProperty();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState([]);

  useEffect(() => {
    fetchProperties(1, { limit: 6 });
  }, []);

  useEffect(() => {
    // Get featured properties (highest rated or most expensive)
    const featured = properties
      .sort((a, b) => (b.noteMoyenne || 0) - (a.noteMoyenne || 0))
      .slice(0, 3);
    setFeaturedProperties(featured);
  }, [properties]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/properties?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const stats = [
    { icon: TrendingUp, label: 'Propriétés vendues', value: '500+' },
    { icon: Shield, label: 'Clients satisfaits', value: '98%' },
    { icon: Award, label: "Années d'expérience", value: '15+' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Recherche Avancée',
      description: 'Trouvez la propriété parfaite grâce à nos filtres intelligents et notre moteur de recherche puissant.',
    },
    {
      icon: Shield,
      title: 'Transactions Sécurisées',
      description: 'Toutes nos transactions sont sécurisées et accompagnées par des professionnels certifiés.',
    },
    {
      icon: Award,
      title: 'Expertise Reconnue',
      description: "Notre équipe d'experts vous accompagne à chaque étape de votre projet immobilier.",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead 
        title={seoConfig.home.title}
        description={seoConfig.home.description}
        keywords={seoConfig.home.keywords}
        image={seoConfig.home.image}
        structuredData={organizationStructuredData}
      />
      <HomeStructuredData />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          }}
        ></div>
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Trouvez Votre
              <span className="text-luxury block mt-2">Propriété de Rêve</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
              Découvrez une sélection exclusive de propriétés exceptionnelles avec Ophrus Immobilier, 
              votre partenaire de confiance depuis plus de 15 ans.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-scale-in">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Rechercher par ville, type de propriété..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 text-lg rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-primary"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  Rechercher
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/properties">
                <Button size="lg" className="w-full sm:w-auto">
                  Voir toutes les propriétés
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white bg-opacity-10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-primary to-blue-dark rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Propriétés en Vedette
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection de propriétés exceptionnelles, choisies pour leur qualité et leur emplacement privilégié.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProperties.map((property, index) => (
                <div key={property._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/properties">
              <Button size="lg">
                Voir toutes les propriétés
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir Ophrus ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nous mettons notre expertise et notre passion au service de vos projets immobiliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-primary to-blue-dark rounded-full mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-primary to-blue-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à Commencer Votre Recherche ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers de clients satisfaits et trouvez la propriété de vos rêves dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-blue-primary hover:bg-gray-100">
                Créer un compte
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-primary">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

