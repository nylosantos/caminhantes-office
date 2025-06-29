import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { uploadToImgBB } from '@/lib/imgbb';
import { BaseImage, GameArt, ImageUploadResponse } from '@/types/images';

interface ImagesContextType {
  // Imagens base
  baseImages: BaseImage[];
  loading: boolean;
  uploadBaseImage: (file: File, type: 'quadrada' | 'vertical' | 'horizontal') => Promise<ImageUploadResponse>;
  removeBaseImage: (imageId: string) => Promise<{ success: boolean; error?: string }>;
  getImageByType: (type: 'quadrada' | 'vertical' | 'horizontal') => BaseImage | null;
  
  // Arte do jogo
  gameArt: GameArt | null;
  uploadGameArt: (file: File) => Promise<ImageUploadResponse>;
  removeGameArt: () => Promise<{ success: boolean; error?: string }>;
}

const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

export const ImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [baseImages, setBaseImages] = useState<BaseImage[]>([]);
  const [gameArt, setGameArt] = useState<GameArt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadImages();
    }
  }, [currentUser]);

  const loadImages = async () => {
    try {
      setLoading(true);
      
      // Carregar imagens base
      const baseImagesSnapshot = await getDocs(collection(db, 'baseImages'));
      const baseImagesData = baseImagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
      })) as BaseImage[];
      
      setBaseImages(baseImagesData);

      // Carregar arte do jogo
      const gameArtSnapshot = await getDocs(collection(db, 'gameArt'));
      if (!gameArtSnapshot.empty) {
        const gameArtDoc = gameArtSnapshot.docs[0];
        setGameArt({
          id: gameArtDoc.id,
          ...gameArtDoc.data(),
          uploadedAt: gameArtDoc.data().uploadedAt?.toDate() || new Date()
        } as GameArt);
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadBaseImage = async (file: File, type: 'quadrada' | 'vertical' | 'horizontal'): Promise<ImageUploadResponse> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      // Verificar se já existe uma imagem deste tipo
      const existingImage = baseImages.find(img => img.type === type);
      
      // Upload para ImgBB
      const uploadResult = await uploadToImgBB(file);
      
      if (!uploadResult.success) {
        return uploadResult;
      }

      const imageData: Omit<BaseImage, 'id'> = {
        type,
        url: uploadResult.url!,
        filename: file.name,
        uploadedAt: new Date(),
        uploadedBy: currentUser.uid
      };

      // Se existe uma imagem do mesmo tipo, substituir
      if (existingImage) {
        await setDoc(doc(db, 'baseImages', existingImage.id), {
          ...imageData,
          uploadedAt: serverTimestamp()
        });
        
        // Atualizar estado local
        setBaseImages(prev => prev.map(img => 
          img.id === existingImage.id 
            ? { ...imageData, id: existingImage.id, uploadedAt: new Date() }
            : img
        ));
      } else {
        // Criar nova imagem
        const docRef = doc(collection(db, 'baseImages'));
        await setDoc(docRef, {
          ...imageData,
          uploadedAt: serverTimestamp()
        });
        
        // Atualizar estado local
        setBaseImages(prev => [...prev, { ...imageData, id: docRef.id, uploadedAt: new Date() }]);
      }

      return { success: true, url: uploadResult.url };
    } catch (error) {
      console.error('Erro ao fazer upload da imagem base:', error);
      return { success: false, error: 'Erro ao fazer upload da imagem' };
    }
  };

  const removeBaseImage = async (imageId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await deleteDoc(doc(db, 'baseImages', imageId));
      setBaseImages(prev => prev.filter(img => img.id !== imageId));
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover imagem base:', error);
      return { success: false, error: 'Erro ao remover imagem' };
    }
  };

  const getImageByType = (type: 'quadrada' | 'vertical' | 'horizontal'): BaseImage | null => {
    return baseImages.find(img => img.type === type) || null;
  };

  const uploadGameArt = async (file: File): Promise<ImageUploadResponse> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticadoaaaaaa' };
    }

    try {
      // Upload para ImgBB
      const uploadResult = await uploadToImgBB(file);
      
      if (!uploadResult.success) {
        return uploadResult;
      }

      const gameArtData: Omit<GameArt, 'id'> = {
        url: uploadResult.url!,
        filename: file.name,
        uploadedAt: new Date(),
        uploadedBy: currentUser.uid
      };

      // Se já existe uma arte do jogo, substituir
      if (gameArt) {
        await setDoc(doc(db, 'gameArt', gameArt.id), {
          ...gameArtData,
          uploadedAt: serverTimestamp()
        });
        
        setGameArt({ ...gameArtData, id: gameArt.id, uploadedAt: new Date() });
      } else {
        // Criar nova arte do jogo
        const docRef = doc(collection(db, 'gameArt'));
        await setDoc(docRef, {
          ...gameArtData,
          uploadedAt: serverTimestamp()
        });
        
        setGameArt({ ...gameArtData, id: docRef.id, uploadedAt: new Date() });
      }

      return { success: true, url: uploadResult.url };
    } catch (error) {
      console.error('Erro ao fazer upload da arte do jogo:', error);
      return { success: false, error: 'Erro ao fazer upload da arte do jogo' };
    }
  };

  const removeGameArt = async (): Promise<{ success: boolean; error?: string }> => {
    if (!gameArt) {
      return { success: false, error: 'Nenhuma arte do jogo para remover' };
    }

    try {
      await deleteDoc(doc(db, 'gameArt', gameArt.id));
      setGameArt(null);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover arte do jogo:', error);
      return { success: false, error: 'Erro ao remover arte do jogo' };
    }
  };

  const value: ImagesContextType = {
    baseImages,
    loading,
    uploadBaseImage,
    removeBaseImage,
    getImageByType,
    gameArt,
    uploadGameArt,
    removeGameArt
  };

  return (
    <ImagesContext.Provider value={value}>
      {children}
    </ImagesContext.Provider>
  );
};

export const useImages = (): ImagesContextType => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error('useImages deve ser usado dentro de um ImagesProvider');
  }
  return context;
};

