import {
  GAME_ART_TO_IMAGE_SECTION,
  GameArtType,
  PageArtType,
} from '@/types/generator';
import { CanvasElement, ElementConfig } from './BaseImageGenerator';
import { BaseImage } from '@/types/images';
import { getInfoElementData } from '@/utils/infoContentGenerator';

// Função para converter configurações antigas de canvas para elementos HTML
export const convertCanvasConfigToElements = (
  config: any,
  generatorData: any,
  activeImageType: 'quadrada' | 'vertical' | 'horizontal',
  baseImages: BaseImage[],
  placarImg: string | null,
  pageType: PageArtType
): CanvasElement[] => {
  const elements: CanvasElement[] = [];
  const canvasWidth = config.canvasWidth;
  const canvasHeight = config.canvasHeight;

  const artType = generatorData.artType as GameArtType;
  const infoData = getInfoElementData(
    pageType,
    generatorData,
    config,
    activeImageType
  );

  // Função auxiliar para converter pixels para porcentagem
  const pxToPercent = (px: number, dimension: 'width' | 'height') => {
    const base = dimension === 'width' ? canvasWidth : canvasHeight;
    return (px / base) * 100;
  };
  // Background
  if (
    config.userBackgroundImgX !== undefined &&
    generatorData.userBackgroundImg
  ) {
    elements.push({
      id: 'background',
      type: 'image',
      content: generatorData.userBackgroundImg,
      position: {
        x: pxToPercent(
          config.userBackgroundImgX + config.userBackgroundImgWidth / 2,
          'width'
        ),
        y: pxToPercent(
          config.userBackgroundImgY + config.userBackgroundImgHeight / 2,
          'height'
        ),
      },
      size: {
        width: pxToPercent(config.userBackgroundImgWidth, 'width'),
        height: pxToPercent(config.userBackgroundImgHeight, 'height'),
      },
      zIndex: 0,
      visible: true,
    });
  }

  // Background from DB or Overlay
  if (config.canvasWidth !== undefined && generatorData.artType) {
    const sectionKey = GAME_ART_TO_IMAGE_SECTION[artType];
    const imgUrl = baseImages.find(
      (img) => img.type === activeImageType && img.section === sectionKey
    )?.url;
    if (imgUrl) {
      elements.push({
        id: 'acabamento',
        type: 'image',
        content: imgUrl,
        position: {
          x: pxToPercent(0 + config.canvasWidth / 2, 'width'),
          y: pxToPercent(0 + config.canvasHeight / 2, 'height'),
        },
        size: {
          width: pxToPercent(config.canvasWidth, 'width'),
          height: pxToPercent(config.canvasHeight, 'height'),
        },
        zIndex: 0,
        visible: true,
      });
    }
  }

  // Logo
  if (config.logoX !== undefined) {
    elements.push({
      id: 'logo',
      type: 'image',
      content: '/caminhantes-clock.png',
      position: {
        x: pxToPercent(config.logoX + config.logoSize / 2, 'width'),
        y: pxToPercent(config.logoY + config.logoSize / 2, 'height'),
      },
      size: {
        width: pxToPercent(config.logoSize, 'width'),
        height: pxToPercent(config.logoSize, 'height'),
      },
      zIndex: 10,
      visible: true,
    });
  }

  // Placar/SplitRectangleDisplay
  if (config.placarX !== undefined && placarImg) {
    elements.push({
      id: 'placar',
      type: 'image',
      content: placarImg,
      position: {
        x: pxToPercent(config.placarX + config.placarSize / 2, 'width'),
        y: pxToPercent(
          config.placarY + (config.placarSize * (720 / 1280)) / 2,
          'height'
        ),
      },
      size: {
        width: pxToPercent(config.placarSize, 'width'),
        height: pxToPercent(config.placarSize * (720 / 1280), 'height'),
      },
      zIndex: 5,
      visible: true,
    });
  }

  // Jogador
  if (config.jogadorX !== undefined && generatorData?.goal?.scorerImageUrl) {
    const jogadorAspect = 1062 / 666; // Proporção padrão das imagens de jogador
    const jogadorHeight = config.jogadorSize * jogadorAspect;
    elements.push({
      id: 'jogador',
      type: 'image',
      content: generatorData?.goal?.scorerImageUrl,
      position: {
        x: pxToPercent(config.jogadorX + config.jogadorSize / 2, 'width'),
        y: pxToPercent(config.jogadorY + jogadorHeight / 2, 'height'),
      },
      size: {
        width: pxToPercent(config.jogadorSize, 'width'),
        height: pxToPercent(jogadorHeight, 'height'),
      },
      zIndex: 3,
      visible: true,
    });
  }
  console.log(
    'ATENCAO ATENCAO> ',
    config.substitutionsX !== undefined,
    generatorData.substitutions && generatorData.substitutions.length > 0
  );
  if (
    config.substitutionsX !== undefined &&
    generatorData.substitutions &&
    generatorData.substitutions.length > 0
  ) {
    elements.push({
      id: 'substituicoes',
      type: 'text',
      content: generatorData?.goal?.scorer?.name as string[], // Conteúdo em array
      position: {
        x: pxToPercent(config.motmTextX, 'width'),
        y: pxToPercent(config.motmTextY, 'height'),
      },
      size: {
        width: pxToPercent(config.canvasWidth, 'width'), // Tamanho relativo em %
        height: pxToPercent(config.canvasHeight, 'height'),
      },
      zIndex: 8,
      visible: true,
    });
  }
  if (config.motmTextX !== undefined && generatorData?.goal?.scorer?.name) {
    elements.push({
      id: 'nome',
      type: 'text',
      content: generatorData?.goal?.scorer?.name as string[], // Conteúdo em array
      position: {
        x: pxToPercent(config.motmTextX, 'width'),
        y: pxToPercent(config.motmTextY, 'height'),
      },
      size: {
        width: pxToPercent(config.canvasWidth, 'width'), // Tamanho relativo em %
        height: pxToPercent(config.canvasHeight, 'height'),
      },
      zIndex: 8,
      visible: true,
    });
  }

  if (infoData) {
    elements.push({
      id: 'info',
      type: 'text',
      content: infoData.content as string[], // Conteúdo em array
      position: {
        x: pxToPercent(config.infoX, 'width'),
        y: pxToPercent(config.infoY, 'height'),
      },
      size: {
        width: pxToPercent(config.canvasWidth, 'width'), // Tamanho relativo em %
        height: pxToPercent(config.canvasHeight, 'height'),
      },
      zIndex: 8,
      visible: true,
      style: infoData.style, // Estilos dinâmicos
    });
  }

  // TV Logos (para generators que têm)
  if (config.tvX !== undefined) {
    elements.push({
      id: 'tv',
      type: 'component',
      content: null, // Será preenchido pelo generator específico
      position: {
        x: pxToPercent(config.tvX, 'width'),
        y: pxToPercent(config.tvY, 'height'),
      },
      size: {
        width: 40, // Tamanho relativo
        height: 15,
      },
      zIndex: 9,
      visible: true,
    });
  }

  // MOTM Text (específico do MotmGenerator)
  if (config.motmTextX !== undefined && pageType === 'MOTM') {
    elements.push({
      id: 'motmText',
      type: 'text',
      content: 'MAN OF THE MATCH',
      position: {
        x: pxToPercent(config.motmTextX, 'width'),
        y: pxToPercent(config.motmTextY, 'height'),
      },
      size: {
        width: 50,
        height: 8,
      },
      zIndex: 7,
      visible: true,
      style: {
        fontSize: `${config.motmTextSize || 1}rem`,
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '900',
        textAlign: 'center' as const,
      },
    });
  }

  // Player Number (específico do MotmGenerator)
  if (
    config.playerNumberX !== undefined &&
    (generatorData?.featuredPlayer?.number ||
      generatorData?.goal?.scorer?.number)
  ) {
    const playerNumber =
      generatorData?.featuredPlayer?.number ||
      generatorData?.goal?.scorer?.number;
    elements.push({
      id: 'numero',
      type: 'text',
      content: playerNumber.toString(),
      position: {
        x: pxToPercent(config.playerNumberX, 'width'),
        y: pxToPercent(config.playerNumberY, 'height'),
      },
      size: {
        width: 20,
        height: 15,
      },
      zIndex: 6,
      visible: true,
      style: {
        fontSize: `${(config.playerNumberSize || 1) * 8}rem`,
        color: 'white',
        textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '900',
        textAlign: 'center' as const,
      },
    });
  }

  return elements;
};

