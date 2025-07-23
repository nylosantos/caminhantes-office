// import { useRoundTranslations } from '@/hooks/useRoundsTranslations';
// import { Match } from '@/types/matches';
// import { RoundTranslationsDocument } from '@/types/translations';
// import React, { createContext, useContext, useState } from 'react';

// interface GlobalContextType {
//   // Estados globais da aplicação
//   isLoading: boolean;
//   setIsLoading: (loading: boolean) => void;

//   // Menu drawer
//   isMenuOpen: boolean;
//   setIsMenuOpen: (open: boolean) => void;

//   // Configurações da aplicação
//   appSettings: {
//     theme: 'light' | 'dark';
//     language: 'pt-BR' | 'en';
//   };
//   updateAppSettings: (settings: Partial<typeof appSettings>) => void;

//   // Estados para escalações
//   currentEscalacao: any;
//   setCurrentEscalacao: (escalacao: any) => void;

//   // Notificações/Toast
//   showNotification: (message: string, type: 'success' | 'error' | 'info') => void;

//   // Rodadas traduzidas
//   getRoundsTranslated: (match: Match) => RoundTranslationsDocument | undefined
// }

// const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// export const useGlobal = () => {
//   const context = useContext(GlobalContext);
//   if (context === undefined) {
//     throw new Error('useGlobal must be used within a GlobalProvider');
//   }
//   return context;
// };

// interface GlobalProviderProps {
//   children: React.ReactNode;
// }

// export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [currentEscalacao, setCurrentEscalacao] = useState(null);

//   const [appSettings, setAppSettings] = useState({
//     theme: 'light' as const,
//     language: 'pt-BR' as const
//   });

//   const updateAppSettings = (settings: Partial<typeof appSettings>) => {
//     setAppSettings(prev => ({ ...prev, ...settings }));
//   };

//   const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
//     // Implementação com SweetAlert2 será feita no componente específico
//     console.log(`${type.toUpperCase()}: ${message}`);
//   };

//   const { translations } = useRoundTranslations()

//   const getRoundsTranslated = (match: Match) => {
//     const round = translations.find(t => t[match.fixture.id][match.league.round])
//     return round
//   }


//   const value: GlobalContextType = {
//     isLoading,
//     setIsLoading,
//     isMenuOpen,
//     setIsMenuOpen,
//     appSettings,
//     updateAppSettings,
//     currentEscalacao,
//     setCurrentEscalacao,
//     showNotification,
//     getRoundsTranslated
//   };

//   return (
//     <GlobalContext.Provider value={value}>
//       {children}
//     </GlobalContext.Provider>
//   );
// };

import { useRoundTranslations } from '@/hooks/useRoundsTranslations';
import { Match } from '@/types/matches'; // Certifique-se de que Match está definido/importado corretamente
import { RoundTranslationsDocument } from '@/types/translations'; // Certifique-se de que RoundTranslationsDocument está definido/importado corretamente
import React, { createContext, useContext, useState } from 'react';

// --- NOVO: Defina o tipo para as configurações da aplicação separadamente ---
interface AppSettings {
  theme: 'light' | 'dark';
  language: 'pt-BR' | 'en';
}
// --- FIM DO NOVO ---

interface GlobalContextType {
  // Estados globais da aplicação
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Menu drawer
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;

  // Configurações da aplicação
  appSettings: AppSettings; // Use o novo tipo AppSettings aqui
  updateAppSettings: (settings: Partial<AppSettings>) => void; // Use AppSettings aqui também

  // Estados para escalações
  currentEscalacao: any; // Considere tipar isso de forma mais específica
  setCurrentEscalacao: (escalacao: any) => void; // Considere tipar isso de forma mais específica

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
  // Considere uma tipagem mais específica para currentEscalacao, ex: useState<EscalacaoType | null>(null);
  const [currentEscalacao, setCurrentEscalacao] = useState<any | null>(null);

  // O 'as const' é bom aqui para inferir os tipos literais 'light', 'dark', 'pt-BR', 'en'
  const [appSettings, setAppSettings] = useState<AppSettings>({ // Tipar o useState explicitamente com AppSettings
    theme: 'light',
    language: 'pt-BR'
  });

  const updateAppSettings = (settings: Partial<AppSettings>) => { // Usar AppSettings aqui também
    setAppSettings(prev => ({ ...prev, ...settings }));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Implementação com SweetAlert2 será feita no componente específico
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const { translations } = useRoundTranslations();

  const getRoundsTranslated = (match: Match): RoundTranslationsDocument | undefined => {
    // Percorrer o array de translations para encontrar a rodada correta
    // A lógica de acesso `t[match.fixture.id][match.league.round]`
    // implica que a estrutura de RoundTranslationsDocument é um objeto
    // onde as chaves são IDs de fixture, e os valores são objetos com chaves de rodada.
    // Se translations é um array de tais objetos, a busca precisa ser mais robusta.
    // Exemplo: translations = [{ "123": { "Round 1": { ... } } }, { "456": { ... } }]
    for (const translationDoc of translations) {
        // Verifica se o ID da fixture existe no documento de tradução atual
        if (translationDoc[match.fixture.id]) {
            // Verifica se a rodada específica existe para aquela fixture
            if (translationDoc[match.fixture.id][match.league.round]) {
                return translationDoc; // Retorna o documento completo se encontrar a correspondência
            }
        }
    }
    return undefined; // Retorna undefined se não encontrar
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
    showNotification  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};