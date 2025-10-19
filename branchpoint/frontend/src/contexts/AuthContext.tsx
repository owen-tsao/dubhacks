import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  loginAsGuest: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUser && storedToken && storedUserId) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        // Auto-login as guest if stored data is invalid
        const guestUser: User = {
          userId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'Guest User',
          email: 'guest@branchpoint.com',
          createdAt: new Date().toISOString(),
        };
        setUser(guestUser);
        localStorage.setItem('user', JSON.stringify(guestUser));
        localStorage.setItem('userId', guestUser.userId);
        localStorage.setItem('authToken', 'demo-token-' + Date.now());
      }
    } else {
      // Auto-login as guest if no stored data
      const guestUser: User = {
        userId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Guest User',
        email: 'guest@branchpoint.com',
        createdAt: new Date().toISOString(),
      };
      setUser(guestUser);
      localStorage.setItem('user', JSON.stringify(guestUser));
      localStorage.setItem('userId', guestUser.userId);
      localStorage.setItem('authToken', 'demo-token-' + Date.now());
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userId', userData.userId);
    // For demo purposes, generate a mock token
    localStorage.setItem('authToken', 'demo-token-' + Date.now());
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      userId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Guest User',
      email: 'guest@branchpoint.com',
      createdAt: new Date().toISOString(),
    };
    login(guestUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loginAsGuest,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};