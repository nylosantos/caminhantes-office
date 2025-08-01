import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { executeWithConfirmationAndLoading } from '@/components/ui/ConfirmDialog';

export interface Alias {
  id?: string;
  name: string;
  alias: string;
}

interface AliasContextType {
  aliases: Alias[];
  loading: boolean;
  addAlias: (data: Omit<Alias, 'id'>) => Promise<boolean>;
  updateAlias: (data: Alias) => Promise<boolean>;
  deleteAlias: (id: string, name: string) => Promise<boolean>;
}

const AliasContext = createContext<AliasContextType | undefined>(undefined);

export const AliasProvider = ({ children }: { children: ReactNode }) => {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = collection(db, 'aliases');

  const fetchAliases = async () => {
    setLoading(true);
    const snapshot = await getDocs(ref);
    const data = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Alias[];
    setAliases(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAliases();
  }, []);

  const addAlias = async (data: Omit<Alias, 'id'>): Promise<boolean> => {
    const success = await executeWithConfirmationAndLoading(
      {
        title: 'Criar Alias',
        text: `Deseja criar o alias para "${data.name}"?`,
        confirmButtonText: 'Criar',
        cancelButtonText: 'Cancelar',
        icon: 'question',
      },
      async () => {
        await addDoc(ref, data);
        await fetchAliases();
      },
      {
        title: 'Criando Alias...',
        text: `Adicionando "${data.name}". Por favor, aguarde.`,
      }
    );

    return success;
  };

  const updateAlias = async (data: Alias): Promise<boolean> => {
    if (!data.id) return false;

    const success = await executeWithConfirmationAndLoading(
      {
        title: 'Atualizar Alias',
        text: `Deseja atualizar o alias "${data.name}"?`,
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar',
        icon: 'question',
      },
      async () => {
        await updateDoc(doc(ref, data.id!), {
          name: data.name,
          alias: data.alias,
        });
        await fetchAliases();
      },
      {
        title: 'Atualizando Alias...',
        text: `Salvando alterações de "${data.name}"...`,
      }
    );

    return success;
  };

  const deleteAlias = async (id: string, name: string): Promise<boolean> => {
    const success = await executeWithConfirmationAndLoading(
      {
        title: 'Excluir Alias',
        text: `Tem certeza que deseja excluir o alias "${name}"?`,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        icon: 'warning',
      },
      async () => {
        await deleteDoc(doc(ref, id));
        await fetchAliases();
      },
      {
        title: 'Excluindo Alias...',
        text: `Removendo "${name}". Aguarde um momento.`,
      }
    );

    return success;
  };

  return (
    <AliasContext.Provider
      value={{
        aliases,
        loading,
        addAlias,
        updateAlias,
        deleteAlias,
      }}
    >
      {children}
    </AliasContext.Provider>
  );
};

export const useAliases = () => {
  const ctx = useContext(AliasContext);
  if (!ctx)
    throw new Error('useAliases deve ser usado dentro de AliasProvider');
  return ctx;
};
