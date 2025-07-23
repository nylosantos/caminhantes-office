// export interface BaseImage {
//   id: string;
//   type: 'quadrada' | 'vertical' | 'horizontal';
//   url: string;
//   filename: string;
//   uploadedAt: Date;
//   uploadedBy: string;
// }

// export interface GameArt {
//   id: string;
//   url: string;
//   filename: string;
//   uploadedAt: Date;
//   uploadedBy: string;
// }

// export interface ImageUploadResponse {
//   success: boolean;
//   url?: string;
//   error?: string;
// }

// export const IMAGE_TYPES = {
//   quadrada: {
//     label: 'Quadrada',
//     dimensions: '1000x1000',
//     description: 'Ideal para posts em redes sociais'
//   },
//   vertical: {
//     label: 'Vertical',
//     dimensions: '1080x1920',
//     description: 'Ideal para stories e conteúdo mobile'
//   },
//   horizontal: {
//     label: 'Horizontal',
//     dimensions: '1920x1080',
//     description: 'Ideal para banners e conteúdo desktop'
//   }
// };

// Tipos e interfaces para o sistema reorganizado de imagens

// Tipos e interfaces para o sistema reorganizado de imagens

// // Enum para as seções disponíveis
// export enum IMAGE_SECTIONS {
//   ESCALACAO = 'escalacao',
//   MATCHDAY = 'matchday',
//   PROXIMO_JOGO = 'proximo_jogo',
//   FIM_DE_JOGO = 'fim_de_jogo',
//   MAN_OF_THE_MATCH = 'man_of_the_match'
// }

// // Enum para os tipos de imagem
// export enum IMAGE_TYPES_ENUM {
//   QUADRADA = 'quadrada',
//   VERTICAL = 'vertical',
//   HORIZONTAL = 'horizontal'
// }

// // Interface para uma imagem base
// export interface BaseImage {
//   id: string;
//   section: IMAGE_SECTIONS;
//   type: IMAGE_TYPES_ENUM;
//   url: string;
//   filename: string;
//   uploadedAt: Date;
// }

// // Tipo para identificar uma imagem específica
// export type ImageIdentifier = {
//   section: IMAGE_SECTIONS;
//   type: IMAGE_TYPES_ENUM;
// };

// // Configuração de cada seção
// export interface SectionConfig {
//   key: IMAGE_SECTIONS;
//   label: string;
//   description: string;
//   allowedTypes: IMAGE_TYPES_ENUM[];
// }

// // Configuração de cada tipo de imagem
// export interface ImageTypeConfig {
//   key: IMAGE_TYPES_ENUM;
//   label: string;
//   description: string;
//   dimensions: string;
// }

// // Mapeamento das seções disponíveis
// export const SECTIONS_CONFIG: Record<IMAGE_SECTIONS, SectionConfig> = {
//   [IMAGE_SECTIONS.ESCALACAO]: {
//     key: IMAGE_SECTIONS.ESCALACAO,
//     label: 'Escalação',
//     description: 'Imagens para posts de escalação do time',
//     allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL, IMAGE_TYPES_ENUM.HORIZONTAL]
//   },
//   [IMAGE_SECTIONS.MATCHDAY]: {
//     key: IMAGE_SECTIONS.MATCHDAY,
//     label: 'Matchday',
//     description: 'Imagens para posts do dia do jogo',
//     allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
//   },
//   [IMAGE_SECTIONS.PROXIMO_JOGO]: {
//     key: IMAGE_SECTIONS.PROXIMO_JOGO,
//     label: 'Próximo Jogo',
//     description: 'Imagens para posts do próximo jogo',
//     allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
//   },
//   [IMAGE_SECTIONS.FIM_DE_JOGO]: {
//     key: IMAGE_SECTIONS.FIM_DE_JOGO,
//     label: 'Fim de Jogo',
//     description: 'Imagens para posts do fim de jogo',
//     allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
//   },
//   [IMAGE_SECTIONS.MAN_OF_THE_MATCH]: {
//     key: IMAGE_SECTIONS.MAN_OF_THE_MATCH,
//     label: 'Man of the Match',
//     description: 'Imagens para posts do melhor jogador',
//     allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
//   }
// };

// // Mapeamento dos tipos de imagem
// export const IMAGE_TYPES_CONFIG: Record<IMAGE_TYPES_ENUM, ImageTypeConfig> = {
//   [IMAGE_TYPES_ENUM.QUADRADA]: {
//     key: IMAGE_TYPES_ENUM.QUADRADA,
//     label: 'Quadrada',
//     description: 'Para posts quadrados (Instagram feed)',
//     dimensions: '1080x1080'
//   },
//   [IMAGE_TYPES_ENUM.VERTICAL]: {
//     key: IMAGE_TYPES_ENUM.VERTICAL,
//     label: 'Vertical',
//     description: 'Para stories (Instagram/Facebook)',
//     dimensions: '1080x1920'
//   },
//   [IMAGE_TYPES_ENUM.HORIZONTAL]: {
//     key: IMAGE_TYPES_ENUM.HORIZONTAL,
//     label: 'Horizontal',
//     description: 'Para posts horizontais (Facebook/Twitter)',
//     dimensions: '1200x630'
//   }
// };

