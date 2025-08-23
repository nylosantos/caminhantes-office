// src/components/konva/elements/LogoElement.tsx

import React, { useCallback } from 'react';
import { Image as KonvaImage, Circle } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, LogoElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';
import { useImageLoader } from '../hooks/useImageLoader';

interface LogoElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const LogoElement: React.FC<LogoElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as LogoElementData;
  
  // Usar logo padrão do Caminhantes
  const logoUrl = data.imageUrl || '/caminhantes-clock.png';
  const { image, loading, error } = useImageLoader(logoUrl);

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
    
    // Para logo, manter proporção quadrada
    const scale = Math.max(scaleX, scaleY);
    
    // Reset scale and apply to size
    node.scaleX(1);
    node.scaleY(1);
    
    const newSize = Math.max(20, data.size * scale); // Tamanho mínimo de 20px
    
    onTransform({
      position: { x: node.x(), y: node.y() },
      size: { 
        width: newSize,
        height: newSize
      },
      data: {
        ...data,
        size: newSize
      }
    });
  }, [onTransform, data]);

  // Se não há imagem ou está carregando, mostrar placeholder
  if (loading || error || !image) {
    return (
      <Circle
        x={element.position.x + element.size.width / 2}
        y={element.position.y + element.size.height / 2}
        radius={element.size.width / 2}
        fill={error ? '#ef4444' : '#6b7280'}
        opacity={element.visible ? 0.5 : 0.25}
        stroke={isSelected ? '#3b82f6' : undefined}
        strokeWidth={isSelected ? 2 : 0}
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
      stroke={isSelected ? '#3b82f6' : undefined}
      strokeWidth={isSelected ? 2 : 0}
      draggable={!element.locked}
      onClick={onClick}
      onTap={onClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      listening={true}
    />
  );
};

export default LogoElement;

