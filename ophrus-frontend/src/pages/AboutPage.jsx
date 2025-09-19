import React from 'react';
import { Award, Users, TrendingUp, Shield, Heart, Star } from 'lucide-react';
import {Button} from '../components/ui/Button';
import { Link } from 'react-router-dom'; import SEO from '../components/layout/SEO';
import { seoConfig } from '../utils/seoData';



const AboutPage = () => {
  const stats = [
    { icon: TrendingUp, label: 'Propriétés vendues', value: '500+' },
    { icon: Users, label: 'Clients satisfaits', value: '750+' },
    { icon: Award, label: 'Années d\'expérience', value: '5+' },
    { icon: Star, label: 'Note moyenne', value: '4.9/5' },
  ];

  const team = [
    {
      name: 'Théodor',
      role: 'Directeur Général',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      description: "8 ans d'expérience dans l'immobilier de luxe"
    },
    {
      name: 'Pierre Martin',
      role: 'Responsable Commercial',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      description: 'Expert en négociation et relation client'
    },
    {
      name: 'Sophie Laurence',
      role: 'Conseillère Immobilière',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      description: "Spécialisée dans l'immobilier résidentiel"
    },
    {
      name: 'Thomas Malonga',
      role: 'Conseiller Investissement',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      description: 'Expert en investissement immobilier'
    },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Confiance',
      description: 'Nous bâtissons des relations durables basées sur la transparence et l\'intégrité.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: "Nous visons l'excellence dans chaque transaction et chaque interaction client."
    },
    {
      icon: Heart,
      title: 'Passion',
      description: "Notre passion pour l'immobilier nous pousse à toujours donner le meilleur de nous-mêmes."
    },
    {
      icon: Users,
      title: 'Accompagnement',
      description: 'Nous accompagnons nos clients à chaque étape de leur projet immobilier.'
    },
  ];

  return (
    <>
      <SEO title={seoConfig.about.title} description={seoConfig.about.description} />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
            }}
          ></div>
          {/* Black Overlay */}
          <div className="absolute inset-0 bg-black opacity-50"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                À Propos d'
                <span className="text-blue-primary block mt-2">Ophrus Immobilier</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Depuis plus de 5 ans, nous accompagnons nos clients dans leurs projets immobiliers
                les plus ambitieux avec expertise, passion et dévouement.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
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

        {/* Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Notre Histoire
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Fondée en 2017 par Théodor, Ophrus Immobilier est née d'une vision simple:
                    révolutionner l'expérience immobilière en plaçant l'humain au cœur de chaque transaction.
                  </p>
                  <p>
                    Forte de son expérience dans l'immobilier de luxe, Marie a rassemblé une équipe
                    d'experts passionnés, partageant les mêmes valeurs d'excellence et d'intégrité.
                  </p>
                  <p>
                    Aujourd'hui, nous sommes fiers d'avoir accompagné plus de 500 familles dans
                    leurs projets immobiliers, des premiers achats aux investissements les plus complexes.
                  </p>
                  <p>
                    Notre approche personnalisée et notre connaissance approfondie du marché nous
                    permettent d'offrir un service d'exception, reconnu par nos clients et nos pairs.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Notre équipe"
                  className="rounded-xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Les principes qui guident notre action au quotidien et font notre différence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-primary to-blue-dark rounded-full mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Notre Équipe
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Des professionnels expérimentés et passionnés, à votre service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-primary font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Notre Mission
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Accompagner</h3>
                <p className="text-gray-700">
                  Nous accompagnons chaque client dans son parcours immobilier,
                  de la définition de ses besoins à la concrétisation de son projet.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Conseiller</h3>
                <p className="text-gray-700">
                  Notre expertise nous permet de fournir des conseils avisés et
                  personnalisés pour optimiser chaque investissement immobilier.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Réussir</h3>
                <p className="text-gray-700">
                  Votre réussite est notre priorité. Nous mettons tout en œuvre
                  pour que votre projet immobilier soit un succès.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-primary to-blue-dark text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à Commencer Votre Projet ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contactez notre équipe d'experts pour une consultation personnalisée et gratuite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-primary hover:bg-gray-100"
                >
                  Contactez-nous
                </Button>
              </Link>
              <Link to="/properties">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-blue-primary hover:bg-gray-100"
                >
                  Voir nos propriétés
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;


