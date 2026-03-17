import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      login(token, user, user.role);

      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else {
        navigate('/market');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed due to server error. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center">
      <div className="w-full max-w-md px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-sm"
          >
            ← Back
          </button>
          <div className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xl">
            🌿
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-emerald-100 px-6 py-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-emerald-700 flex items-center justify-center text-white text-2xl">
              🔐
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-emerald-900 mb-1">
            Login
          </h1>
          <p className="text-center text-sm text-emerald-900/70 mb-6">
            Single login for Buyer, Farmer, and Admin
          </p>

          {error && (
            <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-emerald-900 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-emerald-900 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm shadow hover:from-emerald-700 hover:to-emerald-800"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-emerald-900/60">
            New user?{' '}
            <Link to="/register-buyer" className="text-emerald-700 underline">
              Register as Buyer
            </Link>
            {' '}or{' '}
            <Link to="/register-farmer" className="text-emerald-700 underline">
              Register as Farmer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
