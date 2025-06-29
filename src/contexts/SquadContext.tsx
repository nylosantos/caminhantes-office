import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToImgBB } from '@/lib/imgbb';
import { Player, PlayerFormData, INITIAL_LIVERPOOL_SQUAD } from '@/types/squad';
import { useAuth } from './AuthContext';

interface SquadContextType {
  players: Player[];
  loading: boolean;
  addPlayer: (playerData: PlayerFormData) => Promise<{ success: boolean; error?: string }>;
  updatePlayer: (playerId: string, playerData: PlayerFormData) => Promise<{ success: boolean; error?: string }>;
  deletePlayer: (playerId: string) => Promise<{ success: boolean; error?: string }>;
  getPlayersByPosition: (position: string) => Player[];
  isNumberTaken: (number: string, excludeId?: string) => boolean;
  initializeSquad: () => Promise<{ success: boolean; error?: string }>;
  refreshSquad: () => Promise<void>;
  uploadPlayerImage: (playerId: string, imageFile: File) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
  removePlayerImage: (playerId: string, imageUrl: string) => Promise<{ success: boolean; error?: string }>;
}

const SquadContext = createContext<SquadContextType | undefined>(undefined);

export const useSquad = () => {
  const context = useContext(SquadContext);
  if (context === undefined) {
    throw new Error('useSquad must be used within a SquadProvider');
  }
  return context;
};

