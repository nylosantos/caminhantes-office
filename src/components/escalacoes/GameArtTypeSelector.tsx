import React from 'react';
import {
  Play,
  Coffee,
  RotateCcw,
  Trophy,
  Clock,
  Target,
  ArrowLeftRight,
} from 'lucide-react';
import { GameArtType, GAME_ART_LABELS } from '@/types/generator';

interface GameArtTypeSelectorProps {
  selectedArtType: GameArtType | null;
  onArtTypeSelect: (artType: GameArtType) => void;
}

const GameArtTypeSelector: React.FC<GameArtTypeSelectorProps> = ({
  selectedArtType,
  onArtTypeSelect,
}) => {
  const artTypeOptions: Array<{
    type: GameArtType;
    icon: React.ReactNode;
    description: string;
    color: string;
    disabled?: boolean;
  }> = [
    {
      type: 'INICIO_JOGO',
      icon: <Play className="w-6 h-6" />,
      description: 'Arte para o início da partida',
      color: 'bg-green-500 hover:bg-green-600 border-green-200',
    },
    {
      type: 'INTERVALO',
      icon: <Coffee className="w-6 h-6" />,
      description: 'Arte para o intervalo do jogo',
      color: 'bg-orange-500 hover:bg-orange-600 border-orange-200',
    },
    {
      type: 'INICIO_SEGUNDO_TEMPO',
      icon: <RotateCcw className="w-6 h-6" />,
      description: 'Arte para o início do segundo tempo',
      color: 'bg-blue-500 hover:bg-blue-600 border-blue-200',
    },
    {
      type: 'FIM_DE_JOGO',
      icon: <Trophy className="w-6 h-6" />,
      description: 'Arte para o final da partida',
      color: 'bg-red-500 hover:bg-red-600 border-red-200',
    },
    {
      type: 'INICIO_PRORROGACAO',
      icon: <Clock className="w-6 h-6" />,
      description: 'Arte para o início da prorrogação',
      color: 'bg-purple-500 hover:bg-purple-600 border-purple-200',
    },
    {
      type: 'INICIO_SEGUNDO_TEMPO_PRORROGACAO',
      icon: <Clock className="w-6 h-6" />,
      description: 'Arte para o segundo tempo da prorrogação',
      color: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-200',
    },
    {
      type: 'GOL',
      icon: <Target className="w-6 h-6" />,
      description: 'Arte para comemorar um gol',
      color: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-200',
    },
    {
      type: 'SUBSTITUICAO',
      icon: <ArrowLeftRight className="w-6 h-6" />,
      description: 'Arte para mostrar substituições',
      color: 'bg-cyan-500 hover:bg-cyan-600 border-cyan-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-display-semibold text-gray-800 mb-2">
          Tipo de Arte
        </h3>
        <p className="text-sm text-gray-600 font-display">
          Escolha o momento da partida que deseja destacar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {artTypeOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onArtTypeSelect(option.type)}
            disabled={option.disabled}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${
                selectedArtType === option.type
                  ? `${option.color} text-white shadow-lg transform scale-105`
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }
              ${
                option.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`
                p-2 rounded-lg
                ${
                  selectedArtType === option.type
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                }
              `}
              >
                <div
                  className={
                    selectedArtType === option.type
                      ? 'text-white'
                      : 'text-gray-600'
                  }
                >
                  {option.icon}
                </div>
              </div>
              <div className="flex-1">
                <h4
                  className={`
                  font-display-semibold mb-1
                  ${
                    selectedArtType === option.type
                      ? 'text-white'
                      : 'text-gray-800'
                  }
                `}
                >
                  {GAME_ART_LABELS[option.type]}
                </h4>
                <p
                  className={`
                  text-sm font-display
                  ${
                    selectedArtType === option.type
                      ? 'text-white/90'
                      : 'text-gray-600'
                  }
                `}
                >
                  {option.description}
                </p>
              </div>
            </div>

            {selectedArtType === option.type && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            )}

            {option.disabled && (
              <div className="absolute inset-0 bg-gray-100/50 rounded-lg flex items-center justify-center">
                <span className="text-sm font-display-medium text-gray-500 bg-white px-2 py-1 rounded">
                  Em breve
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedArtType && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-display-semibold text-gray-800 mb-2">
            Tipo Selecionado
          </h4>
          <p className="text-sm text-gray-600 font-display">
            {GAME_ART_LABELS[selectedArtType]} -{' '}
            {
              artTypeOptions.find((opt) => opt.type === selectedArtType)
                ?.description
            }
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500 font-display text-center">
        Cada tipo de arte tem seu próprio acabamento e estilo visual
      </div>
    </div>
  );
};

export default GameArtTypeSelector;
