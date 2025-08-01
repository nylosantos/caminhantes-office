// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';
// // import { db } from '@/lib/firebase';
// // import { useAuth } from './AuthContext';
// // import { uploadToImgBB } from '@/lib/imgbb';
// // import { BaseImage, GameArt, ImageUploadResponse } from '@/types/images';

// // interface ImagesContextType {
// //   // Imagens base
// //   baseImages: BaseImage[];
// //   loading: boolean;
// //   uploadBaseImage: (file: File, type: 'quadrada' | 'vertical' | 'horizontal') => Promise<ImageUploadResponse>;
// //   removeBaseImage: (imageId: string) => Promise<{ success: boolean; error?: string }>;
// //   getImageByType: (type: 'quadrada' | 'vertical' | 'horizontal') => BaseImage | null;

// //   // Arte do jogo
// //   gameArt: GameArt | null;
// //   uploadGameArt: (file: File) => Promise<ImageUploadResponse>;
// //   removeGameArt: () => Promise<{ success: boolean; error?: string }>;
// // }

// // const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

// // export const ImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const { currentUser } = useAuth();
// //   const [baseImages, setBaseImages] = useState<BaseImage[]>([]);
// //   const [gameArt, setGameArt] = useState<GameArt | null>(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (currentUser) {
// //       loadImages();
// //     }
// //   }, [currentUser]);

// //   const loadImages = async () => {
// //     try {
// //       setLoading(true);

// //       // Carregar imagens base
// //       const baseImagesSnapshot = await getDocs(collection(db, 'baseImages'));
// //       const baseImagesData = baseImagesSnapshot.docs.map(doc => ({
// //         id: doc.id,
// //         ...doc.data(),
// //         uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
// //       })) as BaseImage[];

// //       setBaseImages(baseImagesData);

// //       // Carregar arte do jogo
// //       const gameArtSnapshot = await getDocs(collection(db, 'gameArt'));
// //       if (!gameArtSnapshot.empty) {
// //         const gameArtDoc = gameArtSnapshot.docs[0];
// //         setGameArt({
// //           id: gameArtDoc.id,
// //           ...gameArtDoc.data(),
// //           uploadedAt: gameArtDoc.data().uploadedAt?.toDate() || new Date()
// //         } as GameArt);
// //       }
// //     } catch (error) {
// //       console.error('Erro ao carregar imagens:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const uploadBaseImage = async (file: File, type: 'quadrada' | 'vertical' | 'horizontal'): Promise<ImageUploadResponse> => {
// //     if (!currentUser) {
// //       return { success: false, error: 'Usuário não autenticado' };
// //     }

// //     try {
// //       // Verificar se já existe uma imagem deste tipo
// //       const existingImage = baseImages.find(img => img.type === type);

// //       // Upload para ImgBB
// //       const uploadResult = await uploadToImgBB(file);

// //       if (!uploadResult.success) {
// //         return uploadResult;
// //       }

// //       const imageData: Omit<BaseImage, 'id'> = {
// //         type,
// //         url: uploadResult.url!,
// //         filename: file.name,
// //         uploadedAt: new Date(),
// //         uploadedBy: currentUser.uid
// //       };

// //       // Se existe uma imagem do mesmo tipo, substituir
// //       if (existingImage) {
// //         await setDoc(doc(db, 'baseImages', existingImage.id), {
// //           ...imageData,
// //           uploadedAt: serverTimestamp()
// //         });

// //         // Atualizar estado local
// //         setBaseImages(prev => prev.map(img =>
// //           img.id === existingImage.id
// //             ? { ...imageData, id: existingImage.id, uploadedAt: new Date() }
// //             : img
// //         ));
// //       } else {
// //         // Criar nova imagem
// //         const docRef = doc(collection(db, 'baseImages'));
// //         await setDoc(docRef, {
// //           ...imageData,
// //           uploadedAt: serverTimestamp()
// //         });

// //         // Atualizar estado local
// //         setBaseImages(prev => [...prev, { ...imageData, id: docRef.id, uploadedAt: new Date() }]);
// //       }

// //       return { success: true, url: uploadResult.url };
// //     } catch (error) {
// //       console.error('Erro ao fazer upload da imagem base:', error);
// //       return { success: false, error: 'Erro ao fazer upload da imagem' };
// //     }
// //   };

// //   const removeBaseImage = async (imageId: string): Promise<{ success: boolean; error?: string }> => {
// //     try {
// //       await deleteDoc(doc(db, 'baseImages', imageId));
// //       setBaseImages(prev => prev.filter(img => img.id !== imageId));
// //       return { success: true };
// //     } catch (error) {
// //       console.error('Erro ao remover imagem base:', error);
// //       return { success: false, error: 'Erro ao remover imagem' };
// //     }
// //   };

// //   const getImageByType = (type: 'quadrada' | 'vertical' | 'horizontal'): BaseImage | null => {
// //     return baseImages.find(img => img.type === type) || null;
// //   };

