import { ArrowLeft, LogOut, Menu, User } from 'lucide-react';

import { useAuth, useUser } from '@/contexts';
import { ViewType } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import caminhantesClock from '/caminhantes-clock.png';

import MobileMenu from './MobileMenu';
import { showConfirmDialog } from '../ui/ConfirmDialog';

interface SectionHeaderProps {
  onBack?: () => void;
  setCurrentView: (view: ViewType) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  title: string;
}
export default function SectionHeader({
  onBack,
  setCurrentView,
  setIsMenuOpen,
  title,
}: SectionHeaderProps) {
  const { currentUser, logout } = useAuth();
  const { currentUserData } = useUser();

  const getUserName = () => {
    return currentUserData?.name || currentUser?.displayName || 'Usuário';
  };

  // 2. Função de navegação unificada que o menu usará
  const handleNavigation = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Confirmar logout',
      text: 'Tem certeza que deseja sair?',
      icon: 'question',
      confirmButtonText: 'Sair',
      cancelButtonText: 'Cancelar',
    });

    if (confirmed) {
      await logout();
    }
  };
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <MobileMenu
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {onBack ? (
            <>
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="mr-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-display-bold text-gray-800">
                {title}
              </h1>
            </>
          ) : (
            <div className="flex items-center">
              <img
                src={caminhantesClock}
                alt="Caminhantes"
                className="w-10 h-10 mr-3"
              />
              <h1 className="text-xl font-display-bold text-gray-800">
                {title}
              </h1>
            </div>
          )}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Informações do usuário e logout - VISÍVEL APENAS EM DESKTOP */}
            <div className="hidden lg:flex items-center space-x-4">
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
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer font-display-medium"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </Button>
            </div>
            {/* Botão do Menu - VISÍVEL APENAS EM MOBILE */}
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
