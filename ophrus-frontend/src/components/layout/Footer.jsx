import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/images/ophrus-logo.png" alt="Ophrus" className="h-10 w-auto bg-zinc-50 rounded-full shadow-lg" />
              <span className="text-xl font-bold">Ophrus Immobilier</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre partenaire de confiance pour l'achat, la vente et la location de propriétés exceptionnelles. 
              Nous vous accompagnons dans tous vos projets immobiliers avec expertise et professionnalisme.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                  Propriétés
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nos Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Achat de propriétés</li>
              <li className="text-gray-400 text-sm">Vente immobilière</li>
              <li className="text-gray-400 text-sm">Location de biens</li>
              <li className="text-gray-400 text-sm">Estimation gratuite</li>
              <li className="text-gray-400 text-sm">Conseil en investissement</li>
              <li className="text-gray-400 text-sm">Gestion locative</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  123 Avenue des Ball<br />
                  75008 Bacongo, Brazzaville
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">+242 06 123 45 67</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-primary flex-shrink-0" />
                <span className="text-gray-400 text-sm">contact@ophrus-immobilier.cg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Ophrus Immobilier. Tous droits réservés.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                Conditions d'utilisation
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-blue-primary transition-colors text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

