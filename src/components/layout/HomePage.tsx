import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useGlobal, useUser } from '@/contexts';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import caminhantesClock from '@/assets/caminhantes-clock.png';

const HomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentUserData } = useUser();
  const { setIsMenuOpen } = useGlobal();
  const { showConfirmDialog } = useConfirmDialog();

  const handleLogout = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Confirmar logout',
      text: 'Tem certeza que deseja sair?',
      icon: 'question',
      confirmButtonText: 'Sair',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed) {
      await logout();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserName = () => {
    return currentUserData?.name || currentUser?.displayName || 'Usuário';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e título */}
            <div className="flex items-center">
              <img 
                src={caminhantesClock} 
                alt="Caminhantes" 
                className="w-10 h-10 mr-3"
              />
              <h1 className="text-xl font-bold text-gray-800">
                Caminhantes Office
              </h1>
            </div>

            {/* Menu e usuário */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {getUserName()}
                {currentUserData?.role && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    {currentUserData.role}
                  </span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saudação personalizada */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {getGreeting()}, {getUserName().split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Bem-vindo de volta ao Caminhantes Office
          </p>
        </div>

        {/* Boas-vindas */}
        <div className="text-center mb-12">
          <img 
            src={caminhantesClock} 
            alt="Caminhantes" 
            className="w-20 h-20 mx-auto mb-6 drop-shadow-lg"
          />
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Escolha sua aplicação
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecione uma das aplicações disponíveis para começar a trabalhar com suas escalações e conteúdos.
          </p>
        </div>

        {/* Grid de aplicações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Escalações */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-red-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚽</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Gerador de Escalações
              </h3>
              <p className="text-gray-600 mb-4">
                Crie escalações personalizadas com logos, jogadores e informações da partida.
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                Acessar
              </Button>
            </div>
          </div>

          {/* Card Administração (apenas para root/editor) */}
          {currentUserData && (currentUserData.role === 'root' || currentUserData.role === 'editor') && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-red-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Administração
                </h3>
                <p className="text-gray-600 mb-4">
                  Gerencie usuários, permissões e configurações do sistema.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  Acessar
                </Button>
              </div>
            </div>
          )}

          {/* Card placeholder para futuras aplicações */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-not-allowed border border-gray-200 opacity-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Em breve
              </h3>
              <p className="text-gray-600 mb-4">
                Novas aplicações serão adicionadas em breve.
              </p>
              <Button disabled className="w-full">
                Em desenvolvimento
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer com slogan */}
      <footer className="bg-white border-t border-red-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600 mb-2">
              "Aqui você não caminha sozinho"
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Caminhantes Office. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

