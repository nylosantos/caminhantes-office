// src/utils/konva-utils.ts

import {
  CanvasElement,
  ElementType,
  ImageFormat,
  GeneratorType,
  GeneratorData,
  CanvasExportResult,
  LoadImageResult,
  CANVAS_DIMENSIONS,
  ELEMENT_Z_INDEX
} from '@/types/konva';
import { getGeneratorConfig, getFormatConfig } from '@/config/konva-generators';
import { BaseImage, IMAGE_SECTIONS } from '@/types/images';
import { Match } from '@/types/matches';

// ==================== CRIAÇÃO DE ELEMENTOS ====================

export function createCanvasElement(
  type: ElementType,
  generatorType: GeneratorType,
  format: ImageFormat,
  data: any,
  customPosition?: { x: number; y: number },
  customSize?: { width: number; height: number }
): CanvasElement {
  const config = getGeneratorConfig(generatorType);
  const formatConfig = getFormatConfig(generatorType, format);

  if (!config || !formatConfig) {
    throw new Error(`Configuration not found for generator ${generatorType} and format ${format}`);
  }

  const elementConfig = formatConfig.elements[type];
  if (!elementConfig) {
    throw new Error(`Element configuration not found for type ${type}`);
  }

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    position: customPosition || elementConfig.defaultPosition,
    size: customSize || elementConfig.defaultSize,
    zIndex: ELEMENT_Z_INDEX[type] || 10,
    visible: true,
    locked: false,
    selected: false,
    data
  };
}

// ==================== CONVERSÃO DE DADOS ====================

export function convertGeneratorDataToElements(
  generatorType: GeneratorType,
  format: ImageFormat,
  generatorData: GeneratorData,
  matchData: Match,
  baseImages: BaseImage[]
): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const config = getGeneratorConfig(generatorType);

  if (!config) return elements;

  // Background
  const backgroundImage = getBackgroundImage(config.section, format, baseImages);

  if (backgroundImage) {
    elements.push(createCanvasElement('background', generatorType, format, {
      imageUrl: backgroundImage.url,
      section: config.section,
      aspectRatio: CANVAS_DIMENSIONS[format].width / CANVAS_DIMENSIONS[format].height
    }));
  }

  // Logo (sempre presente)
  elements.push(createCanvasElement('logo', generatorType, format, {
    imageUrl: '/caminhantes-clock.png', // Logo padrão
    size: 123 // Tamanho padrão
  }));

  // Elementos específicos por tipo de gerador
  switch (generatorType) {
    case 'escalacao':
      addEscalacaoElements(elements, generatorType, matchData, format, generatorData as any);
      break;
    case 'matchday':
    case 'nextgame':
      addMatchDayElements(elements, generatorType, format, generatorData as any);
      break;
    case 'motm':
      addMotmElements(elements, generatorType, format, generatorData as any);
      break;
    case 'fulltime':
      addFullTimeElements(elements, generatorType, format, generatorData as any);
      break;
    case 'confronto':
      addConfrontoElements(elements, generatorType, format, generatorData as any);
      break;
    case 'gameart':
      addGameArtElements(elements, generatorType, format, generatorData as any);
      break;
  }

  return elements.sort((a, b) => a.zIndex - b.zIndex);
}

