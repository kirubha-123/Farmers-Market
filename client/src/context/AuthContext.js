import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    role: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    // Initialize auth from localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    if (token && role && user) {
      setAuth({
        isAuthenticated: true,
        user: JSON.parse(user),
        role,
        token,
        loading: false,
      });
    } else {
      setAuth(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = (token, user, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({
      isAuthenticated: true,
      user,
      role,
      token,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setAuth({
      isAuthenticated: false,
      user: null,
      role: null,
      token: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
