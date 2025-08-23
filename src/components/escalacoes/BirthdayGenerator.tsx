import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImageIcon, Palette, Gift } from 'lucide-react';

import { Player } from '@/types/squad';
import { ViewType } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';

import StepperResponsive from '../ui/Stepper';
import PlayerSelector from './PlayerSelector';
import PostTextGenerator from './PostTextGenerator';
import SectionHeader from '../layout/SectionHeader';
import BaseImageGenerator, {
  CanvasElement,
  ElementConfig,
} from './BaseImageGenerator';
import {
  getBackgroundImageUrl,
  createDefaultRenderOrder,
} from './GeneratorUtils';

interface BirthdayGeneratorProps {
  onBack: () => void;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

const initialImageGeneratorConfigs: Record<
  'quadrada' | 'vertical' | 'horizontal',
  ElementConfig
> = {
  quadrada: {
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundX: 0,
    backgroundY: 0,
    backgroundSize: 1080,
    logoX: 921,
    logoY: 31,
    logoSize: 123,
    jogadorX: 121,
    jogadorY: 85,
    jogadorSize: 900,
    birthdayTextX: 540,
    birthdayTextY: 150,
    birthdayTextSize: 1,
    playerNameX: 540,
    playerNameY: 220,
    playerNameSize: 1.2,
    playerNumberX: 900,
    playerNumberY: 300,
    playerNumberSize: 1,
    ageTextX: 540,
    ageTextY: 950,
    ageTextSize: 1.5,
  },
  vertical: {
    canvasWidth: 1080,
    canvasHeight: 1920,
    backgroundX: 0,
    backgroundY: 0,
    backgroundSize: 1080,
    logoX: 865,
    logoY: 203,
    logoSize: 175,
    jogadorX: 520,
    jogadorY: 407,
    jogadorSize: 950,
    birthdayTextX: 540,
    birthdayTextY: 300,
    birthdayTextSize: 1.2,
    playerNameX: 540,
    playerNameY: 380,
    playerNameSize: 1.4,
    playerNumberX: 900,
    playerNumberY: 500,
    playerNumberSize: 1.2,
    ageTextX: 540,
    ageTextY: 1700,
    ageTextSize: 1.8,
  },
  horizontal: {
    canvasWidth: 1080,
    canvasHeight: 1920,
    backgroundX: 0,
    backgroundY: 0,
    backgroundSize: 1080,
    logoX: 865,
    logoY: 203,
    logoSize: 175,
    jogadorX: 520,
    jogadorY: 407,
    jogadorSize: 950,
    birthdayTextX: 540,
    birthdayTextY: 300,
    birthdayTextSize: 1.2,
    playerNameX: 540,
    playerNameY: 380,
    playerNameSize: 1.4,
    playerNumberX: 900,
    playerNumberY: 500,
    playerNumberSize: 1.2,
    ageTextX: 540,
    ageTextY: 1700,
    ageTextSize: 1.8,
  },
};

const BirthdayGenerator: React.FC<BirthdayGeneratorProps> = ({
  onBack,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { baseImages } = useImages();

  // Estados básicos
  const [activeImageType, setActiveImageType] = useState<
    'quadrada' | 'vertical'
  >('quadrada');
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  // Estados específicos do Birthday
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayerImageUrl, setSelectedPlayerImageUrl] = useState<
    string | null
  >(null);
  const [playerAge, setPlayerAge] = useState<number | null>(null);
  const [customBirthdayMessage, setCustomBirthdayMessage] =
    useState<string>('FELIZ ANIVERSÁRIO');

  // Estados do novo sistema
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [renderOrder, setRenderOrder] = useState<string[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Selecionar Jogador',
      icon: Palette,
      description: 'Escolha o jogador aniversariante',
    },
    {
      id: 2,
      title: 'Gerar Imagem',
      icon: ImageIcon,
      description: 'Ajuste e gere a imagem',
    },
  ];

  // Calcular idade baseada na data de nascimento
  const calculateAge = useCallback((birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }, []);