// // Função utilitária para obter configuração de uma seção
// export const getSectionConfig = (section: IMAGE_SECTIONS): SectionConfig => {
//   return SECTIONS_CONFIG[section];
// };

// // Função utilitária para obter configuração de um tipo
// export const getImageTypeConfig = (type: IMAGE_TYPES_ENUM): ImageTypeConfig => {
//   return IMAGE_TYPES_CONFIG[type];
// };

// // Função utilitária para verificar se um tipo é permitido em uma seção
// export const isTypeAllowedInSection = (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM): boolean => {
//   return SECTIONS_CONFIG[section].allowedTypes.includes(type);
// };

// // Função utilitária para obter todos os tipos permitidos em uma seção
// export const getAllowedTypesForSection = (section: IMAGE_SECTIONS): IMAGE_TYPES_ENUM[] => {
//   return SECTIONS_CONFIG[section].allowedTypes;
// };

// // Função utilitária para gerar um ID único para uma imagem
// export const generateImageId = (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM): string => {
//   return `${section}_${type}`;
// };

// // Tipo para resultado de operações
// export interface OperationResult {
//   success: boolean;
//   error?: string;
//   data?: any;
// }

// // Interface para o contexto de imagens
// export interface ImagesContextType {
//   baseImages: BaseImage[];
//   loading: boolean;
//   uploadBaseImage: (file: File, section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<OperationResult>;
//   removeBaseImage: (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<OperationResult>;
//   getImageByIdentifier: (identifier: ImageIdentifier) => BaseImage | undefined;
//   getImagesBySection: (section: IMAGE_SECTIONS) => BaseImage[];
// }

// // Compatibilidade com o sistema antigo (para migração gradual)
// export type LegacyImageType = 'quadrada' | 'vertical' | 'horizontal';

// export const LEGACY_IMAGE_TYPES: Record<LegacyImageType, ImageTypeConfig> = {
//   quadrada: IMAGE_TYPES_CONFIG[IMAGE_TYPES_ENUM.QUADRADA],
//   vertical: IMAGE_TYPES_CONFIG[IMAGE_TYPES_ENUM.VERTICAL],
//   horizontal: IMAGE_TYPES_CONFIG[IMAGE_TYPES_ENUM.HORIZONTAL]
// };

// // Função para migrar do sistema antigo para o novo
// export const migrateLegacyImage = (
//   legacyType: LegacyImageType,
//   url: string,
//   filename: string,
//   uploadedAt: Date
// ): BaseImage => {
//   return {
//     id: generateImageId(IMAGE_SECTIONS.ESCALACAO, legacyType as IMAGE_TYPES_ENUM),
//     section: IMAGE_SECTIONS.ESCALACAO,
//     type: legacyType as IMAGE_TYPES_ENUM,
//     url,
//     filename,
//     uploadedAt
//   };
// };

// Enum para as seções disponíveis
export enum IMAGE_SECTIONS {
  ESCALACAO = 'escalacao',
  MATCHDAY = 'matchday',
  PROXIMO_JOGO = 'proximo_jogo',
  FIM_DE_JOGO = 'fim_de_jogo',
  MAN_OF_THE_MATCH = 'man_of_the_match',
  CONFRONTO = 'confronto' // 1. NOVA SEÇÃO ADICIONADA AQUI
}

// Enum para os tipos de imagem
export enum IMAGE_TYPES_ENUM {
  QUADRADA = 'quadrada',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal'
}

// Interface para uma imagem base
export interface BaseImage {
  id: string;
  section: IMAGE_SECTIONS;
  type: IMAGE_TYPES_ENUM;
  url: string;
  filename: string;
  uploadedAt: Date;
}

// Tipo para identificar uma imagem específica
export type ImageIdentifier = {
  section: IMAGE_SECTIONS;
  type: IMAGE_TYPES_ENUM;
};

// Configuração de cada seção
export interface SectionConfig {
  key: IMAGE_SECTIONS;
  label: string;
  description: string;
  allowedTypes: IMAGE_TYPES_ENUM[];
}

// Configuração de cada tipo de imagem
export interface ImageTypeConfig {
  key: IMAGE_TYPES_ENUM;
  label: string;
  description: string;
  dimensions: string;
}

