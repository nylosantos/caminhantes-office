import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Image,
  Database,
  Tv,
  Menu,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal, useUser } from '@/contexts';
import MobileMenu from '@/components/layout/MobileMenu';
import { ViewType } from '@/config/navigation';
import UserManagement from './UserManagement';
import BaseImagesManager from './BaseImagesManager';
import SquadManager from './SquadManager';
import ChannelManager from './ChannelManager';
import AliasManager from './AliasManager';
import SectionHeader from '../layout/SectionHeader';

// 1. Atualizar as props para receber as funções de navegação e logout
interface AdminDashboardProps {
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
}

type AdminSection =
  | 'home'
  | 'users'
  | 'images'
  | 'squad'
  | 'channels'
  | 'alias';

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBack,
  onNavigate,
  onLogout,
}) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('home');
  const { currentUserData } = useUser();
  const { setIsMenuOpen } = useGlobal();

  const renderSection = (
    section: AdminSection,
    title: string,
    Component: React.FC
  ) => {
    if (currentSection !== section) return null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  onClick={() => setCurrentSection('home')}
                  variant="ghost"
                  size="sm"
                  className="mr-4 cursor-pointer font-display-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <h1 className="text-xl font-display-bold text-gray-800">
                  {title}
                </h1>
              </div>
              {/* 2. Botão do menu também presente nas sub-seções */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Component />
        </main>
      </div>
    );
  };

  const userManagementSection = renderSection(
    'users',
    'Administração de Usuários',
    UserManagement
  );
  const baseImagesSection = renderSection(
    'images',
    'Imagens Base',
    BaseImagesManager
  );
  const squadSection = renderSection(
    'squad',
    'Elenco do Liverpool',
    SquadManager
  );
  const channelSection = renderSection(
    'channels',
    'Canais de TV',
    ChannelManager
  );

  const aliasSection = renderSection('alias', 'Aliases', AliasManager);

  if (currentSection !== 'home') {
    return (
      <>
        {/* 3. O menu precisa ser renderizado aqui também */}
        <MobileMenu
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        {userManagementSection ||
          baseImagesSection ||
          squadSection ||
          channelSection ||
          aliasSection ||
          null}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      <SectionHeader
        onBack={onBack}
        setCurrentView={onNavigate}
        setIsMenuOpen={setIsMenuOpen}
        title="Painel Administrativo"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display-extrabold text-gray-800 mb-4">
            Administração do Sistema
          </h2>
          <p className="text-lg text-gray-600 font-display">
            Selecione uma área para gerenciar.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {currentUserData?.role === 'root' && (
            <AdminCard
              title="Usuários"
              description="Gerencie usuários e permissões."
              icon={<Users className="w-8 h-8 text-teal-600" />}
              onClick={() => setCurrentSection('users')}
            />
          )}
          {currentUserData?.role === 'root' && (
            <AdminCard
              title="Imagens Base"
              description="Configure as imagens de fundo."
              icon={<Image className="w-8 h-8 text-teal-600" />}
              onClick={() => setCurrentSection('images')}
            />
          )}
          {currentUserData?.role === 'root' && (
            <AdminCard
              title="Aliases"
              description="Configure nomes alternativos para dados."
              icon={<Link2 className="w-8 h-8 text-teal-600" />}
              onClick={() => setCurrentSection('alias')}
            />
          )}
          {(currentUserData?.role === 'root' ||
            currentUserData?.role === 'editor') && (
            <AdminCard
              title="Elenco Liverpool"
              description="Gerencie os jogadores do elenco."
              icon={<Database className="w-8 h-8 text-teal-600" />}
              onClick={() => setCurrentSection('squad')}
            />
          )}
          {(currentUserData?.role === 'root' ||
            currentUserData?.role === 'editor') && (
            <AdminCard
              title="Canais de TV"
              description="Adicione e gerencie os canais."
              icon={<Tv className="w-8 h-8 text-teal-600" />}
              onClick={() => setCurrentSection('channels')}
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Componente auxiliar para os cards do admin
const AdminCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <div
    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-teal-300 flex flex-col"
    onClick={onClick}
  >
    <div className="text-center flex-grow">
      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4 font-display">{description}</p>
    </div>
    <Button className="w-full mt-auto bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium">
      Gerenciar
    </Button>
  </div>
);

export default AdminDashboard;
