// src/components/konva/elements/BackgroundElement.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Image as KonvaImage, Rect } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, BackgroundElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';
import { useImageLoader } from '../hooks/useImageLoader';

interface BackgroundElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const BackgroundElement: React.FC<BackgroundElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as BackgroundElementData;
  const { image, loading, error } = useImageLoader(data.imageUrl);
  
  const [fallbackColor] = useState('#dc2626'); // Cor de fallback vermelha

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd({
      x: node.x(),
      y: node.y()
    });
  }, [onDragEnd]);

  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Image;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and apply to size
    node.scaleX(1);
    node.scaleY(1);
    
    onTransform({
      position: { x: node.x(), y: node.y() },
      size: { 
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY)
      }
    });
  }, [onTransform]);

  // Se não há imagem ou está carregando, mostrar fallback
  if (loading || error || !image) {
    return (
      <Rect
        x={element.position.x}
        y={element.position.y}
        width={element.size.width}
        height={element.size.height}
        fill={error ? '#ef4444' : fallbackColor}
        opacity={element.visible ? 1 : 0.5}
        draggable={!element.locked}
        onClick={onClick}
        onTap={onClick}
        onDragEnd={handleDragEnd}
        listening={true}
      />
    );
  }

  return (
    <KonvaImage
      x={element.position.x}
      y={element.position.y}
      width={element.size.width}
      height={element.size.height}
      image={image}
      opacity={element.visible ? 1 : 0.5}
      draggable={!element.locked}
      onClick={onClick}
      onTap={onClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      listening={true}
    />
  );
};

export default BackgroundElement;

