// import { UserData } from '@/types/user';
// import {
//   Home,
//   Settings,
//   LayoutTemplate,
//   Sparkles,
//   Trophy,
//   ShieldCheck,
//   Swords,
//   Clock,
//   LucideIcon,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button'; // Assuming you have a Button component

// // --- Type Definitions ---
// export type ViewType =
//   | 'home'
//   | 'admin'
//   | 'escalacoes'
//   | 'matchday'
//   | 'nextGame'
//   | 'fullTime'
//   | 'motm'
//   | 'confronto';

// export interface ColorClasses {
//   border: string;
//   iconBg: string;
//   iconColor: string;
//   button: string;
// }

// // Merged NavItem interface
// export interface NavItem {
//   id: ViewType;
//   title: string;
//   description: string | ((user: UserData | null | undefined) => string);
//   icon: React.ReactNode; // This will be the LucideIcon component itself for cards
//   roles: ('root' | 'editor' | 'user')[]; // 'user' para todos
//   isCard: boolean; // Define se deve aparecer como um card na home
//   colorClasses?: ColorClasses; // Optional, only for card items
//   lucideIcon?: LucideIcon; // To pass the LucideIcon component for the Card component
// }

// // --- Navigation and Card Data ---
// export const navigationItems: NavItem[] = [
//   {
//     id: 'escalacoes',
//     title: 'Gerador de Escalações',
//     description:
//       'Crie escalações personalizadas com logos, jogadores e informações da partida',
//     icon: <LayoutTemplate className="w-8 h-8 text-blue-600" />,
//     lucideIcon: LayoutTemplate, // The LucideIcon component itself
//     roles: ['user', 'editor', 'root'],
//     isCard: true,
//     colorClasses: {
//       border: 'border border-red-100 hover:border-red-300',
//       iconBg: 'bg-red-100',
//       iconColor: 'text-red-600',
//       button: 'bg-red-600 hover:bg-red-700',
//     },
//   },
//   {
//     id: 'matchday',
//     title: 'Dia de Jogo',
//     description: 'Crie a arte de anúncio da partida do dia',
//     icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
//     lucideIcon: Sparkles,
//     roles: ['user', 'editor', 'root'],
//     isCard: true,
//     colorClasses: {
//       border: 'border border-blue-100 hover:border-blue-300',
//       iconBg: 'bg-blue-100',
//       iconColor: 'text-blue-600',
//       button: 'bg-blue-600 hover:bg-blue-700',
//     },
//   },
//   {
//     id: 'nextGame',
//     title: 'Próximo Jogo',
//     description: 'Anuncie qual será o próximo confronto',
//     icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
//     lucideIcon: ShieldCheck,
//     roles: ['user', 'editor', 'root'],
//     isCard: true,
//     colorClasses: {
//       border: 'border border-purple-100 hover:border-purple-300',
//       iconBg: 'bg-purple-100',
//       iconColor: 'text-purple-600',
//       button: 'bg-purple-600 hover:bg-purple-700',
//     },
//   },
//   {
//     id: 'motm',
//     title: 'Melhor da Partida',
//     description: 'Destaque o jogador que foi o "Man of the Match"',
//     icon: <Trophy className="w-8 h-8 text-orange-600" />,
//     lucideIcon: Trophy,
//     roles: ['user', 'editor', 'root'],
//     isCard: true,
//     colorClasses: {
//       border: 'border border-yellow-100 hover:border-yellow-300',
//       iconBg: 'bg-yellow-100',
//       iconColor: 'text-yellow-600',
//       button: 'bg-yellow-600 hover:bg-yellow-700',
//     },
//   },
//   {
//     id: 'fullTime',
//     title: 'Fim de Jogo',
//     description:
//       'Gere cards de resultado final com placar, estatísticas e informações da partida',
//     icon: <Clock className="w-8 h-8 text-purple-600" />,
//     lucideIcon: Clock,
//     roles: ['user', 'editor', 'root'],
//     isCard: true,
//     colorClasses: {
//       border: 'border border-green-100 hover:border-green-300',
//       iconBg: 'bg-green-100',
//       iconColor: 'text-green-600',
//       button: 'bg-green-600 hover:bg-green-700',
//     },
//   },
//   {
//     id: 'confronto',
//     title: 'Confronto Direto',
//     description:
//       'Crie uma arte com o histórico de confrontos, incluindo um gráfico de pizza',
//     icon: <Swords className="w-8 h-8 text-red-600" />,
//     lucideIcon: Swords, // Changed to Swords as per your navigationItems
//     roles: ['user', 'editor', 'root'],
//     isCard: true,
//     colorClasses: {
//       border: 'border border-pink-100 hover:border-pink-300',
//       iconBg: 'bg-pink-100',
//       iconColor: 'text-pink-600',
//       button: 'bg-pink-600 hover:bg-pink-700',
//     },
//   },
//   {
//     id: 'admin',
//     title: 'Administração',
//     description: (user) => {
//       const baseDesc = 'elenco, canais e mais';
//       return `Gerencie ${user?.role === 'root' ? 'usuários, ' : ''}${baseDesc}`;
//     },
//     icon: <Settings className="w-8 h-8 text-teal-600" />,
//     lucideIcon: Settings,
//     roles: ['editor', 'root'],
//     isCard: true, // Admin can also be a card on the home screen if you wish
//     colorClasses: {
//       // Example color classes for admin card
//       border: 'border border-teal-100 hover:border-teal-300',
//       iconBg: 'bg-teal-100',
//       iconColor: 'text-teal-600',
//       button: 'bg-teal-600 hover:bg-teal-700',
//     },
//   },
//   // Items that are not cards, but can appear in the menu
//   {
//     id: 'home',
//     title: 'Início',
//     description: 'Voltar para a tela inicial',
//     icon: <Home className="w-5 h-5" />, // Smaller icon for the menu
//     lucideIcon: Home, // Still provide the LucideIcon if needed elsewhere
//     roles: ['user', 'editor', 'root'],
//     isCard: false,
//   },
// ];

