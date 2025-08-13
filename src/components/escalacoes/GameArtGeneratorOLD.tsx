import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import domtoimage from 'dom-to-image';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Download,
  ImageIcon,
  Loader,
  Palette,
  Upload,
} from 'lucide-react';

import { ViewType } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { Match, MatchFormData } from '@/types/matches';
import { RoundTranslationsDocument } from '@/types/translations';
import {
  GameArtGeneratorData,
  GameArtType,
  GAME_ART_TO_IMAGE_SECTION,
  Substitution,
  BaseGeneratorData,
} from '@/types/generator';
import { Player } from '@/types/squad';
import {
  convertToSaoPauloTime,
  formatCompetitionRound,
  formatDateToBrazilian,
} from '@/utils/dateUtils';

import StepperResponsive from '../ui/Stepper';
import PostTextGenerator, { PostType } from './PostTextGenerator';
import SectionHeader from '../layout/SectionHeader';
import LayerManager from '../generator/LayerManager';
import PositionController from './PositionController';
import SplitRectangleDisplay from '../SplitRectangleDisplay';
import MatchSelector, { MatchSelectorRef } from './MatchSelector';
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
    substitutionsX: 100,
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
    substitutionsX: 100,
    substitutionsY: 400,
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
  console.log('🔄 GameArtGenerator: Componente renderizado');

  const { baseImages } = useImages();
  const [configs, setConfigs] = useState(initialImageGeneratorConfigs);

  const canvasFundoRef = useRef<HTMLCanvasElement>(
    null
  ) as React.RefObject<HTMLCanvasElement>;
  const canvasInteracaoRef = useRef<HTMLCanvasElement>(
    null
  ) as React.RefObject<HTMLCanvasElement>;
  const canvasFrenteRef = useRef<HTMLCanvasElement>(
    null
  ) as React.RefObject<HTMLCanvasElement>;
  const hiddenDisplayRef = useRef<HTMLDivElement>(null);

  const [renderOrder, setRenderOrder] = useState([
    'background',
    'acabamento',
    'placar',
    'logo',
    'info',
    'jogador',
    'nome',
    'numero',
    'substituicoes',
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

  // Estado principal do gerador
  const [generatorData, setGeneratorData] = useState<
    BaseGeneratorData & GameArtGeneratorData
  >({
    matchData: null,
    artType: null,
    homeScore: '',
    awayScore: '',
    showPenalties: false,
    homePenaltyScore: '',
    awayPenaltyScore: '',
    userBackgroundImg: null,
    userBackgroundImgAspectRatio: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
  });

  // CONTROLE COMPLETO COM useRef - NENHUMA MUDANÇA CAUSA RE-RENDERIZAÇÃO
  const renderControlRef = useRef({
    isRendering: false,
    hasRendered: false,
    renderCount: 0,
    lastRenderKey: '',
    shouldRender: false,
    renderTimeout: null as NodeJS.Timeout | null,
  });

  // Criar um match customizado estável usando useMemo para evitar recriações desnecessárias
  const customMatch = useMemo(() => {
    console.log('🎯 customMatch: Recriando match customizado');
    if (!selectedMatch) return null;

    return {
      ...selectedMatch,
      goals: {
        home: generatorData.homeScore
          ? parseInt(generatorData.homeScore)
          : selectedMatch.goals?.home || 0,
        away: generatorData.awayScore
          ? parseInt(generatorData.awayScore)
          : selectedMatch.goals?.away || 0,
      },
      score: {
        ...selectedMatch.score,
        penalty: generatorData.showPenalties
          ? {
              home: generatorData.homePenaltyScore
                ? parseInt(generatorData.homePenaltyScore)
                : 0,
              away: generatorData.awayPenaltyScore
                ? parseInt(generatorData.awayPenaltyScore)
                : 0,
            }
          : selectedMatch.score?.penalty,
      },
      fixture: {
        ...selectedMatch.fixture,
        status: {
          ...selectedMatch.fixture.status,
          long:
            generatorData.homeScore || generatorData.awayScore
              ? 'Match Finished'
              : selectedMatch.fixture.status.long,
          short: generatorData.showPenalties
            ? 'PEN'
            : selectedMatch.fixture.status.short,
        },
      },
    };
  }, [
    selectedMatch,
    generatorData.homeScore,
    generatorData.awayScore,
    generatorData.showPenalties,
    generatorData.homePenaltyScore,
    generatorData.awayPenaltyScore,
  ]);

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
          title: 'Fundo',
          icon: Upload,
          description: 'Upload da imagem de fundo',
        },
        {
          id: 6,
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
          title: 'Fundo',
          icon: Upload,
          description: 'Upload da imagem de fundo',
        },
        {
          id: 6,
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
        return !!generatorData.userBackgroundImg;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    console.log('📋 handleNextStep: Avançando para próximo passo');
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
    console.log(
      '⚽ handleMatchSelect: Partida selecionada',
      matchData.teams.home.name,
      'vs',
      matchData.teams.away.name
    );
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
      matchData: formData,
      // Pré-preencher placar se disponível
      homeScore: matchData.goals?.home?.toString() || '',
      awayScore: matchData.goals?.away?.toString() || '',
      showPenalties: !!(
        matchData.score?.penalty?.home !== undefined &&
        matchData.score?.penalty?.away !== undefined
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
    console.log(
      '🖼️ handleUserBackgroundImgSelect: Imagem de fundo selecionada'
    );
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

  // useEffect para ajustar imagem de fundo
  useEffect(() => {
    console.log('📐 useEffect: Ajustando dimensões da imagem de fundo');
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
    console.log(
      '🔄 loadImage: Carregando imagem',
      src.substring(0, 50) + '...'
    );
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log('✅ loadImage: Imagem carregada com sucesso');
        resolve(img);
      };
      img.onerror = () => {
        console.error('❌ loadImage: Falha ao carregar imagem', src);
        reject(new Error(`Falha ao carregar imagem: ${src}`));
      };
      img.src = src;
    });
  }, []);

  const drawLayer = useCallback(
    async (
      canvasRef: React.RefObject<HTMLCanvasElement>,
      config: ElementConfig,
      elementsToDraw: string[]
    ) => {
      const canvasName =
        canvasRef === canvasFundoRef
          ? 'FUNDO'
          : canvasRef === canvasInteracaoRef
          ? 'INTERACAO'
          : 'FRENTE';
      console.log(
        `🎨 drawLayer [${canvasName}]: Iniciando renderização`,
        elementsToDraw
      );

      await document.fonts.load('1em Lovers Quarrel');
      await document.fonts.load('900 1em Montserrat');
      await document.fonts.ready;

      const canvas = canvasRef.current;
      if (!canvas) {
        console.log(`❌ drawLayer [${canvasName}]: Canvas não encontrado`);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.log(`❌ drawLayer [${canvasName}]: Contexto 2D não encontrado`);
        return;
      }

      canvas.width = config.canvasWidth;
      canvas.height = config.canvasHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      console.log(
        `🧹 drawLayer [${canvasName}]: Canvas limpo (${canvas.width}x${canvas.height})`
      );

      for (const key of elementsToDraw) {
        console.log(
          `🔧 drawLayer [${canvasName}]: Renderizando elemento '${key}'`
        );

        if (key === 'background' && generatorData.userBackgroundImg) {
          console.log(`🖼️ drawLayer [${canvasName}]: Renderizando background`);
          try {
            const userBgImg = await loadImage(generatorData.userBackgroundImg);
            ctx.drawImage(
              userBgImg,
              config.userBackgroundImgX,
              config.userBackgroundImgY,
              config.userBackgroundImgWidth,
              config.userBackgroundImgHeight
            );
            console.log(`✅ drawLayer [${canvasName}]: Background renderizado`);
          } catch (e) {
            console.error(
              `❌ drawLayer [${canvasName}]: Erro ao renderizar background`,
              e
            );
          }
        } else if (key === 'acabamento' && generatorData.artType) {
          console.log(
            `🎭 drawLayer [${canvasName}]: Renderizando acabamento para tipo '${generatorData.artType}'`
          );
          try {
            const sectionKey = GAME_ART_TO_IMAGE_SECTION[generatorData.artType];
            const imgUrl = baseImages.find(
              (img) =>
                img.type === activeImageType && img.section === sectionKey
            )?.url;
            if (imgUrl) {
              console.log(
                `🔗 drawLayer [${canvasName}]: URL do acabamento encontrada`,
                imgUrl
              );
              const overlayImg = await loadImage(imgUrl);
              ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
              console.log(
                `✅ drawLayer [${canvasName}]: Acabamento renderizado`
              );
            } else {
              console.log(
                `⚠️ drawLayer [${canvasName}]: URL do acabamento não encontrada para seção '${sectionKey}'`
              );
            }
          } catch (e) {
            console.warn(
              `❌ drawLayer [${canvasName}]: Erro ao renderizar acabamento`,
              e
            );
          }
        } else if (key === 'placar' && hiddenDisplayRef.current) {
          console.log(
            `📊 drawLayer [${canvasName}]: Tentando renderizar placar`
          );

          // CONTROLE RIGOROSO PARA EVITAR LOOPS - usando useRef
          if (renderControlRef.current.isRendering) {
            console.log(
              `⏸️ drawLayer [${canvasName}]: Placar já está sendo renderizado, pulando...`
            );
            continue;
          }

          if (renderControlRef.current.renderCount >= 1) {
            console.log(
              `🚫 drawLayer [${canvasName}]: Limite de tentativas de renderização do placar atingido`
            );
            continue;
          }

          // Marcar como renderizando SEM causar re-renderização
          renderControlRef.current.isRendering = true;
          renderControlRef.current.renderCount += 1;

          console.log(
            `🔄 drawLayer [${canvasName}]: Iniciando renderização do placar (tentativa ${renderControlRef.current.renderCount})`
          );

          try {
            // Aguardar um pequeno delay para garantir que o DOM esteja atualizado
            await new Promise((resolve) => setTimeout(resolve, 500));
            console.log(
              `⏱️ drawLayer [${canvasName}]: Delay concluído, capturando SplitRectangleDisplay`
            );

            const dataUrl = await domtoimage.toPng(hiddenDisplayRef.current, {
              quality: 1,
              bgcolor: undefined,
              style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
              },
            });
            console.log(
              `📸 drawLayer [${canvasName}]: SplitRectangleDisplay capturado como PNG`
            );

            const splitRectImg = new Image();
            splitRectImg.src = dataUrl;

            await new Promise<void>((resolve, reject) => {
              splitRectImg.onload = () => {
                console.log(
                  `✅ drawLayer [${canvasName}]: Imagem do placar carregada`
                );
                resolve();
              };
              splitRectImg.onerror = (e) => {
                console.error(
                  `❌ drawLayer [${canvasName}]: Erro ao carregar imagem do placar`,
                  e
                );
                reject(e);
              };
            });

            ctx.drawImage(
              splitRectImg,
              config.placarX,
              config.placarY,
              config.placarSize,
              config.placarSize * (720 / 1280)
            );
            console.log(
              `✅ drawLayer [${canvasName}]: Placar renderizado no canvas`
            );

            // Marcar como renderizado SEM causar re-renderização
            renderControlRef.current.hasRendered = true;

            // Atualizar estados SEM causar loops
            setTimeout(() => {
              setDownloadable(true);
              setGenerating(false);
            }, 100);
          } catch (e) {
            console.error(
              `❌ drawLayer [${canvasName}]: Erro ao renderizar SplitRectangleDisplay para imagem`,
              e
            );
            setTimeout(() => {
              setGenerating(false);
            }, 100);
          } finally {
            // Liberar o lock SEM causar re-renderização
            renderControlRef.current.isRendering = false;
            console.log(
              `🏁 drawLayer [${canvasName}]: Renderização do placar finalizada`
            );
          }
        } else if (key === 'logo') {
          console.log(`🏷️ drawLayer [${canvasName}]: Renderizando logo`);
          try {
            const logoImg = await loadImage('/caminhantes-clock.png');
            ctx.drawImage(
              logoImg,
              config.logoX,
              config.logoY,
              config.logoSize,
              config.logoSize
            );
            console.log(`✅ drawLayer [${canvasName}]: Logo renderizado`);
          } catch (e) {
            console.error(
              `❌ drawLayer [${canvasName}]: Erro ao renderizar logo`,
              e
            );
          }
        } else if (key === 'info' && generatorData.matchData) {
          console.log(
            `ℹ️ drawLayer [${canvasName}]: Renderizando informações do estádio`
          );
          ctx.fillStyle = colors.primary;
          ctx.font = '800 24px "Funnel Display", Arial, sans-serif';
          ctx.textAlign = 'center';
          const text = `${generatorData.matchData.stadium.toUpperCase()} - ${generatorData.matchData.competitionRound.toUpperCase()}`;
          ctx.fillText(text, config.stadiumTextX, config.stadiumTextY);
          console.log(
            `✅ drawLayer [${canvasName}]: Informações renderizadas: "${text}"`
          );
        } else if (key === 'jogador' && generatorData.goal?.scorerImageUrl) {
          console.log(
            `👤 drawLayer [${canvasName}]: Renderizando imagem do jogador`
          );
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
              `✅ drawLayer [${canvasName}]: Imagem do jogador renderizada`
            );
          } catch (e) {
            console.error(
              `❌ drawLayer [${canvasName}]: Erro ao renderizar imagem do jogador`,
              e
            );
          }
        } else if (key === 'nome' && generatorData.goal?.scorer) {
          console.log(
            `📝 drawLayer [${canvasName}]: Renderizando nome do jogador: ${generatorData.goal.scorer.name}`
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
            `✅ drawLayer [${canvasName}]: Nome do jogador renderizado`
          );
        } else if (key === 'numero' && generatorData.goal?.scorer) {
          console.log(
            `🔢 drawLayer [${canvasName}]: Renderizando número do jogador: #${generatorData.goal.scorer.number}`
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
            `✅ drawLayer [${canvasName}]: Número do jogador renderizado`
          );
        } else if (
          key === 'substituicoes' &&
          generatorData.substitutions &&
          generatorData.substitutions.length > 0
        ) {
          console.log(
            `🔄 drawLayer [${canvasName}]: Renderizando ${generatorData.substitutions.length} substituições`
          );
          // Desenhar substituições
          const subsX = config.substitutionsX || 100;
          const subsY = config.substitutionsY || 200;
          const lineHeight = 60;

          ctx.fillStyle = colors.primary;
          ctx.font = '600 32px "Funnel Display", Arial, sans-serif';
          ctx.textAlign = 'left';

          generatorData.substitutions.forEach((sub, index) => {
            if (sub.playerOut && sub.playerIn) {
              const y = subsY + index * lineHeight;

              // Desenhar seta vermelha (saiu)
              ctx.fillStyle = '#ef4444';
              ctx.fillText('←', subsX, y);

              // Nome do jogador que saiu
              ctx.fillStyle = colors.primary;
              ctx.fillText(
                `${sub.playerOut.name} (#${sub.playerOut.number})`,
                subsX + 40,
                y
              );

              // Desenhar seta verde (entrou)
              ctx.fillStyle = '#22c55e';
              ctx.fillText('→', subsX + 400, y);

              // Nome do jogador que entrou
              ctx.fillStyle = colors.primary;
              ctx.fillText(
                `${sub.playerIn.name} (#${sub.playerIn.number})`,
                subsX + 440,
                y
              );

              console.log(
                `✅ drawLayer [${canvasName}]: Substituição ${
                  index + 1
                } renderizada: ${sub.playerOut.name} → ${sub.playerIn.name}`
              );
            }
          });
        } else {
          console.log(
            `⏭️ drawLayer [${canvasName}]: Elemento '${key}' pulado (condições não atendidas)`
          );
        }
      }

      console.log(`🏁 drawLayer [${canvasName}]: Renderização completa`);
    },
    [generatorData, baseImages, colors, activeImageType, loadImage]
  );

  const redrawAllLayers = useCallback(() => {
    console.log('🔄 redrawAllLayers: Iniciando redesenho de todas as camadas');
    const finalStep = steps[steps.length - 1].id;

    if (currentStep !== finalStep) {
      console.log(
        `⏸️ redrawAllLayers: Não está no passo final (atual: ${currentStep}, final: ${finalStep})`
      );
      return;
    }

    if (
      !canvasFundoRef.current ||
      !canvasInteracaoRef.current ||
      !canvasFrenteRef.current
    ) {
      console.log('❌ redrawAllLayers: Canvas refs não estão disponíveis');
      return;
    }

    // Reset placar rendered state APENAS quando necessário - SEM causar re-renderização
    if (renderControlRef.current.hasRendered) {
      console.log(
        '🔄 redrawAllLayers: Resetando estado do placar para nova renderização'
      );
      renderControlRef.current.isRendering = false;
      renderControlRef.current.hasRendered = false;
      renderControlRef.current.renderCount = 0;
      renderControlRef.current.lastRenderKey = '';
    }

    const config = configs[activeImageType];
    const activeIndex = activeElementKey
      ? renderOrder.indexOf(activeElementKey)
      : -1;

    const behindElements =
      activeIndex > -1 ? renderOrder.slice(0, activeIndex) : renderOrder;
    const activeElement = activeIndex > -1 ? [renderOrder[activeIndex]] : [];
    const aheadElements =
      activeIndex > -1 ? renderOrder.slice(activeIndex + 1) : [];

    console.log('📋 redrawAllLayers: Distribuição de elementos');
    console.log('  - Elementos atrás:', behindElements);
    console.log('  - Elemento ativo:', activeElement);
    console.log('  - Elementos à frente:', aheadElements);

    // Atualizar estados SEM causar loops
    setTimeout(() => {
      setGenerating(true);
    }, 10);

    Promise.all([
      drawLayer(canvasFundoRef, config, behindElements),
      drawLayer(canvasInteracaoRef, config, activeElement),
      drawLayer(canvasFrenteRef, config, aheadElements),
    ])
      .then(() => {
        console.log(
          '✅ redrawAllLayers: Todas as camadas redesenhadas com sucesso'
        );
        // Atualizar estados SEM causar loops
        setTimeout(() => {
          setGenerating(false);
          if (!renderControlRef.current.hasRendered) {
            setDownloadable(true);
          }
        }, 100);
      })
      .catch((error) => {
        console.error('❌ redrawAllLayers: Erro ao desenhar camadas', error);
        setTimeout(() => {
          setGenerating(false);
        }, 100);
      });
  }, [
    currentStep,
    steps,
    configs,
    activeImageType,
    activeElementKey,
    renderOrder,
    drawLayer,
  ]);

  // useEffect ÚNICO E CONTROLADO - SEM DEPENDÊNCIAS CIRCULARES
  useEffect(() => {
    console.log('🔄 useEffect[MASTER]: Disparado');
    const finalStep = steps[steps.length - 1].id;

    if (currentStep !== finalStep) {
      console.log('⏸️ useEffect[MASTER]: Não está no passo final, pulando');
      return;
    }

    // Debounce longo para evitar chamadas excessivas
    if (renderControlRef.current.renderTimeout) {
      clearTimeout(renderControlRef.current.renderTimeout);
    }

    renderControlRef.current.renderTimeout = setTimeout(() => {
      console.log(
        '⏰ useEffect[MASTER]: Timeout executado, chamando redrawAllLayers'
      );
      redrawAllLayers();
    }, 1000); // 1 segundo de debounce

    return () => {
      console.log('🧹 useEffect[MASTER]: Limpando timeout');
      if (renderControlRef.current.renderTimeout) {
        clearTimeout(renderControlRef.current.renderTimeout);
        renderControlRef.current.renderTimeout = null;
      }
    };
  }, [
    currentStep,
    steps.length,
    generatorData.userBackgroundImg,
    generatorData.artType,
  ]);

  const downloadImage = () => {
    console.log('💾 downloadImage: Iniciando download da imagem');
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
    ) {
      console.error('❌ downloadImage: Canvas ou contexto não disponível');
      return;
    }

    ctx.drawImage(canvasFundoRef.current, 0, 0);
    ctx.drawImage(canvasInteracaoRef.current, 0, 0);
    ctx.drawImage(canvasFrenteRef.current, 0, 0);

    const a = document.createElement('a');
    a.href = finalCanvas.toDataURL('image/png');
    const artTypeLabel = generatorData.artType
      ? generatorData.artType.toLowerCase().replace(/_/g, '-')
      : 'arte';
    a.download = `${activeImageType}_${artTypeLabel}.png`;
    a.click();
    console.log('✅ downloadImage: Download iniciado');
  };

  const handleMoveElement = (axis: 'x' | 'y', amount: number) => {
    console.log(
      `🔧 handleMoveElement: Movendo elemento '${activeElementKey}' no eixo ${axis} por ${amount}px`
    );
    if (!activeElementKey) return;
    setConfigs((prev) => {
      const keyX =
        activeElementKey === 'background'
          ? 'userBackgroundImgX'
          : (`${activeElementKey}X` as keyof ElementConfig);
      const keyY =
        activeElementKey === 'background'
          ? 'userBackgroundImgY'
          : (`${activeElementKey}Y` as keyof ElementConfig);

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
    console.log(
      `📏 handleResizeElement: Redimensionando elemento '${activeElementKey}' por ${amount}px`
    );
    if (!activeElementKey) return;
    setConfigs((prev) => {
      const sizeKey = `${activeElementKey}Size` as keyof ElementConfig;
      const widthKey = `${activeElementKey}Width` as keyof ElementConfig;
      const heightKey = `${activeElementKey}Height` as keyof ElementConfig;

      const newConfig = { ...prev[activeImageType] };

      if (activeElementKey === 'background') {
        if (widthKey in newConfig && heightKey in newConfig) {
          const currentWidth = newConfig[widthKey] as number;
          const currentHeight = newConfig[heightKey] as number;
          const aspectRatio = currentWidth / currentHeight;

          const newHeight = Math.max(100, currentHeight + amount);
          const newWidth = newHeight * aspectRatio;

          (newConfig[widthKey] as number) = newWidth;
          (newConfig[heightKey] as number) = newHeight;

          const centerX = (newConfig.canvasWidth - newWidth) / 2;
          const centerY = (newConfig.canvasHeight - newHeight) / 2;
          newConfig.userBackgroundImgX = centerX;
          newConfig.userBackgroundImgY = centerY;
        }
      } else if (sizeKey in newConfig) {
        (newConfig[sizeKey] as number) = Math.max(
          10,
          (newConfig[sizeKey] as number) + amount
        );
      }

      return { ...prev, [activeImageType]: newConfig };
    });
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-100">
      <SectionHeader
        setCurrentView={setCurrentView}
        setIsMenuOpen={setIsMenuOpen}
        title="Artes do Jogo"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <h1 className="text-2xl font-display-bold text-gray-800">
                Gerador de Artes do Jogo
              </h1>
              <div className="w-20"></div>
            </div>

            <StepperResponsive
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              canAdvanceToStep={canAdvanceToStep}
            />
          </div>

          <div className="p-6">
            {currentStep === 1 && (
              <MatchSelector
                ref={matchSelectorRef}
                escalacaoData={{
                  ...generatorData,
                  formation: null,
                  selectedPlayers: {},
                  reservePlayers: [],
                  coach: '',
                }}
                onMatchSelected={handleMatchSelect}
                onValidationChange={setStep1Valid}
                translations={translations}
                pastMatches
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

            {((currentStep === 4 &&
              generatorData.artType &&
              generatorData.artType !== 'GOL' &&
              generatorData.artType !== 'SUBSTITUICAO') ||
              (currentStep === 5 &&
                (generatorData.artType === 'GOL' ||
                  generatorData.artType === 'SUBSTITUICAO'))) && (
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
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
                        onMove={handleMoveElement}
                        onResize={handleResizeElement}
                        elementName={activeElementKey}
                      />
                    )}
                    <LayerManager
                      renderOrder={renderOrder}
                      setRenderOrder={setRenderOrder}
                    />

                    <div className="flex space-x-4">
                      <Button
                        onClick={downloadImage}
                        disabled={!downloadable || generating}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        {generating ? (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        {generating ? 'Gerando...' : 'Baixar Imagem'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasFundoRef}
                        className="absolute inset-0 w-full h-auto"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                      />
                      <canvas
                        ref={canvasInteracaoRef}
                        className="absolute inset-0 w-full h-auto"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                      />
                      <canvas
                        ref={canvasFrenteRef}
                        className="w-full h-auto"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                      />
                    </div>

                    {/* PostTextGenerator com interface correta */}
                    {selectedMatch && (
                      <PostTextGenerator
                        postType={getPostType()}
                        match={customMatch || selectedMatch}
                        translations={translations}
                        playerName={generatorData.goal?.scorer?.name}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hidden SplitRectangleDisplay for rendering */}
            <div
              ref={hiddenDisplayRef}
              className="absolute -left-[9999px] -top-[9999px] pointer-events-none"
              style={{
                width: '1280px',
                height: '720px',
                transform: 'scale(1)',
                transformOrigin: 'top left',
              }}
            >
              {customMatch && (
                <SplitRectangleDisplay selectedMatch={customMatch} />
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={!canAdvanceToStep(currentStep + 1)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {currentStep === finalStep ? 'Finalizar' : 'Próximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameArtGenerator;
