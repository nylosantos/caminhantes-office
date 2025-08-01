import { useCallback, useEffect, useRef, useState } from 'react';

import domtoimage from 'dom-to-image';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Download,
  Image as ImageIcon,
  Loader,
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
import LayerManager from '../generator/LayerManager';
import PositionController from './PositionController';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';

// Interfaces (sem alterações)
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

export interface EscalacaoConfig {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  imageType: 'quadrada' | 'vertical' | 'horizontal';
  canvasWidth: number;
  canvasHeight: number;
  logoX: number;
  logoY: number;
  logoSize: number;
  placarX: number;
  placarY: number;
  placarSize: number;
  jogadorX: number;
  jogadorY: number;
  jogadorSize: number;
  startYJogadores: number;
  lineHeightJogadores: number;
  playerNumberX: number;
  playerNameX: number;
  playerNumberFontSize?: number;
  playerNameFontSize?: number;
  reserveBlockOffsetY: number;
  reserveBancoX: number;
  reserveNamesX: number;
  reserveBancoFontSize?: number;
  reserveNamesFontSize?: number;
  coachOffsetY: number;
  coachBancoX: number;
  coachNameX: number;
  coachBancoFontSize?: number;
  coachNameFontSize?: number;
  footerY: number;
  stadiumX: number;
  stadiumY: number;
  dateX: number;
  dateY: number;
  competitionX: number;
  competitionY: number;
}

// Constantes de Proporções e Configurações Iniciais (sem alterações)
const proportionPlayerNameNumber = 47 / 28;
const proportionReserveNamesTitle = 24 / 18;
const proportionCoachNameTitle = 31 / 18;

const escalacaoConfigs = {
  quadrada: {
    canvasWidth: 1080,
    canvasHeight: 1080,
    logoX: 921,
    logoY: 31,
    logoSize: 123,
    placarX: 82,
    placarY: -75,
    placarSize: 450,
    jogadorX: 484,
    jogadorY: 100,
    jogadorSize: 950,
    startYJogadores: 229,
    lineHeightJogadores: 54.5,
    playerNumberX: 183,
    playerNameX: 198,
    reserveBlockOffsetY: -30,
    reserveBancoX: 184,
    reserveNamesX: 198,
    coachOffsetY: 0,
    coachBancoX: 184,
    coachNameX: 198,
    footerY: 1005,
    stadiumX: 198,
    stadiumY: 970,
    dateX: 198,
    dateY: 995,
    competitionX: 198,
    competitionY: 1020,
  },
  vertical: {
    canvasWidth: 1080,
    canvasHeight: 1920,
    logoX: 865,
    logoY: 203,
    logoSize: 175,
    placarX: 52,
    placarY: 33,
    placarSize: 690,
    jogadorX: 400,
    jogadorY: 407,
    jogadorSize: 950,
    startYJogadores: 507,
    lineHeightJogadores: 71,
    playerNumberX: 212,
    playerNameX: 230,
    reserveBlockOffsetY: -30,
    reserveBancoX: 212,
    reserveNamesX: 230,
    coachOffsetY: 0,
    coachBancoX: 212,
    coachNameX: 230,
    footerY: 1545,
    stadiumX: 230,
    stadiumY: 1545,
    dateX: 230,
    dateY: 1570,
    competitionX: 230,
    competitionY: 1595,
    playerNumberFontSize: 36,
    playerNameFontSize: 36 * proportionPlayerNameNumber,
    reserveBancoFontSize: 20,
    reserveNamesFontSize: 20 * proportionReserveNamesTitle,
    coachBancoFontSize: 20,
    coachNameFontSize: 20 * proportionCoachNameTitle,
  },
  horizontal: {
    canvasWidth: 1920,
    canvasHeight: 1080,
    logoX: 1761,
    logoY: 31,
    logoSize: 123,
    placarX: 850,
    placarY: -40,
    placarSize: 450,
    jogadorX: 175,
    jogadorY: 100,
    jogadorSize: 950,
    startYJogadores: 260,
    lineHeightJogadores: 54.5,
    playerNumberX: 970,
    playerNameX: 990,
    reserveBlockOffsetY: -30,
    reserveBancoX: 970,
    reserveNamesX: 990,
    coachOffsetY: 0,
    coachBancoX: 970,
    coachNameX: 990,
    footerY: 1005,
    stadiumX: 30,
    stadiumY: 1005,
    dateX: 30,
    dateY: 1030,
    competitionX: 30,
    competitionY: 1055,
  },
};

