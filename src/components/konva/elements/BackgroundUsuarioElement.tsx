// src/components/konva/elements/BackgroundUsuarioElement.tsx

import React, { useCallback } from 'react';
import { Image as KonvaImage, Group, Rect } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, BackgroundUsuarioElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';
import { useImageLoader } from '../hooks/useImageLoader';

interface BackgroundUsuarioElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const BackgroundUsuarioElement: React.FC<BackgroundUsuarioElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as BackgroundUsuarioElementData;
  const { image: backgroundImage, loading: bgLoading, error: bgError } = useImageLoader(data.imageUrl);
  const { image: overlayImage, loading: overlayLoading, error: overlayError } = useImageLoader(data.overlay?.imageUrl);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd({
      x: node.x(),
      y: node.y()
    });
  }, [onDragEnd]);

  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Group;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale
    node.scaleX(1);
    node.scaleY(1);
    
    // Manter proporção da imagem
    let newWidth = element.size.width * scaleX;
    let newHeight = element.size.height * scaleY;
    
    if (data.aspectRatio) {
      // Ajustar para manter proporção
      if (newWidth / newHeight > data.aspectRatio) {
        newWidth = newHeight * data.aspectRatio;
      } else {
        newHeight = newWidth / data.aspectRatio;
      }
    }
    
    onTransform({
      position: { x: node.x(), y: node.y() },
      size: {
        width: Math.max(50, newWidth),
        height: Math.max(50, newHeight)
      }
    });
  }, [onTransform, element.size, data.aspectRatio]);

  // Se não há imagem ou está carregando, mostrar placeholder
  if (bgLoading || bgError || !backgroundImage) {
    return (
      <Group
        x={element.position.x}
        y={element.position.y}
        opacity={element.visible ? 0.7 : 0.35}
        draggable={!element.locked}
        onClick={onClick}
        onTap={onClick}
        onDragEnd={handleDragEnd}
        listening={true}
      >
        <Rect
          x={0}
          y={0}
          width={element.size.width}
          height={element.size.height}
          fill={bgError ? '#ef4444' : '#6b7280'}
          stroke={isSelected ? '#3b82f6' : '#9ca3af'}
          strokeWidth={isSelected ? 2 : 1}
          strokeDashArray={bgError ? undefined : [5, 5]}
        />
      </Group>
    );
  }

  return (
    <Group
      x={element.position.x}
      y={element.position.y}
      opacity={element.visible ? 1 : 0.5}
      draggable={!element.locked}
      onClick={onClick}
      onTap={onClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      listening={true}
    >
      {/* Imagem de fundo do usuário */}
      <KonvaImage
        x={0}
        y={0}
        width={element.size.width}
        height={element.size.height}
        image={backgroundImage}
        listening={false}
      />
      
      {/* Overlay se existir */}
      {data.overlay && overlayImage && !overlayLoading && !overlayError && (
        <KonvaImage
          x={0}
          y={0}
          width={element.size.width}
          height={element.size.height}
          image={overlayImage}
          opacity={data.overlay.opacity || 1}
          listening={false}
        />
      )}
      
      {/* Borda de seleção */}
      {isSelected && (
        <Rect
          x={0}
          y={0}
          width={element.size.width}
          height={element.size.height}
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth={2}
          listening={false}
        />
      )}
    </Group>
  );
};

export default BackgroundUsuarioElement;

