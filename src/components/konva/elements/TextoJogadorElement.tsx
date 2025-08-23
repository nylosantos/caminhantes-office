// src/components/konva/elements/TextoJogadorElement.tsx

import React, { useCallback, useMemo } from 'react';
import { Text, Group } from 'react-konva';
import Konva from 'konva';

import {
  CanvasElement,
  TextoJogadorElementData,
  FormatConfig,
} from '@/types/konva';
import { BaseImage } from '@/types/images';

interface TextoJogadorElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const TextoJogadorElement: React.FC<TextoJogadorElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig,
}) => {
  const data = element.data as TextoJogadorElementData;

  // Configurações de sombra
  const shadowConfig = useMemo(
    () => ({
      shadowColor: data.nameStyle.textShadow?.color || 'rgba(0, 0, 0, 0.5)',
      shadowOffsetX: data.nameStyle.textShadow?.offsetX || 5,
      shadowOffsetY: data.nameStyle.textShadow?.offsetY || 5,
      shadowBlur: data.nameStyle.textShadow?.blur || 5,
    }),
    [data.nameStyle.textShadow]
  );

  const numberShadowConfig = useMemo(
    () => ({
      shadowColor: data.numberStyle.textShadow?.color || 'rgba(0, 0, 0, 0.75)',
      shadowOffsetX: data.numberStyle.textShadow?.offsetX || 5,
      shadowOffsetY: data.numberStyle.textShadow?.offsetY || 5,
      shadowBlur: data.numberStyle.textShadow?.blur || 10,
    }),
    [data.numberStyle.textShadow]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      onDragEnd({
        x: node.x(),
        y: node.y(),
      });
    },
    [onDragEnd]
  );

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target as Konva.Group;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale
      node.scaleX(1);
      node.scaleY(1);

      // Atualizar tamanhos das fontes baseado na escala
      const nameScale = Math.max(0.5, Math.min(3, scaleX)); // Limitar escala entre 0.5x e 3x
      const numberScale = Math.max(0.5, Math.min(3, scaleY));

      onTransform({
        position: { x: node.x(), y: node.y() },
        data: {
          ...data,
          nameStyle: {
            ...data.nameStyle,
            fontSize: data.nameStyle.fontSize * nameScale,
          },
          numberStyle: {
            ...data.numberStyle,
            fontSize: data.numberStyle.fontSize * numberScale,
          },
        },
      });
    },
    [onTransform, data]
  );

  // Posições calculadas
  const nameY = element.position.y;
  const numberY = data.showName
    ? nameY + data.nameStyle.fontSize + 20
    : element.position.y;

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
      {/* Nome do jogador */}
      {data.showName && (
        <Text
          x={0}
          y={0}
          text={data.player.name.toUpperCase()}
          fontSize={data.nameStyle.fontSize}
          fontFamily={data.nameStyle.fontFamily}
          fontStyle={data.nameStyle.fontWeight >= 600 ? 'bold' : 'normal'}
          fill={data.nameStyle.color}
          align={data.nameStyle.textAlign}
          width={element.size.width}
          {...shadowConfig}
          listening={false}
        />
      )}

      {/* Número do jogador */}
      {data.showNumber && (
        <Text
          x={0}
          y={numberY}
          text={`#${data.player.number}`}
          fontSize={data.numberStyle.fontSize}
          fontFamily={data.numberStyle.fontFamily}
          fontStyle={data.numberStyle.fontWeight >= 600 ? 'bold' : 'normal'}
          fill={data.numberStyle.color}
          align={data.numberStyle.textAlign}
          width={element.size.width}
          {...numberShadowConfig}
          listening={false}
        />
      )}

      {/* Borda de seleção */}
      {isSelected && (
        <React.Fragment>
          {/* Placeholder invisível para definir área clicável */}
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
        </React.Fragment>
      )}
    </Group>
  );
};

export default TextoJogadorElement;
