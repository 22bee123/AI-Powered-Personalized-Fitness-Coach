import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Define types
interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileDetails?: {
    age?: string;
    gender?: string;
    weight?: string;
    height?: string;
    goals?: string;
    preferences?: string;
    limitations?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        setUser(data.user);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Update state
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      // Update state
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
