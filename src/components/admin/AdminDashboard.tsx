import React, { useState } from 'react';
import { ArrowLeft, Users, Image, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserManagement from './UserManagement';
import BaseImagesManager from './BaseImagesManager';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [currentSection, setCurrentSection] = useState<'home' | 'users' | 'images' | 'squad'>('home');

  if (currentSection === 'users') {
    return <UserManagement onBack={() => setCurrentSection('home')} />;
  }

  if (currentSection === 'images') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
        <header className="bg-white shadow-sm border-b border-gray-200">
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
                  Imagens Base
                </h1>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BaseImagesManager />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="mr-4 cursor-pointer font-display-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-display-bold text-gray-800">
                Painel Administrativo
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display-extrabold text-gray-800 mb-4">
            Administração do Sistema
          </h2>
          <p className="text-lg text-gray-600 font-display">
            Gerencie usuários, configurações e conteúdo do Caminhantes Office
          </p>
        </div>

        {/* Grid de seções administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Gerenciamento de Usuários */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-teal-300"
            onClick={() => setCurrentSection('users')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                Usuários
              </h3>
              <p className="text-gray-600 mb-4 font-display">
                Gerencie usuários, permissões e controle de acesso ao sistema.
              </p>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar
              </Button>
            </div>
          </div>

          {/* Imagens Base */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-teal-300"
            onClick={() => setCurrentSection('images')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                Imagens Base
              </h3>
              <p className="text-gray-600 mb-4 font-display">
                Configure as imagens base utilizadas para gerar as escalações.
              </p>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium">
                <Image className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>

          {/* Elenco do Liverpool */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-teal-300"
            onClick={() => setCurrentSection('squad')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                Elenco Liverpool
              </h3>
              <p className="text-gray-600 mb-4 font-display">
                Gerencie o elenco do Liverpool com nomes, números e posições.
              </p>
              <Button className="w-full bg-gray-300 text-gray-500 cursor-not-allowed font-display-medium" disabled>
                <Database className="w-4 h-4 mr-2" />
                Em Breve
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

