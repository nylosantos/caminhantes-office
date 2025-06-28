import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Shield, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserData, UserRole } from '@/types/user';
import CreateUserModal from './CreateUserModal';

const UserManagement: React.FC = () => {
  const { users, loadUsers, updateUserStatus, updateUserRole, currentUserData } = useUser();
  const { showConfirmDialog, showSuccessAlert, showErrorAlert } = useConfirmDialog();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    setLoading(true);
    try {
      await loadUsers();
    } catch (error) {
      await showErrorAlert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: UserData) => {
    const action = user.active ? 'desativar' : 'ativar';
    const confirmed = await showConfirmDialog({
      title: `Confirmar ${action}`,
      text: `Tem certeza que deseja ${action} o usuário ${user.name}?`,
      icon: 'question',
      confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelButtonText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await updateUserStatus(user.id, !user.active);
        await showSuccessAlert('Sucesso!', `Usuário ${action}do com sucesso.`);
      } catch (error) {
        await showErrorAlert('Erro', `Não foi possível ${action} o usuário.`);
      }
    }
  };

  const handleChangeRole = async (user: UserData, newRole: UserRole) => {
    if (user.id === currentUserData?.id && newRole !== 'root') {
      await showErrorAlert('Erro', 'Você não pode alterar seu próprio cargo de root.');
      return;
    }

    const confirmed = await showConfirmDialog({
      title: 'Confirmar alteração de cargo',
      text: `Alterar cargo de ${user.name} para ${newRole}?`,
      icon: 'question',
      confirmButtonText: 'Alterar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await updateUserRole(user.id, newRole);
        await showSuccessAlert('Sucesso!', 'Cargo alterado com sucesso.');
      } catch (error) {
        await showErrorAlert('Erro', 'Não foi possível alterar o cargo.');
      }
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'root':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'editor':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'user':
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'root':
        return 'bg-yellow-100 text-yellow-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
          <p className="text-gray-600 mt-1">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'root' || u.role === 'editor').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => !u.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Dropdown de cargo (apenas para root) */}
                      {currentUserData?.role === 'root' && (
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 cursor-pointer"
                          disabled={user.id === currentUserData?.id}
                        >
                          <option value="user">user</option>
                          <option value="editor">editor</option>
                          <option value="root">root</option>
                        </select>
                      )}
                      
                      {/* Toggle status */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                        className={`cursor-pointer ${
                          user.active 
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        disabled={user.id === currentUserData?.id}
                      >
                        {user.active ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadUsersData}
      />
    </div>
  );
};

export default UserManagement;