const EscalacaoGenerator: React.FC<EscalacaoGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { baseImages } = useImages();
  const [configs, setConfigs] = useState(escalacaoConfigs);
  const [activeElementKey, setActiveElementKey] = useState<string | null>(null);
  const [activeImageType, setActiveImageType] = useState<
    'quadrada' | 'vertical' | 'horizontal'
  >('quadrada');

  // NOVO: Estado para a ordem de renderização das camadas
  const [renderOrder, setRenderOrder] = useState([
    'fundo',
    'placar',
    'logo',
    'jogador',
    'titulares',
    'reservas',
    'tecnico',
    'info',
  ]);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // NOVO: Refs para as 3 camadas de canvas
  const canvasFundoRef = useRef<HTMLCanvasElement>(null);
  const canvasInteracaoRef = useRef<HTMLCanvasElement>(null);
  const canvasFrenteRef = useRef<HTMLCanvasElement>(null);
  const hiddenDisplayRef = useRef<HTMLDivElement>(null); // Ref para o contêiner oculto

  const matchSelectorRef = useRef<MatchSelectorRef>(null);

  const colors = { primary: '#ffffff', secondary: '#1ae9de' };

  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [downloadable, setDownloadable] = useState(false);
  const [officialLineUp, setOfficialLineUp] = useState(false);

  const [escalacaoData, setEscalacaoData] = useState<EscalacaoData>({
    matchData: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
    formation: null,
    selectedPlayers: {},
    reservePlayers: [],
    coach: 'Arne Slot',
  });

  const steps = [
    {
      id: 1,
      title: 'Dados da Partida',
      icon: Calendar,
      description: 'Selecione ou preencha os dados da partida',
    },
    {
      id: 2,
      title: 'Arte do Jogo',
      icon: Palette,
      description: 'Selecione a arte do jogo e jogador destaque',
    },
    {
      id: 3,
      title: 'Formação Tática',
      icon: Target,
      description: 'Escolha a formação que será utilizada',
    },
    {
      id: 4,
      title: 'Seleção de Jogadores',
      icon: Users,
      description: 'Selecione os jogadores para cada posição',
    },
    {
      id: 5,
      title: 'Gerar Escalação',
      icon: ImageIcon,
      description: 'Gere a imagem final da escalação',
    },
  ];

  const [step1Valid, setStep1Valid] = useState(false);

  const canAdvanceToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return step1Valid;
      case 3:
        return !!escalacaoData.gameArt && !!escalacaoData.featuredPlayer;
      case 4:
        return !!escalacaoData.formation;
      case 5:
        if (!escalacaoData.formation) return false;
        const allPositionsFilled = escalacaoData.formation.positions.every(
          (pos) => escalacaoData.selectedPlayers[pos.id]
        );
        return !!allPositionsFilled;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (
        matchSelectorRef.current?.submitManualData &&
        !matchSelectorRef.current.canProceed
      ) {
        if (!matchSelectorRef.current.submitManualData()) {
          return;
        }
      }
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

  const handleFormationSelect = (formation: Formation) => {
    setEscalacaoData((prev) => ({ ...prev, formation, selectedPlayers: {} }));
    setCurrentStep(4);
  };

  const handlePlayersChange = (selectedPlayers: SelectedPlayers) => {
    setEscalacaoData((prev) => ({ ...prev, selectedPlayers }));
  };

  const handleReservePlayersChange = (reservePlayers: Player[]) => {
    setEscalacaoData((prev) => ({ ...prev, reservePlayers }));
  };

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // NOVO: Função de desenho genérica e refatorada
  const drawLayer = useCallback(
    async (
      canvasRef: React.RefObject<HTMLCanvasElement>,
      config: EscalacaoConfig,
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

      if (elementsToDraw.length === 0) return;

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

      // Loop principal de desenho
      for (const key of elementsToDraw) {
        // Garante que a sombra esteja desligada antes de qualquer operação
        clearShadow(ctx);

        if (key === 'fundo') {
          try {
            // Você corrigiu a busca, ótimo!
            const imgUrl = baseImages.find(
              (img) =>
                img.section === 'escalacao' && img.type === config.imageType
            )?.url;
            if (!imgUrl)
              throw new Error('Imagem de fundo para escalação não encontrada');
            const bgImg = await loadImage(imgUrl);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          } catch (error) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#dc2626');
            gradient.addColorStop(1, '#991b1b');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
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
          } catch (error) {
            console.warn('Erro ao carregar logo');
          }
        } else if (key === 'placar' && escalacaoData.gameArt) {
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
        } else if (key === 'jogador' && escalacaoData.featuredPlayerImageUrl) {
          try {
            const jogadorImg = await loadImage(
              escalacaoData.featuredPlayerImageUrl
            );
            const jogadorHeight = (config.jogadorSize * 1062) / 666;
            ctx.drawImage(
              jogadorImg,
              config.jogadorX,
              config.jogadorY,
              config.jogadorSize,
              jogadorHeight
            );
          } catch (error) {
            console.warn('Erro ao carregar jogador destaque');
          }
        } else if (key === 'titulares' && escalacaoData.formation) {
          let currentY = config.startYJogadores;
          applyShadow(ctx); // Ativa a sombra para todos os textos dos titulares

          escalacaoData.formation.positions.forEach((position) => {
            const player = escalacaoData.selectedPlayers[position.id];
            if (player) {
              // Desenha o número do jogador
              ctx.fillStyle = colors.secondary;
              const playerNumberSize = config.playerNumberFontSize || 28;
              ctx.font = `800 ${playerNumberSize}px "Funnel Display", sans-serif`;
              ctx.textAlign = 'right';
              ctx.fillText(
                String(player.number),
                config.playerNumberX,
                currentY
              );

              // Desenha o nome do jogador
              ctx.fillStyle = colors.primary;
              const playerNameSize = config.playerNameFontSize || 47;
              ctx.font = `800 ${playerNameSize}px "Funnel Display", sans-serif`;
              ctx.textAlign = 'left';
              ctx.fillText(
                player.name.toUpperCase(),
                config.playerNameX,
                currentY
              );

              currentY += config.lineHeightJogadores;
            }
          });
          clearShadow(ctx); // Desliga a sombra após desenhar os titulares
        } else if (
          key === 'reservas' &&
          escalacaoData.reservePlayers.length > 0
        ) {
          let currentY =
            config.startYJogadores +
            (escalacaoData.formation?.positions.length || 11) *
              config.lineHeightJogadores +
            config.reserveBlockOffsetY;
          const reserveNames = escalacaoData.reservePlayers
            .map((p) => p.name)
            .join(', ');
          const maxWidth =
            config.imageType === 'quadrada'
              ? 300
              : config.imageType === 'vertical'
              ? 400
              : 300;

          // Lógica para quebra de linha (sem alterações)
          const tempReserveFontSize = config.reserveNamesFontSize || 18;
          ctx.font = `${tempReserveFontSize}px "Funnel Display", sans-serif`;
          const words = reserveNames.split(' ');
          let lines: string[] = [];
          let line = '';
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && i > 0) {
              lines.push(line.trim());
              line = words[i] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line.trim());
          const lineHeight = 25;
          const blockHeight = lines.length * lineHeight;

          applyShadow(ctx); // Ativa a sombra para os textos dos reservas

          // Desenha o título "BANCO"
          ctx.fillStyle = colors.secondary;
          const reserveBancoSize = config.reserveBancoFontSize || 18;
          ctx.font = `800 ${reserveBancoSize}px "Funnel Display", sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText(
            'BANCO',
            config.reserveBancoX,
            currentY + blockHeight / 2 + 9 + 15
          );

          // Desenha os nomes dos reservas
          ctx.fillStyle = colors.primary;
          const reserveNamesSize = config.reserveNamesFontSize || 24;
          ctx.font = `800 ${reserveNamesSize}px "Funnel Display", sans-serif`;
          ctx.textAlign = 'left';
          let reservasY = currentY + 15;
          for (const l of lines) {
            ctx.fillText(
              l.toUpperCase(),
              config.reserveNamesX,
              reservasY + lineHeight
            );
            reservasY += lineHeight;
          }
          clearShadow(ctx); // Desliga a sombra
        } else if (key === 'tecnico' && escalacaoData.coach) {
          let currentY =
            config.startYJogadores +
            (escalacaoData.formation?.positions.length || 11) *
              config.lineHeightJogadores +
            config.reserveBlockOffsetY +
            175;

          applyShadow(ctx); // Ativa a sombra para o técnico

          // Desenha o título "TÉCNICO"
          ctx.fillStyle = colors.secondary;
          const coachBancoSize = config.coachBancoFontSize || 18;
          ctx.font = `800 ${coachBancoSize}px "Funnel Display", sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText('TÉCNICO', config.coachBancoX, currentY);

          // Desenha o nome do técnico
          ctx.fillStyle = colors.primary;
          const coachNameSize = config.coachNameFontSize || 31;
          ctx.font = `800 ${coachNameSize}px "Funnel Display", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(
            escalacaoData.coach.toUpperCase(),
            config.coachNameX,
            currentY
          );

          clearShadow(ctx); // Desliga a sombra
        } else if (key === 'info' && escalacaoData.matchData) {
          applyShadow(ctx); // Ativa a sombra para o rodapé

          ctx.fillStyle = colors.primary;
          const infoFontSize = 20; // Usa o tamanho da fonte da config
          ctx.font = `800 ${infoFontSize}px "Funnel Display", sans-serif`;
          ctx.textAlign = config.imageType === 'horizontal' ? 'left' : 'center'; // Define o alinhamento para o centro para ambas as linhas

          // 1. Desestruturar os dados necessários
          const { stadium, date, referee, competitionRound } =
            escalacaoData.matchData;

          // 2. Construir a string da primeira linha (COMPETICAO - ARBITRO)
          const line1Parts = [competitionRound.toUpperCase()];
          if (referee) {
            line1Parts.push(`ÁRBITRO: ${referee.toUpperCase()}`);
          }
          const line1Text = line1Parts.join(' - ');

          // 3. Construir a string da segunda linha (ESTADIO - DATA)
          const line2Text = `${stadium.toUpperCase()} - ${date.toUpperCase()}`;

          // 4. Calcular as posições para desenhar
          const centerX =
            config.imageType === 'horizontal' ? 30 : canvas.width / 2; // Coordenada X central é a mesma para ambas as linhas

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
    [baseImages, escalacaoData, loadImage]
  );

  const redrawAllLayers = useCallback(() => {
    // ADICIONE ESTA VERIFICAÇÃO COMPLETA NO INÍCIO
    if (currentStep !== 5) {
      return;
    }
    setGenerating(true);
    const config = { imageType: activeImageType, ...configs[activeImageType] };
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
    ]).then(() => {
      setGenerating(false);
      setDownloadable(true);
    });
  }, [currentStep, configs, activeImageType, activeElementKey, renderOrder]);

  useEffect(() => {
    redrawAllLayers();
  }, [
    activeElementKey,
    activeImageType,
    escalacaoData,
    renderOrder,
    redrawAllLayers,
  ]);

  useEffect(() => {
    if (currentStep !== 5 || !activeElementKey) return;
    const config = configs[activeImageType];
    const activeElement = [activeElementKey];
    // @ts-expect-error
    drawLayer(canvasInteracaoRef, config, activeElement);
  }, [configs, activeElementKey, activeImageType, currentStep]);

  const downloadEscalacao = () => {
    const finalCanvas = document.createElement('canvas');
    const config = configs[activeImageType];
    finalCanvas.width = config.canvasWidth;
    finalCanvas.height = config.canvasHeight;
    const ctx = finalCanvas.getContext('2d');
    // ADICIONE ESTA VERIFICAÇÃO
    if (
      !ctx ||
      !canvasFundoRef.current ||
      !canvasInteracaoRef.current ||
      !canvasFrenteRef.current
    ) {
      console.error(
        'Download abortado: um ou mais refs de canvas não estão prontos.'
      );
      return;
    }
    ctx.drawImage(canvasFundoRef.current, 0, 0);
    ctx.drawImage(canvasInteracaoRef.current, 0, 0);
    ctx.drawImage(canvasFrenteRef.current, 0, 0);
    const link = document.createElement('a');
    link.download = `escalacao-liverpool-${
      escalacaoData.matchData?.matchDate || 'custom'
    }-${activeImageType}.png`;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
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
        title="Gerador de Escalações"
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
              escalacaoData={escalacaoData}
              onValidationChange={setStep1Valid}
              translations={translations}
            />
          )}
          {currentStep === 2 && (
            <GameArtSelector
              onArtSelect={handleGameArtSelect}
              escalacaoData={escalacaoData}
              setEscalacaoData={setEscalacaoData}
            />
          )}
          {currentStep === 3 && (
            <FormationSelector
              selectedFormation={escalacaoData.formation}
              onFormationSelect={handleFormationSelect}
            />
          )}
          {currentStep === 4 && escalacaoData.formation && (
            <div className="space-y-6">
              <PlayerSelector
                isOfficialLineUp={officialLineUp}
                formation={escalacaoData.formation}
                selectedPlayers={escalacaoData.selectedPlayers}
                onPlayersChange={handlePlayersChange}
                reservePlayers={escalacaoData.reservePlayers}
                onReservePlayersChange={handleReservePlayersChange}
                maxReserves={11}
                onOfficialStatusChange={setOfficialLineUp}
              />
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-display-medium text-gray-700 mb-2">
                  Técnico
                </label>
                <input
                  type="text"
                  value={escalacaoData.coach}
                  onChange={(e) =>
                    setEscalacaoData((prev) => ({
                      ...prev,
                      coach: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display"
                  placeholder="Nome do técnico"
                />
              </div>
            </div>
          )}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-display-bold text-gray-800 mb-2">
                  Gerar Escalação Final
                </h3>
                <p className="text-gray-600 font-display">
                  Ajuste os elementos e a ordem das camadas antes de gerar.
                </p>
              </div>
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
                      <option value="horizontal">Horizontal</option>
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
                      onMove={(axis, amount) =>
                        setConfigs((prev) => {
                          const newConfigs = JSON.parse(JSON.stringify(prev));
                          const key =
                            `${activeElementKey}${axis.toUpperCase()}` as keyof EscalacaoConfig;
                          if (
                            typeof newConfigs[activeImageType][key] === 'number'
                          ) {
                            newConfigs[activeImageType][key] += amount;
                          }
                          return newConfigs;
                        })
                      }
                      onResize={(amount) =>
                        setConfigs((prev) => {
                          const newConfigs = JSON.parse(JSON.stringify(prev));
                          const key =
                            `${activeElementKey}Size` as keyof EscalacaoConfig;
                          if (
                            typeof newConfigs[activeImageType][key] === 'number'
                          ) {
                            newConfigs[activeImageType][key] += amount;
                          }
                          return newConfigs;
                        })
                      }
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
                  postType={'escalacao'}
                  match={selectedMatch}
                  translations={translations}
                  escalacaoOficial={officialLineUp}
                />
              )}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={redrawAllLayers}
                  disabled={generating}
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
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
                    onClick={downloadEscalacao}
                    disabled={generating}
                    variant="outline"
                    className="cursor-pointer font-display-medium"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download PNG
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
          {currentStep !== 1 && (
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              variant="outline"
              className="cursor-pointer font-display-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
            </Button>
          )}
          {currentStep !== 5 && (
            <Button
              onClick={handleNextStep}
              disabled={currentStep === 5 || !canAdvanceToStep(currentStep + 1)}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
            >
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscalacaoGenerator;
