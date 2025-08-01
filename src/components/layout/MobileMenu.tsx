import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, User } from 'lucide-react';
import { useGlobal } from '@/contexts/GlobalContext';
import { useUser } from '@/contexts';
import { Button } from '@/components/ui/button';
import { ViewType, getVisibleNavItems } from '@/config/navigation'; // Importe a nova config

interface MobileMenuProps {
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onNavigate, onLogout }) => {
  const { isMenuOpen, setIsMenuOpen } = useGlobal();
  const { currentUserData } = useUser();

  // Filtra os itens de navegação com base na role do usuário
  const visibleItems = getVisibleNavItems(currentUserData);

  const handleNavigation = (view: ViewType) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  // ... (as variantes da framer-motion continuam as mesmas) ...
  const backdropVariants = { visible: { opacity: 1 }, hidden: { opacity: 0 } };
  const menuVariants = { open: { x: 0 }, closed: { x: '100%' } };

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-display-bold text-lg text-gray-800">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="cursor-pointer"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
              <h3 className="font-display-semibold text-gray-700">Navegação</h3>
              <nav className="flex flex-col space-y-2">
                {/* Renderiza os itens dinamicamente */}
                {visibleItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    icon={item.icon}
                    text={item.title}
                    onClick={() => handleNavigation(item.id)}
                  />
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-200 mt-auto">
              {/* Footer do Menu (Usuário e Logout) */}
              <div className="p-4 border-t border-gray-200 mt-auto">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-display-semibold text-gray-800">
                      {currentUserData?.name || 'Usuário'}
                    </p>
                    {currentUserData?.role && (
                      <p className="text-xs text-gray-500 capitalize">
                        {currentUserData.role}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogoutClick}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-display-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ... (componente MenuItem continua o mesmo) ...
const MenuItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}> = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full text-left p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-display-medium cursor-pointer"
  >
    {/* Ajuste para o ícone ter um tamanho consistente no menu */}
    <div className="w-6 h-6 flex items-center justify-center mr-3 text-gray-500">
      {icon}
    </div>
    {text}
  </button>
);

export default MobileMenu;