export const SquadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Carregar elenco do Firestore
  const loadSquad = async () => {
    try {
      setLoading(true);
      const playersRef = collection(db, 'squad');
      const snapshot = await getDocs(playersRef);
      
      const squadPlayers: Player[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        squadPlayers.push({
          id: doc.id,
          name: data.name,
          number: data.number,
          position: data.position,
          imgUrl: data.imgUrl || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      // Ordenar por posição primeiro, depois por número
      squadPlayers.sort((a, b) => {
        // Definir ordem das posições
        const positionOrder = { 'GOL': 1, 'DEF': 2, 'MEI': 3, 'ATA': 4 };
        
        // Primeiro critério: posição
        const positionDiff = positionOrder[a.position] - positionOrder[b.position];
        if (positionDiff !== 0) {
          return positionDiff;
        }
        
        // Segundo critério: número
        return parseInt(a.number) - parseInt(b.number);
      });
      
      setPlayers(squadPlayers);
    } catch (error) {
      console.error('Erro ao carregar elenco:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo jogador
  const addPlayer = async (playerData: PlayerFormData): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Validar dados
    const validation = validatePlayerData(playerData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Verificar se número já existe
    if (isNumberTaken(playerData.number)) {
      return { success: false, error: `Número ${playerData.number} já está em uso` };
    }

    try {
      const docRef = doc(collection(db, 'squad'));
      const now = new Date();
      
      await setDoc(docRef, {
        name: playerData.name.trim(),
        number: playerData.number.trim(),
        position: playerData.position,
        imgUrl: [],
        createdAt: now,
        updatedAt: now
      });

      // Atualizar estado local
      const newPlayer: Player = {
        id: docRef.id,
        name: playerData.name.trim(),
        number: playerData.number.trim(),
        position: playerData.position,
        imgUrl: [],
        createdAt: now,
        updatedAt: now
      };

      setPlayers(prev => {
        const updated = [...prev, newPlayer];
        // Ordenar por posição primeiro, depois por número
        return updated.sort((a, b) => {
          const positionOrder = { 'GOL': 1, 'DEF': 2, 'MEI': 3, 'ATA': 4 };
          const positionDiff = positionOrder[a.position] - positionOrder[b.position];
          if (positionDiff !== 0) {
            return positionDiff;
          }
          return parseInt(a.number) - parseInt(b.number);
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      return { success: false, error: 'Erro interno ao adicionar jogador' };
    }
  };

  // Atualizar jogador
  const updatePlayer = async (playerId: string, playerData: PlayerFormData): Promise<{ success: boolean; error?: string }> => {
    // Validar dados
    const validation = validatePlayerData(playerData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Verificar se número já existe (excluindo o próprio jogador)
    if (isNumberTaken(playerData.number, playerId)) {
      return { success: false, error: `Número ${playerData.number} já está em uso` };
    }

    try {
      const playerRef = doc(db, 'squad', playerId);
      const now = new Date();
      
      await updateDoc(playerRef, {
        name: playerData.name.trim(),
        number: playerData.number.trim(),
        position: playerData.position,
        updatedAt: now
      });

      // Atualizar estado local
      setPlayers(prev => {
        const updated = prev.map(player => 
          player.id === playerId 
            ? { 
                ...player, 
                name: playerData.name.trim(),
                number: playerData.number.trim(),
                position: playerData.position,
                updatedAt: now 
              }
            : player
        );
        
        // Ordenar por posição primeiro, depois por número
        return updated.sort((a, b) => {
          const positionOrder = { 'GOL': 1, 'DEF': 2, 'MEI': 3, 'ATA': 4 };
          const positionDiff = positionOrder[a.position] - positionOrder[b.position];
          if (positionDiff !== 0) {
            return positionDiff;
          }
          return parseInt(a.number) - parseInt(b.number);
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      return { success: false, error: 'Erro interno ao atualizar jogador' };
    }
  };

  // Deletar jogador
  const deletePlayer = async (playerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await deleteDoc(doc(db, 'squad', playerId));

      // Atualizar estado local
      setPlayers(prev => prev.filter(player => player.id !== playerId));

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      return { success: false, error: 'Erro ao deletar jogador' };
    }
  };

  // Upload de imagem do jogador
  const uploadPlayerImage = async (playerId: string, imageFile: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const player = players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    // Verificar se já tem 2 imagens
    if (player.imgUrl && player.imgUrl.length >= 2) {
      return { success: false, error: 'Jogador já possui o máximo de 2 imagens' };
    }

    try {
      // Upload para ImgBB
      const uploadResult = await uploadToImgBB(imageFile);
      
      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, error: uploadResult.error || 'Erro no upload da imagem' };
      }

      // Atualizar no Firestore
      const playerRef = doc(db, 'squad', playerId);
      const currentImages = player.imgUrl || [];
      const updatedImages = [...currentImages, uploadResult.url];
      
      await updateDoc(playerRef, {
        imgUrl: updatedImages,
        updatedAt: new Date()
      });

      // Atualizar estado local
      setPlayers(prev => prev.map(p => 
        p.id === playerId 
          ? { ...p, imgUrl: updatedImages, updatedAt: new Date() }
          : p
      ));

      return { success: true, imageUrl: uploadResult.url };
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return { success: false, error: 'Erro interno no upload da imagem' };
    }
  };

  // Remover imagem do jogador
  const removePlayerImage = async (playerId: string, imageUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const player = players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    try {
      // Remover URL da lista
      const currentImages = player.imgUrl || [];
      const updatedImages = currentImages.filter(url => url !== imageUrl);
      
      // Atualizar no Firestore
      const playerRef = doc(db, 'squad', playerId);
      await updateDoc(playerRef, {
        imgUrl: updatedImages,
        updatedAt: new Date()
      });

      // Atualizar estado local
      setPlayers(prev => prev.map(p => 
        p.id === playerId 
          ? { ...p, imgUrl: updatedImages, updatedAt: new Date() }
          : p
      ));

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      return { success: false, error: 'Erro interno ao remover imagem' };
    }
  };

  // Buscar jogadores por posição
  const getPlayersByPosition = (position: string): Player[] => {
    return players.filter(player => player.position === position);
  };

  // Verificar se número já está em uso
  const isNumberTaken = (number: string, excludeId?: string): boolean => {
    return players.some(player => 
      player.number === number.trim() && player.id !== excludeId
    );
  };

  // Inicializar elenco com dados padrão
  const initializeSquad = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);
      
      // Verificar se já existe elenco
      if (players.length > 0) {
        return { success: false, error: 'Elenco já foi inicializado' };
      }

      const batch = [];
      const now = new Date();

      for (const playerData of INITIAL_LIVERPOOL_SQUAD) {
        const docRef = doc(collection(db, 'squad'));
        batch.push(
          setDoc(docRef, {
            ...playerData,
            imgUrl: [],
            createdAt: now,
            updatedAt: now
          })
        );
      }

      await Promise.all(batch);
      await loadSquad(); // Recarregar dados

      return { success: true };
    } catch (error) {
      console.error('Erro ao inicializar elenco:', error);
      return { success: false, error: 'Erro ao inicializar elenco' };
    } finally {
      setLoading(false);
    }
  };

  // Recarregar elenco
  const refreshSquad = async () => {
    await loadSquad();
  };

  // Validar dados do jogador
  const validatePlayerData = (data: PlayerFormData): { valid: boolean; error?: string } => {
    if (!data.name.trim()) {
      return { valid: false, error: 'Nome é obrigatório' };
    }

    if (data.name.trim().length < 2) {
      return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }

    if (!data.number.trim()) {
      return { valid: false, error: 'Número é obrigatório' };
    }

    const numberInt = parseInt(data.number.trim());
    if (isNaN(numberInt) || numberInt < 1 || numberInt > 99) {
      return { valid: false, error: 'Número deve ser entre 1 e 99' };
    }

    if (!data.position) {
      return { valid: false, error: 'Posição é obrigatória' };
    }

    return { valid: true };
  };

  useEffect(() => {
    loadSquad();
  }, []);

  const value: SquadContextType = {
    players,
    loading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayersByPosition,
    isNumberTaken,
    initializeSquad,
    refreshSquad,
    uploadPlayerImage,
    removePlayerImage
  };

  return (
    <SquadContext.Provider value={value}>
      {children}
    </SquadContext.Provider>
  );
};