// //   const uploadGameArt = async (file: File): Promise<ImageUploadResponse> => {
// //     if (!currentUser) {
// //       return { success: false, error: 'Usuário não autenticadoaaaaaa' };
// //     }

// //     try {
// //       // Upload para ImgBB
// //       const uploadResult = await uploadToImgBB(file);

// //       if (!uploadResult.success) {
// //         return uploadResult;
// //       }

// //       const gameArtData: Omit<GameArt, 'id'> = {
// //         url: uploadResult.url!,
// //         filename: file.name,
// //         uploadedAt: new Date(),
// //         uploadedBy: currentUser.uid
// //       };

// //       // Se já existe uma arte do jogo, substituir
// //       if (gameArt) {
// //         await setDoc(doc(db, 'gameArt', gameArt.id), {
// //           ...gameArtData,
// //           uploadedAt: serverTimestamp()
// //         });

// //         setGameArt({ ...gameArtData, id: gameArt.id, uploadedAt: new Date() });
// //       } else {
// //         // Criar nova arte do jogo
// //         const docRef = doc(collection(db, 'gameArt'));
// //         await setDoc(docRef, {
// //           ...gameArtData,
// //           uploadedAt: serverTimestamp()
// //         });

// //         setGameArt({ ...gameArtData, id: docRef.id, uploadedAt: new Date() });
// //       }

// //       return { success: true, url: uploadResult.url };
// //     } catch (error) {
// //       console.error('Erro ao fazer upload da arte do jogo:', error);
// //       return { success: false, error: 'Erro ao fazer upload da arte do jogo' };
// //     }
// //   };

// //   const removeGameArt = async (): Promise<{ success: boolean; error?: string }> => {
// //     if (!gameArt) {
// //       return { success: false, error: 'Nenhuma arte do jogo para remover' };
// //     }

// //     try {
// //       await deleteDoc(doc(db, 'gameArt', gameArt.id));
// //       setGameArt(null);
// //       return { success: true };
// //     } catch (error) {
// //       console.error('Erro ao remover arte do jogo:', error);
// //       return { success: false, error: 'Erro ao remover arte do jogo' };
// //     }
// //   };

// //   const value: ImagesContextType = {
// //     baseImages,
// //     loading,
// //     uploadBaseImage,
// //     removeBaseImage,
// //     getImageByType,
// //     gameArt,
// //     uploadGameArt,
// //     removeGameArt
// //   };

// //   return (
// //     <ImagesContext.Provider value={value}>
// //       {children}
// //     </ImagesContext.Provider>
// //   );
// // };

// // export const useImages = (): ImagesContextType => {
// //   const context = useContext(ImagesContext);
// //   if (!context) {
// //     throw new Error('useImages deve ser usado dentro de um ImagesProvider');
// //   }
// //   return context;
// // };

// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
// // import { db } from '@/lib/firebase';
// // import { useAuth } from './AuthContext';
// // import { uploadToImgBB } from '@/lib/imgbb';
// // import {
// //   BaseImage,
// //   IMAGE_SECTIONS,
// //   IMAGE_TYPES_ENUM,
// //   ImageIdentifier,
// //   OperationResult,
// //   generateImageId
// // } from '@/types/images';

// // // Tipos para compatibilidade com sistema antigo
// // type LegacyImageType = 'quadrada' | 'vertical' | 'horizontal';

// // interface ImageUploadResponse {
// //   success: boolean;
// //   url?: string;
// //   error?: string;
// // }

// // interface ImagesContextType {
// //   // Novas funcionalidades
// //   baseImages: BaseImage[];
// //   loading: boolean;
// //   uploadBaseImage: (file: File, section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<ImageUploadResponse>;
// //   removeBaseImage: (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<{ success: boolean; error?: string }>;
// //   getImageByIdentifier: (identifier: ImageIdentifier) => BaseImage | undefined;
// //   getImagesBySection: (section: IMAGE_SECTIONS) => BaseImage[];

// //   // Compatibilidade com sistema antigo
// //   getImageByType: (type: LegacyImageType) => BaseImage | null;
// //   uploadLegacyImage: (file: File, type: LegacyImageType) => Promise<ImageUploadResponse>;
// //   removeLegacyImage: (imageId: string) => Promise<{ success: boolean; error?: string }>;
// // }

// // const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

// // export const ImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
// //   const { currentUser } = useAuth();
// //   const [baseImages, setBaseImages] = useState<BaseImage[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (currentUser) {
// //       loadImages();
// //     }
// //   }, [currentUser]);

// //   const loadImages = async () => {
// //     try {
// //       setLoading(true);

// //       // Carregar imagens base da nova estrutura
// //       const baseImagesSnapshot = await getDocs(collection(db, 'baseImages'));
// //       const baseImagesData = baseImagesSnapshot.docs.map(doc => ({
// //         id: doc.id,
// //         ...doc.data(),
// //         uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
// //       })) as BaseImage[];

// //       setBaseImages(baseImagesData);