// Função para gerar texto de informações da partida
export const generateMatchInfoText = (matchData: any): string => {
  if (!matchData) return '';

  const parts = [];

  if (matchData.stadium || matchData.venue) {
    parts.push(matchData.stadium || matchData.venue);
  }

  if (matchData.date) {
    parts.push(matchData.date);
  }

  if (matchData.competitionRound || matchData.competition) {
    parts.push(matchData.competitionRound || matchData.competition);
  }

  return parts.join(' • ');
};

// Função para criar elemento de TV logos
export const createTvLogosElement = (
  selectedChannelLogos: any[],
  config: any,
  activeImageType: 'quadrada' | 'vertical' | 'horizontal'
): React.ReactNode => {
  if (!selectedChannelLogos || selectedChannelLogos.length === 0) return null;

  const scale = config.tvSize || 1;
  const maxLogosPerRow = activeImageType === 'horizontal' ? 8 : 5;

  return (
    <div
      className="flex flex-wrap gap-2"
      style={{ transform: `scale(${scale})` }}
    >
      {selectedChannelLogos.slice(0, maxLogosPerRow * 2).map((logo, index) => (
        <img
          key={logo.id || index}
          src={logo.logoUrl}
          alt={logo.name}
          className="h-8 w-auto"
          style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}
        />
      ))}
    </div>
  );
};

// Função para obter URL da imagem de fundo baseada no tipo
export const getBackgroundImageUrl = (
  baseImages: any[],
  activeImageType: 'quadrada' | 'vertical' | 'horizontal',
  section: string
): string => {
  const bgImage = baseImages.find(
    (img) => img.type === activeImageType && img.section === section
  );
  return bgImage?.url || '';
};

// Função para criar renderOrder padrão
export const createDefaultRenderOrder = (
  elements: CanvasElement[]
): string[] => {
  // Ordem padrão: background primeiro, logo por último
  const order = [
    'background',
    'acabamento',
    'info',
    'nome',
    'numero',
    'jogador',
    'substituicoes',
    'placar',
    'tv',
    'motmText',
    'logo',
  ];

  // Filtra apenas os elementos que existem
  return order.filter((id) => elements.some((el) => el.id === id));
};

// Função para validar se um generator pode prosseguir para a próxima etapa
export const canAdvanceToStep = (
  step: number,
  generatorData: any,
  selectedMatch?: any
): boolean => {
  switch (step) {
    case 2:
      return !!selectedMatch || !!generatorData.matchData;
    case 3:
      return !!generatorData.gameArt && !!generatorData.featuredPlayer;
    default:
      return true;
  }
};

// Função para criar configuração de elemento baseada no tipo antigo
export const createElementConfigFromLegacy = (
  legacyConfig: any
): ElementConfig => {
  return {
    canvasWidth: legacyConfig.canvasWidth || 1080,
    canvasHeight: legacyConfig.canvasHeight || 1080,
    ...legacyConfig,
  };
};
