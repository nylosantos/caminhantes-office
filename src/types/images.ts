export interface BaseImage {
  id: string;
  type: 'quadrada' | 'vertical' | 'horizontal';
  url: string;
  filename: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface GameArt {
  id: string;
  url: string;
  filename: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const IMAGE_TYPES = {
  quadrada: {
    label: 'Quadrada',
    dimensions: '1000x1000',
    description: 'Ideal para posts em redes sociais'
  },
  vertical: {
    label: 'Vertical',
    dimensions: '1080x1920',
    description: 'Ideal para stories e conteúdo mobile'
  },
  horizontal: {
    label: 'Horizontal',
    dimensions: '1920x1080',
    description: 'Ideal para banners e conteúdo desktop'
  }
};

