import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Custom hook to synchronize Clerk user data with our backend database
 */
export const useUserSync = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only attempt to sync if Clerk has loaded and the user is signed in
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    const syncUserWithDatabase = async () => {
      try {
        setSyncStatus('syncing');
        
        const response = await fetch(`${API_BASE_URL}/api/users/create-or-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to sync user with database');
        }

        const data = await response.json();
        console.log('User synced with database:', data);
        setSyncStatus('success');
      } catch (err) {
        console.error('Error syncing user with database:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setSyncStatus('error');
      }
    };

    // Sync user data when the component mounts and the user is signed in
    syncUserWithDatabase();
  }, [user, isSignedIn, isLoaded]);

  return { syncStatus, error };
};
