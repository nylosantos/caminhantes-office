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
import { Channel } from '@/types/channels';
import { useUser } from '@/contexts';
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
import { EscalacaoData } from './EscalacaoGenerator';
import LayerManager from '../generator/LayerManager';
import PositionController from './PositionController';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';
import SectionHeader from '../layout/SectionHeader';

interface NextGameGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

export interface GroupedChannels {
  [key: string]: Channel[]; // This is an index signature: any string key maps to an array of Channels
}

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
  tvX: number; // NOVO: Posição X para os logos da TV
  tvY: number; // NOVO: Posição Y para os logos da TV
  tvSize: number; // NOVO: Escala/Tamanho para os logos da TV
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
    placarX: -43,
    placarY: 135,
    placarSize: 820,
    jogadorX: 444,
    jogadorY: 90,
    jogadorSize: 950,
    footerX: 63,
    footerY: 745,
    footerSize: 1.7500000000000007,
    tvX: 63, // Ajuste conforme necessário
    tvY: 890, // Ajuste conforme necessário, abaixo do footer ou em outra área
    tvSize: 2.3, // Escala inicial
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
    placarX: -3,
    placarY: 443,
    placarSize: 875,
    jogadorX: 520,
    jogadorY: 407,
    jogadorSize: 950,
    footerX: 160,
    footerY: 1090,
    footerSize: 2.1500000000000004,
    tvX: 160, // Ajuste conforme necessário
    tvY: 1260, // Ajuste conforme necessário
    tvSize: 2.1000000000000005,
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
    tvX: 30, // Ajuste conforme necessário
    tvY: 950, // Ajuste conforme necessário
    tvSize: 0.7, // Pode ser menor para horizontal
  },
};

