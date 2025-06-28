import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserData } from '@/types/user';

export const createRootUser = async () => {
  try {
    console.log('Criando usuário root...');
    
    // Criar usuário no Firebase Auth
    const { user } = await createUserWithEmailAndPassword(
      auth, 
      'nylodocs@gmail.com', 
      'CaminhantesSafe2024!'
    );
    
    console.log('Usuário criado no Auth:', user.uid);
    
    // Atualizar perfil
    await updateProfile(user, { displayName: 'Nylo Santos' });
    
    console.log('Perfil atualizado');
    
    // Criar documento no Firestore
    const userData: UserData = {
      id: user.uid,
      name: 'Nylo Santos',
      email: 'nylodocs@gmail.com',
      role: 'root',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log('Documento criado no Firestore');
    console.log('✅ Usuário root criado com sucesso!');
    
    return userData;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ Email já está em uso. Usuário pode já existir.');
    } else {
      console.error('❌ Erro ao criar usuário root:', error);
    }
    throw error;
  }
};

// Função para executar via console do browser
(window as any).createRootUser = createRootUser;

