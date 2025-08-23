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
import { GroupedChannels } from './NextGameGenerator';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';

interface MatchDayGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

// A interface ElementConfig é a mesma do NextGameGenerator
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
    placarX: 312,
    placarY: 135,
    placarSize: 820,
    jogadorX: -231,
    jogadorY: 90,
    jogadorSize: 950,
    footerX: 1018,
    footerY: 700,
    footerSize: 1.7500000000000007,
    tvX: 3, // Ajuste conforme necessário
    tvY: 885, // Ajuste conforme necessário, abaixo do footer ou em outra área
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
    placarX: 17,
    placarY: 443,
    placarSize: 875,
    jogadorX: 520,
    jogadorY: 407,
    jogadorSize: 950,
    footerX: 160,
    footerY: 1090,
    footerSize: 2.1500000000000004,
    tvX: 5, // Ajuste conforme necessário
    tvY: 1310, // Ajuste conforme necessário
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

const MatchDayGenerator: React.FC<MatchDayGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
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
            // DIFERENÇA AQUI: Usa a section 'matchday'
            const imgUrl = baseImages.find(
              (img) =>
                img.type === activeImageType && img.section === 'matchday'
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
            // console.log(config); // Mantenha para depuração, se quiser
            const scale = config.tvSize;

            // currentY agora é baseado no config.tvY, que o controlador move.
            // O offset de -45 que você tinha antes pode ser um ajuste visual inicial
            // que você pode querer em config.tvY no seu estado inicial, ou manter aqui se for um ajuste fixo.
            let currentY = config.tvY - 45; // Se -45 for um ajuste fixo inicial para o bloco TV

            // --- Configurações para o layout dos logos ---
            const logoOriginalWidth = 350;
            const logoOriginalHeight = 224;

            const logoDisplayHeight = 30 * scale;
            const logoDisplayWidth =
              (logoDisplayHeight / logoOriginalHeight) * logoOriginalWidth;

            const logoSpacing = 15 * scale;
            const lineSpacing = 2 * scale;

            const maxLogosPerRow = activeImageType === 'horizontal' ? 8 : 5;

            // --- Fim das configurações ---

            // REMOVIDO: Título "TRANSMISSÃO:" e suas propriedades de estilo
            // As propriedades de sombra e fonte serão resetadas no final do bloco.

            // Não há mais necessidade de ajustar currentY para o título, já que ele foi removido.
            // currentY continua sendo o ponto de partida para a primeira linha de logos.

            // Agrupa e ordena os logos (essa parte está OK)
            const groupedLogos = selectedChannelLogos.reduce(
              (acc: GroupedChannels, logo: Channel) => {
                if (!acc[logo.type]) {
                  acc[logo.type] = [];
                }
                acc[logo.type].push(logo);
                return acc;
              },
              {} as GroupedChannels
            );
            const sortedChannelTypes = Object.keys(groupedLogos).sort();
            const allSortedLogos: Channel[] = [];
            for (const type of sortedChannelTypes) {
              allSortedLogos.push(
                ...groupedLogos[type].sort((a, b) =>
                  a.name.localeCompare(b.name)
                )
              );
            }

            let logosDrawnInThisLine = 0;
            // Inicialize currentXForLogos com um valor padrão para satisfazer o TypeScript
            let currentXForLogos: number = 0;

            // Loop para desenhar os logos
            for (let i = 0; i < allSortedLogos.length; i++) {
              const logo = allSortedLogos[i];
              try {
                const img = await loadImage(logo.logoUrl!);

                // === Lógica de alinhamento e quebra de linha para os LOGOS ===
                if (logosDrawnInThisLine === 0) {
                  if (activeImageType === 'quadrada') {
                    const remainingLogos = Math.min(
                      maxLogosPerRow,
                      allSortedLogos.length - i
                    );
                    const totalRowWidth =
                      remainingLogos * logoDisplayWidth +
                      (remainingLogos - 1) * logoSpacing;

                    const rightEdgeOffset = 30 * scale; // Margem da direita do canvas
                    currentXForLogos =
                      config.canvasWidth - rightEdgeOffset - totalRowWidth;
                    currentXForLogos += config.tvX; // Adiciona o offset de movimento do usuário
                  } else {
                    const leftEdgeOffset = 75 * scale; // Margem da esquerda
                    currentXForLogos = config.tvX + leftEdgeOffset; // Inicia na posição base + offset
                  }
                } else if (logosDrawnInThisLine >= maxLogosPerRow) {
                  currentY += logoDisplayHeight + lineSpacing;
                  logosDrawnInThisLine = 0;

                  if (activeImageType === 'quadrada') {
                    const remainingLogos = Math.min(
                      maxLogosPerRow,
                      allSortedLogos.length - i
                    );
                    const totalRowWidth =
                      remainingLogos * logoDisplayWidth +
                      (remainingLogos - 1) * logoSpacing;
                    const rightEdgeOffset = 30 * scale;
                    currentXForLogos =
                      config.canvasWidth - rightEdgeOffset - totalRowWidth;
                    currentXForLogos += config.tvX; // Adiciona o offset de movimento do usuário
                  } else {
                    const leftEdgeOffset = 75 * scale;
                    currentXForLogos = config.tvX + leftEdgeOffset;
                  }
                }
                // === Fim da lógica de alinhamento e quebra de linha ===

                ctx.drawImage(
                  img,
                  currentXForLogos, // Usa a nova variável para a posição X dos logos
                  currentY,
                  logoDisplayWidth,
                  logoDisplayHeight
                );

                currentXForLogos += logoDisplayWidth + logoSpacing; // Avança X para o próximo logo
                logosDrawnInThisLine++;
              } catch (e) {
                console.error(
                  `Falha ao carregar logo do canal ${logo.name}:`,
                  e
                );
              }
            }

            // Reset shadow properties
            ctx.shadowColor = 'transparent';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
          }
        } else if (key === 'info' && generatorData.matchData) {
          // Use config.footerX e config.footerY diretamente como base coordinates
          const baseTextX = config.footerX; // ESTE É O VALOR QUE SEU CONTROLADOR MUDA
          const baseTextY = config.footerY; // ESTE É O VALOR QUE SEU CONTROLADOR MUDA

          const scale = config.footerSize; // ESTE É O VALOR QUE SEU CONTROLADOR MUDA

          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowOffsetX = 2 * scale;
          ctx.shadowOffsetY = 2 * scale;
          ctx.shadowBlur = 2 * scale;

          // A fonte deve usar o 'scale' (config.footerSize)
          ctx.font = `800 ${20 * scale}px "Funnel Display", sans-serif`;

          // Definir o alinhamento do texto
          ctx.textAlign = activeImageType === 'quadrada' ? 'right' : 'left';

          // === Lógica de cálculo da coordenada X final para o texto ===
          // Se ctx.textAlign for 'right', o finalX será a margem direita do texto.
          // Se ctx.textAlign for 'left', o finalX será a margem esquerda do texto.
          // O baseTextX (config.footerX) deve representar o ponto de controle do usuário.
          // Se config.footerX já é o ponto de alinhamento desejado (esquerda ou direita),
          // então basta usá-lo diretamente como finalX.
          const finalX = baseTextX; // Usamos baseTextX, que é o config.footerX que o controller atualiza.

          // Desenhe cada linha de texto usando finalX e baseTextY (ajustado para cada linha)
          ctx.fillText(
            `${generatorData.matchData.homeTeam?.toUpperCase()} 🆚 ${generatorData.matchData.awayTeam?.toUpperCase()}`,
            finalX,
            baseTextY
          );
          ctx.fillText(
            generatorData.matchData.stadium.toUpperCase(),
            finalX,
            baseTextY + 25 * scale // Ajuste vertical usando 'scale'
          );
          ctx.fillText(
            generatorData.matchData.date.toUpperCase(),
            finalX,
            baseTextY + 50 * scale
          );
          ctx.fillText(
            generatorData.matchData.competitionRound.toUpperCase(),
            finalX,
            baseTextY + 75 * scale
          );
          ctx.fillText(
            generatorData.matchData.referee !== ''
              ? `ÁRBITRO: ${generatorData.matchData.referee.toUpperCase()}`
              : '',
            finalX,
            baseTextY + 100 * scale
          );
          // Reset das propriedades de sombra
          ctx.shadowColor = 'transparent';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        }
      }
    },
    [generatorData, baseImages, activeImageType, loadImage]
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
    a.download = `matchday-${activeImageType}.png`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <SectionHeader
        onBack={onBack}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
        title="Gerador de Matchday"
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
              awayPenScore={null}
              awayScore={null}
              homePenScore={null}
              homeScore={null}
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
                  postType={'matchday'}
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

export default MatchDayGenerator;