// Mapeamento das seções disponíveis
export const SECTIONS_CONFIG: Record<IMAGE_SECTIONS, SectionConfig> = {
  [IMAGE_SECTIONS.ESCALACAO]: {
    key: IMAGE_SECTIONS.ESCALACAO,
    label: 'Escalação',
    description: 'Imagens para posts de escalação do time',
    allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL, IMAGE_TYPES_ENUM.HORIZONTAL]
  },
  [IMAGE_SECTIONS.MATCHDAY]: {
    key: IMAGE_SECTIONS.MATCHDAY,
    label: 'Matchday',
    description: 'Imagens para posts do dia do jogo',
    allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
  },
  [IMAGE_SECTIONS.PROXIMO_JOGO]: {
    key: IMAGE_SECTIONS.PROXIMO_JOGO,
    label: 'Próximo Jogo',
    description: 'Imagens para posts do próximo jogo',
    allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
  },
  [IMAGE_SECTIONS.FIM_DE_JOGO]: {
    key: IMAGE_SECTIONS.FIM_DE_JOGO,
    label: 'Fim de Jogo',
    description: 'Imagens para posts do fim de jogo',
    allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
  },
  [IMAGE_SECTIONS.MAN_OF_THE_MATCH]: {
    key: IMAGE_SECTIONS.MAN_OF_THE_MATCH,
    label: 'Man of the Match',
    description: 'Imagens para posts do melhor jogador',
    allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
  },
  // 2. NOVA CONFIGURAÇÃO DE SEÇÃO ADICIONADA AQUI
  [IMAGE_SECTIONS.CONFRONTO]: {
    key: IMAGE_SECTIONS.CONFRONTO,
    label: 'Confronto',
    description: 'Imagens de fundo para o gerador de confrontos com gráfico.',
    allowedTypes: [IMAGE_TYPES_ENUM.QUADRADA, IMAGE_TYPES_ENUM.VERTICAL]
  }
};

// Mapeamento dos tipos de imagem
export const IMAGE_TYPES_CONFIG: Record<IMAGE_TYPES_ENUM, ImageTypeConfig> = {
  [IMAGE_TYPES_ENUM.QUADRADA]: {
    key: IMAGE_TYPES_ENUM.QUADRADA,
    label: 'Quadrada',
    description: 'Para posts quadrados (Instagram feed)',
    dimensions: '1080x1080'
  },
  [IMAGE_TYPES_ENUM.VERTICAL]: {
    key: IMAGE_TYPES_ENUM.VERTICAL,
    label: 'Vertical',
    description: 'Para stories (Instagram/Facebook)',
    dimensions: '1080x1920'
  },
  [IMAGE_TYPES_ENUM.HORIZONTAL]: {
    key: IMAGE_TYPES_ENUM.HORIZONTAL,
    label: 'Horizontal',
    description: 'Para posts horizontais (Facebook/Twitter)',
    dimensions: '1200x630'
  }
};

// Função utilitária para obter configuração de uma seção
export const getSectionConfig = (section: IMAGE_SECTIONS): SectionConfig => {
  return SECTIONS_CONFIG[section];
};

// Função utilitária para obter configuração de um tipo
export const getImageTypeConfig = (type: IMAGE_TYPES_ENUM): ImageTypeConfig => {
  return IMAGE_TYPES_CONFIG[type];
};

// Função utilitária para verificar se um tipo é permitido em uma seção
export const isTypeAllowedInSection = (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM): boolean => {
  return SECTIONS_CONFIG[section].allowedTypes.includes(type);
};

// Função utilitária para obter todos os tipos permitidos em uma seção
export const getAllowedTypesForSection = (section: IMAGE_SECTIONS): IMAGE_TYPES_ENUM[] => {
  return SECTIONS_CONFIG[section].allowedTypes;
};

// Função utilitária para gerar um ID único para uma imagem
export const generateImageId = (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM): string => {
  return `${section}_${type}`;
};

// Tipo para resultado de operações
export interface OperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Interface para o contexto de imagens
export interface ImagesContextType {
  baseImages: BaseImage[];
  loading: boolean;
  uploadBaseImage: (file: File, section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<OperationResult>;
  removeBaseImage: (section: IMAGE_SECTIONS, type: IMAGE_TYPES_ENUM) => Promise<OperationResult>;
  getImageByIdentifier: (identifier: ImageIdentifier) => BaseImage | undefined;
  getImagesBySection: (section: IMAGE_SECTIONS) => BaseImage[];
}

// Compatibilidade com o sistema antigo (para migração gradual)
export type LegacyImageType = 'quadrada' | 'vertical' | 'horizontal';

export const LEGACY_IMAGE_TYPES: Record<LegacyImageType, ImageTypeConfig> = {
  quadrada: IMAGE_TYPES_CONFIG[IMAGE_TYPES_ENUM.QUADRADA],
  vertical: IMAGE_TYPES_CONFIG[IMAGE_TYPES_ENUM.VERTICAL],
  horizontal: IMAGE_TYPES_CONFIG[IMAGE_TYPES_ENUM.HORIZONTAL]
};

// Função para migrar do sistema antigo para o novo
export const migrateLegacyImage = (
  legacyType: LegacyImageType,
  url: string,
  filename: string,
  uploadedAt: Date
): BaseImage => {
  return {
    id: generateImageId(IMAGE_SECTIONS.ESCALACAO, legacyType as IMAGE_TYPES_ENUM),
    section: IMAGE_SECTIONS.ESCALACAO,
    type: legacyType as IMAGE_TYPES_ENUM,
    url,
    filename,
    uploadedAt
  };
};
