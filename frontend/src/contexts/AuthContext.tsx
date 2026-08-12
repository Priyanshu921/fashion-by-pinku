import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true; // Invalid token string is treated as expired
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && isTokenExpired(savedToken)) {
      // Immediately purge expired token on initialization
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isTokenValid = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !isTokenExpired(token);
  };

  // Global Axios Interceptor for automated token expiration & auto-logout
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const token = localStorage.getItem('token');
          if (token || user) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);

            import('goey-toast').then(({ goeyToast }) => {
              goeyToast.error('Session Expired', {
                description: 'Your security token has expired. Please log in again.',
              });
            });

            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
