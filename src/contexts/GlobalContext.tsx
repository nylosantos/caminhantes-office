import React, { createContext, useContext, useState } from 'react';

interface GlobalContextType {
  // Estados globais da aplicação
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Menu drawer
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  
  // Configurações da aplicação
  appSettings: {
    theme: 'light' | 'dark';
    language: 'pt-BR' | 'en';
  };
  updateAppSettings: (settings: Partial<typeof appSettings>) => void;
  
  // Estados para escalações
  currentEscalacao: any;
  setCurrentEscalacao: (escalacao: any) => void;
  
  // Notificações/Toast
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

interface GlobalProviderProps {
  children: React.ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentEscalacao, setCurrentEscalacao] = useState(null);
  
  const [appSettings, setAppSettings] = useState({
    theme: 'light' as const,
    language: 'pt-BR' as const
  });

  const updateAppSettings = (settings: Partial<typeof appSettings>) => {
    setAppSettings(prev => ({ ...prev, ...settings }));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Implementação com SweetAlert2 será feita no componente específico
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const value: GlobalContextType = {
    isLoading,
    setIsLoading,
    isMenuOpen,
    setIsMenuOpen,
    appSettings,
    updateAppSettings,
    currentEscalacao,
    setCurrentEscalacao,
    showNotification
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

