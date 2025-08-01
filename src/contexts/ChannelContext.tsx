// src/contexts/ChannelContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { db } from '@/lib/firebase'; // Ajuste o caminho se necessário
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Channel, ChannelFormData } from '@/types/channels';
import { executeWithConfirmationAndLoading } from '@/components/ui/ConfirmDialog';

// Lógica de upload para o ImageBB (similar à que você já deve ter)
async function uploadImageToImageBB(imageFile: File): Promise<string | null> {
  //@ts-expect-error
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY; // Guarde sua chave em .env.local
  if (!apiKey) {
    console.error('ImageBB API Key não encontrada.');
    return null;
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const result = await response.json();
    if (result.success) {
      return result.data.url;
    }
    console.error('Erro no upload para ImageBB:', result.error.message);
    return null;
  } catch (error) {
    console.error('Falha ao fazer upload da imagem:', error);
    return null;
  }
}

export interface ChannelContextType {
  channels: Channel[];
  loading: boolean;
  addChannel: (
    data: ChannelFormData,
    logoFile: File | null
  ) => Promise<{ success: boolean; error?: string }>;
  updateChannel: (
    id: string,
    data: Partial<ChannelFormData>,
    logoFile?: File | null
  ) => Promise<{ success: boolean; error?: string }>;
  deleteChannel: (
    id: string,
    channelName: string
  ) => Promise<
    | {
        success: boolean;
        error?: undefined;
      }
    | {
        success: boolean;
        error: string;
      }
  >;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const channelsCollectionRef = collection(db, 'channels');

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const data = await getDocs(channelsCollectionRef);
      const fetchedChannels = data.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Channel)
      );
      setChannels(fetchedChannels.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Erro ao buscar canais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const addChannel = async (data: ChannelFormData, logoFile: File | null) => {
    const success = await executeWithConfirmationAndLoading(
      {
        // Opções para o diálogo de confirmação de criação
        title: 'Criar Canal',
        text: `Tem certeza que deseja criar o canal ${data.name}?`,
        confirmButtonText: 'Criar',
        cancelButtonText: 'Cancelar',
        icon: 'question',
      },
      // Ação a ser executada se confirmado
      async () => {
        let logoUrl: string | null = null;
        if (logoFile) {
          logoUrl = await uploadImageToImageBB(logoFile);
          if (!logoUrl) {
            // Lançar erro para que executeWithConfirmationAndLoading o capture
            throw new Error('Falha no upload da logo.');
          }
        }

        await addDoc(channelsCollectionRef, { ...data, logoUrl });
        await fetchChannels(); // Re-fetch para atualizar a lista após a adição
      },
      {
        // Opções para o diálogo de loading enquanto a criação está acontecendo
        title: 'Criando Canal...',
        text: `Adicionando ${data.name}. Por favor, aguarde.`,
      }
    );

    // Reage ao resultado global da operação
    if (success) {
      console.log(`Canal ${data.name} criado com sucesso!`);
      return { success: true };
    } else {
      console.log(`Criação do canal ${data.name} cancelada ou falhou.`);
      return {
        success: false,
        error: 'Criação cancelada ou falha na operação.',
      };
    }
  };

  const updateChannel = async (
    id: string,
    data: Partial<ChannelFormData>,
    logoFile?: File | null
  ) => {
    // A função executeWithConfirmationAndLoading encapsula toda a lógica
    // de confirmação, loading, execução da ação e alertas de sucesso/erro.
    const success = await executeWithConfirmationAndLoading(
      {
        // Opções para o diálogo de confirmação
        title: 'Atualizar Canal',
        text: `Tem certeza que deseja atualizar o canal ${data.name}?`,
        confirmButtonText: 'Atualizar',
        cancelButtonText: 'Cancelar',
      },
      // Esta é a função assíncrona (a "ação") que será executada se o usuário confirmar.
      // Toda a sua lógica de atualização do canal deve ir aqui dentro.
      async () => {
        const channelDoc = doc(db, 'channels', id);
        const updateData: any = { ...data };

        if (logoFile) {
          const logoUrl = await uploadImageToImageBB(logoFile);
          if (!logoUrl) {
            // Se o upload falhar, você deve lançar um erro para que
            // executeWithConfirmationAndLoading possa capturá-lo e mostrar o alerta de erro.
            throw new Error('Falha no upload da nova logo.');
          }
          updateData.logoUrl = logoUrl;
        }

        await updateDoc(channelDoc, updateData);
        // Chame fetchChannels aqui, pois é parte da sua ação de atualização
        await fetchChannels();
        // Não é necessário retornar { success: true } aqui,
        // executeWithConfirmationAndLoading já lida com o status de sucesso.
      },
      {
        // Opções para o diálogo de loading enquanto a ação está sendo executada.
        title: 'Atualizando Canal...',
        text: `Atualizando ${data.name}. Por favor, aguarde.`,
      }
    );

    // Após a execução de executeWithConfirmationAndLoading, você pode
    // reagir ao resultado global da operação.
    if (success) {
      console.log(`Canal ${data.name} atualizado com sucesso!`);
      // O alerta de sucesso já foi exibido por executeWithConfirmationAndLoading.
      // Você pode adicionar qualquer lógica de UI adicional aqui, como fechar um modal.
      return { success: true }; // Mantenha o retorno original se precisar dele fora
    } else {
      console.log(`Atualização do canal ${data.name} cancelada ou falhou.`);
      // O alerta de erro (se houver) ou a mensagem de cancelamento já foram tratados.
      return {
        success: false,
        error: 'Atualização cancelada ou falha na operação.',
      }; // Mantenha o retorno original
    }
  };

  const deleteChannel = async (id: string, channelName: string) => {
    // Adicione channelName para melhor UX
    const success = await executeWithConfirmationAndLoading(
      {
        // Opções para o diálogo de confirmação de exclusão
        title: 'Deletar Canal',
        text: `Tem certeza que deseja deletar o canal "${channelName}"? Esta ação é irreversível.`,
        icon: 'warning', // Ícone de aviso para exclusão
        confirmButtonText: 'Sim, Deletar!',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545', // Cor vermelha para botão de exclusão
      },
      // Ação a ser executada se confirmado
      async () => {
        const channelDoc = doc(db, 'channels', id);
        await deleteDoc(channelDoc);
        await fetchChannels(); // Re-fetch para atualizar a lista após a exclusão
      },
      {
        // Opções para o diálogo de loading enquanto a exclusão está acontecendo
        title: 'Deletando Canal...',
        text: `Removendo "${channelName}". Por favor, aguarde.`,
      }
    );

    // Reage ao resultado global da operação
    if (success) {
      console.log(`Canal "${channelName}" deletado com sucesso!`);
      return { success: true };
    } else {
      console.log(`Exclusão do canal "${channelName}" cancelada ou falhou.`);
      return {
        success: false,
        error: 'Exclusão cancelada ou falha na operação.',
      };
    }
  };

  return (
    <ChannelContext.Provider
      value={{ channels, loading, addChannel, updateChannel, deleteChannel }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannels = () => {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannels deve ser usado dentro de um ChannelProvider');
  }
  return context;
};
