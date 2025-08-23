// src/components/konva/elements/SubstituicoesElement.tsx

import React, { useCallback, useMemo } from 'react';
import { Text, Group } from 'react-konva';
import Konva from 'konva';

import { CanvasElement, SubstituicoesElementData, FormatConfig } from '@/types/konva';
import { BaseImage } from '@/types/images';

interface SubstituicoesElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const SubstituicoesElement: React.FC<SubstituicoesElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig
}) => {
  const data = element.data as SubstituicoesElementData;

  // Organizar substituições em layout centralizado
  const substitutionLayout = useMemo(() => {
    if (data.substitutions.length === 0) return [];

    const items: Array<{
      text: string;
      x: number;
      y: number;
      style: any;
      align: string;
    }> = [];

    // Calcular tamanho da fonte baseado no número de substituições
    const baseFontSize = Math.max(16, Math.min(24, 200 / data.substitutions.length));
    const lineHeight = baseFontSize + 10;
    
    // Calcular altura total do bloco
    const totalHeight = data.substitutions.length * lineHeight;
    const startY = (element.size.height - totalHeight) / 2;

    data.substitutions.forEach((sub, index) => {
      const y = startY + (index * lineHeight);
      
      // Texto da substituição: "Jogador Sai ← Jogador Entra"
      const substitutionText = `${sub.playerOut.name} ← ${sub.playerIn.name}`;
      
      items.push({
        text: substitutionText,
        x: element.size.width / 2,
        y: y,
        style: {
          ...data.styles.playerOut,
          fontSize: baseFontSize
        },
        align: 'center'
      });
    });

    return items;
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

  if (data.substitutions.length === 0) {
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
          text="Nenhuma substituição"
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
      {/* Renderizar substituições */}
      {substitutionLayout.map((item, index) => (
        <Text
          key={`substitution-${index}`}
          x={0}
          y={item.y}
          text={item.text.toUpperCase()}
          fontSize={item.style.fontSize}
          fontFamily={item.style.fontFamily}
          fontStyle={item.style.fontWeight >= 600 ? 'bold' : 'normal'}
          fill={item.style.color}
          align={item.align as any}
          width={element.size.width}
          shadowColor={item.style.textShadow?.color || 'rgba(0, 0, 0, 0.8)'}
          shadowOffsetX={item.style.textShadow?.offsetX || 2}
          shadowOffsetY={item.style.textShadow?.offsetY || 2}
          shadowBlur={item.style.textShadow?.blur || 5}
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

export default SubstituicoesElement;

