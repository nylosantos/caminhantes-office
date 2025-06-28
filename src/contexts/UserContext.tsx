import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserData, CreateUserData, UserRole } from '@/types/user';
import { useAuth } from './AuthContext';

interface UserContextType {
  currentUserData: UserData | null;
  users: UserData[];
  loading: boolean;
  
  // Funções para gerenciar usuários
  createUser: (userData: CreateUserData) => Promise<void>;
  updateUserStatus: (userId: string, active: boolean) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  loadUsers: () => Promise<void>;
  
  // Funções de verificação de permissão
  canAccessAdmin: () => boolean;
  canManageUsers: () => boolean;
  isRoot: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário atual
  useEffect(() => {
    const loadCurrentUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            // Converter timestamps do Firestore para Date
            const processedUserData = {
              ...userData,
              id: currentUser.uid,
              createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt),
              updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(userData.updatedAt),
              lastLogin: userData.lastLogin?.toDate ? userData.lastLogin.toDate() : userData.lastLogin ? new Date(userData.lastLogin) : undefined
            };
            setCurrentUserData(processedUserData);
          } else {
            // Se não existe documento do usuário, criar um básico
            const newUserData = {
              name: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              role: 'user' as UserRole,
              active: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', currentUser.uid), newUserData);
            
            // Recarregar após criar
            const updatedDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (updatedDoc.exists()) {
              const userData = updatedDoc.data() as UserData;
              setCurrentUserData({
                ...userData,
                id: currentUser.uid,
                createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(),
                updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date()
              });
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      } else {
        setCurrentUserData(null);
      }
      setLoading(false);
    };

    loadCurrentUserData();
  }, [currentUser]);

  // Criar novo usuário
  const createUser = async (userData: CreateUserData): Promise<void> => {
    try {
      // Criar usuário no Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Atualizar perfil
      await updateProfile(user, { displayName: userData.name });
      
      // Criar documento no Firestore
      const newUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        active: userData.active ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser?.uid
      };
      
      await setDoc(doc(db, 'users', user.uid), newUserData);
      
      // Recarregar lista de usuários
      await loadUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  };

  // Atualizar status do usuário
  const updateUserStatus = async (userId: string, active: boolean): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        active,
        updatedAt: serverTimestamp()
      });
      
      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, active } : user
      ));
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      throw error;
    }
  };

  // Atualizar role do usuário
  const updateUserRole = async (userId: string, role: UserRole): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
        updatedAt: serverTimestamp()
      });
      
      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
    } catch (error) {
      console.error('Erro ao atualizar role do usuário:', error);
      throw error;
    }
  };

  // Carregar todos os usuários
  const loadUsers = async (): Promise<void> => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserData;
        usersData.push({
          ...userData,
          id: doc.id,
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt),
          updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(userData.updatedAt),
          lastLogin: userData.lastLogin?.toDate ? userData.lastLogin.toDate() : userData.lastLogin ? new Date(userData.lastLogin) : undefined
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      throw error;
    }
  };

  // Verificações de permissão
  const canAccessAdmin = (): boolean => {
    return currentUserData?.role === 'root' || currentUserData?.role === 'editor';
  };

  const canManageUsers = (): boolean => {
    return currentUserData?.role === 'root' || currentUserData?.role === 'editor';
  };

  const isRoot = (): boolean => {
    return currentUserData?.role === 'root';
  };

  const value: UserContextType = {
    currentUserData,
    users,
    loading,
    createUser,
    updateUserStatus,
    updateUserRole,
    loadUsers,
    canAccessAdmin,
    canManageUsers,
    isRoot
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

