import React from 'react';
import { AuthProvider } from './AuthContext';
import { DatabaseProvider } from './DatabaseContext';
import { GlobalProvider } from './GlobalContext';
import { UserProvider } from './UserContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GlobalProvider>
      <AuthProvider>
        <UserProvider>
          <DatabaseProvider>
            {children}
          </DatabaseProvider>
        </UserProvider>
      </AuthProvider>
    </GlobalProvider>
  );
};

// Re-exportar todos os hooks para facilitar o uso
export { useAuth } from './AuthContext';
export { useDatabase } from './DatabaseContext';
export { useGlobal } from './GlobalContext';
export { useUser } from './UserContext';

