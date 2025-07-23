// import { Calendar, Trophy, Clock, Zap, ArrowRight, LucideIcon } from 'lucide-react';
// import { Button } from '../ui/button';

// // Interface para as classes de cores
// interface ColorClasses {
//     border: string;
//     iconBg: string;
//     iconColor: string;
//     button: string;
// }

// // Interface para as props do componente Card
// interface CardProps {
//     icon: LucideIcon;
//     title: string;
//     description: string;
//     colorClasses: ColorClasses;
//     onClick: React.Dispatch<React.SetStateAction<"home" | "admin" | "escalacoes" | "matchday" | "nextGame" | "fullTime" | "motm">>
//     view: "home" | "admin" | "escalacoes" | "matchday" | "nextGame" | "fullTime" | "motm";
// }

// // Componente Card com cores hardcoded
// const Card: React.FC<CardProps> = ({
//     icon: Icon,
//     title,
//     description,
//     colorClasses,
//     onClick,
//     view
// }) => {
//     return (
//         <div
//             className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer ${colorClasses.border}`}
//             onClick={() => onClick(view)}
//         >
//             <div className="text-center">
//                 <div className={`w-16 h-16 ${colorClasses.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
//                     <Icon className={`w-8 h-8 ${colorClasses.iconColor}`} />
//                 </div>
//                 <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
//                     {title}
//                 </h3>
//                 <p className="text-gray-600 mb-4 font-display">
//                     {description}
//                 </p>
//                 <Button className={`w-full ${colorClasses.button} text-white cursor-pointer font-display-medium`}>
//                     <Icon className="w-4 h-4 mr-2" />
//                     Acessar
//                 </Button>
//             </div>
//         </div>
//     );
// };

// // Interface para os dados do card
// interface CardData {
//     icon: LucideIcon;
//     title: string;
//     description: string;
//     colorClasses: ColorClasses;
//     view: "home" | "admin" | "escalacoes" | "matchday" | "nextGame" | "fullTime" | "motm";
// }

// // Dados dos cards com classes de cores específicas
// const cardsData: CardData[] = [
//     {
//         icon: Calendar,
//         title: "Gerador de Escalações",
//         description: "Crie escalações personalizadas com logos, jogadores e informações da partida.",
//         colorClasses: {
//             border: "border border-red-100 hover:border-red-300",
//             iconBg: "bg-red-100",
//             iconColor: "text-red-600",
//             button: "bg-red-600 hover:bg-red-700"
//         },
//         view: "escalacoes"
//     },
//     {
//         icon: Trophy,
//         title: "Man of the Match",
//         description: "Destaque o melhor jogador da partida com design elegante e personalizado.",
//         colorClasses: {
//             border: "border border-yellow-100 hover:border-yellow-300",
//             iconBg: "bg-yellow-100",
//             iconColor: "text-yellow-600",
//             button: "bg-yellow-600 hover:bg-yellow-700"
//         },
//         view: "motm"
//     },
//     {
//         icon: Clock,
//         title: "Fim de Jogo",
//         description: "Gere cards de resultado final com placar, estatísticas e informações da partida.",
//         colorClasses: {
//             border: "border border-green-100 hover:border-green-300",
//             iconBg: "bg-green-100",
//             iconColor: "text-green-600",
//             button: "bg-green-600 hover:bg-green-700"
//         },
//         view: "fullTime"
//     },
//     {
//         icon: Zap,
//         title: "Dia de Jogo",
//         description: "Crie posts promocionais para anunciar jogos com data, horário e adversário.",
//         colorClasses: {
//             border: "border border-blue-100 hover:border-blue-300",
//             iconBg: "bg-blue-100",
//             iconColor: "text-blue-600",
//             button: "bg-blue-600 hover:bg-blue-700"
//         },
//         view: "matchday"
//     },
//     {
//         icon: ArrowRight,
//         title: "Próximo Jogo",
//         description: "Anuncie o próximo confronto com informações detalhadas e design atrativo.",
//         colorClasses: {
//             border: "border border-purple-100 hover:border-purple-300",
//             iconBg: "bg-purple-100",
//             iconColor: "text-purple-600",
//             button: "bg-purple-600 hover:bg-purple-700"
//         },
//         view: "nextGame"
//     }
// ];

// // Interface para as props do componente principal
// interface CardsContainerProps {
//     setCurrentView: React.Dispatch<React.SetStateAction<"home" | "admin" | "escalacoes" | "matchday" | "nextGame" | "fullTime" | "motm">>
// }