function addEscalacaoElements(
  elements: CanvasElement[],
  generatorType: GeneratorType,
  matchData: Match,
  format: ImageFormat,
  data: any
) {
  // Placar
  if (data.matchData) {
    elements.push(createCanvasElement('placar', generatorType, format, {
      selectedMatch: matchData,
      homeScore: null,
      awayScore: null,
      homePenScore: null,
      awayPenScore: null,
      logoOffset: 0,
      logoFadePercentage: 0
    }));
  }

  // Jogador em destaque
  if (data.featuredPlayer && data.featuredPlayerImageUrl) {
    elements.push(createCanvasElement('jogador', generatorType, format, {
      player: data.featuredPlayer,
      imageUrl: data.featuredPlayerImageUrl,
      aspectRatio: 1062 / 666
    }));
  }

  // Lista de jogadores
  if (data.formation && Object.keys(data.selectedPlayers).length > 0) {
    elements.push(createCanvasElement('lista-jogadores', generatorType, format, {
      formation: data.formation,
      selectedPlayers: data.selectedPlayers,
      reservePlayers: data.reservePlayers || [],
      coach: data.coach || '',
      colors: {
        primary: '#ffffff',
        secondary: '#1ae9de'
      },
      styles: {
        playerNumber: {
          fontFamily: 'Funnel Display',
          fontSize: 28,
          fontWeight: 800,
          color: '#1ae9de',
          textAlign: 'right',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        },
        playerName: {
          fontFamily: 'Funnel Display',
          fontSize: 47,
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'left',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        },
        reserveTitle: {
          fontFamily: 'Funnel Display',
          fontSize: 18,
          fontWeight: 800,
          color: '#1ae9de',
          textAlign: 'right',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        },
        reserveNames: {
          fontFamily: 'Funnel Display',
          fontSize: 24,
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'left',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        },
        coachTitle: {
          fontFamily: 'Funnel Display',
          fontSize: 18,
          fontWeight: 800,
          color: '#1ae9de',
          textAlign: 'right',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        },
        coachName: {
          fontFamily: 'Funnel Display',
          fontSize: 31,
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'left',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        }
      }
    }));
  }

  // Informações da partida
  if (data.matchData) {
    elements.push(createCanvasElement('info-partida', generatorType, format, {
      matchData: data.matchData,
      style: {
        fontFamily: 'Funnel Display',
        fontSize: 20,
        fontWeight: 800,
        color: '#ffffff',
        textAlign: 'center',
        textShadow: {
          color: 'rgba(0, 0, 0, 0.8)',
          offsetX: 2,
          offsetY: 2,
          blur: 5
        }
      },
      layout: 'horizontal',
      showReferee: true
    }));
  }
}

function addMatchDayElements(
  elements: CanvasElement[],
  generatorType: GeneratorType,
  format: ImageFormat,
  data: any
) {
  // Placar
  if (data.matchData) {
    elements.push(createCanvasElement('placar', generatorType, format, {
      selectedMatch: data.matchData,
      homeScore: null,
      awayScore: null,
      homePenScore: null,
      awayPenScore: null,
      logoOffset: 0,
      logoFadePercentage: 0
    }));
  }

  // Jogador em destaque
  if (data.featuredPlayer && data.featuredPlayerImageUrl) {
    elements.push(createCanvasElement('jogador', generatorType, format, {
      player: data.featuredPlayer,
      imageUrl: data.featuredPlayerImageUrl,
      aspectRatio: 1062 / 666
    }));
  }

  // Canais de TV
  if (data.selectedChannels && data.selectedChannels.length > 0) {
    elements.push(createCanvasElement('canais-tv', generatorType, format, {
      channels: data.selectedChannels,
      maxLogosPerRow: 4,
      logoSize: {
        width: 80,
        height: 60
      },
      spacing: {
        logo: 20,
        line: 15
      },
      alignment: 'left'
    }));
  }

  // Informações da partida
  if (data.matchData) {
    elements.push(createCanvasElement('info-partida', generatorType, format, {
      matchData: data.matchData,
      style: {
        fontFamily: 'Funnel Display',
        fontSize: 20,
        fontWeight: 800,
        color: '#ffffff',
        textAlign: 'center',
        textShadow: {
          color: 'rgba(0, 0, 0, 0.8)',
          offsetX: 2,
          offsetY: 2,
          blur: 5
        }
      },
      layout: 'horizontal',
      showReferee: true
    }));
  }
}