// //       // Se não há imagens na nova estrutura, tentar migrar do sistema antigo
// //       if (baseImagesData.length === 0) {
// //         await migrateFromLegacySystem();
// //       }
// //     } catch (error) {
// //       console.error('Erro ao carregar imagens:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Função para migrar dados do sistema antigo
// //   const migrateFromLegacySystem = async () => {
// //     try {
// //       // Buscar imagens do sistema antigo (se existirem)
// //       const legacySnapshot = await getDocs(collection(db, 'legacyBaseImages'));

// //       if (!legacySnapshot.empty) {
// //         const migratedImages: BaseImage[] = [];

// //         for (const docSnap of legacySnapshot.docs) {
// //           const legacyData = docSnap.data();

// //           // Converter para nova estrutura (todas vão para seção "escalacao")
// //           const migratedImage: BaseImage = {
// //             id: generateImageId(IMAGE_SECTIONS.ESCALACAO, legacyData.type as IMAGE_TYPES_ENUM),
// //             section: IMAGE_SECTIONS.ESCALACAO,
// //             type: legacyData.type as IMAGE_TYPES_ENUM,
// //             url: legacyData.url,
// //             filename: legacyData.filename,
// //             uploadedAt: legacyData.uploadedAt?.toDate() || new Date(),
// //             uploadedBy: legacyData.uploadedBy
// //           };

// //           // Salvar na nova estrutura
// //           await setDoc(doc(db, 'baseImages', migratedImage.id), {
// //             section: migratedImage.section,
// //             type: migratedImage.type,
// //             url: migratedImage.url,
// //             filename: migratedImage.filename,
// //             uploadedAt: serverTimestamp(),
// //             uploadedBy: migratedImage.uploadedBy
// //           });

// //           migratedImages.push(migratedImage);
// //         }

// //         setBaseImages(migratedImages);

// //         // Opcional: remover dados antigos após migração bem-sucedida
// //         // for (const docSnap of legacySnapshot.docs) {
// //         //   await deleteDoc(doc(db, 'legacyBaseImages', docSnap.id));
// //         // }
// //       }
// //     } catch (error) {
// //       console.error('Erro na migração:', error);
// //     }
// //   };

// //   const uploadBaseImage = async (
// //     file: File,
// //     section: IMAGE_SECTIONS,
// //     type: IMAGE_TYPES_ENUM
// //   ): Promise<ImageUploadResponse> => {
// //     if (!currentUser) {
// //       return { success: false, error: 'Usuário não autenticado' };
// //     }

// //     try {
// //       // Verificar se já existe uma imagem desta seção e tipo
// //       const existingImage = baseImages.find(img =>
// //         img.section === section && img.type === type
// //       );

// //       // Upload para ImgBB
// //       const uploadResult = await uploadToImgBB(file);

// //       if (!uploadResult.success) {
// //         return uploadResult;
// //       }

// //       const imageId = generateImageId(section, type);
// //       const imageData = {
// //         section,
// //         type,
// //         url: uploadResult.url!,
// //         filename: file.name,
// //         uploadedAt: serverTimestamp(),
// //         uploadedBy: currentUser.uid
// //       };

// //       // Salvar no Firestore
// //       await setDoc(doc(db, 'baseImages', imageId), imageData);

// //       // Criar objeto para estado local
// //       const newImage: BaseImage = {
// //         id: imageId,
// //         section,
// //         type,
// //         url: uploadResult.url!,
// //         filename: file.name,
// //         uploadedAt: new Date(),
// //         uploadedBy: currentUser.uid
// //       };

// //       // Atualizar estado local
// //       if (existingImage) {
// //         setBaseImages(prev => prev.map(img =>
// //           img.section === section && img.type === type ? newImage : img
// //         ));
// //       } else {
// //         setBaseImages(prev => [...prev, newImage]);
// //       }

// //       return { success: true, url: uploadResult.url };
// //     } catch (error) {
// //       console.error('Erro ao fazer upload da imagem:', error);
// //       return { success: false, error: 'Erro ao fazer upload da imagem' };
// //     }
// //   };

// //   const removeBaseImage = async (
// //     section: IMAGE_SECTIONS,
// //     type: IMAGE_TYPES_ENUM
// //   ): Promise<{ success: boolean; error?: string }> => {
// //     try {
// //       const imageId = generateImageId(section, type);
// //       await deleteDoc(doc(db, 'baseImages', imageId));

// //       setBaseImages(prev => prev.filter(img =>
// //         !(img.section === section && img.type === type)
// //       ));

// //       return { success: true };
// //     } catch (error) {
// //       console.error('Erro ao remover imagem:', error);
// //       return { success: false, error: 'Erro ao remover imagem' };
// //     }
// //   };

// //   const getImageByIdentifier = (identifier: ImageIdentifier): BaseImage | undefined => {
// //     return baseImages.find(img =>
// //       img.section === identifier.section && img.type === identifier.type
// //     );
// //   };

// //   const getImagesBySection = (section: IMAGE_SECTIONS): BaseImage[] => {
// //     return baseImages.filter(img => img.section === section);
// //   };

