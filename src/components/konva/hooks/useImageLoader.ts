// src/components/konva/hooks/useImageLoader.ts

import { useState, useEffect, useCallback } from 'react';
import { LoadImageResult } from '@/types/konva';

interface UseImageLoaderResult {
  image: HTMLImageElement | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export const useImageLoader = (src: string | null | undefined): UseImageLoaderResult => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadImage = useCallback(async (imageUrl: string): Promise<LoadImageResult> => {
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
      
      img.onerror = (e) => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });
  }, []);

  const reload = useCallback(() => {
    if (src) {
      setLoading(true);
      setError(null);
      setImage(null);
      
      loadImage(src)
        .then((result) => {
          setImage(result.image);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [src, loadImage]);

  useEffect(() => {
    if (!src) {
      setImage(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setImage(null);

    loadImage(src)
      .then((result) => {
        setImage(result.image);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [src, loadImage]);

  return {
    image,
    loading,
    error,
    reload
  };
};

// Hook para carregar múltiplas imagens
export const useMultipleImageLoader = (sources: (string | null | undefined)[]): {
  images: (HTMLImageElement | null)[];
  loading: boolean;
  errors: (string | null)[];
  reload: () => void;
} => {
  const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<(string | null)[]>([]);

  const loadImage = useCallback(async (imageUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      
      img.src = imageUrl;
    });
  }, []);

  const reload = useCallback(() => {
    const validSources = sources.filter(Boolean) as string[];
    
    if (validSources.length === 0) {
      setImages([]);
      setErrors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrors(new Array(sources.length).fill(null));
    setImages(new Array(sources.length).fill(null));

    Promise.allSettled(
      validSources.map(src => loadImage(src))
    ).then((results) => {
      const newImages: (HTMLImageElement | null)[] = [];
      const newErrors: (string | null)[] = [];

      sources.forEach((src, index) => {
        if (!src) {
          newImages[index] = null;
          newErrors[index] = null;
          return;
        }

        const validIndex = validSources.indexOf(src);
        const result = results[validIndex];

        if (result.status === 'fulfilled') {
          newImages[index] = result.value;
          newErrors[index] = null;
        } else {
          newImages[index] = null;
          newErrors[index] = result.reason.message;
        }
      });

      setImages(newImages);
      setErrors(newErrors);
      setLoading(false);
    });
  }, [sources, loadImage]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    images,
    loading,
    errors,
    reload
  };
};

// Hook para pré-carregar imagens
export const useImagePreloader = (sources: string[]): {
  preloaded: boolean;
  progress: number;
  errors: string[];
} => {
  const [preloaded, setPreloaded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (sources.length === 0) {
      setPreloaded(true);
      setProgress(100);
      return;
    }

    setPreloaded(false);
    setProgress(0);
    setErrors([]);

    let loadedCount = 0;
    const totalCount = sources.length;
    const newErrors: string[] = [];

    const updateProgress = () => {
      loadedCount++;
      setProgress((loadedCount / totalCount) * 100);
      
      if (loadedCount === totalCount) {
        setPreloaded(true);
        setErrors(newErrors);
      }
    };

    sources.forEach((src, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = updateProgress;
      img.onerror = () => {
        newErrors.push(`Failed to preload image ${index}: ${src}`);
        updateProgress();
      };
      
      img.src = src;
    });
  }, [sources]);

  return {
    preloaded,
    progress,
    errors
  };
};