function addMotmElements(
  elements: CanvasElement[],
  generatorType: GeneratorType,
  format: ImageFormat,
  data: any
) {
  // Placar
  if (data.matchData) {
    elements.push(createCanvasElement('placar', generatorType, format, {
      selectedMatch: data.matchData,
      homeScore: null,
      awayScore: null,
      homePenScore: null,
      awayPenScore: null,
      logoOffset: 0,
      logoFadePercentage: 0
    }));
  }

  // Jogador em destaque
  if (data.featuredPlayer && data.featuredPlayerImageUrl) {
    elements.push(createCanvasElement('jogador', generatorType, format, {
      player: data.featuredPlayer,
      imageUrl: data.featuredPlayerImageUrl,
      aspectRatio: 1062 / 666
    }));

    // Texto do jogador (nome e número)
    elements.push(createCanvasElement('texto-jogador', generatorType, format, {
      player: data.featuredPlayer,
      showName: true,
      showNumber: true,
      nameStyle: {
        fontFamily: 'Lovers Quarrel',
        fontSize: 300,
        fontWeight: 500,
        color: '#ffffff',
        textAlign: 'center',
        textShadow: {
          color: 'rgba(0, 0, 0, 0.5)',
          offsetX: 5,
          offsetY: 5,
          blur: 5
        }
      },
      numberStyle: {
        fontFamily: 'Lovers Quarrel',
        fontSize: 80,
        fontWeight: 400,
        color: '#ffffff',
        textAlign: 'center',
        textShadow: {
          color: 'rgba(0, 0, 0, 0.75)',
          offsetX: 5,
          offsetY: 5,
          blur: 10
        }
      }
    }));
  }

  // Informações da partida
  if (data.matchData) {
    elements.push(createCanvasElement('info-partida', generatorType, format, {
      matchData: data.matchData,
      style: {
        fontFamily: 'Funnel Display',
        fontSize: 20,
        fontWeight: 800,
        color: '#ffffff',
        textAlign: 'center',
        textShadow: {
          color: 'rgba(0, 0, 0, 0.8)',
          offsetX: 2,
          offsetY: 2,
          blur: 5
        }
      },
      layout: 'horizontal',
      showReferee: true
    }));
  }
}

function addFullTimeElements(
  elements: CanvasElement[],
  generatorType: GeneratorType,
  format: ImageFormat,
  data: any
) {
  // Similar ao MOTM, mas com background do usuário se disponível
  if (data.userUploadedImageUrl) {
    elements.push(createCanvasElement('background-usuario', generatorType, format, {
      imageUrl: data.userUploadedImageUrl,
      aspectRatio: data.userUploadedImageAspectRatio || (16 / 9)
    }));
  }

  addMotmElements(elements, generatorType, format, data);
}

function addConfrontoElements(
  elements: CanvasElement[],
  generatorType: GeneratorType,
  format: ImageFormat,
  data: any
) {
  // Elementos base do matchday
  addMatchDayElements(elements, generatorType, format, data);

  // Gráfico de confrontos
  if (data.matchData && (data.homeWins || data.draws || data.awayWins)) {
    elements.push(createCanvasElement('grafico', generatorType, format, {
      homeWins: data.homeWins || 0,
      draws: data.draws || 0,
      awayWins: data.awayWins || 0,
      homeTeamName: data.matchData.homeTeam?.name || 'Casa',
      awayTeamName: data.matchData.awayTeam?.name || 'Visitante',
      colors: {
        home: '#1ae9de',
        draw: '#6b7280',
        away: '#ef4444'
      }
    }));
  }
}

