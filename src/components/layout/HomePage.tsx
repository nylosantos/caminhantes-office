import React, { useState } from 'react';
import { Menu, LogOut, User, Calendar, Settings, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useGlobal, useUser } from '@/contexts';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import AdminDashboard from '@/components/admin/AdminDashboard';
import EscalacaoGenerator from '@/components/escalacoes/EscalacaoGenerator';
import caminhantesClock from '@/assets/caminhantes-clock.png';

const HomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentUserData } = useUser();
  const { setIsMenuOpen } = useGlobal();
  const { showConfirmDialog } = useConfirmDialog();
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'escalacoes'>('home');

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
    const firstName = currentUserData?.name?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';
    
    if (hour < 12) return `Bom dia, ${firstName}! 🌅`;
    if (hour < 18) return `Boa tarde, ${firstName}! ☀️`;
    return `Boa noite, ${firstName}! 🌙`;
  };

  const getUserName = () => {
    return currentUserData?.name || currentUser?.displayName || 'Usuário';
  };

  // Renderizar view específica
  if (currentView === 'admin') {
    return <AdminDashboard onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'escalacoes') {
    return <EscalacaoGenerator onBack={() => setCurrentView('home')} />;
  }

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
              <h1 className="text-xl font-display-bold text-gray-800">
                Caminhantes Office
              </h1>
            </div>

            {/* Menu e usuário */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600 font-display">
                <User className="w-4 h-4 mr-1" />
                {getUserName()}
                {currentUserData?.role && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-display-medium">
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-display-medium"
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
        <div className="text-center mb-12">
          <img 
            src={caminhantesClock} 
            alt="Caminhantes" 
            className="w-20 h-20 mx-auto mb-6 drop-shadow-lg"
          />
          <h2 className="text-3xl font-display-extrabold text-gray-800 mb-2">
            {getGreeting()}
          </h2>
          <p className="text-lg text-gray-600 font-display">
            Bem-vindo ao Caminhantes Office
          </p>
        </div>

        {/* Grid de aplicações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Card Escalações */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-red-100 hover:border-red-300"
            onClick={() => setCurrentView('escalacoes')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                Gerador de Escalações
              </h3>
              <p className="text-gray-600 mb-4 font-display">
                Crie escalações personalizadas com logos, jogadores e informações da partida.
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium">
                <Calendar className="w-4 h-4 mr-2" />
                Acessar
              </Button>
            </div>
          </div>

          {/* Card Administração (apenas para root/editor) */}
          {currentUserData && (currentUserData.role === 'root' || currentUserData.role === 'editor') && (
            <div 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-teal-300"
              onClick={() => setCurrentView('admin')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                  Administração
                </h3>
                <p className="text-gray-600 mb-4 font-display">
                  Gerencie usuários, permissões e configurações do sistema.
                </p>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium">
                  <Settings className="w-4 h-4 mr-2" />
                  Acessar
                </Button>
              </div>
            </div>
          )}

          {/* Card placeholder para futuras aplicações */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 opacity-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                Em Breve
              </h3>
              <p className="text-gray-600 mb-4 font-display">
                Novas aplicações serão adicionadas em breve.
              </p>
              <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed font-display-medium">
                Em Desenvolvimento
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer com slogan */}
      <footer className="bg-white border-t border-red-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-lg font-display-semibold text-red-600 mb-2">
              "Aqui você não caminha sozinho"
            </p>
            <p className="text-sm text-gray-500 font-display">
              © {new Date().getFullYear()} Caminhantes Office. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

