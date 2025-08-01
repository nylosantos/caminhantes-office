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
import { EscalacaoData } from './EscalacaoGenerator';
import LayerManager from '../generator/LayerManager';
import PositionController from './PositionController';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';

interface MotmGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

// Interface para as configurações de cada elemento
interface ElementConfig {
  canvasWidth: number;
  canvasHeight: number;
  backgroundX: number;
  backgroundY: number;
  backgroundSize: number; // Usaremos Size para manter a proporção
  logoX: number;
  logoY: number;
  logoSize: number;
  placarX: number;
  placarY: number;
  placarSize: number;
  jogadorX: number;
  jogadorY: number;
  jogadorSize: number;
  motmTextX: number;
  motmTextY: number;
  motmTextSize: number; // Para controlar o tamanho do bloco de texto
  playerNumberX: number;
  playerNumberY: number;
  playerNumberSize: number; // Para controlar o tamanho do bloco de texto
}

// Configurações iniciais para cada tipo de imagem
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
    logoX: 30,
    logoY: 1393,
    logoSize: 95,
    placarX: 115,
    placarY: 923,
    placarSize: 875,
    jogadorX: 105,
    jogadorY: 300,
    jogadorSize: 1025,
    motmTextX: 540,
    motmTextY: 365,
    motmTextSize: 1,
    playerNumberX: 900,
    playerNumberY: 470,
    playerNumberSize: 1,
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
    jogadorX: 647,
    jogadorY: 100,
    jogadorSize: 900,
    motmTextX: 960,
    motmTextY: 880,
    motmTextSize: 1,
    playerNumberX: 30,
    playerNumberY: 1005,
    playerNumberSize: 1,
  },
};