function addGameArtElements(
  elements: CanvasElement[],
  generatorType: GeneratorType,
  format: ImageFormat,
  data: any
) {
  // Background do usuário se disponível
  if (data.userBackgroundImg) {
    elements.push(createCanvasElement('background-usuario', generatorType, format, {
      imageUrl: data.userBackgroundImg,
      aspectRatio: data.userBackgroundImgAspectRatio || (16 / 9)
    }));
  }

  // Placar com scores
  if (data.matchData) {
    elements.push(createCanvasElement('placar', generatorType, format, {
      selectedMatch: data.matchData,
      homeScore: parseInt(data.homeScore) || null,
      awayScore: parseInt(data.awayScore) || null,
      homePenScore: data.showPenalties ? (parseInt(data.homePenaltyScore) || null) : null,
      awayPenScore: data.showPenalties ? (parseInt(data.awayPenaltyScore) || null) : null,
      logoOffset: 0,
      logoFadePercentage: 0
    }));
  }

  // Jogador do gol se disponível
  if (data.goal?.scorer && data.goal?.scorerImageUrl) {
    elements.push(createCanvasElement('jogador', generatorType, format, {
      player: data.goal.scorer,
      imageUrl: data.goal.scorerImageUrl,
      aspectRatio: 1062 / 666
    }));
  }

  // Substituições se disponível
  if (data.substitutions && data.substitutions.length > 0) {
    elements.push(createCanvasElement('substituicoes', generatorType, format, {
      substitutions: data.substitutions,
      styles: {
        playerOut: {
          fontFamily: 'Funnel Display',
          fontSize: 24,
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'center',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        },
        playerIn: {
          fontFamily: 'Funnel Display',
          fontSize: 24,
          fontWeight: 800,
          color: '#1ae9de',
          textAlign: 'center',
          textShadow: {
            color: 'rgba(0, 0, 0, 0.8)',
            offsetX: 2,
            offsetY: 2,
            blur: 5
          }
        },
        arrow: {
          fontFamily: 'Arial',
          fontSize: 20,
          fontWeight: 400,
          color: '#ffffff',
          textAlign: 'center'
        }
      },
      maxWidth: 400
    }));
  }
}

// ==================== UTILITÁRIOS DE IMAGEM ====================

function getBackgroundImage(section: IMAGE_SECTIONS, format: ImageFormat, baseImages: BaseImage[]): BaseImage | null {
  return baseImages.find(img =>
    img.section === section &&
    img.type === format
  ) || null;
}

