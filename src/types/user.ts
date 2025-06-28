export type UserRole = 'root' | 'editor' | 'user';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // ID do usuário que criou este usuário
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active?: boolean;
}