// //   // Funções de compatibilidade com sistema antigo
// //   const getImageByType = (type: LegacyImageType): BaseImage | null => {
// //     // Busca na seção de escalação por compatibilidade
// //     const image = getImageByIdentifier({
// //       section: IMAGE_SECTIONS.ESCALACAO,
// //       type: type as IMAGE_TYPES_ENUM
// //     });
// //     return image || null;
// //   };

// //   const uploadLegacyImage = async (
// //     file: File,
// //     type: LegacyImageType
// //   ): Promise<ImageUploadResponse> => {
// //     // Redireciona para a nova função, sempre na seção "escalacao"
// //     return uploadBaseImage(file, IMAGE_SECTIONS.ESCALACAO, type as IMAGE_TYPES_ENUM);
// //   };

// //   const removeLegacyImage = async (imageId: string): Promise<{ success: boolean; error?: string }> => {
// //     try {
// //       // Encontrar a imagem pelo ID antigo
// //       const image = baseImages.find(img => img.id === imageId);
// //       if (!image) {
// //         return { success: false, error: 'Imagem não encontrada' };
// //       }

// //       // Usar a nova função de remoção
// //       return removeBaseImage(image.section, image.type);
// //     } catch (error) {
// //       console.error('Erro ao remover imagem legacy:', error);
// //       return { success: false, error: 'Erro ao remover imagem' };
// //     }
// //   };

// //   const value: ImagesContextType = {
// //     // Novas funcionalidades
// //     baseImages,
// //     loading,
// //     uploadBaseImage,
// //     removeBaseImage,
// //     getImageByIdentifier,
// //     getImagesBySection,

// //     // Compatibilidade com sistema antigo
// //     getImageByType,
// //     uploadLegacyImage,
// //     removeLegacyImage
// //   };

// //   return (
// //     <ImagesContext.Provider value={value}>
// //       {children}
// //     </ImagesContext.Provider>
// //   );
// // };

// // export const useImages = (): ImagesContextType => {
// //   const context = useContext(ImagesContext);
// //   if (!context) {
// //     throw new Error('useImages deve ser usado dentro de um ImagesProvider');
// //   }
// //   return context;
// // };

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { useAuth } from './AuthContext';
// import { uploadToImgBB } from '@/lib/imgbb';
// import {
//   BaseImage,
//   IMAGE_SECTIONS,
//   IMAGE_TYPES_ENUM,
//   ImageIdentifier,
//   OperationResult,
//   generateImageId
// } from '@/types/images';

// // Tipos para compatibilidade com sistema antigo
// type LegacyImageType = 'quadrada' | 'vertical' | 'horizontal';

// interface ImageUploadResponse {
//   success: boolean;
//   url?: string;
//   error?: string;
// }

// // Interface para GameArt (mantendo compatibilidade)
// interface GameArt {
//   id: string;
//   url: string;
//   filename: string;
//   uploadedAt: Date;
//   uploadedBy: string;
// }

// interface ImagesContextType {
//   // Novas funcionalidades para imagens base
//   baseImages: BaseImage[];
//   loading: boolean;
//   uploadBaseImage: (file: File, section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<ImageUploadResponse>;
//   removeBaseImage: (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<{ success: boolean; error?: string }>;
//   getImageByIdentifier: (identifier: ImageIdentifier) => BaseImage | undefined;
//   getImagesBySection: (section: IMAGE_SECTIONS) => BaseImage[];

//   // Compatibilidade com sistema antigo para imagens base
//   getImageByType: (type: LegacyImageType) => BaseImage | null;
//   uploadLegacyImage: (file: File, type: LegacyImageType) => Promise<ImageUploadResponse>;
//   removeLegacyImage: (imageId: string) => Promise<{ success: boolean; error?: string }>;

//   // Funcionalidades para GameArt (mantendo do sistema original)
//   gameArt: GameArt | null;
//   uploadGameArt: (file: File) => Promise<ImageUploadResponse>;
//   removeGameArt: () => Promise<{ success: boolean; error?: string }>;
// }

// const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

// export const ImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { currentUser } = useAuth();
//   const [baseImages, setBaseImages] = useState<BaseImage[]>([]);
//   const [gameArt, setGameArt] = useState<GameArt | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (currentUser) {
//       loadImages();
//     }
//   }, [currentUser]);

//   const loadImages = async () => {
//     try {
//       setLoading(true);

//       // Carregar imagens base da nova estrutura
//       const baseImagesSnapshot = await getDocs(collection(db, 'baseImages'));
//       const baseImagesData = baseImagesSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
//       })) as BaseImage[];

//       setBaseImages(baseImagesData);

//       // Carregar arte do jogo
//       const gameArtSnapshot = await getDocs(collection(db, 'gameArt'));
//       if (!gameArtSnapshot.empty) {
//         const gameArtDoc = gameArtSnapshot.docs[0];
//         setGameArt({
//           id: gameArtDoc.id,
//           ...gameArtDoc.data(),
//           uploadedAt: gameArtDoc.data().uploadedAt?.toDate() || new Date()
//         } as GameArt);
//       }