export async function loadImageFromUrl(url: string): Promise<LoadImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve({
        image: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
}

// ==================== EXPORTAÇÃO ====================

// export async function exportCanvasAsImage(
//   stage: any,
//   imageFormat: ImageFormat,
//   format: 'png' | 'jpeg' = 'png',
//   quality: number = 1,
//   scale: number = 1
// ): Promise<CanvasExportResult> {
//   if (!stage) {
//     throw new Error('Stage is required for export');
//   }
//   console.log('e esse stage? ', stage.width(), stage.height())
//   const dataUrl = stage.toDataURL({
//     mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
//     quality,
//     pixelRatio: scale
//   });

//   const imageWidth = CANVAS_DIMENSIONS[imageFormat].width
//   const imageHeight = CANVAS_DIMENSIONS[imageFormat].height

//   return {
//     dataUrl,
//     width: imageWidth,
//     height: imageHeight,
//     format
//   };
// }
// A sua função original que faz a exportação
export async function exportCanvasAsImage(
  stage: any,
  imageFormat: ImageFormat,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1,
  scale: number = 1
): Promise<CanvasExportResult> {
  if (!stage) {
    throw new Error('Stage is required for export');
  }

  // Obtenha as dimensões originais do seu canvas
  const originalWidth = CANVAS_DIMENSIONS[imageFormat].width;
  const originalHeight = CANVAS_DIMENSIONS[imageFormat].height;

  // 1. Guarde os valores atuais
  const originalStageScaleX = stage.scaleX();
  const originalStageScaleY = stage.scaleY();
  const originalStageWidth = stage.width();
  const originalStageHeight = stage.height();

  // 2. Defina temporariamente as novas dimensões e escala
  // Konva.js recalcula as posições dos elementos automaticamente com a nova escala,
  // mas é mais seguro definir a escala para 1 para garantir o tamanho exato da imagem.
  stage.width(originalWidth);
  stage.height(originalHeight);
  stage.scale({ x: 1, y: 1 });

  // 3. Exporte a imagem com as dimensões originais
  const dataUrl = stage.toDataURL({
    mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
    quality,
    pixelRatio: scale, // Usa o pixelRatio para gerar uma imagem de alta resolução
  });

  // 4. Restaure os valores originais
  stage.width(originalStageWidth);
  stage.height(originalStageHeight);
  stage.scale({ x: originalStageScaleX, y: originalStageScaleY });

  return {
    dataUrl,
    width: originalWidth,
    height: originalHeight,
    format,
  };
}

// ==================== VALIDAÇÃO ====================

export function validateElement(element: CanvasElement): boolean {
  if (!element.id || !element.type) return false;
  if (!element.position || typeof element.position.x !== 'number' || typeof element.position.y !== 'number') return false;
  if (!element.size || typeof element.size.width !== 'number' || typeof element.size.height !== 'number') return false;
  if (typeof element.zIndex !== 'number') return false;
  if (typeof element.visible !== 'boolean') return false;
  if (typeof element.locked !== 'boolean') return false;

  return true;
}

export function validateElements(elements: CanvasElement[]): boolean {
  return elements.every(validateElement);
}

// ==================== MANIPULAÇÃO DE ELEMENTOS ====================

export function duplicateElement(element: CanvasElement, offset: { x: number; y: number } = { x: 20, y: 20 }): CanvasElement {
  return {
    ...element,
    id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    position: {
      x: element.position.x + offset.x,
      y: element.position.y + offset.y
    },
    selected: false
  };
}

export function alignElements(elements: CanvasElement[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): CanvasElement[] {
  if (elements.length < 2) return elements;

  const bounds = {
    left: Math.min(...elements.map(el => el.position.x)),
    right: Math.max(...elements.map(el => el.position.x + el.size.width)),
    top: Math.min(...elements.map(el => el.position.y)),
    bottom: Math.max(...elements.map(el => el.position.y + el.size.height))
  };

  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;

  return elements.map(element => {
    let newPosition = { ...element.position };

    switch (alignment) {
      case 'left':
        newPosition.x = bounds.left;
        break;
      case 'center':
        newPosition.x = centerX - element.size.width / 2;
        break;
      case 'right':
        newPosition.x = bounds.right - element.size.width;
        break;
      case 'top':
        newPosition.y = bounds.top;
        break;
      case 'middle':
        newPosition.y = centerY - element.size.height / 2;
        break;
      case 'bottom':
        newPosition.y = bounds.bottom - element.size.height;
        break;
    }

    return {
      ...element,
      position: newPosition
    };
  });
}

export function distributeElements(elements: CanvasElement[], direction: 'horizontal' | 'vertical'): CanvasElement[] {
  if (elements.length < 3) return elements;

  const sorted = [...elements].sort((a, b) =>
    direction === 'horizontal'
      ? a.position.x - b.position.x
      : a.position.y - b.position.y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalSpace = direction === 'horizontal'
    ? (last.position.x + last.size.width) - first.position.x
    : (last.position.y + last.size.height) - first.position.y;

  const totalElementSize = sorted.reduce((sum, el) =>
    sum + (direction === 'horizontal' ? el.size.width : el.size.height), 0
  );

  const spacing = (totalSpace - totalElementSize) / (sorted.length - 1);

  let currentPos = direction === 'horizontal' ? first.position.x : first.position.y;

  return sorted.map((element, index) => {
    if (index === 0) return element;

    const newPosition = { ...element.position };

    if (direction === 'horizontal') {
      newPosition.x = currentPos;
      currentPos += element.size.width + spacing;
    } else {
      newPosition.y = currentPos;
      currentPos += element.size.height + spacing;
    }

    return {
      ...element,
      position: newPosition
    };
  });
}

