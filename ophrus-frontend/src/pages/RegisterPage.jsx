// src/pages/RegisterPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {Button} from '../components/ui/Button';
import {Input} from '../components/ui/Input';
import { validateEmail, validatePhone } from '../lib/utils';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.telephone) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(formData.password)) {
      newErrors.password = 'Inclure une majuscule, un chiffre et un symbole';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez le mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { confirmPassword, acceptTerms, ...userData } = formData;
      const result = await register(userData);

      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setErrors((prev) => ({
          ...prev,
          email: result.message || 'Erreur lors de l’inscription',
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-primary to-blue-dark rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Créer votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            to="/login"
            className="font-medium text-blue-primary hover:text-blue-dark transition-colors"
          >
            connectez-vous à votre compte existant
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nom complet */}
            <Input
              label="Nom complet"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              error={errors.nom}
              placeholder="Votre nom complet"
            />

            {/* Email */}
            <Input
              label="Adresse email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="votre@email.com"
            />

            {/* Téléphone */}
            <Input
              label="Numéro de téléphone"
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              error={errors.telephone}
              placeholder="+242 06 123 45 67"
            />

            {/* Mot de passe */}
            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              icon={showPassword ? EyeOff : Eye}
              onIconClick={() => setShowPassword((prev) => !prev)}
            />

            {/* Confirmation mot de passe */}
            <Input
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              icon={showConfirmPassword ? EyeOff : Eye}
              onIconClick={() => setShowConfirmPassword((prev) => !prev)}
            />

            {/* CGU */}
            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-primary border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-900">
                J'accepte les{' '}
                <Link to="/terms" className="text-blue-primary hover:text-blue-dark">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-blue-primary hover:text-blue-dark">
                  politique de confidentialité
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-500 mt-1">{errors.acceptTerms}</p>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Créer mon compte
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
