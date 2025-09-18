import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';


const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) {
      toast.error('Token de réinitialisation manquant');
      navigate('/login');
      return;
    }

    verifyToken();
  }, [token, navigate]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-reset-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setIsTokenValid(true);
        setUserEmail(data.email);
      } else {
        setIsTokenValid(false);
        toast.error(data.message || 'Token invalide ou expiré');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setIsTokenValid(false);
      toast.error('Erreur de connexion au serveur');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = formData;

    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsPasswordReset(true);
        toast.success('Mot de passe réinitialisé avec succès !');
      } else {
        toast.error(data.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  // Token invalide ou expiré
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Lien invalide ou expiré
            </h1>
            
            <p className="text-gray-600 mb-8">
              Ce lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien.
            </p>
            
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="w-full bg-[#009fe3] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0088cc] transition-colors block text-center"
              >
                Demander un nouveau lien
              </Link>
              
              <Link
                to="/login"
                className="w-full text-[#009fe3] py-3 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors block text-center"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mot de passe réinitialisé avec succès
  if (isPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Mot de passe réinitialisé !
            </h1>
            
            <p className="text-gray-600 mb-8">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            
            <Link
              to="/login"
              className="w-full bg-[#009fe3] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0088cc] transition-colors block text-center"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Chargement de la vérification du token
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009fe3] mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification du lien...</p>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de réinitialisation
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#009fe3] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Nouveau mot de passe
            </h1>
            
            <p className="text-gray-600">
              Créez un nouveau mot de passe pour <strong>{userEmail}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors"
                  placeholder="Minimum 6 caractères"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors"
                  placeholder="Répétez le mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#009fe3] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0088cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-[#009fe3] hover:text-[#0088cc] font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

