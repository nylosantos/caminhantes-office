// src/components/konva/elements/CanaisTvElement.tsx

import React, { useCallback, useMemo } from 'react';
import { Image as KonvaImage, Group, Rect } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, CanaisTvElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';
import { useMultipleImageLoader } from '../hooks/useImageLoader';

interface CanaisTvElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const CanaisTvElement: React.FC<CanaisTvElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as CanaisTvElementData;

  // Carregar todas as imagens dos canais
  const channelUrls = useMemo(() => 
    data.channels.map(channel => channel.logoUrl),
    [data.channels]
  );

  const { images, loading, errors } = useMultipleImageLoader(channelUrls);

  // Organizar logos em linhas
  const logoLayout = useMemo(() => {
    const layout: Array<{
      image: HTMLImageElement | null;
      x: number;
      y: number;
      width: number;
      height: number;
      channel: any;
    }> = [];

    let currentX = 0;
    let currentY = 0;
    let logosInCurrentRow = 0;

    data.channels.forEach((channel, index) => {
      const image = images[index];
      
      // Nova linha se necessário
      if (logosInCurrentRow >= data.maxLogosPerRow) {
        currentY += data.logoSize.height + data.spacing.line;
        currentX = 0;
        logosInCurrentRow = 0;
      }

      // Ajustar posição baseado no alinhamento
      let adjustedX = currentX;
      if (data.alignment === 'center') {
        const totalRowWidth = Math.min(data.maxLogosPerRow, data.channels.length - (Math.floor(index / data.maxLogosPerRow) * data.maxLogosPerRow)) * (data.logoSize.width + data.spacing.logo) - data.spacing.logo;
        adjustedX = (element.size.width - totalRowWidth) / 2 + currentX;
      } else if (data.alignment === 'right') {
        const totalRowWidth = Math.min(data.maxLogosPerRow, data.channels.length - (Math.floor(index / data.maxLogosPerRow) * data.maxLogosPerRow)) * (data.logoSize.width + data.spacing.logo) - data.spacing.logo;
        adjustedX = element.size.width - totalRowWidth + currentX;
      }

      layout.push({
        image,
        x: adjustedX,
        y: currentY,
        width: data.logoSize.width,
        height: data.logoSize.height,
        channel
      });

      currentX += data.logoSize.width + data.spacing.logo;
      logosInCurrentRow++;
    });

    return layout;
  }, [data, images, element.size.width]);

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
    
    // Atualizar tamanho dos logos baseado na escala
    const scale = Math.max(0.3, Math.min(3, Math.min(scaleX, scaleY)));
    
    onTransform({
      position: { x: node.x(), y: node.y() },
      size: {
        width: element.size.width * scaleX,
        height: element.size.height * scaleY
      },
      data: {
        ...data,
        logoSize: {
          width: data.logoSize.width * scale,
          height: data.logoSize.height * scale
        },
        spacing: {
          logo: data.spacing.logo * scale,
          line: data.spacing.line * scale
        }
      }
    });
  }, [onTransform, data, element.size]);

  if (data.channels.length === 0) {
    return (
      <Group
        x={element.position.x}
        y={element.position.y}
        opacity={element.visible ? 0.5 : 0.25}
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
          fill="#6b7280"
          stroke={isSelected ? '#3b82f6' : '#9ca3af'}
          strokeWidth={isSelected ? 2 : 1}
          strokeDashArray={[5, 5]}
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
      {/* Renderizar logos dos canais */}
      {logoLayout.map((logo, index) => {
        if (logo.image) {
          return (
            <KonvaImage
              key={`channel-${index}`}
              x={logo.x}
              y={logo.y}
              width={logo.width}
              height={logo.height}
              image={logo.image}
              listening={false}
            />
          );
        } else {
          // Placeholder para logo não carregado
          return (
            <Rect
              key={`channel-placeholder-${index}`}
              x={logo.x}
              y={logo.y}
              width={logo.width}
              height={logo.height}
              fill="#9ca3af"
              stroke="#6b7280"
              strokeWidth={1}
              listening={false}
            />
          );
        }
      })}
      
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
          strokeDashArray={[5, 5]}
          listening={false}
        />
      )}
    </Group>
  );
};

export default CanaisTvElement;

