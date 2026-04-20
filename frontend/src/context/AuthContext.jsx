import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const verify = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const r = await API.post('/auth/verify', {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsAdmin(r.data.valid);
      } catch {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    verify();
    // Re-verify when storage changes (e.g. WhatsApp login sets adminToken)
    window.addEventListener('storage', verify);
    return () => window.removeEventListener('storage', verify);
  }, []);

  const adminLogin = async (secretKey) => {
    const { data } = await API.post('/auth/admin-login', { secretKey });
    localStorage.setItem('adminToken', data.token);
    setIsAdmin(true);
    return data;
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
