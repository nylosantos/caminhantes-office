// src/components/konva/elements/GraficoElement.tsx

import React, { useCallback, useMemo } from 'react';
import { Arc, Group, Text } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, GraficoElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';

interface GraficoElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const GraficoElement: React.FC<GraficoElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as GraficoElementData;

  // Calcular dados do gráfico de pizza
  const chartData = useMemo(() => {
    const total = data.homeWins + data.draws + data.awayWins;
    if (total === 0) return [];

    const radius = Math.min(element.size.width, element.size.height) / 2 - 20;
    const centerX = element.size.width / 2;
    const centerY = element.size.height / 2;

    let currentAngle = 0;
    const segments = [];

    // Vitórias do time da casa
    if (data.homeWins > 0) {
      const angle = (data.homeWins / total) * 360;
      segments.push({
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        fill: data.colors.home,
        label: `${data.homeTeamName}: ${data.homeWins}`,
        value: data.homeWins
      });
      currentAngle += angle;
    }

    // Empates
    if (data.draws > 0) {
      const angle = (data.draws / total) * 360;
      segments.push({
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        fill: data.colors.draw,
        label: `Empates: ${data.draws}`,
        value: data.draws
      });
      currentAngle += angle;
    }

    // Vitórias do time visitante
    if (data.awayWins > 0) {
      const angle = (data.awayWins / total) * 360;
      segments.push({
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        fill: data.colors.away,
        label: `${data.awayTeamName}: ${data.awayWins}`,
        value: data.awayWins
      });
    }

    return { segments, radius, centerX, centerY, total };
  }, [data, element.size]);

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
    
    onTransform({
      position: { x: node.x(), y: node.y() },
      size: {
        width: element.size.width * scaleX,
        height: element.size.height * scaleY
      }
    });
  }, [onTransform, element.size]);

  if (!chartData.segments || chartData.segments.length === 0) {
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
          text="Sem dados para gráfico"
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
      {/* Segmentos do gráfico de pizza */}
      {chartData.segments.map((segment, index) => (
        <Arc
          key={`segment-${index}`}
          x={chartData.centerX}
          y={chartData.centerY}
          innerRadius={0}
          outerRadius={chartData.radius}
          angle={segment.endAngle - segment.startAngle}
          rotation={segment.startAngle}
          fill={segment.fill}
          stroke="#ffffff"
          strokeWidth={2}
          listening={false}
        />
      ))}

      {/* Legenda */}
      {chartData.segments.map((segment, index) => (
        <Group key={`legend-${index}`}>
          {/* Cor da legenda */}
          <Arc
            x={20}
            y={20 + index * 25}
            innerRadius={0}
            outerRadius={8}
            angle={360}
            fill={segment.fill}
            listening={false}
          />
          
          {/* Texto da legenda */}
          <Text
            x={35}
            y={15 + index * 25}
            text={segment.label}
            fontSize={14}
            fontFamily="Arial"
            fill="#ffffff"
            shadowColor="rgba(0, 0, 0, 0.8)"
            shadowOffsetX={1}
            shadowOffsetY={1}
            shadowBlur={3}
            listening={false}
          />
        </Group>
      ))}

      {/* Borda de seleção */}
      {isSelected && (
        <Arc
          x={chartData.centerX}
          y={chartData.centerY}
          innerRadius={chartData.radius + 5}
          outerRadius={chartData.radius + 7}
          angle={360}
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

export default GraficoElement;

