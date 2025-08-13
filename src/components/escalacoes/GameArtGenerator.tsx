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
  // Palette,
  Upload,
} from 'lucide-react';

import { ViewType } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import {
  BaseGeneratorData,
  GAME_ART_TO_IMAGE_SECTION,
  GameArtGeneratorData,
  GameArtType,
  Substitution,
} from '@/types/generator';
import { Match, MatchFormData } from '@/types/matches';
import { RoundTranslationsDocument } from '@/types/translations';
import {
  convertToSaoPauloTime,
  formatCompetitionRound,
  formatDateToBrazilian,
} from '@/utils/dateUtils';

import StepperResponsive from '../ui/Stepper';
// import GameArtSelector from './GameArtSelector';
import PostTextGenerator, { PostType } from './PostTextGenerator';
import SectionHeader from '../layout/SectionHeader';
// import { EscalacaoData } from './EscalacaoGenerator';
import LayerManager from '../generator/LayerManager';
import PositionController from './PositionController';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';
import { useUser } from '@/contexts';
import { Player } from '@/types/squad';
import GameArtTypeSelector from './GameArtTypeSelector';
import ScoreEditor from './ScoreEditor';
import GoalPlayerSelector from './GoalPlayerSelector';
import SubstitutionsManager from './SubstitutionsManager';

