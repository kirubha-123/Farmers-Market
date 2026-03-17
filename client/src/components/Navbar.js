import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user, role } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState({ notifs: 0, messages: 0 });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCounts();
      const interval = setInterval(fetchUnreadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCounts = async () => {
    try {
      const [notifRes, msgRes] = await Promise.all([
        api.get('/notifications', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        api.get('/messages/unread/count', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]).catch(() => [{ data: [] }, { data: { count: 0 } }]);

      const notifUnread = notifRes?.data?.filter?.(n => !n.read)?.length || 0;
      const msgUnread = msgRes?.data?.count || 0;
      
      setUnreadCounts({ notifs: notifUnread, messages: msgUnread });
    } catch (err) {
      console.error("Unread count fetch error:", err);
    }
  };

  const linkClass = (path) =>
    `text-xs sm:text-sm px-2 ${
      location.pathname === path
        ? 'text-emerald-900 border-b-2 border-emerald-600 pb-1'
        : 'text-emerald-900/70 hover:text-emerald-900'
    }`;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
      setShowMobileMenu(false);
    }
  };

  // Hide navbar on auth pages
  const hideNavbar = ['/login', '/register-buyer', '/register-farmer'].includes(location.pathname);

  if (hideNavbar && !isAuthenticated) {
    return null;
  }

  return (
    <header className="border-b border-emerald-100 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo section */}
        <div className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-emerald-50 rounded-full text-emerald-700 transition-colors flex items-center gap-1"
              title="Go Back"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>
          )}

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-lg">
              🌿
            </div>
            <span className="font-semibold text-emerald-900 text-sm sm:text-base">
              FarmDirect
            </span>
          </div>
        </div>

        {/* Center navigation links */}
        <nav className="hidden lg:flex gap-4 text-sm">
          <button className={linkClass('/')} onClick={() => navigate('/')}>
            Home
          </button>
          {isAuthenticated && (
            <button
              className={linkClass('/market')}
              onClick={() => navigate('/market')}
            >
              Marketplace
            </button>
          )}
          <button
            className={linkClass('/farmers')}
            onClick={() => navigate('/farmers')}
          >
            Farmers
          </button>
          
          {/* Farmer-only features */}
          {role === 'farmer' && (
            <>
              <button
                className={linkClass('/agri-doctor')}
                onClick={() => navigate('/agri-doctor')}
              >
                Agri-Doctor
              </button>
              <button
                className={linkClass('/ai-price')}
                onClick={() => navigate('/ai-price')}
              >
                Market Rates
              </button>
            </>
          )}

          {/* Admin-only features */}
          {role === 'admin' && (
            <button
              className={linkClass('/admin-dashboard')}
              onClick={() => navigate('/admin-dashboard')}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Right section - Icons & Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <>
              {/* Messages */}
              <button
                onClick={() => navigate('/messages')}
                className="text-emerald-900/80 hover:text-emerald-900 text-xl relative"
                title="Messages"
              >
                💬
                {unreadCounts.messages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] h-4 w-4 flex items-center justify-center rounded-full animate-pulse border-2 border-white">
                    {unreadCounts.messages > 9 ? '9+' : unreadCounts.messages}
                  </span>
                )}
              </button>

              {/* Orders/Notifications */}
              <button
                onClick={() => {
                  if (role === 'farmer') navigate('/farmer-orders');
                  else navigate('/my-orders');
                }}
                className="text-emerald-900/80 hover:text-emerald-900 text-xl relative"
                title="Orders"
              >
                🔔
                {unreadCounts.notifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] h-4 w-4 flex items-center justify-center rounded-full animate-pulse border-2 border-white">
                    {unreadCounts.notifs > 9 ? '9+' : unreadCounts.notifs}
                  </span>
                )}
              </button>

              {/* Cart - Buyer only */}
              {role === 'buyer' && (
                <button
                  onClick={() => navigate('/cart')}
                  className="text-emerald-900/80 hover:text-emerald-900 text-xl"
                  title="Cart"
                >
                  🛒
                </button>
              )}

              {/* Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors"
                title="Profile"
              >
                <span className="text-xl">👤</span>
                <span className="text-sm font-medium text-emerald-900 hidden md:inline max-w-xs truncate">
                  {user?.name || 'Profile'}
                </span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:block px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden text-emerald-900"
                title="Menu"
              >
                ☰
              </button>
            </>
          ) : (
            <>
              {/* Not logged in - show auth buttons */}
              <button
                onClick={() => navigate('/register-buyer')}
                className="hidden sm:block px-3 py-1.5 rounded-full border border-emerald-600 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition-colors"
              >
                Buyer Register
              </button>
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:block px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register-farmer')}
                className="hidden sm:block px-3 py-1.5 rounded-full border border-amber-500 text-amber-600 text-sm font-medium hover:bg-amber-50 transition-colors"
              >
                Farmer Register
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden text-emerald-900"
                title="Menu"
              >
                ☰
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="space-y-2">
            <button
              onClick={() => { navigate('/'); setShowMobileMenu(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm"
            >
              Home
            </button>
            {isAuthenticated && (
              <button
                onClick={() => { navigate('/market'); setShowMobileMenu(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm"
              >
                Marketplace
              </button>
            )}
            <button
              onClick={() => { navigate('/farmers'); setShowMobileMenu(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm"
            >
              Farmers
            </button>

            {/* Farmer features */}
            {role === 'farmer' && (
              <>
                <button
                  onClick={() => { navigate('/agri-doctor'); setShowMobileMenu(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm"
                >
                  Agri-Doctor
                </button>
                <button
                  onClick={() => { navigate('/ai-price'); setShowMobileMenu(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm"
                >
                  Market Rates
                </button>
              </>
            )}

            {/* Auth buttons for mobile */}
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => { navigate('/login'); setShowMobileMenu(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm font-medium mt-3 border-t border-emerald-200 pt-3"
                >
                  Login
                </button>
                <button
                  onClick={() => { navigate('/register-buyer'); setShowMobileMenu(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm font-medium"
                >
                  Buyer Register
                </button>
                <button
                  onClick={() => { navigate('/register-farmer'); setShowMobileMenu(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
                >
                  Farmer Register
                </button>
              </>
            )}

            {/* Profile for mobile */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-100 text-emerald-900 text-sm font-medium mt-3 border-t border-emerald-200 pt-3"
                >
                  👤 {user?.name || 'Profile'}
                </button>
                <button
                  onClick={() => handleLogout()}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
