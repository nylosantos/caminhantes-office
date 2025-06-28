import React from 'react';
import { AuthProvider } from './AuthContext';
import { DatabaseProvider } from './DatabaseContext';
import { GlobalProvider } from './GlobalContext';
import { UserProvider } from './UserContext';
import { ImagesProvider } from './ImagesContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GlobalProvider>
      <AuthProvider>
        <DatabaseProvider>
          <UserProvider>
            <ImagesProvider>
              {children}
            </ImagesProvider>
          </UserProvider>
        </DatabaseProvider>
      </AuthProvider>
    </GlobalProvider>
  );
};

// Re-export hooks for convenience
export { useAuth } from './AuthContext';
export { useDatabase } from './DatabaseContext';
export { useGlobal } from './GlobalContext';
export { useUser } from './UserContext';
export { useImages } from './ImagesContext';