interface GameArtGeneratorProps {
  onBack: () => void;
  translations: RoundTranslationsDocument[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  setIsMenuOpen: (open: boolean) => void;
}

interface ElementConfig {
  canvasWidth: number;
  canvasHeight: number;
  logoX: number;
  logoY: number;
  logoSize: number;
  placarX: number;
  placarY: number;
  placarSize: number;
  stadiumTextX: number;
  stadiumTextY: number;
  userBackgroundImgX: number;
  userBackgroundImgY: number;
  userBackgroundImgWidth: number;
  userBackgroundImgHeight: number;
  // Configurações específicas para gols
  jogadorX?: number;
  jogadorY?: number;
  jogadorSize?: number;
  motmTextX?: number;
  motmTextY?: number;
  motmTextSize?: number;
  playerNumberX?: number;
  playerNumberY?: number;
  playerNumberSize?: number;
  // Configurações específicas para substituições
  substitutionsX?: number;
  substitutionsY?: number;
  substitutionsWidth?: number;
  substitutionsHeight?: number;
}

const initialImageGeneratorConfigs: Record<
  'quadrada' | 'vertical' | 'horizontal',
  ElementConfig
> = {
  quadrada: {
    canvasWidth: 1080,
    canvasHeight: 1080,
    logoX: 931,
    logoY: 61,
    logoSize: 123,
    placarX: 80,
    placarY: 565,
    placarSize: 930,
    stadiumTextX: 1080 / 2,
    stadiumTextY: 40,
    userBackgroundImgX: 0,
    userBackgroundImgY: 0,
    userBackgroundImgWidth: 1080,
    userBackgroundImgHeight: 1080,
    // Configurações para gols
    jogadorX: 121,
    jogadorY: 85,
    jogadorSize: 900,
    motmTextX: 540,
    motmTextY: 195,
    motmTextSize: 1,
    playerNumberX: 900,
    playerNumberY: 300,
    playerNumberSize: 1,
    // Configurações para substituições
    substitutionsX: 175,
    substitutionsY: 200,
    substitutionsWidth: 880,
    substitutionsHeight: 400,
  },
  vertical: {
    canvasWidth: 1080,
    canvasHeight: 1920,
    logoX: 865,
    logoY: 203,
    logoSize: 175,
    placarX: 115,
    placarY: 923,
    placarSize: 875,
    stadiumTextX: 1080 / 2,
    stadiumTextY: 185,
    userBackgroundImgX: 0,
    userBackgroundImgY: 0,
    userBackgroundImgWidth: 1080,
    userBackgroundImgHeight: 1920,
    // Configurações para gols
    jogadorX: 105,
    jogadorY: 300,
    jogadorSize: 1025,
    motmTextX: 540,
    motmTextY: 365,
    motmTextSize: 1,
    playerNumberX: 900,
    playerNumberY: 470,
    playerNumberSize: 1,
    // Configurações para substituições
    substitutionsX: 190,
    substitutionsY: 430,
    substitutionsWidth: 880,
    substitutionsHeight: 500,
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
    stadiumTextX: 1920 / 2,
    stadiumTextY: 40,
    userBackgroundImgX: 0,
    userBackgroundImgY: 0,
    userBackgroundImgWidth: 1920,
    userBackgroundImgHeight: 1080,
    // Configurações para gols
    jogadorX: 647,
    jogadorY: 100,
    jogadorSize: 900,
    motmTextX: 960,
    motmTextY: 880,
    motmTextSize: 1,
    playerNumberX: 30,
    playerNumberY: 1005,
    playerNumberSize: 1,
    // Configurações para substituições
    substitutionsX: 200,
    substitutionsY: 200,
    substitutionsWidth: 1520,
    substitutionsHeight: 400,
  },
};

const GameArtGenerator: React.FC<GameArtGeneratorProps> = ({
  onBack,
  translations,
  setCurrentView,
  setIsMenuOpen,
}) => {
  const { currentUserData } = useUser();
  const { baseImages } = useImages();
  const [configs, setConfigs] = useState(initialImageGeneratorConfigs);

  const canvasFundoRef = useRef<HTMLCanvasElement>(null);
  const canvasInteracaoRef = useRef<HTMLCanvasElement>(null);
  const canvasFrenteRef = useRef<HTMLCanvasElement>(null);
  const hiddenDisplayRef = useRef<HTMLDivElement>(null); // Ref para o contêiner oculto

  const [renderOrder, setRenderOrder] = useState([
    'background',
    'acabamento',
    'logo',
    'info',
    'nome',
    'numero',
    'jogador',
    'substituicoes',
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
  const [generatorData, setGeneratorData] = useState<
    BaseGeneratorData &
      GameArtGeneratorData & {
        userBackgroundImg: string | null;
        userBackgroundImgAspectRatio: number | null;
        artType: GameArtType | null;
        homeScore: string;
        awayScore: string;
        showPenalties: boolean;
        homePenaltyScore: string;
        awayPenaltyScore: string;
      }
  >({
    matchData: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
    artType: null,
    homeScore: '',
    awayScore: '',
    showPenalties: false,
    homePenaltyScore: '',
    awayPenaltyScore: '',
    userBackgroundImg: null,
    userBackgroundImgAspectRatio: null,
  });

  // Função para obter os passos dinamicamente baseado no tipo de arte
  const getSteps = () => {
    const baseSteps = [
      {
        id: 1,
        title: 'Dados da Partida',
        icon: Calendar,
        description: 'Selecione a partida',
      },
      {
        id: 2,
        title: 'Tipo de Arte',
        icon: Palette,
        description: 'Escolha o momento do jogo',
      },
    ];

    if (generatorData.artType === 'GOL') {
      return [
        ...baseSteps,
        {
          id: 3,
          title: 'Jogador',
          icon: Palette,
          description: 'Selecione o autor do gol',
        },
        {
          id: 4,
          title: 'Placar',
          icon: Palette,
          description: 'Configure o placar',
        },
        {
          id: 5,
          title: 'Gerar Imagem',
          icon: ImageIcon,
          description: 'Ajuste e gere a imagem',
        },
      ];
    } else if (generatorData.artType === 'SUBSTITUICAO') {
      return [
        ...baseSteps,
        {
          id: 3,
          title: 'Substituições',
          icon: Palette,
          description: 'Configure as substituições',
        },
        {
          id: 4,
          title: 'Placar',
          icon: Palette,
          description: 'Configure o placar',
        },
        {
          id: 5,
          title: 'Gerar Imagem',
          icon: ImageIcon,
          description: 'Ajuste e gere a imagem',
        },
      ];
    } else {
      return [
        ...baseSteps,
        {
          id: 3,
          title: 'Placar',
          icon: Palette,
          description: 'Configure o placar',
        },
        {
          id: 4,
          title: 'Fundo',
          icon: Upload,
          description: 'Upload da imagem de fundo',
        },
        {
          id: 5,
          title: 'Gerar Imagem',
          icon: ImageIcon,
          description: 'Ajuste e gere a imagem',
        },
      ];
    }
  };

  const steps = getSteps();
  const [step1Valid, setStep1Valid] = useState(false);

  const canAdvanceToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return step1Valid;
      case 3:
        return !!generatorData.artType;
      case 4:
        if (generatorData.artType === 'GOL') {
          return !!generatorData.goal?.scorer;
        } else if (generatorData.artType === 'SUBSTITUICAO') {
          return (
            !!generatorData.substitutions &&
            generatorData.substitutions.length > 0
          );
        } else {
          return true; // Para outros tipos, pode avançar direto para o placar
        }
      case 5:
        if (
          generatorData.artType === 'GOL' ||
          generatorData.artType === 'SUBSTITUICAO'
        ) {
          return true; // Placar é opcional
        } else {
          return true; // Para outros tipos, placar é opcional
        }
      case 6:
        if (
          generatorData.artType === 'GOL' ||
          generatorData.artType === 'SUBSTITUICAO'
        ) {
          return true; // Nao precisa de background, é opcional
        } else {
          return !!generatorData.userBackgroundImg; // Background obrigatorio
        }
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
    setGeneratorData((prev) => ({
      ...prev,
      matchData: formData, // Pré-preencher placar se disponível
      homeScore: matchData.goals?.home?.toString() || '',
      awayScore: matchData.goals?.away?.toString() || '',
      showPenalties: !!(
        matchData.score?.penalty?.home != null &&
        matchData.score?.penalty?.away != null
      ),
      homePenaltyScore: matchData.score?.penalty?.home?.toString() || '',
      awayPenaltyScore: matchData.score?.penalty?.away?.toString() || '',
    }));
  };

  const handleArtTypeSelect = (artType: GameArtType) => {
    console.log('🎨 handleArtTypeSelect: Tipo de arte selecionado', artType);
    setGeneratorData((prev) => ({ ...prev, artType }));
    // Reset step-specific data when changing art type
    if (artType !== 'GOL') {
      setGeneratorData((prev) => ({ ...prev, goal: undefined }));
    }
    if (artType !== 'SUBSTITUICAO') {
      setGeneratorData((prev) => ({ ...prev, substitutions: undefined }));
    }
  };

  const handleGoalPlayerSelect = (
    player: Player | null,
    imageUrl: string | null,
    imgIndex: number | null
  ) => {
    console.log('👤 handleGoalPlayerSelect: Jogador selecionado', player?.name);
    setGeneratorData((prev) => ({
      ...prev,
      goal: {
        scorer: player,
        scorerImageUrl: imageUrl,
        scorerImgIndex: imgIndex,
      },
    }));
  };

  const handleSubstitutionsChange = (substitutions: Substitution[]) => {
    console.log(
      '🔄 handleSubstitutionsChange: Substituições alteradas',
      substitutions.length
    );
    setGeneratorData((prev) => ({ ...prev, substitutions }));
  };

  const handleUserBackgroundImgSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        setGeneratorData((prev) => ({
          ...prev,
          userBackgroundImg: reader.result as string,
          userBackgroundImgAspectRatio: img.width / img.height,
        }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (
      !generatorData.userBackgroundImg ||
      !generatorData.userBackgroundImgAspectRatio
    )
      return;

    const aspectRatio = generatorData.userBackgroundImgAspectRatio;
    const currentCanvasConfig = configs[activeImageType];

    let newHeight: number;
    if (activeImageType === 'vertical') {
      newHeight = 1550;
    } else {
      newHeight = currentCanvasConfig.canvasHeight;
    }

    const newWidth = newHeight * aspectRatio;
    const newX = (currentCanvasConfig.canvasWidth - newWidth) / 2;
    const newY = (currentCanvasConfig.canvasHeight - newHeight) / 2;

    setConfigs((prev) => ({
      ...prev,
      [activeImageType]: {
        ...prev[activeImageType],
        userBackgroundImgWidth: newWidth,
        userBackgroundImgHeight: newHeight,
        userBackgroundImgX: newX,
        userBackgroundImgY: newY,
      },
    }));
  }, [
    generatorData.userBackgroundImg,
    generatorData.userBackgroundImgAspectRatio,
    activeImageType,
  ]);

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
        if (key === 'background' && generatorData.userBackgroundImg) {
          try {
            const userBgImg = await loadImage(generatorData.userBackgroundImg);
            ctx.drawImage(
              userBgImg,
              config.userBackgroundImgX,
              config.userBackgroundImgY,
              config.userBackgroundImgWidth,
              config.userBackgroundImgHeight
            );
          } catch (e) {
            console.error(e);
          }
        } else if (key === 'acabamento' && generatorData.artType) {
          try {
            const sectionKey = GAME_ART_TO_IMAGE_SECTION[generatorData.artType];
            const imgUrl = baseImages.find(
              (img) =>
                img.type === activeImageType && img.section === sectionKey
            )?.url;
            if (imgUrl) {
              const overlayImg = await loadImage(imgUrl);
              ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
            }
          } catch (e) {
            console.warn(
              `❌ drawLayer [${generatorData.artType}]: Erro ao renderizar acabamento`,
              e
            );
          }
        } else if (key === 'placar') {
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
        } else if (key === 'info' && generatorData.matchData) {
          ctx.fillStyle = colors.primary;
          ctx.font = '800 24px "Funnel Display", Arial, sans-serif';
          ctx.textAlign = 'center';
          const text = `${generatorData.matchData.stadium.toUpperCase()} - ${generatorData.matchData.competitionRound.toUpperCase()}`;
          ctx.fillText(text, config.stadiumTextX, config.stadiumTextY);
        } else if (key === 'jogador' && generatorData.artType === 'GOL') {
          console.log(
            `👤 drawLayer [${generatorData.goal?.scorerImageUrl}]: Renderizando imagem do jogador`
          );
          if (generatorData.goal?.scorerImageUrl) {
            try {
              const jogadorImg = await loadImage(
                generatorData.goal.scorerImageUrl
              );
              const aspect = 1062 / 666;
              const width = config.jogadorSize || 900;
              const height = width * aspect;
              ctx.drawImage(
                jogadorImg,
                config.jogadorX || 0,
                config.jogadorY || 0,
                width,
                height
              );
              console.log(
                `✅ drawLayer [${generatorData.goal?.scorerImageUrl}]: Imagem do jogador renderizada`
              );
            } catch (e) {
              console.error(
                `❌ drawLayer [${generatorData.goal?.scorerImageUrl}]: Erro ao renderizar imagem do jogador`,
                e
              );
            }
          } else {
            try {
              const jogadorImg = await loadImage(
                'https://i.ibb.co/zHQTjFZ2/Mighty-Red-png.png'
              );
              const aspect = 1062 / 666;
              const width = config.jogadorSize || 900;
              const height = width * aspect;
              ctx.drawImage(
                jogadorImg,
                config.jogadorX || 0,
                config.jogadorY || 0,
                width,
                height
              );
              console.log(
                `✅ drawLayer [${generatorData.goal?.scorerImageUrl}]: Imagem do Mighty Red renderizada`
              );
            } catch (e) {
              console.error(
                `❌ drawLayer [${generatorData.goal?.scorerImageUrl}]: Erro ao renderizar imagem do Mighty Red`,
                e
              );
            }
          }
        } else if (key === 'nome' && generatorData.goal?.scorer) {
          console.log(
            `📝 drawLayer [${generatorData.goal?.scorer.name}]: Renderizando nome do jogador: ${generatorData.goal.scorer.name}`
          );
          ctx.textAlign = 'center';
          const scale = config.motmTextSize || 1;

          ctx.fillStyle = colors.primary;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowOffsetX = 5 * scale;
          ctx.shadowOffsetY = 5 * scale;
          ctx.shadowBlur = 5 * scale;

          ctx.font = `500 ${300 * scale}px "Lovers Quarrel", sans-serif`;
          ctx.fillText(
            generatorData.goal.scorer.name,
            config.motmTextX || 0,
            config.motmTextY || 0
          );

          ctx.shadowColor = 'transparent';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
          console.log(
            `✅ drawLayer [${generatorData.goal?.scorer.name}]: Nome do jogador renderizado`
          );
        } else if (key === 'numero' && generatorData.goal?.scorer) {
          console.log(
            `🔢 drawLayer [${generatorData.goal?.scorer.number}]: Renderizando número do jogador: #${generatorData.goal.scorer.number}`
          );
          ctx.textAlign = 'center';
          const scale = config.playerNumberSize || 1;
          ctx.fillStyle = colors.primary;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowOffsetX = 5 * scale;
          ctx.shadowOffsetY = 5 * scale;
          ctx.shadowBlur = 10 * scale;
          ctx.font = `400 ${80 * scale}px "Lovers Quarrel", sans-serif`;
          ctx.fillText(
            `#${generatorData.goal.scorer.number.toUpperCase()}`,
            config.playerNumberX || 0,
            config.playerNumberY || 0
          );
          console.log(
            `✅ drawLayer [${generatorData.goal?.scorer.number}]: Número do jogador renderizado`
          );
        } else if (
          key === 'substituicoes' &&
          generatorData.substitutions &&
          generatorData.substitutions.length > 0
        ) {
          console.log(
            `🔄 drawLayer [substituições]: Renderizando ${generatorData.substitutions.length} substituições`
          );

          const subsX = config.substitutionsX || 175;
          const subsY = config.substitutionsY || 200;
          const boxTop = subsY;
          const boxHeight = 600; // altura máxima da área
          const enterYOffsetFactor = 1.3; // fator relativo para espaçamento entre linhas

          // Fonte base
          const baseFontSize = 44;
          let fontSize = baseFontSize;

          // Altura de linha baseada na fonte
          let lineHeight = fontSize * 4.5; // ajuste conforme a sua tipografia
          let enterYOffset = fontSize * enterYOffsetFactor;

          // Ajustar fonte se não couber
          const totalHeight = generatorData.substitutions.length * lineHeight;
          if (totalHeight > boxHeight) {
            const scaleFactor = boxHeight / totalHeight;
            fontSize *= scaleFactor;
            lineHeight *= scaleFactor;
            enterYOffset *= scaleFactor;
          }

          // Calcula altura final do bloco e ponto inicial centralizado
          const blockHeight =
            generatorData.substitutions.length * lineHeight -
            (lineHeight - enterYOffset);
          const startY = boxTop + (boxHeight - blockHeight) / 2;

          ctx.font = `600 ${fontSize}px "Funnel Display", Arial, sans-serif`;
          ctx.textAlign = 'left';

          generatorData.substitutions.forEach((sub, index) => {
            if (sub.playerOut && sub.playerIn) {
              const y = startY + index * lineHeight;

              // Seta vermelha (saiu)
              ctx.fillStyle = '#ef4444';
              ctx.fillText('←', subsX, y);

              // Nome do jogador que saiu
              ctx.fillStyle = colors.primary;
              ctx.fillText(
                `${sub.playerOut.name} (#${sub.playerOut.number})`,
                subsX + fontSize * 2.3,
                y
              );

              // Seta verde (entrou)
              ctx.fillStyle = '#22c55e';
              ctx.fillText('→', subsX, y + enterYOffset);

              // Nome do jogador que entrou
              ctx.fillStyle = colors.primary;
              ctx.fillText(
                `${sub.playerIn.name} (#${sub.playerIn.number})`,
                subsX + fontSize * 2.3,
                y + enterYOffset
              );
            }
          });

          // Caixa para debug visual
          // ctx.strokeStyle = 'rgb(255, 251, 0)';
          // ctx.strokeRect(subsX - 50, boxTop, 800, boxHeight);
        }
      }
    },
    [generatorData, baseImages, colors.primary, activeImageType, loadImage]
  );

  const redrawAllLayers = useCallback(() => {
    if (
      currentStep !== finalStep ||
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
    if (currentStep !== 3 || !activeElementKey || !canvasInteracaoRef?.current)
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
    a.download = `${activeImageType}_placar_final.png`;
    a.click();
  };

  // FUNÇÕES CORRIGIDAS
  const handleMoveElement = (axis: 'x' | 'y', amount: number) => {
    if (!activeElementKey) return;

    setConfigs((prev) => {
      let nomeElement: string;
      if (activeElementKey === 'nome') {
        nomeElement = 'motmText';
      } else if (activeElementKey === 'numero') {
        nomeElement = 'playerNumber';
      } else if (activeElementKey === 'substituicoes') {
        nomeElement = 'substitutions';
      } else {
        nomeElement = activeElementKey;
      }
      // CORREÇÃO: Constrói a chave corretamente para 'background'
      const keyX =
        nomeElement === 'background'
          ? 'userBackgroundImgX'
          : (`${nomeElement}X` as keyof ElementConfig);
      const keyY =
        nomeElement === 'background'
          ? 'userBackgroundImgY'
          : (`${nomeElement}Y` as keyof ElementConfig);

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
      let nomeElement: string;
      if (activeElementKey === 'nome') {
        nomeElement = 'motmText';
      } else if (activeElementKey === 'numero') {
        nomeElement = 'playerNumber';
      } else if (activeElementKey === 'substituicoes') {
        nomeElement = 'substitutions';
      } else {
        nomeElement = activeElementKey;
      }
      // CORREÇÃO: Constrói as chaves corretamente para 'background'
      const sizeKey = `${nomeElement}Size` as keyof ElementConfig;
      const widthKey =
        nomeElement === 'background'
          ? 'userBackgroundImgWidth'
          : (`${nomeElement}Width` as keyof ElementConfig);
      const heightKey =
        nomeElement === 'background'
          ? 'userBackgroundImgHeight'
          : (`${nomeElement}Height` as keyof ElementConfig);

      const newConfig = { ...prev[activeImageType] };
      if (sizeKey in newConfig && typeof newConfig[sizeKey] === 'number') {
        // Elementos de escala (texto) são mais sensíveis
        if (sizeKey === 'playerNumberSize' || sizeKey === 'motmTextSize') {
          (newConfig[sizeKey] as number) += amount / 100; // Incremento pequeno
        } else {
          // Elementos de imagem (logo, placar, etc.) recebem o incremento direto
          (newConfig[sizeKey] as number) += amount; // Incremento maior e perceptível
        }
      } else if (
        widthKey in newConfig &&
        typeof newConfig[widthKey] === 'number'
      ) {
        const aspectRatio =
          (newConfig[heightKey] as number) / (newConfig[widthKey] as number) ||
          1;
        (newConfig[widthKey] as number) += amount;
        (newConfig[heightKey] as number) =
          (newConfig[widthKey] as number) * aspectRatio;
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

  // Função para mapear GameArtType para PostType
  const getPostType = (): PostType => {
    if (!generatorData.artType) return 'fimDeJogo'; // fallback

    switch (generatorData.artType) {
      case 'INICIO_JOGO':
        return 'inicioJogo';
      case 'INTERVALO':
        return 'intervalo';
      case 'INICIO_SEGUNDO_TEMPO':
        return 'inicioSegundoTempo';
      case 'INICIO_PRORROGACAO':
        return 'inicioProrrogacao';
      case 'INICIO_SEGUNDO_TEMPO_PRORROGACAO':
        return 'inicioSegundoTempoProrrogacao';
      case 'FIM_DE_JOGO':
        return 'fimDeJogo';
      case 'GOL':
        return 'gol';
      case 'SUBSTITUICAO':
        return 'substituicao';
      default:
        return 'fimDeJogo';
    }
  };

  const finalStep = steps[steps.length - 1].id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <SectionHeader
        onBack={onBack}
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
        title="Artes do Jogo"
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
              awayPenScore={
                generatorData.awayPenaltyScore === ''
                  ? null
                  : +generatorData.awayPenaltyScore
              }
              awayScore={
                generatorData.awayScore === '' ? null : +generatorData.awayScore
              }
              homePenScore={
                generatorData.homePenaltyScore === ''
                  ? null
                  : +generatorData.homePenaltyScore
              }
              homeScore={
                generatorData.homeScore === '' ? null : +generatorData.homeScore
              }
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
              pastMatches
              includeTheOne
            />
          )}
          {currentStep === 2 && (
            <GameArtTypeSelector
              selectedArtType={generatorData.artType}
              onArtTypeSelect={handleArtTypeSelect}
            />
          )}

          {currentStep === 3 && generatorData.artType === 'GOL' && (
            <GoalPlayerSelector
              selectedPlayer={generatorData.goal?.scorer || null}
              selectedPlayerImageUrl={
                generatorData.goal?.scorerImageUrl || null
              }
              selectedPlayerImgIndex={
                generatorData.goal?.scorerImgIndex || null
              }
              onPlayerSelect={handleGoalPlayerSelect}
            />
          )}

          {currentStep === 3 && generatorData.artType === 'SUBSTITUICAO' && (
            <SubstitutionsManager
              substitutions={generatorData.substitutions || []}
              onSubstitutionsChange={handleSubstitutionsChange}
            />
          )}

          {((currentStep === 3 &&
            generatorData.artType &&
            generatorData.artType !== 'GOL' &&
            generatorData.artType !== 'SUBSTITUICAO') ||
            (currentStep === 4 &&
              (generatorData.artType === 'GOL' ||
                generatorData.artType === 'SUBSTITUICAO'))) && (
            <ScoreEditor
              selectedMatch={selectedMatch}
              homeScore={generatorData.homeScore}
              awayScore={generatorData.awayScore}
              showPenalties={generatorData.showPenalties}
              homePenaltyScore={generatorData.homePenaltyScore}
              awayPenaltyScore={generatorData.awayPenaltyScore}
              onHomeScoreChange={(value) =>
                setGeneratorData((prev) => ({ ...prev, homeScore: value }))
              }
              onAwayScoreChange={(value) =>
                setGeneratorData((prev) => ({ ...prev, awayScore: value }))
              }
              onShowPenaltiesChange={(value) =>
                setGeneratorData((prev) => ({
                  ...prev,
                  showPenalties: value,
                }))
              }
              onHomePenaltyScoreChange={(value) =>
                setGeneratorData((prev) => ({
                  ...prev,
                  homePenaltyScore: value,
                }))
              }
              onAwayPenaltyScoreChange={(value) =>
                setGeneratorData((prev) => ({
                  ...prev,
                  awayPenaltyScore: value,
                }))
              }
            />
          )}

          {currentStep === 4 &&
            generatorData.artType &&
            generatorData.artType !== 'GOL' &&
            generatorData.artType !== 'SUBSTITUICAO' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-display-semibold text-gray-800 mb-2">
                    Imagem de Fundo
                  </h3>
                  <p className="text-sm text-gray-600 font-display">
                    Faça upload da imagem que será usada como fundo
                  </p>
                </div>

                <div className="flex justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUserBackgroundImgSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-display">
                        Clique para selecionar uma imagem
                      </p>
                    </div>
                  </label>
                </div>

                {generatorData.userBackgroundImg && (
                  <div className="text-center">
                    <img
                      src={generatorData.userBackgroundImg}
                      alt="Preview"
                      className="max-w-xs mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-green-600 font-display mt-2">
                      ✓ Imagem carregada com sucesso
                    </p>
                  </div>
                )}
              </div>
            )}
          {currentStep === finalStep && (
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
                  postType={getPostType()}
                  match={selectedMatch}
                  translations={translations}
                  playerName={generatorData.goal?.scorer?.name}
                  substitutions={generatorData.substitutions}
                  homeGoals={generatorData.homeScore}
                  awayGoals={generatorData.awayScore}
                />
              )}
              <div className="flex flex-wrap justify-center space-x-4 gap-2">
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
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
            </Button>
          )}
          {currentStep < finalStep && (
            <Button
              onClick={handleNextStep}
              disabled={!canAdvanceToStep(currentStep + 1)}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameArtGenerator;