//       // Se não há imagens na nova estrutura, tentar migrar do sistema antigo
//       if (baseImagesData.length === 0) {
//         await migrateFromLegacySystem();
//       }
//     } catch (error) {
//       console.error('Erro ao carregar imagens:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Função para migrar dados do sistema antigo
//   const migrateFromLegacySystem = async () => {
//     try {
//       // Buscar imagens do sistema antigo (se existirem)
//       const legacySnapshot = await getDocs(collection(db, 'legacyBaseImages'));

//       if (!legacySnapshot.empty) {
//         const migratedImages: BaseImage[] = [];

//         for (const docSnap of legacySnapshot.docs) {
//           const legacyData = docSnap.data();

//           // Converter para nova estrutura (todas vão para seção "escalacao")
//           const migratedImage: BaseImage = {
//             id: generateImageId(IMAGE_SECTIONS.ESCALACAO, legacyData.type as IMAGE_TYPES_ENUM),
//             section: IMAGE_SECTIONS.ESCALACAO,
//             type: legacyData.type as IMAGE_TYPES_ENUM,
//             url: legacyData.url,
//             filename: legacyData.filename,
//             uploadedAt: legacyData.uploadedAt?.toDate() || new Date(),
//             uploadedBy: legacyData.uploadedBy
//           };

//           // Salvar na nova estrutura
//           await setDoc(doc(db, 'baseImages', migratedImage.id), {
//             section: migratedImage.section,
//             type: migratedImage.type,
//             url: migratedImage.url,
//             filename: migratedImage.filename,
//             uploadedAt: serverTimestamp(),
//             uploadedBy: migratedImage.uploadedBy
//           });

//           migratedImages.push(migratedImage);
//         }

//         setBaseImages(migratedImages);
//       }
//     } catch (error) {
//       console.error('Erro na migração:', error);
//     }
//   };

//   // === FUNÇÕES PARA IMAGENS BASE ===

//   const uploadBaseImage = async (
//     file: File,
//     section: IMAGE_SECTIONS,
//     type: IMAGE_TYPES_ENUM
//   ): Promise<ImageUploadResponse> => {
//     if (!currentUser) {
//       return { success: false, error: 'Usuário não autenticado' };
//     }

//     try {
//       // Verificar se já existe uma imagem desta seção e tipo
//       const existingImage = baseImages.find(img =>
//         img.section === section && img.type === type
//       );

//       // Upload para ImgBB
//       const uploadResult = await uploadToImgBB(file);

//       if (!uploadResult.success) {
//         return uploadResult;
//       }

//       const imageId = generateImageId(section, type);
//       const imageData = {
//         section,
//         type,
//         url: uploadResult.url!,
//         filename: file.name,
//         uploadedAt: serverTimestamp(),
//         uploadedBy: currentUser.uid
//       };

//       // Salvar no Firestore
//       await setDoc(doc(db, 'baseImages', imageId), imageData);

//       // Criar objeto para estado local
//       const newImage: BaseImage = {
//         id: imageId,
//         section,
//         type,
//         url: uploadResult.url!,
//         filename: file.name,
//         uploadedAt: new Date(),
//         uploadedBy: currentUser.uid
//       };

//       // Atualizar estado local
//       if (existingImage) {
//         setBaseImages(prev => prev.map(img =>
//           img.section === section && img.type === type ? newImage : img
//         ));
//       } else {
//         setBaseImages(prev => [...prev, newImage]);
//       }

//       return { success: true, url: uploadResult.url };
//     } catch (error) {
//       console.error('Erro ao fazer upload da imagem:', error);
//       return { success: false, error: 'Erro ao fazer upload da imagem' };
//     }
//   };

//   const removeBaseImage = async (
//     section: IMAGE_SECTIONS,
//     type: IMAGE_TYPES_ENUM
//   ): Promise<{ success: boolean; error?: string }> => {
//     try {
//       const imageId = generateImageId(section, type);
//       await deleteDoc(doc(db, 'baseImages', imageId));

//       setBaseImages(prev => prev.filter(img =>
//         !(img.section === section && img.type === type)
//       ));

//       return { success: true };
//     } catch (error) {
//       console.error('Erro ao remover imagem:', error);
//       return { success: false, error: 'Erro ao remover imagem' };
//     }
//   };

//   const getImageByIdentifier = (identifier: ImageIdentifier): BaseImage | undefined => {
//     return baseImages.find(img =>
//       img.section === identifier.section && img.type === identifier.type
//     );
//   };

//   const getImagesBySection = (section: IMAGE_SECTIONS): BaseImage[] => {
//     return baseImages.filter(img => img.section === section);
//   };

//   // === FUNÇÕES DE COMPATIBILIDADE PARA IMAGENS BASE ===

//   const getImageByType = (type: LegacyImageType): BaseImage | null => {
//     // Busca na seção de escalação por compatibilidade
//     const image = getImageByIdentifier({
//       section: IMAGE_SECTIONS.ESCALACAO,
//       type: type as IMAGE_TYPES_ENUM
//     });
//     return image || null;
//   };

