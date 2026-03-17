import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Landing() {
  const { isAuthenticated, user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-amber-50">
      {/* logo row */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xl">
          🌿
        </div>
      </div>

      <div className="max-w-md w-full px-6 text-center">
        <span className="inline-flex items-center px-4 py-1 rounded-full bg-white shadow text-sm text-emerald-700 mb-6">
          🌾 Farm Fresh, Direct to You
        </span>

        {!isAuthenticated ? (
          <>
            <h1 className="text-3xl font-extrabold text-emerald-900 mb-4 leading-tight">
              Connect Directly with<br />Local Farmers
            </h1>

            <p className="text-sm text-emerald-900/70 mb-8">
              Skip the middlemen and access fresh, locally-grown produce at fair prices.
              Support your local farming community while enjoying the freshest food.
            </p>

            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold shadow hover:bg-emerald-800"
              >
                Login
              </Link>

              <Link
                to="/register-buyer"
                className="block w-full py-3 rounded-xl bg-amber-500 text-emerald-900 font-semibold shadow hover:bg-amber-600"
              >
                Register as Buyer
              </Link>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-b from-emerald-50 to-amber-50 text-emerald-600">
                    Or
                  </span>
                </div>
              </div>

              <Link
                to="/register-farmer"
                className="block w-full py-3 rounded-xl border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-50"
              >
                Register as Farmer
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-emerald-900 mb-4 leading-tight">
              Welcome back!
            </h1>

            <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
                  👤
                </div>
              </div>
              <p className="text-xl font-semibold text-emerald-900 mb-1">
                {user?.name}
              </p>
              <p className="text-sm text-emerald-600 mb-4 capitalize">
                {role} Account
              </p>
              <p className="text-xs text-emerald-900/60">
                {user?.email}
              </p>
            </div>

            <div className="space-y-3">
              {role === 'admin' && (
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="block w-full py-3 rounded-xl bg-slate-800 text-white font-semibold shadow hover:bg-slate-900"
                >
                  🛡️ Go to Admin Dashboard
                </button>
              )}

              {role === 'farmer' && (
                <>
                  <button
                    onClick={() => navigate('/farmer-dashboard')}
                    className="block w-full py-3 rounded-xl bg-emerald-700 text-white font-semibold shadow hover:bg-emerald-800"
                  >
                    👨‍🌾 Go to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/agri-doctor')}
                    className="block w-full py-3 rounded-xl border-2 border-emerald-600 text-emerald-600 font-semibold hover:bg-emerald-50"
                  >
                    🏥 Agri-Doctor
                  </button>
                </>
              )}

              {role === 'buyer' && (
                <>
                  <button
                    onClick={() => navigate('/market')}
                    className="block w-full py-3 rounded-xl bg-amber-500 text-emerald-900 font-semibold shadow hover:bg-amber-600"
                  >
                    🛒 Browse Market
                  </button>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="block w-full py-3 rounded-xl border-2 border-amber-500 text-amber-600 font-semibold hover:bg-amber-50"
                  >
                    📦 My Orders
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('/profile')}
                className="block w-full py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50"
              >
                ⚙️ Profile Settings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Landing;
