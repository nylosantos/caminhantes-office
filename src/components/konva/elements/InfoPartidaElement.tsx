// src/components/konva/elements/InfoPartidaElement.tsx

import React, { useCallback, useMemo } from 'react';
import { Text, Group } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, InfoPartidaElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';

interface InfoPartidaElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const InfoPartidaElement: React.FC<InfoPartidaElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as InfoPartidaElementData;

  // Organizar informações da partida
  const infoLines = useMemo(() => {
    const lines: Array<{
      text: string;
      y: number;
    }> = [];

    if (!data.matchData) return lines;

    const { stadium, date, referee, competitionRound } = data.matchData;
    const lineHeight = data.style.fontSize * 1.4;

    if (data.layout === 'vertical') {
      // Layout vertical - uma informação por linha
      let currentY = 0;
      
      if (competitionRound) {
        lines.push({
          text: competitionRound.toUpperCase(),
          y: currentY
        });
        currentY += lineHeight;
      }
      
      if (data.showReferee && referee) {
        lines.push({
          text: `ÁRBITRO: ${referee.toUpperCase()}`,
          y: currentY
        });
        currentY += lineHeight;
      }
      
      if (stadium) {
        lines.push({
          text: stadium.toUpperCase(),
          y: currentY
        });
        currentY += lineHeight;
      }
      
      if (date) {
        lines.push({
          text: date.toUpperCase(),
          y: currentY
        });
      }
    } else {
      // Layout horizontal - informações agrupadas
      const line1Parts = [competitionRound?.toUpperCase()];
      if (data.showReferee && referee) {
        line1Parts.push(`ÁRBITRO: ${referee.toUpperCase()}`);
      }
      const line1Text = line1Parts.filter(Boolean).join(' - ');
      
      const line2Text = `${stadium?.toUpperCase() || ''} - ${date?.toUpperCase() || ''}`;
      
      if (line1Text) {
        lines.push({
          text: line1Text,
          y: 0
        });
      }
      
      if (line2Text.trim() !== ' - ') {
        lines.push({
          text: line2Text,
          y: lineHeight
        });
      }
    }

    return lines;
  }, [data]);

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
    
    // Atualizar tamanho da fonte baseado na escala
    const scale = Math.max(0.5, Math.min(2, Math.min(scaleX, scaleY)));
    
    onTransform({
      position: { x: node.x(), y: node.y() },
      size: {
        width: element.size.width * scaleX,
        height: element.size.height * scaleY
      },
      data: {
        ...data,
        style: {
          ...data.style,
          fontSize: data.style.fontSize * scale
        }
      }
    });
  }, [onTransform, data, element.size]);

  if (infoLines.length === 0) {
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
        <Text
          x={element.size.width / 2}
          y={element.size.height / 2}
          text="Sem informações da partida"
          fontSize={16}
          fontFamily="Arial"
          fill="#6b7280"
          align="center"
          verticalAlign="middle"
          width={element.size.width}
          offsetY={8}
          listening={false}
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
      {/* Renderizar linhas de informação */}
      {infoLines.map((line, index) => (
        <Text
          key={`info-line-${index}`}
          x={0}
          y={line.y + 25} // Ajuste vertical
          text={line.text}
          fontSize={data.style.fontSize}
          fontFamily={data.style.fontFamily}
          fontStyle={data.style.fontWeight >= 600 ? 'bold' : 'normal'}
          fill={data.style.color}
          align={data.style.textAlign as any}
          width={element.size.width}
          shadowColor={data.style.textShadow?.color || 'rgba(0, 0, 0, 0.8)'}
          shadowOffsetX={data.style.textShadow?.offsetX || 2}
          shadowOffsetY={data.style.textShadow?.offsetY || 2}
          shadowBlur={data.style.textShadow?.blur || 5}
          listening={false}
        />
      ))}
      
      {/* Borda de seleção */}
      {isSelected && (
        <Text
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

export default InfoPartidaElement;

