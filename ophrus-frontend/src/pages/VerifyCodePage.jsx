import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyCodePage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Code invalide');

      // Rediriger vers la page de réinitialisation avec le token en query
      navigate(`/reset-password?token=${data.token}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Vérification du code</h1>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="email"
          placeholder="Votre e-mail"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Code de vérification"
          className="w-full border p-2 rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Vérification...' : 'Valider le code'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
