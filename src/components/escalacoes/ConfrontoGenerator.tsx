import { useCallback, useEffect, useRef, useState } from 'react';

import domtoimage from 'dom-to-image';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Download,
  ImageIcon,
  Loader,
  Palette,
  PieChart,
} from 'lucide-react';

import Chart from 'chart.js/auto';
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
import { EscalacaoData } from './EscalacaoGenerator';
import LayerManager from '../generator/LayerManager';
import PositionController from './PositionController';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';

// Props do componente
interface ConfrontoGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

// Interface de configuração dos elementos
interface ElementConfig {
  canvasWidth: number;
  canvasHeight: number;
  backgroundX: number;
  backgroundY: number;
  backgroundSize: number;
  logoX: number;
  logoY: number;
  logoSize: number;
  placarX: number;
  placarY: number;
  placarSize: number;
  jogadorX: number;
  jogadorY: number;
  jogadorSize: number;
  footerX: number;
  footerY: number;
  footerSize: number;
  pieChartX: number;
  pieChartY: number;
  pieChartSize: number;
  pieChartLegendX: number;
  pieChartLegendY: number;
  pieChartLegendSize: number;
}

// Configurações iniciais
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
    placarX: 92,
    placarY: -75,
    placarSize: 600,
    jogadorX: 484,
    jogadorY: 100,
    jogadorSize: 950,
    footerX: 198,
    footerY: 980,
    footerSize: 1,
    pieChartX: 215,
    pieChartY: 325,
    pieChartSize: 355,
    pieChartLegendX: 195,
    pieChartLegendY: 760,
    pieChartLegendSize: 1.7500000000000007,
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
    placarX: 40,
    placarY: 117,
    placarSize: 785,
    jogadorX: 505,
    jogadorY: 407,
    jogadorSize: 950,
    footerX: 190,
    footerY: 1445,
    footerSize: 1.4500000000000004,
    pieChartX: 230,
    pieChartY: 615,
    pieChartSize: 415,
    pieChartLegendX: 195,
    pieChartLegendY: 1165,
    pieChartLegendSize: 2.000000000000001,
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
    placarX: 850,
    placarY: -40,
    placarSize: 450,
    jogadorX: 175,
    jogadorY: 100,
    jogadorSize: 950,
    footerX: 30,
    footerY: 1005,
    footerSize: 1,
    pieChartX: 960,
    pieChartY: 600,
    pieChartSize: 280,
    pieChartLegendX: 960,
    pieChartLegendY: 900,
    pieChartLegendSize: 1,
  },
};

export interface ConfrontoData {
  homeWins: number;
  draws: number;
  awayWins: number;
}

