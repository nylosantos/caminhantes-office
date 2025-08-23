import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ImageIcon,
  Palette,
} from 'lucide-react';

import { Player } from '@/types/squad';
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
} from './GeneratorUtils';

interface MotmGeneratorProps {
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
    logoX: 921,
    logoY: 31,
    logoSize: 123,
    placarX: 80,
    placarY: 565,
    placarSize: 930,
    jogadorX: 121,
    jogadorY: 85,
    jogadorSize: 900,
    motmTextX: 540,
    motmTextY: 195,
    motmTextSize: 1,
    playerNumberX: 900,
    playerNumberY: 300,
    playerNumberSize: 1,
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
    placarX: 115,
    placarY: 923,
    placarSize: 875,
    jogadorX: 520,
    jogadorY: 407,
    jogadorSize: 950,
    motmTextX: 540,
    motmTextY: 350,
    motmTextSize: 1.2,
    playerNumberX: 900,
    playerNumberY: 500,
    playerNumberSize: 1.2,
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
    placarX: 1000,
    placarY: 400,
    placarSize: 800,
    jogadorX: 175,
    jogadorY: 100,
    jogadorSize: 950,
    motmTextX: 960,
    motmTextY: 150,
    motmTextSize: 0.8,
    playerNumberX: 1500,
    playerNumberY: 250,
    playerNumberSize: 0.8,
  },
};

const MotmGenerator: React.FC<MotmGeneratorProps> = ({
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
  const [generatorData, setGeneratorData] = useState<BaseGeneratorData>({
    matchData: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
  });

  // Estados específicos do MOTM
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [awayScore, setAwayScore] = useState<number | null>(null);
  const [homePenScore, setHomePenScore] = useState<number | null>(null);
  const [awayPenScore, setAwayPenScore] = useState<number | null>(null);

  // Estados do novo sistema
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [renderOrder, setRenderOrder] = useState<string[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Dados da Partida',
      icon: Calendar,
      description: 'Selecione a partida e placar',
    },
    {
      id: 2,
      title: 'Arte e Jogador',
      icon: Palette,
      description: 'Selecione a arte e o jogador destaque',
    },
    {
      id: 3,
      title: 'Gerar Imagem',
      icon: ImageIcon,
      description: 'Ajuste e gere a imagem',
    },
  ];

  const [step1Valid, setStep1Valid] = useState(false);

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
                'motm'
              ),
            };
          case 'placar':
            return {
              ...element,
              content: selectedMatch ? (
                <SplitRectangleDisplay
                  selectedMatch={selectedMatch}
                  homeScore={homeScore}
                  homePenScore={homePenScore}
                  awayScore={awayScore}
                  awayPenScore={awayPenScore}
                />
              ) : null,
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
    homeScore,
    awayScore,
    homePenScore,
    awayPenScore,
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
        title="Gerador de Man of the Match"
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

          {/* Controles de placar */}
          {selectedMatch && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Placar Final</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedMatch.teams.home.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={homeScore ?? ''}
                    onChange={(e) =>
                      setHomeScore(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Gols"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedMatch.teams.away.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={awayScore ?? ''}
                    onChange={(e) =>
                      setAwayScore(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Gols"
                  />
                </div>
              </div>

              {/* Pênaltis (opcional) */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={homePenScore !== null || awayPenScore !== null}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setHomePenScore(null);
                        setAwayPenScore(null);
                      } else {
                        setHomePenScore(0);
                        setAwayPenScore(0);
                      }
                    }}
                  />
                  <span className="text-sm font-medium">
                    Decisão por pênaltis
                  </span>
                </label>

                {(homePenScore !== null || awayPenScore !== null) && (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      min="0"
                      value={homePenScore ?? ''}
                      onChange={(e) =>
                        setHomePenScore(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Pênaltis casa"
                    />
                    <input
                      type="number"
                      min="0"
                      value={awayPenScore ?? ''}
                      onChange={(e) =>
                        setAwayPenScore(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Pênaltis fora"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

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
            downloadFileName="motm"
          />

          {/* Gerador de texto para post */}
          <PostTextGenerator
            matchData={generatorData.matchData}
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

export default MotmGenerator;
