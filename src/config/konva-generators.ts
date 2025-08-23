// src/config/konva-generators.ts

import {
  GeneratorConfig,
  FormatConfig,
  ImageFormat,
  ElementType,
  TextStyle,
  DEFAULT_COLORS,
  CANVAS_DIMENSIONS
} from '@/types/konva';
import { IMAGE_SECTIONS } from '@/types/images';

// ==================== ESTILOS DE TEXTO PADRÃO ====================

const DEFAULT_TEXT_STYLES: Record<string, TextStyle> = {
  playerNumber: {
    fontFamily: 'Funnel Display',
    fontSize: 28,
    fontWeight: 800,
    color: DEFAULT_COLORS.secondary,
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
    color: DEFAULT_COLORS.primary,
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
    color: DEFAULT_COLORS.secondary,
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
    color: DEFAULT_COLORS.primary,
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
    color: DEFAULT_COLORS.secondary,
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
    color: DEFAULT_COLORS.primary,
    textAlign: 'left',
    textShadow: {
      color: 'rgba(0, 0, 0, 0.8)',
      offsetX: 2,
      offsetY: 2,
      blur: 5
    }
  },
  motmPlayerName: {
    fontFamily: 'Lovers Quarrel',
    fontSize: 300,
    fontWeight: 500,
    color: DEFAULT_COLORS.primary,
    textAlign: 'center',
    textShadow: {
      color: 'rgba(0, 0, 0, 0.5)',
      offsetX: 5,
      offsetY: 5,
      blur: 5
    }
  },
  motmPlayerNumber: {
    fontFamily: 'Lovers Quarrel',
    fontSize: 80,
    fontWeight: 400,
    color: DEFAULT_COLORS.primary,
    textAlign: 'center',
    textShadow: {
      color: 'rgba(0, 0, 0, 0.75)',
      offsetX: 5,
      offsetY: 5,
      blur: 10
    }
  },
  infoPartida: {
    fontFamily: 'Funnel Display',
    fontSize: 20,
    fontWeight: 800,
    color: DEFAULT_COLORS.primary,
    textAlign: 'center',
    textShadow: {
      color: 'rgba(0, 0, 0, 0.8)',
      offsetX: 2,
      offsetY: 2,
      blur: 5
    }
  }
};

// ==================== CONFIGURAÇÃO ESCALAÇÃO ====================

const ESCALACAO_CONFIG: GeneratorConfig = {
  type: 'escalacao',
  section: IMAGE_SECTIONS.ESCALACAO,
  supportedFormats: ['quadrada', 'vertical', 'horizontal'],
  requiredElements: ['background', 'logo', 'placar'],
  optionalElements: ['jogador', 'lista-jogadores', 'info-partida'],
  defaultRenderOrder: [
    'background',
    'placar',
    'logo',
    'jogador',
    'lista-jogadores',
    'info-partida'
  ],
  formatConfigs: {
    quadrada: {
      canvasWidth: 1080,
      canvasHeight: 1080,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1080, height: 1080 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 921, y: 31 },
          defaultSize: { width: 123, height: 123 },
          constraints: { lockAspectRatio: true }
        },
        placar: {
          defaultPosition: { x: 82, y: -75 },
          defaultSize: { width: 450, height: 450 * (720 / 1280) },
          constraints: { lockAspectRatio: true }
        },
        jogador: {
          defaultPosition: { x: 484, y: 100 },
          defaultSize: { width: 950, height: 950 * (1062 / 666) },
          constraints: { lockAspectRatio: true }
        },
        'lista-jogadores': {
          defaultPosition: { x: 183, y: 229 },
          defaultSize: { width: 400, height: 600 },
          constraints: { allowResize: false }
        },
        'info-partida': {
          defaultPosition: { x: 198, y: 970 },
          defaultSize: { width: 1080, height: 80 },
          constraints: { allowResize: false }
        },
        'texto-jogador': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'canais-tv': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    },
    vertical: {
      canvasWidth: 1080,
      canvasHeight: 1920,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1080, height: 1920 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 865, y: 203 },
          defaultSize: { width: 175, height: 175 },
          constraints: { lockAspectRatio: true }
        },
        placar: {
          defaultPosition: { x: 52, y: 33 },
          defaultSize: { width: 690, height: 690 * (720 / 1280) },
          constraints: { lockAspectRatio: true }
        },
        jogador: {
          defaultPosition: { x: 400, y: 407 },
          defaultSize: { width: 950, height: 950 * (1062 / 666) },
          constraints: { lockAspectRatio: true }
        },
        'lista-jogadores': {
          defaultPosition: { x: 212, y: 507 },
          defaultSize: { width: 600, height: 800 },
          constraints: { allowResize: false }
        },
        'info-partida': {
          defaultPosition: { x: 230, y: 1545 },
          defaultSize: { width: 800, height: 100 },
          constraints: { allowResize: false }
        },
        'texto-jogador': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'canais-tv': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    },
    horizontal: {
      canvasWidth: 1920,
      canvasHeight: 1080,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1920, height: 1080 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 1761, y: 31 },
          defaultSize: { width: 123, height: 123 },
          constraints: { lockAspectRatio: true }
        },
        placar: {
          defaultPosition: { x: 850, y: -40 },
          defaultSize: { width: 450, height: 450 * (720 / 1280) },
          constraints: { lockAspectRatio: true }
        },
        jogador: {
          defaultPosition: { x: 175, y: 100 },
          defaultSize: { width: 950, height: 950 * (1062 / 666) },
          constraints: { lockAspectRatio: true }
        },
        'lista-jogadores': {
          defaultPosition: { x: 970, y: 260 },
          defaultSize: { width: 400, height: 600 },
          constraints: { allowResize: false }
        },
        'info-partida': {
          defaultPosition: { x: 30, y: 1005 },
          defaultSize: { width: 800, height: 80 },
          constraints: { allowResize: false }
        },
        'texto-jogador': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'canais-tv': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    }
  }
};

