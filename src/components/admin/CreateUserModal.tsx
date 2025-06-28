import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CreateUserData, UserRole } from '@/types/user';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createUser, currentUserData } = useUser();
  const { showSuccessAlert, showErrorAlert } = useConfirmDialog();
  
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      await showErrorAlert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    if (formData.password.length < 6) {
      await showErrorAlert('Senha inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    try {
      await createUser(formData);
      await showSuccessAlert('Usuário criado!', `${formData.name} foi criado com sucesso.`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        active: true
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      let errorMessage = 'Erro ao criar usuário. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca.';
      }
      
      await showErrorAlert('Erro ao criar usuário', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Criar Novo Usuário</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nome do usuário"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="email@exemplo.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>
          </div>

          {/* Cargo */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                disabled={loading}
              >
                <option value="user">Usuário</option>
                <option value="editor">Editor</option>
                {currentUserData?.role === 'root' && (
                  <option value="root">Root</option>
                )}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'user' && 'Acesso apenas às aplicações básicas'}
              {formData.role === 'editor' && 'Acesso às aplicações e área administrativa'}
              {formData.role === 'root' && 'Acesso total ao sistema'}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              id="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              disabled={loading}
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Usuário ativo (pode fazer login)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </div>
              ) : (
                'Criar Usuário'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;

