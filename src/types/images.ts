export interface BaseImage {
  id: string;
  type: 'square' | 'vertical' | 'horizontal';
  url: string;
  filename: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  deleteUrl?: string;
  error?: string;
}

export const IMAGE_TYPES = {
  square: {
    label: 'Quadrada',
    description: '1000x1000px - Para posts quadrados',
    dimensions: '1:1'
  },
  vertical: {
    label: 'Vertical', 
    description: '1080x1920px - Para stories e posts verticais',
    dimensions: '9:16'
  },
  horizontal: {
    label: 'Horizontal',
    description: '1920x1080px - Para posts horizontais e banners',
    dimensions: '16:9'
  }
} as const;