// ==================== CONFIGURAÇÃO MATCHDAY ====================

const MATCHDAY_CONFIG: GeneratorConfig = {
  type: 'matchday',
  section: IMAGE_SECTIONS.MATCHDAY,
  supportedFormats: ['quadrada', 'vertical'],
  requiredElements: ['background', 'logo', 'placar'],
  optionalElements: ['jogador', 'canais-tv', 'info-partida'],
  defaultRenderOrder: [
    'background',
    'placar',
    'logo',
    'jogador',
    'canais-tv',
    'info-partida'
  ],
  formatConfigs: {
    quadrada: {
      canvasWidth: 1080,
      canvasHeight: 1080,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1080, height: 1080 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 901, y: 61 },
          defaultSize: { width: 123, height: 123 },
          constraints: { lockAspectRatio: true }
        },
        placar: {
          defaultPosition: { x: 312, y: 135 },
          defaultSize: { width: 820, height: 820 * (720 / 1280) },
          constraints: { lockAspectRatio: true }
        },
        jogador: {
          defaultPosition: { x: -231, y: 90 },
          defaultSize: { width: 950, height: 950 * (1062 / 666) },
          constraints: { lockAspectRatio: true }
        },
        'canais-tv': {
          defaultPosition: { x: 3, y: 885 },
          defaultSize: { width: 1000, height: 150 },
          constraints: { allowResize: false }
        },
        'info-partida': {
          defaultPosition: { x: 1018, y: 700 },
          defaultSize: { width: 800, height: 80 },
          constraints: { allowResize: false }
        },
        'lista-jogadores': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'texto-jogador': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    },
    vertical: {
      canvasWidth: 1080,
      canvasHeight: 1920,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1080, height: 1920 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 901, y: 61 },
          defaultSize: { width: 123, height: 123 },
          constraints: { lockAspectRatio: true }
        },
        placar: {
          defaultPosition: { x: 312, y: 135 },
          defaultSize: { width: 820, height: 820 * (720 / 1280) },
          constraints: { lockAspectRatio: true }
        },
        jogador: {
          defaultPosition: { x: -231, y: 90 },
          defaultSize: { width: 950, height: 950 * (1062 / 666) },
          constraints: { lockAspectRatio: true }
        },
        'canais-tv': {
          defaultPosition: { x: 75, y: 1600 },
          defaultSize: { width: 900, height: 200 },
          constraints: { allowResize: false }
        },
        'info-partida': {
          defaultPosition: { x: 540, y: 1400 },
          defaultSize: { width: 800, height: 80 },
          constraints: { allowResize: false }
        },
        'lista-jogadores': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'texto-jogador': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    },
    horizontal: {
      canvasWidth: 1920,
      canvasHeight: 1080,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1920, height: 1080 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        placar: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        jogador: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'canais-tv': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'info-partida': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'lista-jogadores': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'texto-jogador': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    }
  }
};