// // --- Utility Function for Filtering Nav Items ---
// export const getVisibleNavItems = (
//   userData: UserData | null | undefined
// ): NavItem[] => {
//   if (!userData) return [];
//   return navigationItems.filter((item) => item.roles.includes(userData.role));
// };

// // --- Card Component (updated to use NavItem) ---
// interface CardProps {
//   item: NavItem; // Now takes a NavItem directly
//   onClick: React.Dispatch<React.SetStateAction<ViewType>>;
//   currentUserData: UserData | null | undefined; // Pass user data for dynamic description
// }

// const Card: React.FC<CardProps> = ({ item, onClick, currentUserData }) => {
//   // Ensure colorClasses exist for a card item
//   if (!item.isCard || !item.colorClasses || !item.lucideIcon) {
//     return null; // Or throw an error, depending on your error handling
//   }

//   const IconComponent = item.lucideIcon; // Get the LucideIcon component
//   const descriptionText =
//     typeof item.description === 'function'
//       ? item.description(currentUserData)
//       : item.description;

//   return (
//     <div
//       className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer ${item.colorClasses.border}`}
//       onClick={() => onClick(item.id)}
//     >
//       <div className="text-center">
//         <div
//           className={`w-16 h-16 ${item.colorClasses.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
//         >
//           <IconComponent className={`w-8 h-8 ${item.colorClasses.iconColor}`} />
//         </div>
//         <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
//           {item.title}
//         </h3>
//         <p className="text-gray-600 mb-4 font-display">{descriptionText}</p>
//         <Button
//           className={`w-full ${item.colorClasses.button} text-white cursor-pointer font-display-medium`}
//         >
//           <IconComponent className="w-4 h-4 mr-2" />
//           Acessar
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Card; // Export the Card component
import {
  Calendar,
  Users,
  Trophy,
  Clock,
  Star,
  Settings,
  Brush,
  BarChart3,
  LucideIcon,
  LayoutTemplate,
  Sparkles,
  ShieldCheck,
  Swords,
  Home,
  Goal,
} from 'lucide-react';
import { UserData } from '@/types/user';

export type ViewType =
  | 'home'
  | 'admin'
  | 'escalacoes'
  | 'matchday'
  | 'nextGame'
  | 'motm'
  | 'fullTime'
  | 'confronto'
  | 'gameArt'
  | 'palpites';

export interface NavItem {
  id: ViewType;
  title: string;
  description: string | ((userData: UserData | null | undefined) => string);
  icon?: React.ReactNode;
  lucideIcon?: LucideIcon;
  roles: string[];
  isCard?: boolean;
  colorClasses?: {
    border: string;
    iconBg: string;
    iconColor: string;
    button: string;
  };
}

