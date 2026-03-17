import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCounts, setUnreadCounts] = useState({ notifs: 0, messages: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchUnreadCounts();
      const interval = setInterval(fetchUnreadCounts, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUnreadCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [notifRes, msgRes] = await Promise.all([
        api.get('/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/messages/unread/count', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const notifUnread = notifRes.data.filter(n => !n.read).length;
      const msgUnread = msgRes.data.count || 0;
      
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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="border-b border-emerald-100 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* logo + back button */}
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

        {/* center nav links */}
        <nav className="hidden lg:flex gap-4 text-sm">
          <button className={linkClass('/')} onClick={() => navigate('/')}>
            Home
          </button>
          <button
            className={linkClass('/market')}
            onClick={() => navigate('/market')}
          >
            Marketplace
          </button>
          <button
            className={linkClass('/farmers')}
            onClick={() => navigate('/farmers')}
          >
            Farmers
          </button>
          
          {/* ✅ ONLY FOR FARMERS: Predictions & Advice */}
          {localStorage.getItem('role') === 'farmer' && (
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
        </nav>

        {/* right icons + logout */}
        <div className="flex items-center gap-4">
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

          <button
            onClick={() => {
              const role = localStorage.getItem('role');
              if (role === 'farmer') navigate('/farmer-orders');
              else navigate('/my-orders');
            }}
            className="text-emerald-900/80 hover:text-emerald-900 text-xl relative"
            title="Orders & Notifications"
          >
            🔔
            {unreadCounts.notifs > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] h-4 w-4 flex items-center justify-center rounded-full animate-pulse border-2 border-white">
                {unreadCounts.notifs > 9 ? '9+' : unreadCounts.notifs}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="text-emerald-900/80 hover:text-emerald-900 text-xl"
            title="Cart"
          >
            🛒
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="text-emerald-900/80 hover:text-emerald-900 text-xl"
            title="My Profile"
          >
            👤
          </button>
          
          <button
            onClick={handleLogout}
            className="hidden sm:block px-4 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
