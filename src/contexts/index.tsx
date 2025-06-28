import React from 'react';
import { AuthProvider } from './AuthContext';
import { DatabaseProvider } from './DatabaseContext';
import { GlobalProvider } from './GlobalContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GlobalProvider>
      <AuthProvider>
        <DatabaseProvider>
          {children}
        </DatabaseProvider>
      </AuthProvider>
    </GlobalProvider>
  );
};

// Re-exportar todos os hooks para facilitar o uso
export { useAuth } from './AuthContext';
export { useDatabase } from './DatabaseContext';
export { useGlobal } from './GlobalContext';

