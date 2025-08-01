import React from 'react';

import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { SquadProvider } from './SquadContext';
import { TeamsProvider } from './TeamsContext';
import { GlobalProvider } from './GlobalContext';
import { ImagesProvider } from './ImagesContext';
import { ChannelProvider } from './ChannelContext';
import { DatabaseProvider } from './DatabaseContext';
import { AliasProvider } from './AliasContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GlobalProvider>
      <AuthProvider>
        <DatabaseProvider>
          <AliasProvider>
            <UserProvider>
              <TeamsProvider>
                <ImagesProvider>
                  <ChannelProvider>
                    <SquadProvider>{children}</SquadProvider>
                  </ChannelProvider>
                </ImagesProvider>
              </TeamsProvider>
            </UserProvider>
          </AliasProvider>
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
export { useSquad } from './SquadContext';
export { useSportDbTeams } from './TeamsContext';
