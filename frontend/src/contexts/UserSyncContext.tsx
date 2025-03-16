import React, { createContext, useContext, ReactNode } from 'react';
import { useUserSync } from '../hooks/useUserSync';

// Define the context type
interface UserSyncContextType {
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  error: string | null;
}

// Create the context with default values
const UserSyncContext = createContext<UserSyncContextType>({
  syncStatus: 'idle',
  error: null
});

// Hook to use the UserSync context
export const useUserSyncContext = () => useContext(UserSyncContext);

// Provider component
interface UserSyncProviderProps {
  children: ReactNode;
}

export const UserSyncProvider: React.FC<UserSyncProviderProps> = ({ children }) => {
  // Use our custom hook to handle user synchronization
  const { syncStatus, error } = useUserSync();

  // Provide the sync status to the app
  return (
    <UserSyncContext.Provider value={{ syncStatus, error }}>
      {children}
    </UserSyncContext.Provider>
  );
};
