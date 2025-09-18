import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import {Button} from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-primary mb-4">404</div>
          <div className="text-6xl mb-4">🏠</div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page non trouvée
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
          Vérifiez l'URL ou retournez à l'accueil.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/" className="block">
            <Button size="lg" className="w-full flex items-center justify-center space-x-2">
              <Home className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </Button>
          </Link>
          
          <Link to="/properties" className="block">
            <Button variant="outline" size="lg" className="w-full flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Voir les propriétés</span>
            </Button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Page précédente</span>
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Besoin d'aide ?
          </h3>
          <p className="text-gray-600 mb-4">
            Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.
          </p>
          <Link to="/contact">
            <Button variant="outline" size="sm">
              Nous contacter
            </Button>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Liens populaires
          </h4>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/" className="text-blue-primary hover:text-blue-dark transition-colors">
              Accueil
            </Link>
            <Link to="/properties" className="text-blue-primary hover:text-blue-dark transition-colors">
              Propriétés
            </Link>
            <Link to="/about" className="text-blue-primary hover:text-blue-dark transition-colors">
              À propos
            </Link>
            <Link to="/contact" className="text-blue-primary hover:text-blue-dark transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

