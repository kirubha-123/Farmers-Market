import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function Register({ fixedRole }) {
  const role = fixedRole === 'farmer' ? 'farmer' : 'buyer';
  const roleLabel = role === 'farmer' ? 'Farmer' : 'Buyer';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role,
    phone: '',
    location: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user, res.data.user.role);
      if (res.data.user.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else {
        navigate('/market');
      }
    } catch (err) {
      setError('Registration failed (maybe email already used)');
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
              {role === 'farmer' ? '🌾' : '🛒'}
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-emerald-900 mb-1">
            Register as {roleLabel}
          </h1>
          <p className="text-center text-sm text-emerald-900/70 mb-6">
            Create your {roleLabel.toLowerCase()} account to continue
          </p>

          {error && (
            <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-emerald-900 mb-1">Name</label>
              <input
                name="name"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-emerald-900 mb-1">Email</label>
              <input
                name="email"
                type="email"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-emerald-900 mb-1">Password</label>
              <input
                name="password"
                type="password"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-emerald-900 mb-1">Phone</label>
              <input
                name="phone"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-emerald-900 mb-1">Location</label>
              <input
                name="location"
                className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm shadow hover:from-emerald-700 hover:to-emerald-800"
            >
              Register
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-emerald-900/60">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
