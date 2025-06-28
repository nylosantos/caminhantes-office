import React, { useState } from 'react';
import { Users, Settings, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts';
import UserManagement from './UserManagement';
import caminhantesClock from '@/assets/caminhantes-clock.png';

type AdminSection = 'dashboard' | 'users' | 'settings' | 'analytics';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { currentUserData } = useUser();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const menuItems = [
    {
      id: 'users' as AdminSection,
      label: 'Usuários',
      icon: Users,
      description: 'Gerenciar usuários e permissões',
      available: true
    },
    {
      id: 'settings' as AdminSection,
      label: 'Configurações',
      icon: Settings,
      description: 'Configurações do sistema',
      available: false
    },
    {
      id: 'analytics' as AdminSection,
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Estatísticas e relatórios',
      available: false
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Configurações</h3>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Relatórios</h3>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <img 
                src={caminhantesClock} 
                alt="Caminhantes" 
                className="w-16 h-16 mx-auto mb-4 drop-shadow-lg"
              />
              <h2 className="text-2xl font-display-extrabold text-gray-800 mb-2">
                Área Administrativa
              </h2>
              <p className="text-gray-600 font-display">
                Bem-vindo à área de administração do Caminhantes Office
              </p>
            </div>

            {/* Menu de opções */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl shadow-lg p-6 border transition-all ${
                      item.available
                        ? 'hover:shadow-xl cursor-pointer border-gray-200 hover:border-teal-300'
                        : 'cursor-not-allowed border-gray-200 opacity-50'
                    }`}
                    onClick={() => item.available && setActiveSection(item.id)}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        item.available ? 'bg-teal-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          item.available ? 'text-teal-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                        {item.label}
                      </h3>
                      <p className="text-gray-600 mb-4 font-display">
                        {item.description}
                      </p>
                      <Button
                        disabled={!item.available}
                        className={`w-full font-display-medium ${
                          item.available
                            ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {item.available ? 'Acessar' : 'Em breve'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Informações do usuário */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-display-semibold">
                      {currentUserData?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-display-medium text-teal-800">
                    Logado como: {currentUserData?.name}
                  </p>
                  <p className="text-sm text-teal-600 font-display">
                    Cargo: {currentUserData?.role} | Email: {currentUserData?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={activeSection === 'dashboard' ? onBack : () => setActiveSection('dashboard')}
                className="mr-4 cursor-pointer font-display-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {activeSection === 'dashboard' ? 'Voltar' : 'Dashboard'}
              </Button>
              <img 
                src={caminhantesClock} 
                alt="Caminhantes" 
                className="w-8 h-8 mr-3"
              />
              <h1 className="text-xl font-display-bold text-gray-800">
                Administração
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-display">
                {currentUserData?.name}
              </span>
              <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full font-display-medium">
                {currentUserData?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;