//   const uploadLegacyImage = async (
//     file: File,
//     type: LegacyImageType
//   ): Promise<ImageUploadResponse> => {
//     // Redireciona para a nova função, sempre na seção "escalacao"
//     return uploadBaseImage(file, IMAGE_SECTIONS.ESCALACAO, type as IMAGE_TYPES_ENUM);
//   };

//   const removeLegacyImage = async (imageId: string): Promise<{ success: boolean; error?: string }> => {
//     try {
//       // Encontrar a imagem pelo ID antigo
//       const image = baseImages.find(img => img.id === imageId);
//       if (!image) {
//         return { success: false, error: 'Imagem não encontrada' };
//       }

//       // Usar a nova função de remoção
//       return removeBaseImage(image.section, image.type);
//     } catch (error) {
//       console.error('Erro ao remover imagem legacy:', error);
//       return { success: false, error: 'Erro ao remover imagem' };
//     }
//   };

//   // === FUNÇÕES PARA GAME ART ===

//   const uploadGameArt = async (file: File): Promise<ImageUploadResponse> => {
//     if (!currentUser) {
//       return { success: false, error: 'Usuário não autenticado' };
//     }

//     try {
//       // Upload para ImgBB
//       const uploadResult = await uploadToImgBB(file);

//       if (!uploadResult.success) {
//         return uploadResult;
//       }

//       const gameArtData: Omit<GameArt, 'id'> = {
//         url: uploadResult.url!,
//         filename: file.name,
//         uploadedAt: new Date(),
//         uploadedBy: currentUser.uid
//       };

//       // Se já existe uma arte do jogo, substituir
//       if (gameArt) {
//         await setDoc(doc(db, 'gameArt', gameArt.id), {
//           ...gameArtData,
//           uploadedAt: serverTimestamp()
//         });

//         setGameArt({ ...gameArtData, id: gameArt.id, uploadedAt: new Date() });
//       } else {
//         // Criar nova arte do jogo
//         const docRef = doc(collection(db, 'gameArt'));
//         await setDoc(docRef, {
//           ...gameArtData,
//           uploadedAt: serverTimestamp()
//         });

//         setGameArt({ ...gameArtData, id: docRef.id, uploadedAt: new Date() });
//       }

//       return { success: true, url: uploadResult.url };
//     } catch (error) {
//       console.error('Erro ao fazer upload da arte do jogo:', error);
//       return { success: false, error: 'Erro ao fazer upload da arte do jogo' };
//     }
//   };

//   const removeGameArt = async (): Promise<{ success: boolean; error?: string }> => {
//     if (!gameArt) {
//       return { success: false, error: 'Nenhuma arte do jogo para remover' };
//     }

//     try {
//       await deleteDoc(doc(db, 'gameArt', gameArt.id));
//       setGameArt(null);
//       return { success: true };
//     } catch (error) {
//       console.error('Erro ao remover arte do jogo:', error);
//       return { success: false, error: 'Erro ao remover arte do jogo' };
//     }
//   };

//   const value: ImagesContextType = {
//     // Novas funcionalidades para imagens base
//     baseImages,
//     loading,
//     uploadBaseImage,
//     removeBaseImage,
//     getImageByIdentifier,
//     getImagesBySection,

//     // Compatibilidade com sistema antigo para imagens base
//     getImageByType,
//     uploadLegacyImage,
//     removeLegacyImage,

//     // Funcionalidades para GameArt
//     gameArt,
//     uploadGameArt,
//     removeGameArt
//   };

//   return (
//     <ImagesContext.Provider value={value}>
//       {children}
//     </ImagesContext.Provider>
//   );
// };

// export const useImages = (): ImagesContextType => {
//   const context = useContext(ImagesContext);
//   if (!context) {
//     throw new Error('useImages deve ser usado dentro de um ImagesProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { uploadToImgBB } from '@/lib/imgbb';
import {
  BaseImage,
  IMAGE_SECTIONS,
  IMAGE_TYPES_ENUM,
  ImageIdentifier,
  generateImageId,
} from '@/types/images';

// Tipos para compatibilidade com sistema antigo
type LegacyImageType = 'quadrada' | 'vertical' | 'horizontal';

interface ImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Interface para GameArt (mantendo compatibilidade)
interface GameArt {
  id: string;
  url: string;
  filename: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// UPDATED: Interface para ChannelLogo com o campo 'type'
interface ChannelLogo {
  id: string; // Document ID (usually channelId)
  name: string; // Channel name
  logoUrl: string; // URL of the logo image
  type: 'TV_FECHADA' | 'STREAMING' | 'TV_ABERTA'; // NEW: Type of the channel
  uploadedAt: Date;
}

interface ImagesContextType {
  // Novas funcionalidades para imagens base
  baseImages: BaseImage[];
  loading: boolean;
  uploadBaseImage: (
    file: File,
    section: IMAGE_SECTIONS,
    type: IMAGE_TYPES_ENUM
  ) => Promise<ImageUploadResponse>;
  removeBaseImage: (
    section: IMAGE_SECTIONS,
    type: IMAGE_TYPES_ENUM
  ) => Promise<{ success: boolean; error?: string }>;
  getImageByIdentifier: (identifier: ImageIdentifier) => BaseImage | undefined;
  getImagesBySection: (section: IMAGE_SECTIONS) => BaseImage[];