const NextGameGenerator: React.FC<NextGameGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { currentUserData } = useUser();
  const { baseImages, channelLogos } = useImages();
  const [configs, setConfigs] = useState(initialImageGeneratorConfigs);

  const canvasFundoRef = useRef<HTMLCanvasElement>(null);
  const canvasInteracaoRef = useRef<HTMLCanvasElement>(null);
  const canvasFrenteRef = useRef<HTMLCanvasElement>(null);
  const hiddenDisplayRef = useRef<HTMLDivElement>(null); // Ref para o contêiner oculto

  const [renderOrder, setRenderOrder] = useState([
    'background',
    'jogador',
    'placar',
    'logo',
    'info',
    'tv',
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

  // NEW: Estado para as logos de canal selecionadas
  const [selectedChannelLogos, setSelectedChannelLogos] = useState<Channel[]>(
    []
  );
  // NEW: Estado booleano para indicar se devemos pegar os logos
  const [showChannelLogoSelection, setShowChannelLogoSelection] =
    useState<boolean>(false); // Padrão: false

  // NEW: Função para gerenciar as logos selecionadas
  const handleToggleChannelLogo = (logo: Channel) => {
    setSelectedChannelLogos((prevLogos) => {
      // Se a logo já está selecionada, remove
      if (prevLogos.some((l) => l.id === logo.id)) {
        return prevLogos.filter((l) => l.id !== logo.id);
      } else {
        // Caso contrário, adiciona
        return [...prevLogos, logo];
      }
    });
  };

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
                img.type === activeImageType && img.section === 'proximo_jogo'
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
        } else if (key === 'tv') {
          if (selectedChannelLogos.length > 0) {
            const scale = config.tvSize;
            let currentX = config.tvX;
            let currentY = config.tvY;
            // console.log(config);
            // --- Configurações para o layout dos logos ---
            const logoOriginalWidth = 350;
            const logoOriginalHeight = 224;

            const logoDisplayHeight = 30 * scale; // Ajuste o tamanho visual dos logos aqui
            const logoDisplayWidth =
              (logoDisplayHeight / logoOriginalHeight) * logoOriginalWidth;

            const logoSpacing = 15 * scale; // Espaçamento horizontal entre os logos
            const lineSpacing = 2 * scale; // Espaçamento VERTICAL entre as linhas de logos

            const maxLogosPerRow = activeImageType === 'horizontal' ? 8 : 5; // Ajuste conforme a sua preferência

            // --- Fim das configurações ---

            // Título "TRANSMISSÃO:"
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowOffsetX = 2 * scale;
            ctx.shadowOffsetY = 2 * scale;
            ctx.shadowBlur = 2 * scale;

            // Ajusta a posição Y inicial para os logos.
            currentY += lineSpacing; // Agora currentY aponta para o TOPO da primeira linha de logos

            // Agrupa por tipo e ordena alfabeticamente
            const groupedLogos = selectedChannelLogos.reduce(
              (acc: GroupedChannels, logo: Channel) => {
                if (!acc[logo.type]) {
                  acc[logo.type] = [];
                }
                acc[logo.type].push(logo);
                return acc;
              },
              {} as GroupedChannels
            ); // Explicitly type the initial accumulator as GroupedChannels

            const sortedChannelTypes = Object.keys(groupedLogos).sort();

            // Lista única de todos os logos selecionados e ordenados
            const allSortedLogos: Channel[] = [];
            for (const type of sortedChannelTypes) {
              // No need for @ts-ignore here anymore!
              allSortedLogos.push(
                ...groupedLogos[type].sort((a, b) =>
                  a.name.localeCompare(b.name)
                )
              );
            }

            let logosDrawnInThisLine = 0; // Contador de logos desenhados na linha atual (agora global para todos os tipos)

            for (const logo of allSortedLogos) {
              // Itera sobre a lista ÚNICA e ordenada
              try {
                const img = await loadImage(logo.logoUrl!);

                // Verifica se adicionar o próximo logo excederia o limite por linha
                if (logosDrawnInThisLine >= maxLogosPerRow) {
                  currentX = config.tvX; // Reinicia X na próxima linha
                  currentY += logoDisplayHeight + lineSpacing; // Pula para a próxima linha
                  logosDrawnInThisLine = 0; // Reinicia o contador de logos para a nova linha
                }

                ctx.drawImage(
                  img,
                  currentX,
                  currentY,
                  logoDisplayWidth,
                  logoDisplayHeight
                );
                currentX += logoDisplayWidth + logoSpacing; // Avança X para o próximo logo
                logosDrawnInThisLine++; // Incrementa o contador de logos na linha
              } catch (e) {
                console.error(
                  `Falha ao carregar logo do canal ${logo.name}:`,
                  e
                );
              }
            }

            // Reset shadow properties after drawing text and logos
            ctx.shadowColor = 'transparent';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
          }
        } else if (key === 'info' && generatorData.matchData) {
          const scale = config.footerSize;
          ctx.fillStyle = '#FFFFFF';
          // Shadow properties
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)'; // Black shadow, 50% opacity
          ctx.shadowOffsetX = 2 * scale; // Horizontal offset
          ctx.shadowOffsetY = 2 * scale; // Vertical offset
          ctx.shadowBlur = 2 * scale; // Blur radius
          ctx.font = `800 ${
            20 * config.footerSize
          }px "Funnel Display", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(
            // `${generatorData.matchData.homeTeam?.toUpperCase()} 🆚 ${generatorData.matchData.awayTeam?.toUpperCase()}`,
            `${generatorData.matchData.homeTeam?.toUpperCase()} 🆚 ${generatorData.matchData.awayTeam?.toUpperCase()}`,
            config.footerX,
            config.footerY
          );
          ctx.fillText(
            generatorData.matchData.stadium.toUpperCase(),
            config.footerX,
            config.footerY + 25 * config.footerSize
          );
          // const provisoryDate = '30 de Julho de 2025 às 07:30';
          ctx.fillText(
            generatorData.matchData.date.toUpperCase(),
            // provisoryDate.toUpperCase(),
            config.footerX,
            config.footerY + 50 * config.footerSize
          );
          ctx.fillText(
            generatorData.matchData.competitionRound.toUpperCase(),
            config.footerX,
            config.footerY + 75 * config.footerSize
          );
          ctx.fillText(
            generatorData.matchData.referee !== ''
              ? `ÁRBITRO: ${generatorData.matchData.referee.toUpperCase()}`
              : '',
            config.footerX,
            config.footerY + 100 * config.footerSize
          );
        }
      }
    },
    [
      generatorData,
      baseImages,
      activeImageType,
      loadImage,
      showChannelLogoSelection,
      selectedChannelLogos,
    ] // Added new dependencies
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
    if (currentStep !== 3 || !activeElementKey || !canvasInteracaoRef.current)
      return;
    const config = configs[activeImageType];
    const activeElement = [activeElementKey];
    // @ts-expect-error
    drawLayer(canvasInteracaoRef, config, activeElement);
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
    a.download = `proximo-jogo-${activeImageType}.png`;
    a.click();
  };

  const handleMoveElement = (axis: 'x' | 'y', amount: number) => {
    if (!activeElementKey) return;

    setConfigs((prev) => {
      // Determine a chave base a ser usada no objeto de configuração
      let baseKey = activeElementKey;
      if (activeElementKey === 'info') {
        baseKey = 'footer'; // Mapeia 'info' para 'footer'
      }

      const keyX = `${baseKey}X` as keyof ElementConfig;
      const keyY = `${baseKey}Y` as keyof ElementConfig;
      const newConfig = { ...prev[activeImageType] };

      if (axis === 'x' && keyX in newConfig) {
        (newConfig[keyX] as number) += amount;
      } else if (axis === 'y' && keyY in newConfig) {
        (newConfig[keyY] as number) += amount;
      }

      return { ...prev, [activeImageType]: newConfig };
    });
  };

  const handleResizeElement = (amount: number) => {
    if (!activeElementKey) return;

    setConfigs((prev) => {
      // Determine a chave base a ser usada no objeto de configuração
      let baseKey = activeElementKey;
      if (activeElementKey === 'info') {
        baseKey = 'footer'; // Mapeia 'info' para 'footer'
      }

      const sizeKey = `${baseKey}Size` as keyof ElementConfig;
      const newConfig = { ...prev[activeImageType] };

      if (sizeKey in newConfig) {
        if (sizeKey === 'footerSize') {
          // Incremento pequeno para elementos de texto como o footer
          (newConfig[sizeKey] as number) += amount / 100;
        } else {
          // Incremento maior para outros elementos (geralmente imagens)
          (newConfig[sizeKey] as number) += amount;
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

  const downloadSplitRectanglePng = async () => {
    if (!hiddenDisplayRef.current) return;

    try {
      const dataUrl = await domtoimage.toPng(hiddenDisplayRef.current, {
        quality: 1,
        bgcolor: undefined,
      });

      const link = document.createElement('a');
      link.download = 'placar.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar PNG do SplitRectangleDisplay:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <SectionHeader
        onBack={onBack}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
        title="Gerador de Próximo Jogo"
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
            />
          )}
          {currentStep === 2 && (
            <>
              <GameArtSelector
                onArtSelect={handleGameArtSelect}
                escalacaoData={{
                  ...generatorData,
                  formation: null,
                  selectedPlayers: {},
                  // @ts-ignore
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
                // NEW: Passando props relacionadas às logos de canais
                showChannelLogoSelection={showChannelLogoSelection}
                selectedChannelLogos={selectedChannelLogos}
                setShowChannelLogoSelection={setShowChannelLogoSelection}
                onToggleChannelLogo={handleToggleChannelLogo}
                allChannelLogos={channelLogos} // Passa todas as logos disponíveis
              />
            </>
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
                  postType={'proximoJogo'}
                  match={selectedMatch}
                  translations={translations}
                />
              )}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={redrawAllLayers}
                  disabled={generating}
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
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
                    className="cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                )}
                {currentUserData && currentUserData.role === 'root' && (
                  <Button
                    onClick={downloadSplitRectanglePng}
                    variant="default"
                    className="cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Arte 'Placar' (PNG)
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

export default NextGameGenerator;
