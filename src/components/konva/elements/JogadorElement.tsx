// src/components/konva/elements/JogadorElement.tsx

import React, { useCallback } from 'react';
import { Image as KonvaImage, Rect, Text } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, JogadorElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';
import { useImageLoader } from '../hooks/useImageLoader';

interface JogadorElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const JogadorElement: React.FC<JogadorElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as JogadorElementData;
  const { image, loading, error } = useImageLoader(data.imageUrl);

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
    
    // Manter proporção do jogador (aspectRatio do data)
    const aspectRatio = data.aspectRatio || (1062 / 666); // Proporção padrão dos jogadores
    let newWidth = Math.max(50, node.width() * scaleX);
    let newHeight = newWidth * aspectRatio;
    
    onTransform({
      position: { x: node.x(), y: node.y() },
      size: { 
        width: newWidth,
        height: newHeight
      }
    });
  }, [onTransform, data.aspectRatio]);

  // Se não há imagem ou está carregando, mostrar placeholder
  if (loading || error || !image) {
    return (
      <React.Fragment>
        <Rect
          x={element.position.x}
          y={element.position.y}
          width={element.size.width}
          height={element.size.height}
          fill={error ? '#ef4444' : '#6b7280'}
          opacity={element.visible ? 0.7 : 0.35}
          stroke={isSelected ? '#3b82f6' : '#9ca3af'}
          strokeWidth={isSelected ? 2 : 1}
          strokeDashArray={error ? undefined : [5, 5]}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          listening={true}
        />
        
        {/* Informações do jogador */}
        <Text
          x={element.position.x + element.size.width / 2}
          y={element.position.y + element.size.height / 2 - 20}
          text={data.player.name}
          fontSize={16}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#ffffff"
          align="center"
          verticalAlign="middle"
          width={element.size.width}
          listening={false}
        />
        
        <Text
          x={element.position.x + element.size.width / 2}
          y={element.position.y + element.size.height / 2}
          text={`#${data.player.number}`}
          fontSize={24}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#ffffff"
          align="center"
          verticalAlign="middle"
          width={element.size.width}
          listening={false}
        />
        
        <Text
          x={element.position.x + element.size.width / 2}
          y={element.position.y + element.size.height / 2 + 20}
          text={loading ? 'Carregando...' : error ? 'Erro na imagem' : 'Sem imagem'}
          fontSize={12}
          fontFamily="Arial"
          fill="#ffffff"
          align="center"
          verticalAlign="middle"
          width={element.size.width}
          listening={false}
        />
      </React.Fragment>
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

export default JogadorElement;

