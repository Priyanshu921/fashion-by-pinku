import { createContext, useContext, useState, type ReactNode } from 'react';
import axios from '../api';

interface AuthContextType {
  user: any | null;
  login: (token: string, userData: any) => void;
  logout: () => Promise<void>;
  logoutAll: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      import('goey-toast').then(({ goeyToast }) => goeyToast.success('Goodbye! You have been logged out.'));
    } catch (err) {
      console.error('Logout failed on backend, clearing local state anyway', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const logoutAll = async (password: string) => {
    try {
      await axios.post('/api/auth/logout-all', { password });
      import('goey-toast').then(({ goeyToast }) => goeyToast.success('Logged out of all devices successfully. Goodbye!'));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, logoutAll }}>
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
