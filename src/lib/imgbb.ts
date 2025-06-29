import { ImageUploadResponse } from '@/types/images';

// Chave da API do ImgBB (você precisará criar uma conta gratuita)
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'sua-chave-aqui';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadToImgBB = async (file: File): Promise<ImageUploadResponse> => {
  try {
    // Verificar se a chave da API está configurada
    if (!IMGBB_API_KEY || IMGBB_API_KEY === 'sua-chave-aqui') {
      return {
        success: false,
        url: '',
        error: 'Chave da API do ImgBB não configurada. Verifique o arquivo .env'
      };
    }

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        url: '',
        error: validation.error || 'Arquivo inválido'
      };
    }

    // Converter arquivo para base64
    const base64 = await fileToBase64(file);
    
    // Preparar dados para upload
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64.split(',')[1]); // Remove o prefixo data:image/...;base64,
    formData.append('name', file.name);

    // Fazer upload
    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      return {
        success: false,
        url: '',
        error: `Erro HTTP: ${response.status} - ${response.statusText}`
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        url: data.data.url,
        deleteUrl: data.data.delete_url
      };
    } else {
      return {
        success: false,
        url: '',
        error: data.error?.message || 'Erro no upload para ImgBB'
      };
    }
  } catch (error) {
    console.error('Erro no upload para ImgBB:', error);
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Erro de conexão com o serviço de upload'
    };
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Verificar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPG, PNG ou WebP.'
    };
  }

  // Verificar tamanho (máximo 32MB do ImgBB)
  const maxSize = 32 * 1024 * 1024; // 32MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Máximo 32MB.'
    };
  }

  return { valid: true };
};

