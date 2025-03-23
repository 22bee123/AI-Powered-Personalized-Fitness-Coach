import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  error: string | null;
}

const ClerkAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(ClerkAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a ClerkAuthProvider');
  }
  return context;
};

interface ClerkAuthProviderProps {
  children: ReactNode;
}

export const ClerkAuthProvider = ({ children }: ClerkAuthProviderProps) => {
  const { isLoaded, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync Clerk user with our backend
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && clerkUser) {
        try {
          // Create or update user in your backend
          const response = await api.post('/users/clerk-sync', { 
            clerkId: clerkUser.id,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            email: clerkUser.primaryEmailAddress?.emailAddress
          });
          
          setUser(response.data);
        } catch (err) {
          console.error('Error syncing user with backend:', err);
        }
      } else if (isLoaded && !clerkUser) {
        setUser(null);
      }
      
      if (isLoaded) {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [isLoaded, clerkUser]);

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || !isLoaded,
    logout,
    error,
  };

  return <ClerkAuthContext.Provider value={value}>{children}</ClerkAuthContext.Provider>;
}; 