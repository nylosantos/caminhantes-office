import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ImageIcon,
  TrendingUp,
} from 'lucide-react';

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

import StepperResponsive from '../ui/Stepper';
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
} from './GeneratorUtils';

interface PredictionGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

const initialImageGeneratorConfigs: Record<
  'quadrada' | 'vertical',
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
    placarY: 300,
    placarSize: 930,
    predictionTextX: 540,
    predictionTextY: 150,
    predictionTextSize: 1,
    infoTextX: 540,
    infoTextY: 950,
    infoTextSize: 1.2,
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
    placarY: 600,
    placarSize: 875,
    predictionTextX: 540,
    predictionTextY: 350,
    predictionTextSize: 1.2,
    infoTextX: 540,
    infoTextY: 1700,
    infoTextSize: 1.4,
  },
};

const PredictionGenerator: React.FC<PredictionGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { baseImages } = useImages();

  // Estados básicos
  const [activeImageType, setActiveImageType] = useState<
    'quadrada' | 'vertical'
  >('quadrada');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const matchSelectorRef = useRef<MatchSelectorRef>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [matchData, setMatchData] = useState<MatchFormData | null>(null);

  // Estados específicos do Prediction
  const [predictionText, setPredictionText] = useState<string>('NOSSO PALPITE');
  const [homeScorePrediction, setHomeScorePrediction] = useState<number>(1);
  const [awayScorePrediction, setAwayScorePrediction] = useState<number>(0);
  const [confidence, setConfidence] = useState<'baixa' | 'média' | 'alta'>(
    'média'
  );

  // Estados do novo sistema
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [renderOrder, setRenderOrder] = useState<string[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Selecionar Partida',
      icon: Calendar,
      description: 'Escolha a partida para o palpite',
    },
    {
      id: 2,
      title: 'Configurar Palpite',
      icon: TrendingUp,
      description: 'Defina seu palpite e confiança',
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
    if (selectedMatch) {
      const config = initialImageGeneratorConfigs[activeImageType];

      // Criar elementos
      const newElements: CanvasElement[] = [];

      // Background
      newElements.push({
        id: 'background',
        type: 'image',
        content:
          getBackgroundImageUrl(baseImages, activeImageType, 'prediction') ||
          getBackgroundImageUrl(baseImages, activeImageType, 'proximo_jogo'), // Fallback
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

      // Placar/SplitRectangleDisplay com palpite
      newElements.push({
        id: 'placar',
        type: 'component',
        content: (
          <SplitRectangleDisplay
            selectedMatch={selectedMatch}
            homeScore={homeScorePrediction}
            homePenScore={null}
            awayScore={awayScorePrediction}
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

      // Texto "NOSSO PALPITE"
      newElements.push({
        id: 'predictionText',
        type: 'text',
        content: predictionText,
        position: {
          x: (config.predictionTextX / config.canvasWidth) * 100,
          y: (config.predictionTextY / config.canvasHeight) * 100,
        },
        size: {
          width: 60,
          height: 10,
        },
        zIndex: 7,
        visible: true,
        style: {
          fontSize: `${(config.predictionTextSize || 1) * 2.5}rem`,
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '900',
          textAlign: 'center' as const,
        },
      });

      // Informações da partida + confiança
      const infoText = generateMatchInfoText(matchData);
      const confidenceText = `Confiança: ${confidence.toUpperCase()}`;
      const fullInfoText = infoText
        ? `${infoText} • ${confidenceText}`
        : confidenceText;

      newElements.push({
        id: 'infoText',
        type: 'text',
        content: fullInfoText,
        position: {
          x: (config.infoTextX / config.canvasWidth) * 100,
          y: (config.infoTextY / config.canvasHeight) * 100,
        },
        size: {
          width: 80,
          height: 8,
        },
        zIndex: 8,
        visible: true,
        style: {
          fontSize: `${(config.infoTextSize || 1) * 1.2}rem`,
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '700',
          textAlign: 'center' as const,
        },
      });

      setElements(newElements);
      setRenderOrder(createDefaultRenderOrder(newElements));
    }
  }, [
    selectedMatch,
    activeImageType,
    baseImages,
    predictionText,
    homeScorePrediction,
    awayScorePrediction,
    confidence,
    matchData,
  ]);

  const canAdvanceToStepLocal = (step: number): boolean => {
    switch (step) {
      case 2:
        return !!selectedMatch;
      case 3:
        return (
          !!selectedMatch &&
          homeScorePrediction !== null &&
          awayScorePrediction !== null
        );
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

  const handleMatchSelect = (match: Match) => {
    const matchDate = new Date(match.fixture.date);
    const saoPauloDate = convertToSaoPauloTime(matchDate);
    const formData: MatchFormData = {
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      competition: formatCompetitionRound(match, translations),
      matchDate: new Date().toISOString().split('T')[0],
      matchTime: '16:00',
      venue: match.fixture.venue.name || 'Estádio não informado',
      matchday: '',
      stage: '',
      referee: match.fixture.referee || '',
      stadium: match.fixture.venue.name || 'Estádio não informado',
      date: formatDateToBrazilian(saoPauloDate),
      competitionRound: formatCompetitionRound(match, translations),
    };
    setSelectedMatch(match);
    setMatchData(formData);
  };

  const handleGenerateStart = () => {
    setGenerating(true);
  };

  const handleGenerateEnd = () => {
    setGenerating(false);
  };

  const generatePredictionPostText = (): string => {
    if (!selectedMatch) return '';

    const homeTeam = selectedMatch.teams.home.name;
    const awayTeam = selectedMatch.teams.away.name;
    const competition = matchData?.competitionRound || 'Partida';
    const venue = matchData?.stadium || 'Estádio';
    const date = matchData?.date || '';

    const confidenceEmoji = {
      baixa: '🤔',
      média: '🎯',
      alta: '🔥',
    }[confidence];

    const confidenceText = {
      baixa: 'Palpite arriscado',
      média: 'Palpite equilibrado',
      alta: 'Palpite confiante',
    }[confidence];

    return `⚽ NOSSO PALPITE ${confidenceEmoji}

${homeTeam} ${homeScorePrediction} x ${awayScorePrediction} ${awayTeam}

📅 ${date}
🏟️ ${venue}
🏆 ${competition}

${confidenceText}! E vocês, qual o palpite de vocês? 

Comentem aí embaixo! 👇

#Palpite #${homeTeam.replace(/\s+/g, '')}vs${awayTeam.replace(
      /\s+/g,
      ''
    )} #Caminhantes #Futebol`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SectionHeader
        title="Gerador de Palpite"
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
            <h3 className="text-lg font-semibold">Selecione a Partida</h3>
            <MatchSelector
              ref={matchSelectorRef}
              onMatchSelect={handleMatchSelect}
              onValidationChange={setStep1Valid}
              translations={translations}
              selectedMatch={selectedMatch}
            />
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

      {currentStep === 2 && selectedMatch && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configure seu Palpite</h3>

            {/* Personalização do texto principal */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Texto Principal</label>
              <input
                type="text"
                value={predictionText}
                onChange={(e) => setPredictionText(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="NOSSO PALPITE"
                maxLength={25}
              />
              <p className="text-xs text-gray-500">
                Máximo 25 caracteres. Use maiúsculas para melhor visual.
              </p>
            </div>

            {/* Palpite do placar */}
            <div className="space-y-4">
              <h4 className="font-medium">Placar Previsto</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedMatch.teams.home.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={homeScorePrediction}
                    onChange={(e) =>
                      setHomeScorePrediction(parseInt(e.target.value) || 0)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedMatch.teams.away.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={awayScorePrediction}
                    onChange={(e) =>
                      setAwayScorePrediction(parseInt(e.target.value) || 0)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Nível de confiança */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível de Confiança</label>
              <div className="grid grid-cols-3 gap-2">
                {(['baixa', 'média', 'alta'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={confidence === level ? 'default' : 'outline'}
                    onClick={() => setConfidence(level)}
                    className={
                      confidence === level
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : ''
                    }
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Baixa: palpite arriscado | Média: equilibrado | Alta: confiante
              </p>
            </div>
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
            downloadFileName="prediction"
          />

          {/* Gerador de texto para post */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Texto para Post</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {generatePredictionPostText()}
              </pre>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatePredictionPostText());
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

export default PredictionGenerator;
