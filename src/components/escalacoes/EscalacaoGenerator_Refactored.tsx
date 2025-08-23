import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ImageIcon,
  Palette,
  Target,
  Users,
} from 'lucide-react';

import { Player } from '@/types/squad';
import { Formation } from '@/types/formations';
import { ViewType } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { Match, MatchFormData } from '@/types/matches';
import { RoundTranslationsDocument } from '@/types/translations';
import {
  convertToSaoPauloTime,
  formatCompetitionRound,
  formatDateToBrazilian,
} from '@/utils/dateUtils';

import PlayerSelector from './PlayerSelector';
import StepperResponsive from '../ui/Stepper';
import GameArtSelector from './GameArtSelector';
import FormationSelector from './FormationSelector';
import PostTextGenerator from './PostTextGenerator';
import SectionHeader from '../layout/SectionHeader';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import BaseImageGenerator, {
  CanvasElement,
  ElementConfig,
} from './BaseImageGenerator';
import {
  getBackgroundImageUrl,
  createDefaultRenderOrder,
  generateMatchInfoText,
  canAdvanceToStep,
} from './GeneratorUtils';

interface EscalacaoGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

interface SelectedPlayers {
  [positionId: string]: Player | null;
}

export interface EscalacaoData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  featuredPlayer: Player | null;
  featuredPlayerImageUrl: string | null;
  featuredPlayerImgIndex: number | null;
  formation: Formation | null;
  selectedPlayers: SelectedPlayers;
  reservePlayers: Player[];
  coach: string;
}

const initialImageGeneratorConfigs: Record<
  'quadrada' | 'vertical' | 'horizontal',
  ElementConfig
> = {
  quadrada: {
    canvasWidth: 1080,
    canvasHeight: 1080,
    logoX: 921,
    logoY: 31,
    logoSize: 123,
    placarX: 80,
    placarY: 135,
    placarSize: 930,
    jogadorX: 121,
    jogadorY: 85,
    jogadorSize: 900,
    startYJogadores: 200,
    lineHeightJogadores: 35,
    playerNumberX: 150,
    playerNameX: 200,
    reserveBlockOffsetY: 600,
    reserveBancoX: 150,
    reserveNamesX: 200,
    coachOffsetY: 800,
    coachBancoX: 150,
    coachNameX: 200,
    footerY: 950,
    stadiumX: 540,
    stadiumY: 980,
    dateX: 540,
    dateY: 1010,
    competitionX: 540,
    competitionY: 1040,
  },
  vertical: {
    canvasWidth: 1080,
    canvasHeight: 1920,
    logoX: 865,
    logoY: 203,
    logoSize: 175,
    placarX: 115,
    placarY: 443,
    placarSize: 875,
    jogadorX: 520,
    jogadorY: 407,
    jogadorSize: 950,
    startYJogadores: 800,
    lineHeightJogadores: 40,
    playerNumberX: 200,
    playerNameX: 260,
    reserveBlockOffsetY: 1200,
    reserveBancoX: 200,
    reserveNamesX: 260,
    coachOffsetY: 1500,
    coachBancoX: 200,
    coachNameX: 260,
    footerY: 1650,
    stadiumX: 540,
    stadiumY: 1700,
    dateX: 540,
    dateY: 1750,
    competitionX: 540,
    competitionY: 1800,
  },
  horizontal: {
    canvasWidth: 1920,
    canvasHeight: 1080,
    logoX: 1761,
    logoY: 31,
    logoSize: 123,
    placarX: 1000,
    placarY: 135,
    placarSize: 800,
    jogadorX: 175,
    jogadorY: 100,
    jogadorSize: 950,
    startYJogadores: 200,
    lineHeightJogadores: 30,
    playerNumberX: 50,
    playerNameX: 100,
    reserveBlockOffsetY: 600,
    reserveBancoX: 50,
    reserveNamesX: 100,
    coachOffsetY: 800,
    coachBancoX: 50,
    coachNameX: 100,
    footerY: 950,
    stadiumX: 960,
    stadiumY: 980,
    dateX: 960,
    dateY: 1010,
    competitionX: 960,
    competitionY: 1040,
  },
};

