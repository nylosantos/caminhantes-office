// src/components/konva/elements/ListaJogadoresElement.tsx

import React, { useCallback, useMemo } from 'react';
import { Text, Group } from 'react-konva';
import Konva from 'konva';

import {
  CanvasElement,
  ListaJogadoresElementData,
  FormatConfig,
} from '@/types/konva';
import { BaseImage } from '@/types/images';

interface ListaJogadoresElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const ListaJogadoresElement: React.FC<ListaJogadoresElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig,
}) => {
  const data = element.data as ListaJogadoresElementData;

  // Configurações de sombra para diferentes estilos
  const getShadowConfig = useCallback(
    (style: any) => ({
      shadowColor: style.textShadow?.color || 'rgba(0, 0, 0, 0.8)',
      shadowOffsetX: style.textShadow?.offsetX || 2,
      shadowOffsetY: style.textShadow?.offsetY || 2,
      shadowBlur: style.textShadow?.blur || 5,
    }),
    []
  );

  // Calcular posições e conteúdo
  const content = useMemo(() => {
    const items: Array<{
      type:
        | 'player'
        | 'reserve-title'
        | 'reserve-names'
        | 'coach-title'
        | 'coach-name';
      text: string;
      x: number;
      y: number;
      style: any;
      align: string;
    }> = [];

    let currentY = -37;
    const lineHeight = 54.5; // Altura padrão entre linhas de jogadores

    // Jogadores titulares
    if (data.formation) {
      data.formation.positions.forEach((position, index) => {
        const player = data.selectedPlayers[position.id];
        if (player) {
          // Número do jogador
          items.push({
            type: 'player',
            text: String(player.number),
            x: -155, // Será ajustado baseado no playerNumberX
            y: currentY + 13,
            style: data.styles.playerNumber,
            align: 'right',
          });

          // Nome do jogador
          items.push({
            type: 'player',
            text: player.name.toUpperCase(),
            x: 15, // Espaçamento entre número e nome
            y: currentY,
            style: data.styles.playerName,
            align: 'left',
          });

          currentY += lineHeight;
        }
      });
    }

    // Reservas
    if (data.reservePlayers.length > 0) {
      currentY += -20; // Espaçamento antes dos reservas

      const reserveNames = data.reservePlayers.map((p) => p.name).join(', ');

      // Quebra de linha para reservas se necessário
      const maxWidth = 600; // Largura máxima para texto de reservas
      const words = reserveNames.split(' ');
      const lines: string[] = [];
      let line = '';

      // Simular medição de texto (aproximada)
      const avgCharWidth = data.styles.reserveNames.fontSize * 0.6;

      for (const word of words) {
        const testLine = line + word + ' ';
        if (testLine.length * avgCharWidth > maxWidth && line.length > 0) {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        lines.push(line.trim());
      }

      const blockHeight = lines.length * 25;

      // Título "BANCO"
      items.push({
        type: 'reserve-title',
        text: 'BANCO',
        x: -155,
        y: currentY + blockHeight / 2 + 9 + 15 + 7,
        style: data.styles.reserveTitle,
        align: 'right',
      });

      // Nomes dos reservas
      lines.forEach((lineText, lineIndex) => {
        items.push({
          type: 'reserve-names',
          text: lineText.toUpperCase(),
          x: 15,
          y: currentY + 15 + lineIndex * 25 + 25,
          style: data.styles.reserveNames,
          align: 'left',
        });
      });

      currentY += blockHeight + 50;
    }

    // Técnico
    if (data.coach) {
      currentY += 25; // Espaçamento antes do técnico

      // Título "TÉCNICO"
      items.push({
        type: 'coach-title',
        text: 'TÉCNICO',
        x: -155,
        y: currentY + 7,
        style: data.styles.coachTitle,
        align: 'right',
      });

      // Nome do técnico
      items.push({
        type: 'coach-name',
        text: data.coach.toUpperCase(),
        x: 15,
        y: currentY,
        style: data.styles.coachName,
        align: 'left',
      });
    }

    return items;
  }, [data]);

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
      const scale = Math.max(0.5, Math.min(2, Math.min(scaleX, scaleY)));

      onTransform({
        position: { x: node.x(), y: node.y() },
        size: {
          width: element.size.width * scaleX,
          height: element.size.height * scaleY,
        },
        data: {
          ...data,
          styles: {
            playerNumber: {
              ...data.styles.playerNumber,
              fontSize: data.styles.playerNumber.fontSize * scale,
            },
            playerName: {
              ...data.styles.playerName,
              fontSize: data.styles.playerName.fontSize * scale,
            },
            reserveTitle: {
              ...data.styles.reserveTitle,
              fontSize: data.styles.reserveTitle.fontSize * scale,
            },
            reserveNames: {
              ...data.styles.reserveNames,
              fontSize: data.styles.reserveNames.fontSize * scale,
            },
            coachTitle: {
              ...data.styles.coachTitle,
              fontSize: data.styles.coachTitle.fontSize * scale,
            },
            coachName: {
              ...data.styles.coachName,
              fontSize: data.styles.coachName.fontSize * scale,
            },
          },
        },
      });
    },
    [onTransform, data, element.size]
  );

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
      {/* Renderizar todos os itens de texto */}
      {content.map((item, index) => (
        <Text
          key={`${item.type}-${index}`}
          x={item.x}
          y={item.y}
          text={item.text}
          fontSize={item.style.fontSize}
          fontFamily={item.style.fontFamily}
          fontStyle={item.style.fontWeight >= 600 ? 'bold' : 'normal'}
          fill={item.style.color}
          align={item.align as any}
          width={item.align === 'right' ? 150 : element.size.width + 400}
          {...getShadowConfig(item.style)}
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

export default ListaJogadoresElement;