export const navigationItems: NavItem[] = [
  {
    id: 'gameArt',
    title: 'Artes do Jogo',
    description:
      'Crie artes para todos os momentos da partida: início, gols, substituições e mais',
    icon: <Brush className="w-8 h-8 text-cyan-600" />,
    lucideIcon: Brush,
    roles: ['user', 'root', 'editor'],
    isCard: true,
    colorClasses: {
      border: 'border-cyan-200',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      button: 'bg-cyan-600 hover:bg-cyan-700',
    },
  },
  {
    id: 'escalacoes',
    title: 'Gerador de Escalações',
    description:
      'Crie escalações personalizadas com logos, jogadores e informações da partida',
    icon: <LayoutTemplate className="w-8 h-8 text-blue-600" />,
    lucideIcon: LayoutTemplate, // The LucideIcon component itself
    roles: ['user', 'editor', 'root'],
    isCard: true,
    colorClasses: {
      border: 'border border-red-100 hover:border-red-300',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
  },
  {
    id: 'matchday',
    title: 'Dia de Jogo',
    description: 'Crie a arte de anúncio da partida do dia',
    icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
    lucideIcon: Sparkles,
    roles: ['user', 'editor', 'root'],
    isCard: true,
    colorClasses: {
      border: 'border border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  },
  {
    id: 'nextGame',
    title: 'Próximo Jogo',
    description: 'Anuncie qual será o próximo confronto',
    icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
    lucideIcon: ShieldCheck,
    roles: ['user', 'editor', 'root'],
    isCard: true,
    colorClasses: {
      border: 'border border-purple-100 hover:border-purple-300',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
  },
  {
    id: 'motm',
    title: 'Melhor da Partida',
    description: 'Destaque o jogador que foi o "Man of the Match"',
    icon: <Trophy className="w-8 h-8 text-orange-600" />,
    lucideIcon: Trophy,
    roles: ['user', 'editor', 'root'],
    isCard: true,
    colorClasses: {
      border: 'border border-yellow-100 hover:border-yellow-300',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
  },
  {
    id: 'fullTime',
    title: 'Fim de Jogo',
    description:
      'Gere cards de resultado final com placar, estatísticas e informações da partida',
    icon: <Clock className="w-8 h-8 text-purple-600" />,
    lucideIcon: Clock,
    roles: ['user', 'editor', 'root'],
    isCard: true,
    colorClasses: {
      border: 'border border-green-100 hover:border-green-300',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
    },
  },
  {
    id: 'confronto',
    title: 'Confronto Direto',
    description:
      'Crie uma arte com o histórico de confrontos, incluindo um gráfico de pizza',
    icon: <Swords className="w-8 h-8 text-red-600" />,
    lucideIcon: Swords, // Changed to Swords as per your navigationItems
    roles: ['user', 'editor', 'root'],
    isCard: true,
    colorClasses: {
      border: 'border border-pink-100 hover:border-pink-300',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      button: 'bg-pink-600 hover:bg-pink-700',
    },
  },
  {
    id: 'palpites',
    title: 'Palpites',
    description:
      'Crie artes para todos os momentos da partida: início, gols, substituições e mais',
    icon: <Goal className="w-8 h-8 text-orange-600" />,
    lucideIcon: Goal,
    roles: ['user', 'root', 'editor'],
    isCard: true,
    colorClasses: {
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700',
    },
  },
  {
    id: 'admin',
    title: 'Administração',
    description: (user) => {
      const baseDesc = 'elenco, canais e mais';
      return `Gerencie ${user?.role === 'root' ? 'usuários, ' : ''}${baseDesc}`;
    },
    icon: <Settings className="w-8 h-8 text-teal-600" />,
    lucideIcon: Settings,
    roles: ['editor', 'root'],
    isCard: true, // Admin can also be a card on the home screen if you wish
    colorClasses: {
      // Example color classes for admin card
      border: 'border border-teal-100 hover:border-teal-300',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      button: 'bg-teal-600 hover:bg-teal-700',
    },
  },
  // Items that are not cards, but can appear in the menu
  {
    id: 'home',
    title: 'Início',
    description: 'Voltar para a tela inicial',
    icon: <Home className="w-5 h-5" />, // Smaller icon for the menu
    lucideIcon: Home, // Still provide the LucideIcon if needed elsewhere
    roles: ['user', 'editor', 'root'],
    isCard: false,
  },
];

export const getVisibleNavItems = (
  userData: UserData | null | undefined
): NavItem[] => {
  if (!userData) return [];

  return navigationItems.filter((item) => item.roles.includes(userData.role));
};

export const getNavItemById = (id: ViewType): NavItem | undefined => {
  return navigationItems.find((item) => item.id === id);
};
