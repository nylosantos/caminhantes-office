import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import caminhantesClock from '/caminhantes-clock.png';
import { useAuth, useGlobal, useUser } from '@/contexts';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useRoundTranslations } from '@/hooks/useRoundsTranslations';
import EscalacaoGenerator from '@/components/escalacoes/EscalacaoGenerator';
import MotmGenerator from '../escalacoes/MotmGenerator';
import MatchDayGenerator from '../escalacoes/MatchDayGenerator';
import NextGameGenerator from '../escalacoes/NextGameGenerator';
import FullTimeGenerator from '../escalacoes/FullTimeGenerator';
import ConfrontoGenerator from '../escalacoes/ConfrontoGenerator';

// 1. Importar a configuração de navegação e os tipos
import { ViewType, getVisibleNavItems, NavItem } from '@/config/navigation';
import { UserData } from '@/types/user';
import SectionHeader from './SectionHeader';

const HomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentUserData } = useUser();
  const { setIsMenuOpen } = useGlobal();
  const { showConfirmDialog } = useConfirmDialog();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const { translations } = useRoundTranslations();

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName =
      currentUserData?.name?.split(' ')[0] ||
      currentUser?.displayName?.split(' ')[0] ||
      'Usuário';

    if (hour < 12) return `Bom dia, ${firstName}! 🌅`;
    if (hour < 18) return `Boa tarde, ${firstName}! ☀️`;
    return `Boa noite, ${firstName}! 🌙`;
  };

  // 2. Função de navegação unificada que o menu usará
  const handleNavigation = (view: ViewType) => {
    setCurrentView(view);
  };

  const visibleNavItems = getVisibleNavItems(currentUserData);

  const cardItems = visibleNavItems.filter(
    (item) => item.isCard && item.colorClasses && item.lucideIcon // Ensure card-specific data exists
  );

  // Renderizar view específica
  if (currentView === 'admin') {
    // 4. Passar as props corretas para o AdminDashboard
    return (
      <AdminDashboard
        onBack={() => setCurrentView('home')}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />
    );
  }
  if (currentView === 'escalacoes') {
    return (
      <EscalacaoGenerator
        translations={translations}
        onBack={() => setCurrentView('home')}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
      />
    );
  }
  if (currentView === 'matchday') {
    return (
      <MatchDayGenerator
        translations={translations}
        onBack={() => setCurrentView('home')}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
      />
    );
  }
  if (currentView === 'nextGame') {
    return (
      <NextGameGenerator
        translations={translations}
        onBack={() => setCurrentView('home')}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
      />
    );
  }
  if (currentView === 'motm') {
    return (
      <MotmGenerator
        translations={translations}
        onBack={() => setCurrentView('home')}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
      />
    );
  }
  if (currentView === 'fullTime') {
    return (
      <FullTimeGenerator
        translations={translations}
        onBack={() => setCurrentView('home')}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
      />
    );
  }
  if (currentView === 'confronto') {
    return (
      <ConfrontoGenerator
        translations={translations}
        onBack={() => setCurrentView('home')}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col">
      <SectionHeader
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
        title="Caminhantes Office"
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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

        {/* 6. Grid de aplicações renderizado dinamicamente */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {cardItems.map((item) => (
            <Card
              key={item.id}
              item={item} // Pass the entire item object
              onClick={setCurrentView}
              currentUserData={currentUserData} // Pass currentUserData for dynamic description
            />
          ))}
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
              <Button
                disabled
                className="w-full bg-gray-300 text-gray-500 cursor-not-allowed font-display-medium"
              >
                Em Desenvolvimento
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-red-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-lg font-display-semibold text-red-600 mb-2">
              "Aqui você não caminha sozinho"
            </p>
            <p className="text-sm text-gray-500 font-display">
              © {new Date().getFullYear()} Caminhantes Office. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// New Interface for CardProps
interface CardProps {
  item: NavItem; // The entire NavItem object
  onClick: React.Dispatch<React.SetStateAction<ViewType>>;
  currentUserData: UserData | null | undefined; // To pass to the description function
}

// Updated Card Component
const Card: React.FC<CardProps> = ({ item, onClick, currentUserData }) => {
  // Destructure properties from 'item' for easier access
  const { id, title, description, colorClasses, lucideIcon, isCard } = item;

  // Type guard and check for required card properties
  if (!isCard || !colorClasses || !lucideIcon) {
    // Optionally handle cases where an item flagged as isCard is missing required props
    console.warn(
      `Card with ID ${id} is missing required properties for rendering as a card.`
    );
    return null; // Don't render if it's not a valid card item
  }

  // Resolve the icon component
  const IconComponent = lucideIcon;

  // Resolve the description string (if it's a function)
  const resolvedDescription =
    typeof description === 'function'
      ? description(currentUserData)
      : description;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer ${colorClasses.border}`}
      onClick={() => onClick(id)} // Use item.id for view
    >
      <div className="text-center">
        <div
          className={`w-16 h-16 ${colorClasses.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <IconComponent className={`w-8 h-8 ${colorClasses.iconColor}`} />
        </div>
        <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 font-display">{resolvedDescription}</p>
        <Button
          className={`w-full ${colorClasses.button} text-white cursor-pointer font-display-medium`}
        >
          <IconComponent className="w-4 h-4 mr-2" />
          Acessar
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
