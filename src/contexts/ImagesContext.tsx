import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BaseImage, ImageUploadResponse } from '@/types/images';
import { uploadToImgBB, validateImageFile } from '@/lib/imgbb';
import { useAuth } from './AuthContext';

interface ImagesContextType {
  baseImages: BaseImage[];
  loading: boolean;
  uploadBaseImage: (file: File, type: BaseImage['type']) => Promise<{ success: boolean; error?: string }>;
  deleteBaseImage: (type: BaseImage['type']) => Promise<{ success: boolean; error?: string }>;
  getBaseImageByType: (type: BaseImage['type']) => BaseImage | null;
  refreshImages: () => Promise<void>;
}

const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

export const useImages = () => {
  const context = useContext(ImagesContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImagesProvider');
  }
  return context;
};

export const ImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseImages, setBaseImages] = useState<BaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Carregar imagens base do Firestore
  const loadBaseImages = async () => {
    try {
      setLoading(true);
      const imagesRef = collection(db, 'baseImages');
      const snapshot = await getDocs(imagesRef);
      
      const images: BaseImage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        images.push({
          id: doc.id,
          type: data.type,
          url: data.url,
          filename: data.filename,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          uploadedBy: data.uploadedBy
        });
      });
      
      setBaseImages(images);
    } catch (error) {
      console.error('Erro ao carregar imagens base:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload de nova imagem base
  const uploadBaseImage = async (file: File, type: BaseImage['type']): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      setLoading(true);

      // Verificar se já existe uma imagem deste tipo e deletar
      const existingImage = getBaseImageByType(type);
      if (existingImage) {
        await deleteBaseImage(type);
      }

      // Upload para ImgBB
      const uploadResult: ImageUploadResponse = await uploadToImgBB(file);
      
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }

      // Salvar no Firestore
      const imageData: Omit<BaseImage, 'id'> = {
        type,
        url: uploadResult.url,
        filename: file.name,
        uploadedAt: new Date(),
        uploadedBy: currentUser.uid
      };

      const docRef = doc(collection(db, 'baseImages'));
      await setDoc(docRef, {
        ...imageData,
        uploadedAt: new Date() // Firestore timestamp
      });

      // Atualizar estado local
      const newImage: BaseImage = {
        id: docRef.id,
        ...imageData
      };

      setBaseImages(prev => [...prev.filter(img => img.type !== type), newImage]);

      return { success: true };
    } catch (error) {
      console.error('Erro no upload da imagem base:', error);
      return { success: false, error: 'Erro interno no upload' };
    } finally {
      setLoading(false);
    }
  };

  // Deletar imagem base
  const deleteBaseImage = async (type: BaseImage['type']): Promise<{ success: boolean; error?: string }> => {
    try {
      const imageToDelete = getBaseImageByType(type);
      if (!imageToDelete) {
        return { success: false, error: 'Imagem não encontrada' };
      }

      // Deletar do Firestore
      await deleteDoc(doc(db, 'baseImages', imageToDelete.id));

      // Atualizar estado local
      setBaseImages(prev => prev.filter(img => img.type !== type));

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar imagem base:', error);
      return { success: false, error: 'Erro ao deletar imagem' };
    }
  };

  // Buscar imagem por tipo
  const getBaseImageByType = (type: BaseImage['type']): BaseImage | null => {
    return baseImages.find(img => img.type === type) || null;
  };

  // Recarregar imagens
  const refreshImages = async () => {
    await loadBaseImages();
  };

  useEffect(() => {
    loadBaseImages();
  }, []);

  const value: ImagesContextType = {
    baseImages,
    loading,
    uploadBaseImage,
    deleteBaseImage,
    getBaseImageByType,
    refreshImages
  };

  return (
    <ImagesContext.Provider value={value}>
      {children}
    </ImagesContext.Provider>
  );
};

