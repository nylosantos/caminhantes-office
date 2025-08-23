import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ImageIcon,
  Palette,
} from 'lucide-react';

import { Player } from '@/types/squad';
import { Channel } from '@/types/channels';
import { ViewType } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { BaseGeneratorData } from '@/types/generator';
import { Match, MatchFormData } from '@/types/matches';
import { RoundTranslationsDocument } from '@/types/translations';
import {
  convertToSaoPauloTime,
  formatCompetitionRound,
  formatDateToBrazilian,
} from '@/utils/dateUtils';

import StepperResponsive from '../ui/Stepper';
import GameArtSelector from './GameArtSelector';
import PostTextGenerator from './PostTextGenerator';
import SectionHeader from '../layout/SectionHeader';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import BaseImageGenerator, {
  CanvasElement,
  ElementConfig,
} from './BaseImageGenerator';
import {
  convertCanvasConfigToElements,
  generateMatchInfoText,
  getBackgroundImageUrl,
  createDefaultRenderOrder,
  canAdvanceToStep,
  createTvLogosElement,
} from './GeneratorUtils';
import { GroupedChannels } from './NextGameGenerator';

interface MatchDayGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
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
    logoX: 901,
    logoY: 61,
    logoSize: 123,
    placarX: 312,
    placarY: 135,
    placarSize: 820,
    jogadorX: -231,
    jogadorY: 90,
    jogadorSize: 950,
    footerX: 1018,
    footerY: 700,
    footerSize: 1.75,
    tvX: 3,
    tvY: 885,
    tvSize: 2.3,
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
    placarX: 355,
    placarY: 443,
    placarSize: 875,
    jogadorX: 175,
    jogadorY: 407,
    jogadorSize: 950,
    footerX: 1018,
    footerY: 1090,
    footerSize: 2.15,
    tvX: 160,
    tvY: 1260,
    tvSize: 2.1,
  },
  horizontal: {
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundX: 0,
    backgroundY: 0,
    backgroundSize: 1920,
    logoX: 1761,
    logoY: 31,
    logoSize: 123,
    placarX: 1200,
    placarY: 135,
    placarSize: 600,
    jogadorX: 50,
    jogadorY: 100,
    jogadorSize: 950,
    footerX: 30,
    footerY: 1005,
    footerSize: 1,
    tvX: 30,
    tvY: 950,
    tvSize: 0.7,
  },
};

const MatchDayGenerator: React.FC<MatchDayGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { baseImages, channelLogos } = useImages();

  // Estados básicos
  const [activeImageType, setActiveImageType] = useState<
    'quadrada' | 'vertical' | 'horizontal'
  >('quadrada');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const matchSelectorRef = useRef<MatchSelectorRef>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatorData, setGeneratorData] = useState<BaseGeneratorData>({
    matchData: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
  });

  // Estados específicos do MatchDay
  const [selectedChannelLogos, setSelectedChannelLogos] = useState<Channel[]>(
    []
  );
  const [showChannelLogoSelection, setShowChannelLogoSelection] =
    useState<boolean>(false);

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
      title: 'Arte e Jogador',
      icon: Palette,
      description: 'Selecione a arte e o jogador',
    },
    {
      id: 3,
      title: 'Gerar Imagem',
      icon: ImageIcon,
      description: 'Ajuste e gere a imagem',
    },
  ];

  const [step1Valid, setStep1Valid] = useState(false);

  // Função para gerenciar as logos selecionadas
  const handleToggleChannelLogo = (logo: Channel) => {
    setSelectedChannelLogos((prevLogos) => {
      if (prevLogos.some((l) => l.id === logo.id)) {
        return prevLogos.filter((l) => l.id !== logo.id);
      } else {
        return [...prevLogos, logo];
      }
    });
  };

  // Atualizar elementos quando dados mudarem
  useEffect(() => {
    if (generatorData.gameArt || generatorData.featuredPlayer) {
      const config = initialImageGeneratorConfigs[activeImageType];
      const newElements = convertCanvasConfigToElements(
        config,
        generatorData,
        activeImageType
      );

      // Atualizar conteúdo específico dos elementos
      const updatedElements = newElements.map((element) => {
        switch (element.id) {
          case 'background':
            return {
              ...element,
              content: getBackgroundImageUrl(
                baseImages,
                activeImageType,
                'matchday'
              ),
            };
          case 'placar':
            return {
              ...element,
              content: selectedMatch ? (
                <SplitRectangleDisplay
                  selectedMatch={selectedMatch}
                  homeScore={null}
                  homePenScore={null}
                  awayScore={null}
                  awayPenScore={null}
                />
              ) : null,
            };
          case 'info':
            return {
              ...element,
              content: generateMatchInfoText(generatorData.matchData),
            };
          case 'tv':
            return {
              ...element,
              content: createTvLogosElement(
                selectedChannelLogos,
                config,
                activeImageType
              ),
            };
          default:
            return element;
        }
      });

      setElements(updatedElements);
      setRenderOrder(createDefaultRenderOrder(updatedElements));
    }
  }, [
    generatorData,
    activeImageType,
    baseImages,
    selectedMatch,
    selectedChannelLogos,
  ]);

  const canAdvanceToStepLocal = (step: number): boolean => {
    return canAdvanceToStep(step, generatorData, selectedMatch);
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
    setGeneratorData((prev) => ({ ...prev, matchData: formData }));
  };

  const handleGameArtSelect = (
    gameArt: string,
    featuredPlayer: Player | null,
    featuredPlayerImageUrl: string | null
  ) => {
    setGeneratorData((prev) => ({
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
        title="Gerador de Match Day"
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
          <GameArtSelector
            onGameArtSelect={handleGameArtSelect}
            selectedGameArt={generatorData.gameArt}
            selectedPlayer={generatorData.featuredPlayer}
            selectedPlayerImageUrl={generatorData.featuredPlayerImageUrl}
          />

          {/* Seleção de logos de canal */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showChannelLogos"
                checked={showChannelLogoSelection}
                onChange={(e) => setShowChannelLogoSelection(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="showChannelLogos"
                className="text-sm font-medium"
              >
                Adicionar logos de canais de TV
              </label>
            </div>

            {showChannelLogoSelection && (
              <div className="space-y-4">
                <h4 className="font-medium">
                  Selecione os canais que transmitirão o jogo:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {channelLogos.map((logo) => (
                    <div
                      key={logo.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedChannelLogos.some((l) => l.id === logo.id)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleChannelLogo(logo)}
                    >
                      <img
                        src={logo.logoUrl}
                        alt={logo.name}
                        className="w-full h-12 object-contain mb-2"
                      />
                      <p className="text-xs text-center">{logo.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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

      {currentStep === 3 && (
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
            downloadFileName="matchday"
          />

          {/* Gerador de texto para post */}
          <PostTextGenerator
            match={generatorData.matchData}
            featuredPlayer={generatorData.featuredPlayer}
            currentUserData={null}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
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

export default MatchDayGenerator;