  // Atualizar elementos quando dados mudarem
  useEffect(() => {
    if (selectedPlayer && selectedPlayerImageUrl) {
      const config = initialImageGeneratorConfigs[activeImageType];

      // Criar elementos
      const newElements: CanvasElement[] = [];

      // Background
      newElements.push({
        id: 'background',
        type: 'image',
        content:
          getBackgroundImageUrl(baseImages, activeImageType, 'birthday') ||
          getBackgroundImageUrl(baseImages, activeImageType, 'motm'), // Fallback para MOTM
        position: {
          x: 50,
          y: 50,
        },
        size: {
          width: 100,
          height: 100,
        },
        zIndex: 0,
        visible: true,
      });

      // Logo
      newElements.push({
        id: 'logo',
        type: 'image',
        content: '/caminhantes-clock.png',
        position: {
          x: ((config.logoX + config.logoSize / 2) / config.canvasWidth) * 100,
          y: ((config.logoY + config.logoSize / 2) / config.canvasHeight) * 100,
        },
        size: {
          width: (config.logoSize / config.canvasWidth) * 100,
          height: (config.logoSize / config.canvasHeight) * 100,
        },
        zIndex: 10,
        visible: true,
      });

      // Jogador
      const jogadorAspect = 1062 / 666;
      const jogadorHeight = config.jogadorSize * jogadorAspect;

      newElements.push({
        id: 'jogador',
        type: 'image',
        content: selectedPlayerImageUrl,
        position: {
          x:
            ((config.jogadorX + config.jogadorSize / 2) / config.canvasWidth) *
            100,
          y:
            ((config.jogadorY + jogadorHeight / 2) / config.canvasHeight) * 100,
        },
        size: {
          width: (config.jogadorSize / config.canvasWidth) * 100,
          height: (jogadorHeight / config.canvasHeight) * 100,
        },
        zIndex: 3,
        visible: true,
      });

      // Texto "FELIZ ANIVERSÁRIO"
      newElements.push({
        id: 'birthdayText',
        type: 'text',
        content: customBirthdayMessage,
        position: {
          x: (config.birthdayTextX / config.canvasWidth) * 100,
          y: (config.birthdayTextY / config.canvasHeight) * 100,
        },
        size: {
          width: 60,
          height: 10,
        },
        zIndex: 7,
        visible: true,
        style: {
          fontSize: `${(config.birthdayTextSize || 1) * 2.5}rem`,
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '900',
          textAlign: 'center' as const,
        },
      });

      // Nome do jogador
      newElements.push({
        id: 'playerName',
        type: 'text',
        content: selectedPlayer.name.toUpperCase(),
        position: {
          x: (config.playerNameX / config.canvasWidth) * 100,
          y: (config.playerNameY / config.canvasHeight) * 100,
        },
        size: {
          width: 70,
          height: 8,
        },
        zIndex: 6,
        visible: true,
        style: {
          fontSize: `${(config.playerNameSize || 1) * 2}rem`,
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '700',
          textAlign: 'center' as const,
        },
      });

      // Número do jogador
      if (selectedPlayer.number) {
        newElements.push({
          id: 'playerNumber',
          type: 'text',
          content: selectedPlayer.number.toString(),
          position: {
            x: (config.playerNumberX / config.canvasWidth) * 100,
            y: (config.playerNumberY / config.canvasHeight) * 100,
          },
          size: {
            width: 20,
            height: 15,
          },
          zIndex: 6,
          visible: true,
          style: {
            fontSize: `${(config.playerNumberSize || 1) * 8}rem`,
            color: 'white',
            textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '900',
            textAlign: 'center' as const,
          },
        });
      }

      // Idade (se disponível)
      if (playerAge) {
        newElements.push({
          id: 'ageText',
          type: 'text',
          content: `${playerAge} ANOS`,
          position: {
            x: (config.ageTextX / config.canvasWidth) * 100,
            y: (config.ageTextY / config.canvasHeight) * 100,
          },
          size: {
            width: 40,
            height: 8,
          },
          zIndex: 8,
          visible: true,
          style: {
            fontSize: `${(config.ageTextSize || 1) * 2}rem`,
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '900',
            textAlign: 'center' as const,
          },
        });
      }

      setElements(newElements);
      setRenderOrder(createDefaultRenderOrder(newElements));
    }
  }, [
    selectedPlayer,
    selectedPlayerImageUrl,
    activeImageType,
    baseImages,
    playerAge,
    customBirthdayMessage,
  ]);