// ==================== CONFIGURAÇÃO MOTM ====================

const MOTM_CONFIG: GeneratorConfig = {
  type: 'motm',
  section: IMAGE_SECTIONS.MAN_OF_THE_MATCH,
  supportedFormats: ['quadrada', 'vertical'],
  requiredElements: ['background', 'logo', 'placar', 'jogador', 'texto-jogador'],
  optionalElements: ['info-partida'],
  defaultRenderOrder: [
    'background',
    'placar',
    'logo',
    'jogador',
    'texto-jogador',
    'info-partida'
  ],
  formatConfigs: {
    quadrada: {
      canvasWidth: 1080,
      canvasHeight: 1080,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1080, height: 1080 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 921, y: 31 },
          defaultSize: { width: 123, height: 123 },
          constraints: { lockAspectRatio: true }
        },
        placar: {
          defaultPosition: { x: 80, y: 565 },
          defaultSize: { width: 930, height: 930 * (720 / 1280) },
          constraints: { lockAspectRatio: true }
        },
        jogador: {
          defaultPosition: { x: 121, y: 85 },
          defaultSize: { width: 900, height: 900 * (1062 / 666) },
          constraints: { lockAspectRatio: true }
        },
        'texto-jogador': {
          defaultPosition: { x: 540, y: 195 },
          defaultSize: { width: 800, height: 200 },
          constraints: { allowResize: false }
        },
        'info-partida': {
          defaultPosition: { x: 540, y: 1000 },
          defaultSize: { width: 800, height: 80 },
          constraints: { allowResize: false }
        },
        'lista-jogadores': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'canais-tv': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    },
    vertical: {
      canvasWidth: 1080,
      canvasHeight: 1920,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1080, height: 1920 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 921, y: 31 },
          defaultSize: { width: 123, height: 123 },
          constraints: { lockAspectRatio: true }
        },
        placar: {
          defaultPosition: { x: 80, y: 1200 },
          defaultSize: { width: 930, height: 930 * (720 / 1280) },
          constraints: { lockAspectRatio: true }
        },
        jogador: {
          defaultPosition: { x: 121, y: 300 },
          defaultSize: { width: 900, height: 900 * (1062 / 666) },
          constraints: { lockAspectRatio: true }
        },
        'texto-jogador': {
          defaultPosition: { x: 540, y: 500 },
          defaultSize: { width: 800, height: 200 },
          constraints: { allowResize: false }
        },
        'info-partida': {
          defaultPosition: { x: 540, y: 1800 },
          defaultSize: { width: 800, height: 80 },
          constraints: { allowResize: false }
        },
        'lista-jogadores': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'canais-tv': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    },
    horizontal: {
      canvasWidth: 1920,
      canvasHeight: 1080,
      elements: {
        background: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 1920, height: 1080 },
          constraints: { allowResize: false, allowMove: false }
        },
        logo: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        placar: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        jogador: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'texto-jogador': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'info-partida': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'lista-jogadores': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'canais-tv': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        grafico: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        substituicoes: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        'background-usuario': {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        },
        overlay: {
          defaultPosition: { x: 0, y: 0 },
          defaultSize: { width: 0, height: 0 }
        }
      }
    }
  }
};

// ==================== CONFIGURAÇÕES EXPORTADAS ====================

export const GENERATOR_CONFIGS: Record<string, GeneratorConfig> = {
  escalacao: ESCALACAO_CONFIG,
  matchday: MATCHDAY_CONFIG,
  nextgame: { ...MATCHDAY_CONFIG, type: 'nextgame', section: IMAGE_SECTIONS.PROXIMO_JOGO },
  motm: MOTM_CONFIG,
  fulltime: { ...MOTM_CONFIG, type: 'fulltime', section: IMAGE_SECTIONS.FIM_DE_JOGO },
  confronto: { ...MATCHDAY_CONFIG, type: 'confronto', section: IMAGE_SECTIONS.CONFRONTO },
  gameart: { ...MOTM_CONFIG, type: 'gameart', section: IMAGE_SECTIONS.INICIO_JOGO }
};

export const TEXT_STYLES = DEFAULT_TEXT_STYLES;

export function getGeneratorConfig(type: string): GeneratorConfig | undefined {
  return GENERATOR_CONFIGS[type];
}

export function getFormatConfig(generatorType: string, format: ImageFormat): FormatConfig | undefined {
  const config = getGeneratorConfig(generatorType);
  return config?.formatConfigs[format];
}