const MotmGenerator: React.FC<MotmGeneratorProps> = ({
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
    'logo',
    'nome',
    'numero',
    'jogador',
    'placar',
  ]);
  const [activeElementKey, setActiveElementKey] = useState<string | null>(null);
  const [activeImageType, setActiveImageType] = useState<
    'quadrada' | 'vertical' | 'horizontal'
  >('quadrada');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const matchSelectorRef = useRef<MatchSelectorRef>(null);
  const colors = { primary: '#ffffff', secondary: '#1ae9de' };
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

  const canAdvanceToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return step1Valid;
      case 3:
        return !!generatorData.gameArt && !!generatorData.featuredPlayer;
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
      homeTeam: 'Liverpool',
      awayTeam: 'Adversário',
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

      for (const key of elementsToDraw) {
        if (key === 'background') {
          try {
            const imgUrl = baseImages.find(
              (img) =>
                img.type === activeImageType &&
                img.section === 'man_of_the_match'
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
        } else if (key === 'nome' && generatorData.featuredPlayer) {
          ctx.textAlign = 'center';
          const scale = config.motmTextSize;

          ctx.fillStyle = colors.primary;

          // Shadow properties
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Black shadow, 50% opacity
          ctx.shadowOffsetX = 5 * scale; // Horizontal offset
          ctx.shadowOffsetY = 5 * scale; // Vertical offset
          ctx.shadowBlur = 5 * scale; // Blur radius

          ctx.font = `500 ${300 * scale}px "Lovers Quarrel", sans-serif`;
          ctx.fillText(
            generatorData.featuredPlayer.name,
            config.motmTextX,
            config.motmTextY
          );

          // It's good practice to reset shadow properties if you don't want them
          // to affect subsequent drawings.
          ctx.shadowColor = 'transparent';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        } else if (key === 'numero' && generatorData.featuredPlayer) {
          ctx.textAlign = 'center';
          const scale = config.playerNumberSize;
          ctx.fillStyle = colors.primary;
          // Shadow properties
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)'; // Black shadow, 50% opacity
          ctx.shadowOffsetX = 5 * scale; // Horizontal offset
          ctx.shadowOffsetY = 5 * scale; // Vertical offset
          ctx.shadowBlur = 10 * scale; // Blur radius
          ctx.font = `400 ${80 * scale}px "Lovers Quarrel", sans-serif`;
          ctx.fillText(
            `#${generatorData.featuredPlayer.number.toUpperCase()}`,
            config.playerNumberX,
            config.playerNumberY
          );
          ctx.fillStyle = colors.primary;
        }
      }
    },
    [generatorData, baseImages, colors, activeImageType, loadImage]
  );

  const redrawAllLayers = useCallback(() => {
    if (
      currentStep !== 3 ||
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

    const behindElements =
      activeIndex > -1 ? renderOrder.slice(0, activeIndex) : renderOrder;
    const activeElement = activeIndex > -1 ? [renderOrder[activeIndex]] : [];
    const aheadElements =
      activeIndex > -1 ? renderOrder.slice(activeIndex + 1) : [];

    Promise.all([
      // @ts-expect-error
      drawLayer(canvasFundoRef, config, behindElements),
      // @ts-expect-error
      drawLayer(canvasInteracaoRef, config, activeElement),
      // @ts-expect-error
      drawLayer(canvasFrenteRef, config, aheadElements),
    ])
      .then(() => {
        setGenerating(false);
        setDownloadable(true);
      })
      .catch((error) => {
        console.error('Erro ao desenhar camadas:', error);
        setGenerating(false);
      });
  }, [currentStep, configs, activeImageType, activeElementKey, renderOrder]);

  useEffect(() => {
    redrawAllLayers();
  }, [redrawAllLayers]);

  useEffect(() => {
    if (currentStep !== 3 || !activeElementKey || !canvasInteracaoRef.current)
      return;
    const config = configs[activeImageType];
    const activeElement = [activeElementKey];
    // @ts-expect-error
    drawLayer(canvasInteracaoRef, config, activeElement);
  }, [configs, activeElementKey, activeImageType, currentStep]);

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
    a.download = `motm-${
      generatorData.featuredPlayer?.name || 'jogador'
    }-${activeImageType}.png`;
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

  const handleResizeElement = (amount: number) => {
    if (!activeElementKey) return;
    setConfigs((prev) => {
      const sizeKey = `${activeElementKey}Size` as keyof ElementConfig;
      const newConfig = { ...prev[activeImageType] };

      if (sizeKey in newConfig) {
        // Elementos de escala (texto) são mais sensíveis
        if (sizeKey === 'playerNumberSize' || sizeKey === 'motmTextSize') {
          (newConfig[sizeKey] as number) += amount / 100; // Incremento pequeno
        } else {
          // Elementos de imagem (logo, placar, etc.) recebem o incremento direto
          (newConfig[sizeKey] as number) += amount; // Incremento maior e perceptível
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
        title="Man of The Match"
      />

      {/* Onde você renderiza o componente para ser capturado */}
      {selectedMatch && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div
            ref={hiddenDisplayRef}
            style={{ width: '1290px', height: '327px' }}
          >
            <SplitRectangleDisplay selectedMatch={selectedMatch} />
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
              pastMatches
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
              setEscalacaoData={(update) =>
                setGeneratorData((prev) => {
                  let newState;
                  if (typeof update === 'function') {
                    const prevAsEscalacaoData: EscalacaoData = {
                      ...prev,
                      formation: null,
                      selectedPlayers: {},
                      reservePlayers: [],
                      coach: '',
                    };
                    newState = update(prevAsEscalacaoData);
                  } else {
                    newState = update;
                  }
                  return {
                    ...prev,
                    gameArt: newState.gameArt,
                    featuredPlayer: newState.featuredPlayer,
                    featuredPlayerImageUrl: newState.featuredPlayerImageUrl,
                  };
                })
              }
            />
          )}
          {currentStep === 3 && (
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
                          {key}
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
                  postType={'melhorDaPartida'}
                  match={selectedMatch}
                  translations={translations}
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
          {currentStep < 3 && (
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

export default MotmGenerator;