  const canAdvanceToStepLocal = (step: number): boolean => {
    switch (step) {
      case 2:
        return !!selectedPlayer && !!selectedPlayerImageUrl;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePlayerSelect = (
    player: Player,
    imageUrl: string | null
    // imageIndex: number | null
  ) => {
    setSelectedPlayer(player);
    setSelectedPlayerImageUrl(imageUrl);

    // // Calcular idade se data de nascimento estiver disponível
    // if (player.birth?.date) {
    //   const age = calculateAge(player.birth.date);
    //   setPlayerAge(age);
    // } else {
    //   setPlayerAge(null);
    // }
  };

  const handleGenerateStart = () => {
    setGenerating(true);
  };

  const handleGenerateEnd = () => {
    setGenerating(false);
  };

  const generateBirthdayPostText = (): string => {
    if (!selectedPlayer) return '';

    const playerName = selectedPlayer.name;
    const ageText = playerAge ? ` que completa ${playerAge} anos` : '';

    return `🎉 Hoje é um dia especial! 🎂

Feliz aniversário para nosso jogador ${playerName}${ageText}! 

Que este novo ano seja repleto de conquistas, gols e muita felicidade! 🏆⚽

Parabéns, craque! 🎈

#FelizAniversario #${playerName.replace(/\s+/g, '')} #Caminhantes`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Gerador de Aniversário"
        onBack={onBack}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
      />

      <StepperResponsive
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        canAdvanceToStep={canAdvanceToStepLocal}
      />

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Selecione o Jogador Aniversariante
            </h3>
            <PlayerSelector
              onPlayerSelect={handlePlayerSelect}
              selectedPlayer={selectedPlayer}
              selectedPlayerImageUrl={selectedPlayerImageUrl}
            />

            {/* Personalização da mensagem */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Mensagem de Aniversário
              </label>
              <input
                type="text"
                value={customBirthdayMessage}
                onChange={(e) => setCustomBirthdayMessage(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="FELIZ ANIVERSÁRIO"
                maxLength={30}
              />
              <p className="text-xs text-gray-500">
                Máximo 30 caracteres. Use maiúsculas para melhor visual.
              </p>
            </div>

            {/* Idade manual (caso não seja calculada automaticamente) */}
            {selectedPlayer && !playerAge && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Idade (opcional)</label>
                <input
                  type="number"
                  min="16"
                  max="50"
                  value={playerAge || ''}
                  onChange={(e) =>
                    setPlayerAge(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Ex: 25"
                />
                <p className="text-xs text-gray-500">
                  Se não souber a idade exata, pode deixar em branco.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={!canAdvanceToStepLocal(2)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Seletor de tipo de imagem */}
          <div className="flex justify-center space-x-4">
            {(['quadrada', 'vertical'] as const).map((type) => (
              <Button
                key={type}
                variant={activeImageType === type ? 'default' : 'outline'}
                onClick={() => setActiveImageType(type)}
                className={
                  activeImageType === type
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : ''
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {/* Gerador de imagem */}
          <BaseImageGenerator
            configs={initialImageGeneratorConfigs}
            activeImageType={activeImageType}
            elements={elements}
            onElementsChange={setElements}
            renderOrder={renderOrder}
            onRenderOrderChange={setRenderOrder}
            generating={generating}
            onGenerateStart={handleGenerateStart}
            onGenerateEnd={handleGenerateEnd}
            downloadFileName="birthday"
          />

          {/* Gerador de texto para post */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Texto para Post</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {generateBirthdayPostText()}
              </pre>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generateBirthdayPostText());
              }}
              variant="outline"
              className="w-full"
            >
              Copiar Texto
            </Button>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthdayGenerator;