const EscalacaoGenerator: React.FC<EscalacaoGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { baseImages } = useImages();

  // Estados básicos
  const [activeImageType, setActiveImageType] = useState<
    'quadrada' | 'vertical' | 'horizontal'
  >('quadrada');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const matchSelectorRef = useRef<MatchSelectorRef>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  // Estados específicos da Escalação
  const [escalacaoData, setEscalacaoData] = useState<EscalacaoData>({
    matchData: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
    formation: null,
    selectedPlayers: {},
    reservePlayers: [],
    coach: '',
  });

  // Estados do novo sistema
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [renderOrder, setRenderOrder] = useState<string[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Dados da Partida',
      icon: Calendar,
      description: 'Selecione a partida',
    },
    {
      id: 2,
      title: 'Formação',
      icon: Target,
      description: 'Escolha a formação tática',
    },
    {
      id: 3,
      title: 'Jogadores',
      icon: Users,
      description: 'Selecione os jogadores',
    },
    {
      id: 4,
      title: 'Arte e Destaque',
      icon: Palette,
      description: 'Selecione a arte e jogador destaque',
    },
    {
      id: 5,
      title: 'Gerar Imagem',
      icon: ImageIcon,
      description: 'Ajuste e gere a imagem',
    },
  ];

  const [step1Valid, setStep1Valid] = useState(false);

  // Função para criar elemento de texto da escalação
  const createEscalacaoTextElement = useCallback(() => {
    if (!escalacaoData.formation || !escalacaoData.selectedPlayers) return null;

    const config = initialImageGeneratorConfigs[activeImageType];
    const formation = escalacaoData.formation;

    // Criar texto da escalação
    let escalacaoText = '';

    // Jogadores titulares
    escalacaoText += 'ESCALAÇÃO:\n\n';

    formation.positions.forEach((position, index) => {
      const player = escalacaoData.selectedPlayers[position.id];
      if (player) {
        escalacaoText += `${player.number || '?'}. ${player.name}\n`;
      }
    });

    // Reservas
    if (escalacaoData.reservePlayers.length > 0) {
      escalacaoText += '\nRESERVAS:\n';
      escalacaoData.reservePlayers.forEach((player) => {
        escalacaoText += `${player.number || '?'}. ${player.name}\n`;
      });
    }

    // Técnico
    if (escalacaoData.coach) {
      escalacaoText += `\nTÉCNICO: ${escalacaoData.coach}\n`;
    }

    return (
      <div
        className="text-white font-mono text-sm leading-relaxed"
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'Montserrat, monospace',
          fontWeight: '600',
        }}
      >
        <pre className="whitespace-pre-wrap">{escalacaoText}</pre>
      </div>
    );
  }, [escalacaoData, activeImageType]);

  // Atualizar elementos quando dados mudarem
  useEffect(() => {
    if (escalacaoData.gameArt || escalacaoData.formation) {
      const config = initialImageGeneratorConfigs[activeImageType];

      // Criar elementos básicos
      const newElements: CanvasElement[] = [];

      // Background
      newElements.push({
        id: 'background',
        type: 'image',
        content: getBackgroundImageUrl(
          baseImages,
          activeImageType,
          'escalacao'
        ),
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

      // Placar/SplitRectangleDisplay
      if (selectedMatch) {
        newElements.push({
          id: 'placar',
          type: 'component',
          content: (
            <SplitRectangleDisplay
              selectedMatch={selectedMatch}
              homeScore={null}
              homePenScore={null}
              awayScore={null}
              awayPenScore={null}
            />
          ),
          position: {
            x:
              ((config.placarX + config.placarSize / 2) / config.canvasWidth) *
              100,
            y:
              ((config.placarY + (config.placarSize * (720 / 1280)) / 2) /
                config.canvasHeight) *
              100,
          },
          size: {
            width: (config.placarSize / config.canvasWidth) * 100,
            height:
              ((config.placarSize * (720 / 1280)) / config.canvasHeight) * 100,
          },
          zIndex: 5,
          visible: true,
        });
      }

      // Jogador destaque (se selecionado)
      if (escalacaoData.featuredPlayerImageUrl) {
        const jogadorAspect = 1062 / 666;
        const jogadorHeight = config.jogadorSize * jogadorAspect;

        newElements.push({
          id: 'jogador',
          type: 'image',
          content: escalacaoData.featuredPlayerImageUrl,
          position: {
            x:
              ((config.jogadorX + config.jogadorSize / 2) /
                config.canvasWidth) *
              100,
            y:
              ((config.jogadorY + jogadorHeight / 2) / config.canvasHeight) *
              100,
          },
          size: {
            width: (config.jogadorSize / config.canvasWidth) * 100,
            height: (jogadorHeight / config.canvasHeight) * 100,
          },
          zIndex: 3,
          visible: true,
        });
      }

      // Texto da escalação
      const escalacaoTextElement = createEscalacaoTextElement();
      if (escalacaoTextElement) {
        newElements.push({
          id: 'escalacaoText',
          type: 'component',
          content: escalacaoTextElement,
          position: {
            x: 25, // Lado esquerdo
            y: 60, // Meio-baixo
          },
          size: {
            width: 45,
            height: 35,
          },
          zIndex: 6,
          visible: true,
        });
      }

      // Informações da partida
      if (escalacaoData.matchData) {
        newElements.push({
          id: 'matchInfo',
          type: 'text',
          content: generateMatchInfoText(escalacaoData.matchData),
          position: {
            x: (config.stadiumX / config.canvasWidth) * 100,
            y: (config.stadiumY / config.canvasHeight) * 100,
          },
          size: {
            width: 60,
            height: 8,
          },
          zIndex: 8,
          visible: true,
          style: {
            fontSize: '1.2rem',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '700',
            textAlign: 'center' as const,
          },
        });
      }

      setElements(newElements);
      setRenderOrder(createDefaultRenderOrder(newElements));
    }
  }, [
    escalacaoData,
    activeImageType,
    baseImages,
    selectedMatch,
    createEscalacaoTextElement,
  ]);

  const canAdvanceToStepLocal = (step: number): boolean => {
    switch (step) {
      case 2:
        return !!selectedMatch;
      case 3:
        return !!escalacaoData.formation;
      case 4:
        return Object.keys(escalacaoData.selectedPlayers).length > 0;
      case 5:
        return !!escalacaoData.gameArt;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (
      currentStep === 1 &&
      matchSelectorRef.current &&
      !matchSelectorRef.current.canProceed
    ) {
      if (!matchSelectorRef.current.submitManualData()) return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleMatchSelect = (matchData: Match) => {
    const matchDate = new Date(matchData.fixture.date);
    const saoPauloDate = convertToSaoPauloTime(matchDate);
    const formData: MatchFormData = {
      homeTeam: matchData.teams.home.name,
      awayTeam: matchData.teams.away.name,
      competition: formatCompetitionRound(matchData, translations),
      matchDate: new Date().toISOString().split('T')[0],
      matchTime: '16:00',
      venue: matchData.fixture.venue.name || 'Estádio não informado',
      matchday: '',
      stage: '',
      referee: matchData.fixture.referee || '',
      stadium: matchData.fixture.venue.name || 'Estádio não informado',
      date: formatDateToBrazilian(saoPauloDate),
      competitionRound: formatCompetitionRound(matchData, translations),
    };
    setSelectedMatch(matchData);
    setEscalacaoData((prev) => ({ ...prev, matchData: formData }));
  };

  const handleFormationSelect = (formation: Formation) => {
    setEscalacaoData((prev) => ({ ...prev, formation }));
  };

  const handlePlayerSelect = (positionId: string, player: Player | null) => {
    setEscalacaoData((prev) => ({
      ...prev,
      selectedPlayers: {
        ...prev.selectedPlayers,
        [positionId]: player,
      },
    }));
  };

  const handleReservePlayersChange = (players: Player[]) => {
    setEscalacaoData((prev) => ({ ...prev, reservePlayers: players }));
  };

  const handleCoachChange = (coach: string) => {
    setEscalacaoData((prev) => ({ ...prev, coach }));
  };

  const handleGameArtSelect = (
    gameArt: string,
    featuredPlayer: Player | null,
    featuredPlayerImageUrl: string | null
  ) => {
    setEscalacaoData((prev) => ({
      ...prev,
      gameArt,
      featuredPlayer,
      featuredPlayerImageUrl,
    }));
  };

  const handleGenerateStart = () => {
    setGenerating(true);
  };

  const handleGenerateEnd = () => {
    setGenerating(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Gerador de Escalação"
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
          <MatchSelector
            ref={matchSelectorRef}
            onMatchSelect={handleMatchSelect}
            onValidationChange={setStep1Valid}
            translations={translations}
            selectedMatch={selectedMatch}
          />
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
          <FormationSelector
            onFormationSelect={handleFormationSelect}
            selectedFormation={escalacaoData.formation}
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={!canAdvanceToStepLocal(3)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && escalacaoData.formation && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecione os Jogadores</h3>

            {/* Seleção de jogadores por posição */}
            <div className="space-y-4">
              {escalacaoData.formation.positions.map((position) => (
                <div
                  key={position.id}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium">
                    {position.label}
                  </label>
                  <PlayerSelector
                    onPlayerSelect={(player, imageUrl, imageIndex) =>
                      handlePlayerSelect(position.id, player)
                    }
                    selectedPlayer={escalacaoData.selectedPlayers[position.id]}
                    selectedPlayerImageUrl={null}
                    showImageSelection={false}
                  />
                </div>
              ))}
            </div>

            {/* Reservas */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Jogadores Reservas</label>
              <PlayerSelector
                onPlayerSelect={(player) => {
                  if (
                    player &&
                    !escalacaoData.reservePlayers.find(
                      (p) => p.id === player.id
                    )
                  ) {
                    handleReservePlayersChange([
                      ...escalacaoData.reservePlayers,
                      player,
                    ]);
                  }
                }}
                selectedPlayer={null}
                selectedPlayerImageUrl={null}
                showImageSelection={false}
              />

              {/* Lista de reservas selecionados */}
              {escalacaoData.reservePlayers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    Reservas selecionados:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {escalacaoData.reservePlayers.map((player) => (
                      <span
                        key={player.id}
                        className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                      >
                        {player.name}
                        <button
                          onClick={() =>
                            handleReservePlayersChange(
                              escalacaoData.reservePlayers.filter(
                                (p) => p.id !== player.id
                              )
                            )
                          }
                          className="ml-1 text-teal-600 hover:text-teal-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Técnico */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Técnico</label>
              <input
                type="text"
                value={escalacaoData.coach}
                onChange={(e) => handleCoachChange(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Nome do técnico"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={!canAdvanceToStepLocal(4)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-6">
          <GameArtSelector
            onGameArtSelect={handleGameArtSelect}
            selectedGameArt={escalacaoData.gameArt}
            selectedPlayer={escalacaoData.featuredPlayer}
            selectedPlayerImageUrl={escalacaoData.featuredPlayerImageUrl}
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={!canAdvanceToStepLocal(5)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Seletor de tipo de imagem */}
          <div className="flex justify-center space-x-4">
            {(['quadrada', 'vertical', 'horizontal'] as const).map((type) => (
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
            downloadFileName="escalacao"
          />

          {/* Gerador de texto para post */}
          <PostTextGenerator
            matchData={escalacaoData.matchData}
            featuredPlayer={escalacaoData.featuredPlayer}
            currentUserData={null}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(4)}
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

export default EscalacaoGenerator;
