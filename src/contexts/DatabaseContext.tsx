import React, { createContext, useContext } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DatabaseContextType {
  // Operações CRUD genéricas
  create: (collectionName: string, data: any) => Promise<string>;
  read: (collectionName: string, docId: string) => Promise<DocumentData | null>;
  update: (collectionName: string, docId: string, data: any) => Promise<void>;
  delete: (collectionName: string, docId: string) => Promise<void>;
  list: (collectionName: string, constraints?: QueryConstraint[]) => Promise<DocumentData[]>;
  
  // Operações específicas para escalações
  createEscalacao: (escalacao: any) => Promise<string>;
  getEscalacoes: (userId: string) => Promise<DocumentData[]>;
  updateEscalacao: (id: string, escalacao: any) => Promise<void>;
  deleteEscalacao: (id: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  // Operações CRUD genéricas
  const create = async (collectionName: string, data: any): Promise<string> => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  };

  const read = async (collectionName: string, docId: string): Promise<DocumentData | null> => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  };

  const update = async (collectionName: string, docId: string, data: any): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  };

  const deleteDoc_ = async (collectionName: string, docId: string): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  };

  const list = async (collectionName: string, constraints: QueryConstraint[] = []): Promise<DocumentData[]> => {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  // Operações específicas para escalações
  const createEscalacao = async (escalacao: any): Promise<string> => {
    return await create('escalacoes', escalacao);
  };

  const getEscalacoes = async (userId: string): Promise<DocumentData[]> => {
    return await list('escalacoes', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ]);
  };

  const updateEscalacao = async (id: string, escalacao: any): Promise<void> => {
    await update('escalacoes', id, escalacao);
  };

  const deleteEscalacao = async (id: string): Promise<void> => {
    await deleteDoc_('escalacoes', id);
  };

  const value: DatabaseContextType = {
    create,
    read,
    update,
    delete: deleteDoc_,
    list,
    createEscalacao,
    getEscalacoes,
    updateEscalacao,
    deleteEscalacao
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