const ConfrontoGenerator: React.FC<ConfrontoGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { baseImages } = useImages();
  const [configs, setConfigs] = useState(initialImageGeneratorConfigs);

  const canvasFundoRef = useRef<HTMLCanvasElement>(null);
  const canvasInteracaoRef = useRef<HTMLCanvasElement>(null);
  const canvasFrenteRef = useRef<HTMLCanvasElement>(null);
  const hiddenDisplayRef = useRef<HTMLDivElement>(null); // Ref para o contêiner oculto

  const [renderOrder, setRenderOrder] = useState([
    'background',
    'jogador',
    'placar',
    'grafico',
    'legenda',
    'logo',
    'info',
  ]);
  const [activeElementKey, setActiveElementKey] = useState<string | null>(null);
  const [activeImageType, setActiveImageType] = useState<
    'quadrada' | 'vertical' | 'horizontal'
  >('quadrada');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const matchSelectorRef = useRef<MatchSelectorRef>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [downloadable, setDownloadable] = useState(false);
  const [generatorData, setGeneratorData] = useState<BaseGeneratorData>({
    matchData: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
  });
  const [confrontoData, setConfrontoData] = useState<ConfrontoData>({
    homeWins: 0,
    draws: 0,
    awayWins: 0,
  });

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
      title: 'Dados do Confronto',
      icon: PieChart,
      description: 'Insira o histórico',
    },
    {
      id: 4,
      title: 'Gerar Imagem',
      icon: ImageIcon,
      description: 'Ajuste e gere a imagem',
    },
  ];
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);

  const canAdvanceToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return step1Valid;
      case 3:
        return step2Valid;
      case 4:
        const total =
          confrontoData.homeWins + confrontoData.draws + confrontoData.awayWins;
        return total > 0;
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
    setStep2Valid(!!gameArt && !!featuredPlayer);
  };

  const handleConfrontoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ConfrontoData
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setConfrontoData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
      img.src = src;
    });
  }, []);

  const drawLayer = useCallback(
    async (
      canvasRef: React.RefObject<HTMLCanvasElement>,
      config: ElementConfig,
      elementsToDraw: string[]
    ) => {
      await document.fonts.load('1em Lovers Quarrel');
      await document.fonts.load('900 1em Montserrat');
      await document.fonts.ready;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = config.canvasWidth;
      canvas.height = config.canvasHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const colorHome =
        generatorData.matchData?.homeTeam === 'Liverpool'
          ? '#d32f2f'
          : '#757575';
      const colorDraw = '#1ae9de';
      const colorAway =
        generatorData.matchData?.awayTeam === 'Liverpool'
          ? '#d32f2f'
          : '#757575';

      // Funções auxiliares para gerenciar o estado da sombra
      const applyShadow = (ctx: CanvasRenderingContext2D) => {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'; // Sombra preta com 80% de opacidade
        ctx.shadowOffsetX = 2; // Deslocamento horizontal de 2px
        ctx.shadowOffsetY = 2; // Deslocamento vertical de 2px
        ctx.shadowBlur = 5; // Nível de desfoque de 5px
      };

      const clearShadow = (ctx: CanvasRenderingContext2D) => {
        ctx.shadowColor = 'transparent'; // Cor transparente desativa a sombra
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
      };

      for (const key of elementsToDraw) {
        if (key === 'background') {
          try {
            const imgUrl = baseImages.find(
              (img) =>
                img.type === activeImageType && img.section === 'confronto'
            )?.url;
            if (imgUrl) {
              const bgImg = await loadImage(imgUrl);
              const aspect = bgImg.height / bgImg.width;
              const width = config.backgroundSize;
              const height = width * aspect;
              ctx.drawImage(
                bgImg,
                config.backgroundX,
                config.backgroundY,
                width,
                height
              );
            }
          } catch (e) {
            console.warn(e);
          }
        } else if (key === 'logo') {
          try {
            const logoImg = await loadImage('/caminhantes-clock.png');
            ctx.drawImage(
              logoImg,
              config.logoX,
              config.logoY,
              config.logoSize,
              config.logoSize
            );
          } catch (e) {
            console.error(e);
          }
        } else if (key === 'placar' && generatorData.gameArt) {
          if (hiddenDisplayRef.current) {
            setGenerating(true); // Indicar que a geração está em andamento
            try {
              // Capture o conteúdo do SplitRectangleDisplay como um Blob de imagem PNG
              const dataUrl = await domtoimage.toPng(hiddenDisplayRef.current, {
                quality: 1, // 0 to 1, 1 is best quality
                bgcolor: undefined, // Para manter o fundo transparente, se o container não tiver bg-black
              });

              // Crie uma nova imagem a partir do Data URL
              const splitRectImg = new Image();
              splitRectImg.src = dataUrl;

              // Aguarde o carregamento da imagem
              await new Promise<void>((resolve, reject) => {
                splitRectImg.onload = () => resolve();
                splitRectImg.onerror = (e) => reject(e);
              });

              // Desenhe a imagem capturada no seu canvas principal
              ctx.drawImage(
                splitRectImg,
                config.placarX, // Use as posições X e Y do placar ou crie novas para este elemento
                config.placarY,
                config.placarSize, // Ajuste para a largura do SplitRectangleDisplay (1290px)
                config.placarSize * (720 / 1280) // Mantenha a proporção (altura: 327px)
              );
              setDownloadable(true); // Marcar como baixável após desenhar
            } catch (e) {
              console.error(
                'Erro ao renderizar SplitRectangleDisplay para imagem:',
                e
              );
            } finally {
              setGenerating(false);
            }
          }
        } else if (key === 'jogador' && generatorData.featuredPlayerImageUrl) {
          try {
            const jogadorImg = await loadImage(
              generatorData.featuredPlayerImageUrl
            );
            const aspect = 1062 / 666;
            const width = config.jogadorSize;
            const height = width * aspect;
            ctx.drawImage(
              jogadorImg,
              config.jogadorX,
              config.jogadorY,
              width,
              height
            );
          } catch (e) {
            console.error(e);
          }
        } else if (key === 'grafico') {
          applyShadow(ctx);
          const { homeWins, draws, awayWins } = confrontoData;
          const total = homeWins + draws + awayWins;
          if (total > 0) {
            const chartCanvas = document.createElement('canvas');
            const offscreenChartSize = 500;
            chartCanvas.width = offscreenChartSize;
            chartCanvas.height = offscreenChartSize;
            new Chart(chartCanvas, {
              type: 'pie',
              data: {
                labels: [
                  `Vitórias ${generatorData.matchData?.homeTeam || 'Casa'}`,
                  'Empates',
                  `Vitórias ${
                    generatorData.matchData?.awayTeam || 'Visitante'
                  }`,
                ],
                datasets: [
                  {
                    data: [homeWins, draws, awayWins],
                    backgroundColor: [colorHome, colorDraw, colorAway],
                    borderColor: '#ffffff',
                    borderWidth: 4,
                  },
                ],
              },
              options: {
                animation: { duration: 0 },
                responsive: false,
                plugins: { legend: { display: false } },
              },
            });
            await new Promise((resolve) => setTimeout(resolve, 50));
            ctx.drawImage(
              chartCanvas,
              config.pieChartX,
              config.pieChartY,
              config.pieChartSize,
              config.pieChartSize
            );
          }
          clearShadow(ctx);
        } else if (key === 'legenda') {
          applyShadow(ctx);
          const { homeWins, draws, awayWins } = confrontoData;
          const total = homeWins + draws + awayWins;
          if (total > 0) {
            const scale = config.pieChartLegendSize;
            const fontSize = 20 * scale;
            const boxSize = 18 * scale;
            const lineHeight = 30 * scale;
            const startX = config.pieChartLegendX;
            let currentY = config.pieChartLegendY;

            ctx.font = `600 ${fontSize}px "Funnel Display", sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            const legendItems = [
              {
                label: `Vitórias ${selectedMatch?.teams.home.name}: ${homeWins}`,
                color: colorHome,
              },
              { label: `Empates: ${draws}`, color: colorDraw },
              {
                label: `Vitórias ${selectedMatch?.teams.away.name}: ${awayWins}`,
                color: colorAway,
              },
            ];

            for (const item of legendItems) {
              ctx.fillStyle = item.color;
              ctx.fillRect(startX, currentY - boxSize / 2, boxSize, boxSize);

              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(item.label, startX + boxSize + 10 * scale, currentY);
              currentY += lineHeight;
            }
          }
          clearShadow(ctx);
        } else if (key === 'info' && generatorData.matchData) {
          applyShadow(ctx); // Ativa a sombra para o rodapé

          ctx.fillStyle = '#FFFFFF';
          const infoFontSize = 20; // Usa o tamanho da fonte da config
          ctx.font = `800 ${infoFontSize}px "Funnel Display", sans-serif`;
          ctx.textAlign = 'center'; // Define o alinhamento para o centro para ambas as linhas

          // 1. Desestruturar os dados necessários
          const { stadium, date, referee, competitionRound } =
            generatorData.matchData;

          // 2. Construir a string da primeira linha (COMPETICAO - ARBITRO)
          const line1Parts = [competitionRound.toUpperCase()];
          if (referee) {
            line1Parts.push(`ÁRBITRO: ${referee.toUpperCase()}`);
          }
          const line1Text = line1Parts.join(' - ');

          // 3. Construir a string da segunda linha (ESTADIO - DATA)
          const line2Text = `${stadium.toUpperCase()} - ${date.toUpperCase()}`;

          // 4. Calcular as posições para desenhar
          const centerX = canvas.width / 2; // Coordenada X central é a mesma para ambas as linhas

          // Posição Y da primeira linha, usando a configuração
          const line1Y = config.footerY;

          // Posição Y da segunda linha, com um espaçamento.
          // O espaçamento é baseado no tamanho da fonte para ser proporcional.
          const lineHeight = infoFontSize * 1.4; // 1.4 é um bom multiplicador para espaçamento
          const line2Y = line1Y + lineHeight;

          const adjustY = 25;

          // 5. Desenhar as duas linhas no canvas
          ctx.fillText(line1Text, centerX, line1Y + adjustY);
          ctx.fillText(line2Text, centerX, line2Y + adjustY);

          clearShadow(ctx); // Desliga a sombra após desenhar tudo
        }
      }
    },
    [generatorData, confrontoData, baseImages, activeImageType, loadImage]
  );

  const redrawAllLayers = useCallback(() => {
    if (
      currentStep !== 4 ||
      !canvasFundoRef.current ||
      !canvasInteracaoRef.current ||
      !canvasFrenteRef.current
    )
      return;

    setGenerating(true);
    const config = configs[activeImageType];
    const activeIndex = activeElementKey
      ? renderOrder.indexOf(activeElementKey)
      : -1;

    const behind =
      activeIndex > -1 ? renderOrder.slice(0, activeIndex) : renderOrder;
    const active = activeIndex > -1 ? [renderOrder[activeIndex]] : [];
    const ahead = activeIndex > -1 ? renderOrder.slice(activeIndex + 1) : [];

    Promise.all([
      // @ts-expect-error
      drawLayer(canvasFundoRef, config, behind),
      // @ts-expect-error
      drawLayer(canvasInteracaoRef, config, active),
      // @ts-expect-error
      drawLayer(canvasFrenteRef, config, ahead),
    ]).finally(() => {
      setGenerating(false);
      setDownloadable(true);
    });
  }, [
    currentStep,
    configs,
    activeImageType,
    activeElementKey,
    renderOrder,
    drawLayer,
  ]);

  useEffect(() => {
    redrawAllLayers();
  }, [redrawAllLayers]);

  useEffect(() => {
    if (currentStep !== 4 || !activeElementKey || !canvasInteracaoRef.current)
      return;
    const config = configs[activeImageType];
    // @ts-expect-error
    drawLayer(canvasInteracaoRef, config, [activeElementKey]);
  }, [configs, activeElementKey, activeImageType, currentStep, drawLayer]);

  const downloadImage = () => {
    const finalCanvas = document.createElement('canvas');
    const config = configs[activeImageType];
    finalCanvas.width = config.canvasWidth;
    finalCanvas.height = config.canvasHeight;
    const ctx = finalCanvas.getContext('2d');
    if (
      !ctx ||
      !canvasFundoRef.current ||
      !canvasInteracaoRef.current ||
      !canvasFrenteRef.current
    )
      return;

    ctx.drawImage(canvasFundoRef.current, 0, 0);
    ctx.drawImage(canvasInteracaoRef.current, 0, 0);
    ctx.drawImage(canvasFrenteRef.current, 0, 0);

    const a = document.createElement('a');
    a.href = finalCanvas.toDataURL('image/png');
    a.download = `confronto-${activeImageType}.png`;
    a.click();
  };

  const handleMoveElement = (axis: 'x' | 'y', amount: number) => {
    if (!activeElementKey) return;
    setConfigs((prev) => {
      const keyX = `${activeElementKey}X` as keyof ElementConfig;
      const keyY = `${activeElementKey}Y` as keyof ElementConfig;
      const newConfig = { ...prev[activeImageType] };

      if (axis === 'x' && keyX in newConfig)
        (newConfig[keyX] as number) += amount;
      else if (axis === 'y' && keyY in newConfig)
        (newConfig[keyY] as number) += amount;

      return { ...prev, [activeImageType]: newConfig };
    });
  };

  // FUNÇÃO CORRIGIDA
  const handleResizeElement = (amount: number) => {
    if (!activeElementKey) return;
    setConfigs((prev) => {
      const sizeKey = `${activeElementKey}Size` as keyof ElementConfig;
      const newConfig = { ...prev[activeImageType] };

      if (sizeKey in newConfig) {
        // Elementos de escala (texto, legenda) são mais sensíveis
        if (sizeKey === 'footerSize' || sizeKey === 'pieChartLegendSize') {
          (newConfig[sizeKey] as number) += amount / 100; // Incremento pequeno
        } else {
          // Elementos de imagem (logo, placar, etc.) recebem o incremento direto
          (newConfig[sizeKey] as number) += amount; // Incremento maior
        }
      }

      return { ...prev, [activeImageType]: newConfig };
    });
  };

  const handleStepClick = (stepId: number) => {
    if (canAdvanceToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <SectionHeader
        onBack={onBack}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
        title="Confronto Direto"
      />

      {/* Onde você renderiza o componente para ser capturado */}
      {selectedMatch && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div
            ref={hiddenDisplayRef}
            style={{ width: '1290px', height: '327px' }}
          >
            <SplitRectangleDisplay
              selectedMatch={selectedMatch}
              homeScore={null}
              homePenScore={null}
              awayScore={null}
              awayPenScore={null}
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StepperResponsive
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          canAdvanceToStep={canAdvanceToStep}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {currentStep === 1 && (
            <MatchSelector
              ref={matchSelectorRef}
              onMatchSelected={handleMatchSelect}
              escalacaoData={{
                ...generatorData,
                formation: null,
                selectedPlayers: {},
                reservePlayers: [],
                coach: '',
              }}
              onValidationChange={setStep1Valid}
              translations={translations}
            />
          )}
          {currentStep === 2 && (
            <GameArtSelector
              onArtSelect={handleGameArtSelect}
              escalacaoData={{
                ...generatorData,
                formation: null,
                selectedPlayers: {},
                reservePlayers: [],
                coach: '',
              }}
              setEscalacaoData={(update) => {
                let newState;
                if (typeof update === 'function') {
                  const prevAsEscalacaoData: EscalacaoData = {
                    ...generatorData,
                    formation: null,
                    selectedPlayers: {},
                    reservePlayers: [],
                    coach: '',
                  };
                  newState = update(prevAsEscalacaoData);
                } else {
                  newState = update;
                }
                setGeneratorData((prev) => ({
                  ...prev,
                  gameArt: newState.gameArt,
                  featuredPlayer: newState.featuredPlayer,
                  featuredPlayerImageUrl: newState.featuredPlayerImageUrl,
                }));
                setStep2Valid(!!newState.gameArt && !!newState.featuredPlayer);
              }}
            />
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-display-medium text-center">
                Histórico do Confronto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vitórias {selectedMatch?.teams.home.name}
                  </label>
                  <input
                    type="text"
                    value={confrontoData.homeWins || ''}
                    onChange={(e) => handleConfrontoChange(e, 'homeWins')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Empates
                  </label>
                  <input
                    type="text"
                    value={confrontoData.draws || ''}
                    onChange={(e) => handleConfrontoChange(e, 'draws')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vitórias {selectedMatch?.teams.away.name}
                  </label>
                  <input
                    type="text"
                    value={confrontoData.awayWins || ''}
                    onChange={(e) => handleConfrontoChange(e, 'awayWins')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-sm font-display-medium text-gray-700 mb-2">
                      Editar Imagem:
                    </label>
                    <select
                      value={activeImageType}
                      onChange={(e) =>
                        setActiveImageType(e.target.value as any)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="quadrada">Quadrada</option>
                      <option value="vertical">Vertical</option>
                      {/* <option value="horizontal">Horizontal</option> */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-display-medium text-gray-700 mb-2">
                      Elemento a ser Movido:
                    </label>
                    <select
                      value={activeElementKey ?? ''}
                      onChange={(e) =>
                        setActiveElementKey(e.target.value || null)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Nenhum</option>
                      {renderOrder.map((key) => (
                        <option
                          key={key}
                          value={key}
                          className="capitalize"
                        >
                          {key.replace(/([A-Z])/g, ' $1')}
                        </option>
                      ))}
                    </select>
                  </div>
                  {activeElementKey && (
                    <PositionController
                      elementName={activeElementKey}
                      onMove={handleMoveElement}
                      onResize={handleResizeElement}
                    />
                  )}
                  <div className="mt-4 pt-4 border-t">
                    <LayerManager
                      renderOrder={renderOrder}
                      setRenderOrder={setRenderOrder}
                    />
                  </div>
                </div>
                <div className="relative md:col-span-2 w-full flex justify-center items-center bg-gray-200 rounded-lg p-2">
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: `${
                        (configs[activeImageType].canvasHeight /
                          configs[activeImageType].canvasWidth) *
                        100
                      }%`,
                    }}
                  >
                    {[canvasFundoRef, canvasInteracaoRef, canvasFrenteRef].map(
                      (ref, index) => (
                        <canvas
                          key={index}
                          ref={ref}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: index + 1,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
              {selectedMatch && (
                <PostTextGenerator
                  postType={'confronto'}
                  match={selectedMatch}
                  translations={translations}
                  confrontoData={confrontoData}
                />
              )}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={redrawAllLayers}
                  disabled={generating}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {generating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />{' '}
                      Gerando...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" /> Gerar Imagem
                    </>
                  )}
                </Button>
                {downloadable && (
                  <Button
                    onClick={downloadImage}
                    disabled={generating}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex ${
            currentStep === 1 ? 'justify-end' : 'justify-between'
          } mt-6`}
        >
          {currentStep > 1 && (
            <Button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
            </Button>
          )}
          {currentStep < 4 && (
            <Button
              onClick={handleNextStep}
              disabled={!canAdvanceToStep(currentStep + 1)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfrontoGenerator;