// // Componente que renderiza todos os cards
// const CardsContainer: React.FC<CardsContainerProps> = ({ setCurrentView }) => {
//     return (
//         <>
//             {cardsData.map((card, index) => (
//                 <Card
//                     key={index}
//                     icon={card.icon}
//                     title={card.title}
//                     description={card.description}
//                     colorClasses={card.colorClasses}
//                     view={card.view}
//                     onClick={setCurrentView}
//                 />
//             ))}
//         </>
//     );
// };

// export default CardsContainer;

import { Calendar, Trophy, Clock, Zap, ArrowRight, PieChart, LucideIcon } from 'lucide-react'; // 1. Importar o PieChart
import { Button } from '../ui/button';

// Interface para as classes de cores
interface ColorClasses {
    border: string;
    iconBg: string;
    iconColor: string;
    button: string;
}

// 2. Adicionar "confronto" aos tipos de view permitidos
type ViewType = "home" | "admin" | "escalacoes" | "matchday" | "nextGame" | "fullTime" | "motm" | "confronto";

// Interface para as props do componente Card
interface CardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    colorClasses: ColorClasses;
    onClick: React.Dispatch<React.SetStateAction<ViewType>>;
    view: ViewType;
}

// Componente Card (sem alterações, apenas usando o novo ViewType)
const Card: React.FC<CardProps> = ({
    icon: Icon,
    title,
    description,
    colorClasses,
    onClick,
    view
}) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer ${colorClasses.border}`}
            onClick={() => onClick(view)}
        >
            <div className="text-center">
                <div className={`w-16 h-16 ${colorClasses.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${colorClasses.iconColor}`} />
                </div>
                <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 mb-4 font-display">
                    {description}
                </p>
                <Button className={`w-full ${colorClasses.button} text-white cursor-pointer font-display-medium`}>
                    <Icon className="w-4 h-4 mr-2" />
                    Acessar
                </Button>
            </div>
        </div>
    );
};

// Interface para os dados do card
interface CardData {
    icon: LucideIcon;
    title: string;
    description: string;
    colorClasses: ColorClasses;
    view: ViewType;
}

// 3. Adicionar o novo card ao array de dados
const cardsData: CardData[] = [
    {
        icon: Calendar,
        title: "Gerador de Escalações",
        description: "Crie escalações personalizadas com logos, jogadores e informações da partida.",
        colorClasses: {
            border: "border border-red-100 hover:border-red-300",
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            button: "bg-red-600 hover:bg-red-700"
        },
        view: "escalacoes"
    },
    {
        icon: Trophy,
        title: "Man of the Match",
        description: "Destaque o melhor jogador da partida com design elegante e personalizado.",
        colorClasses: {
            border: "border border-yellow-100 hover:border-yellow-300",
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
            button: "bg-yellow-600 hover:bg-yellow-700"
        },
        view: "motm"
    },
    {
        icon: Clock,
        title: "Fim de Jogo",
        description: "Gere cards de resultado final com placar, estatísticas e informações da partida.",
        colorClasses: {
            border: "border border-green-100 hover:border-green-300",
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            button: "bg-green-600 hover:bg-green-700"
        },
        view: "fullTime"
    },
    {
        icon: Zap,
        title: "Dia de Jogo",
        description: "Crie posts promocionais para anunciar jogos com data, horário e adversário.",
        colorClasses: {
            border: "border border-blue-100 hover:border-blue-300",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700"
        },
        view: "matchday"
    },
    {
        icon: ArrowRight,
        title: "Próximo Jogo",
        description: "Anuncie o próximo confronto com informações detalhadas e design atrativo.",
        colorClasses: {
            border: "border border-purple-100 hover:border-purple-300",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
            button: "bg-purple-600 hover:bg-purple-700"
        },
        view: "nextGame"
    },
    // NOVO CARD ADICIONADO AQUI
    {
        icon: PieChart,
        title: "Gerador de Confrontos",
        description: "Crie uma arte com o histórico de confrontos, incluindo um gráfico de pizza.",
        colorClasses: {
            border: "border border-pink-100 hover:border-pink-300",
            iconBg: "bg-pink-100",
            iconColor: "text-pink-600",
            button: "bg-pink-600 hover:bg-pink-700"
        },
        view: "confronto"
    }
];

// Interface para as props do componente principal
interface CardsContainerProps {
    setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>
}

// Componente que renderiza todos os cards
const CardsContainer: React.FC<CardsContainerProps> = ({ setCurrentView }) => {
    return (
        <>
            {cardsData.map((card, index) => (
                <Card
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                    colorClasses={card.colorClasses}
                    view={card.view}
                    onClick={setCurrentView}
                />
            ))}
        </>
    );
};

export default CardsContainer;