  // Compatibilidade com sistema antigo para imagens base
  getImageByType: (type: LegacyImageType) => BaseImage | null;
  uploadLegacyImage: (
    file: File,
    type: LegacyImageType
  ) => Promise<ImageUploadResponse>;
  removeLegacyImage: (
    imageId: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Funcionalidades para GameArt (mantendo do sistema original)
  gameArt: GameArt | null;
  uploadGameArt: (file: File) => Promise<ImageUploadResponse>;
  removeGameArt: () => Promise<{ success: boolean; error?: string }>;

  // Funcionalidades para Channel Logos
  channelLogos: ChannelLogo[];
  getChannelLogoById: (channelId: string) => ChannelLogo | undefined;
  getChannelLogosByType: (
    type: 'TV_FECHADA' | 'STREAMING' | 'TV_ABERTA'
  ) => ChannelLogo[]; // NEW: Helper to filter by type
}

const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

export const ImagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [baseImages, setBaseImages] = useState<BaseImage[]>([]);
  const [gameArt, setGameArt] = useState<GameArt | null>(null);
  const [channelLogos, setChannelLogos] = useState<ChannelLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadImages();
    }
  }, [currentUser]);

  const loadImages = async () => {
    try {
      setLoading(true);

      // Carregar imagens base da nova estrutura
      const baseImagesSnapshot = await getDocs(collection(db, 'baseImages'));
      const baseImagesData = baseImagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
      })) as BaseImage[];

      setBaseImages(baseImagesData);

      // Carregar arte do jogo
      const gameArtSnapshot = await getDocs(collection(db, 'gameArt'));
      if (!gameArtSnapshot.empty) {
        const gameArtDoc = gameArtSnapshot.docs[0];
        setGameArt({
          id: gameArtDoc.id,
          ...gameArtDoc.data(),
          uploadedAt: gameArtDoc.data().uploadedAt?.toDate() || new Date(),
        } as GameArt);
      }

      // UPDATED: Carregar logos dos canais, incluindo o campo 'type'
      const channelsSnapshot = await getDocs(collection(db, 'channels'));
      const channelLogosData = channelsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          logoUrl: data.logoUrl,
          type: data.type, // NEW: Include the 'type' field
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
        } as ChannelLogo;
      });
      setChannelLogos(channelLogosData);

      // Se não há imagens na nova estrutura, tentar migrar do sistema antigo
      if (baseImagesData.length === 0) {
        await migrateFromLegacySystem();
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para migrar dados do sistema antigo
  const migrateFromLegacySystem = async () => {
    try {
      const legacySnapshot = await getDocs(collection(db, 'legacyBaseImages'));

      if (!legacySnapshot.empty) {
        const migratedImages: BaseImage[] = [];

        for (const docSnap of legacySnapshot.docs) {
          const legacyData = docSnap.data();

          const migratedImage: BaseImage = {
            id: generateImageId(
              IMAGE_SECTIONS.ESCALACAO,
              legacyData.type as IMAGE_TYPES_ENUM
            ),
            section: IMAGE_SECTIONS.ESCALACAO,
            type: legacyData.type as IMAGE_TYPES_ENUM,
            url: legacyData.url,
            filename: legacyData.filename,
            uploadedAt: legacyData.uploadedAt?.toDate() || new Date(),
            uploadedBy: legacyData.uploadedBy,
          };

          await setDoc(doc(db, 'baseImages', migratedImage.id), {
            section: migratedImage.section,
            type: migratedImage.type,
            url: migratedImage.url,
            filename: migratedImage.filename,
            uploadedAt: serverTimestamp(),
            uploadedBy: migratedImage.uploadedBy,
          });

          migratedImages.push(migratedImage);
        }

        setBaseImages(migratedImages);
      }
    } catch (error) {
      console.error('Erro na migração:', error);
    }
  };

  // === FUNÇÕES PARA IMAGENS BASE ===

  const uploadBaseImage = async (
    file: File,
    section: IMAGE_SECTIONS,
    type: IMAGE_TYPES_ENUM
  ): Promise<ImageUploadResponse> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const existingImage = baseImages.find(
        (img) => img.section === section && img.type === type
      );

      const uploadResult = await uploadToImgBB(file);

      if (!uploadResult.success) {
        return uploadResult;
      }

      const imageId = generateImageId(section, type);
      const imageData = {
        section,
        type,
        url: uploadResult.url!,
        filename: file.name,
        uploadedAt: serverTimestamp(),
        uploadedBy: currentUser.uid,
      };

      await setDoc(doc(db, 'baseImages', imageId), imageData);

      const newImage: BaseImage = {
        id: imageId,
        section,
        type,
        url: uploadResult.url!,
        filename: file.name,
        uploadedAt: new Date(),
        uploadedBy: currentUser.uid,
      };

      if (existingImage) {
        setBaseImages((prev) =>
          prev.map((img) =>
            img.section === section && img.type === type ? newImage : img
          )
        );
      } else {
        setBaseImages((prev) => [...prev, newImage]);
      }

      return { success: true, url: uploadResult.url };
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return { success: false, error: 'Erro ao fazer upload da imagem' };
    }
  };

  const removeBaseImage = async (
    section: IMAGE_SECTIONS,
    type: IMAGE_TYPES_ENUM
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const imageId = generateImageId(section, type);
      await deleteDoc(doc(db, 'baseImages', imageId));

      setBaseImages((prev) =>
        prev.filter((img) => !(img.section === section && img.type === type))
      );

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      return { success: false, error: 'Erro ao remover imagem' };
    }
  };

  const getImageByIdentifier = (
    identifier: ImageIdentifier
  ): BaseImage | undefined => {
    return baseImages.find(
      (img) =>
        img.section === identifier.section && img.type === identifier.type
    );
  };

  const getImagesBySection = (section: IMAGE_SECTIONS): BaseImage[] => {
    return baseImages.filter((img) => img.section === section);
  };

  // === FUNÇÕES DE COMPATIBILIDADE PARA IMAGENS BASE ===

  const getImageByType = (type: LegacyImageType): BaseImage | null => {
    const image = getImageByIdentifier({
      section: IMAGE_SECTIONS.ESCALACAO,
      type: type as IMAGE_TYPES_ENUM,
    });
    return image || null;
  };

  const uploadLegacyImage = async (
    file: File,
    type: LegacyImageType
  ): Promise<ImageUploadResponse> => {
    return uploadBaseImage(
      file,
      IMAGE_SECTIONS.ESCALACAO,
      type as IMAGE_TYPES_ENUM
    );
  };

  const removeLegacyImage = async (
    imageId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const image = baseImages.find((img) => img.id === imageId);
      if (!image) {
        return { success: false, error: 'Imagem não encontrada' };
      }

      return removeBaseImage(image.section, image.type);
    } catch (error) {
      console.error('Erro ao remover imagem legacy:', error);
      return { success: false, error: 'Erro ao remover imagem' };
    }
  };

  // === FUNÇÕES PARA GAME ART ===

  const uploadGameArt = async (file: File): Promise<ImageUploadResponse> => {
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const uploadResult = await uploadToImgBB(file);

      if (!uploadResult.success) {
        return uploadResult;
      }

      const gameArtData: Omit<GameArt, 'id'> = {
        url: uploadResult.url!,
        filename: file.name,
        uploadedAt: new Date(),
        uploadedBy: currentUser.uid,
      };

      if (gameArt) {
        await setDoc(doc(db, 'gameArt', gameArt.id), {
          ...gameArtData,
          uploadedAt: serverTimestamp(),
        });

        setGameArt({ ...gameArtData, id: gameArt.id, uploadedAt: new Date() });
      } else {
        const docRef = doc(collection(db, 'gameArt'));
        await setDoc(docRef, {
          ...gameArtData,
          uploadedAt: serverTimestamp(),
        });

        setGameArt({ ...gameArtData, id: docRef.id, uploadedAt: new Date() });
      }

      return { success: true, url: uploadResult.url };
    } catch (error) {
      console.error('Erro ao fazer upload da arte do jogo:', error);
      return { success: false, error: 'Erro ao fazer upload da arte do jogo' };
    }
  };

  const removeGameArt = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
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

  // === FUNÇÕES PARA CHANNEL LOGOS ===

  const getChannelLogoById = (channelId: string): ChannelLogo | undefined => {
    return channelLogos.find((logo) => logo.id === channelId);
  };

  // NEW: Função para obter logos de canais por tipo
  const getChannelLogosByType = (
    type: 'TV_FECHADA' | 'STREAMING' | 'TV_ABERTA'
  ): ChannelLogo[] => {
    return channelLogos.filter((logo) => logo.type === type);
  };

  const value: ImagesContextType = {
    // Funcionalidades para imagens base
    baseImages,
    loading,
    uploadBaseImage,
    removeBaseImage,
    getImageByIdentifier,
    getImagesBySection,

    // Compatibilidade com sistema antigo para imagens base
    getImageByType,
    uploadLegacyImage,
    removeLegacyImage,

    // Funcionalidades para GameArt
    gameArt,
    uploadGameArt,
    removeGameArt,

    // Funcionalidades para Channel Logos
    channelLogos,
    getChannelLogoById,
    getChannelLogosByType, // NEW: Added to context value
  };

  return (
    <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>
  );
};

export const useImages = (): ImagesContextType => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error('useImages deve ser usado dentro de um ImagesProvider');
  }
  return context;
};
