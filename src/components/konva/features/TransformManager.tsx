// src/components/konva/features/TransformManager.tsx

import React, { useRef, useEffect, useCallback } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';

import { TransformManagerProps } from '@/types/konva';

const TransformManager: React.FC<TransformManagerProps> = ({
  selectedElement,
  onElementUpdate
}) => {
  const transformerRef = useRef<Konva.Transformer>(null);

  // Atualizar transformer quando elemento selecionado mudar
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    if (selectedElement && !selectedElement.locked) {
      // Encontrar o nó do elemento selecionado
      const stage = transformer.getStage();
      if (!stage) return;

      const elementNode = stage.findOne(`#${selectedElement.id}`);
      if (elementNode) {
        transformer.nodes([elementNode]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedElement]);

  // Configurar transformer baseado no tipo de elemento
  const getTransformerConfig = useCallback(() => {
    if (!selectedElement) return {};

    const config: any = {
      rotateEnabled: false, // Desabilitar rotação por padrão
      borderStroke: '#3b82f6',
      borderStrokeWidth: 2,
      anchorStroke: '#3b82f6',
      anchorStrokeWidth: 2,
      anchorFill: '#ffffff',
      anchorSize: 8,
      keepRatio: false
    };

    // Configurações específicas por tipo de elemento
    switch (selectedElement.type) {
      case 'background':
      case 'background-usuario':
        // Backgrounds não devem ser redimensionados
        config.enabledAnchors = [];
        config.resizeEnabled = false;
        break;

      case 'logo':
        // Logo deve manter proporção
        config.keepRatio = true;
        config.enabledAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        break;

      case 'jogador':
        // Jogador deve manter proporção
        config.keepRatio = true;
        config.enabledAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        break;

      case 'placar':
        // Placar deve manter proporção específica (1280x720)
        config.keepRatio = true;
        config.enabledAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        break;

      case 'texto-jogador':
      case 'lista-jogadores':
      case 'canais-tv':
      case 'substituicoes':
      case 'info-partida':
        // Elementos de texto podem ser redimensionados livremente
        config.enabledAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        break;

      case 'grafico':
        // Gráfico deve manter proporção quadrada
        config.keepRatio = true;
        config.enabledAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        break;

      default:
        config.enabledAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        break;
    }

    // Verificar constraints do elemento
    const constraints = selectedElement.data?.constraints;
    if (constraints) {
      if (constraints.allowResize === false) {
        config.enabledAnchors = [];
        config.resizeEnabled = false;
      }
      if (constraints.lockAspectRatio) {
        config.keepRatio = true;
      }
    }

    return config;
  }, [selectedElement]);

  // Manipular fim da transformação
  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>) => {
    if (!selectedElement) return;

    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    // Calcular novas dimensões
    let newWidth = Math.max(5, node.width() * scaleX);
    let newHeight = Math.max(5, node.height() * scaleY);

    // Aplicar constraints de tamanho
    const constraints = selectedElement.data?.constraints;
    if (constraints) {
      if (constraints.minSize) {
        newWidth = Math.max(newWidth, constraints.minSize.width);
        newHeight = Math.max(newHeight, constraints.minSize.height);
      }
      if (constraints.maxSize) {
        newWidth = Math.min(newWidth, constraints.maxSize.width);
        newHeight = Math.min(newHeight, constraints.maxSize.height);
      }
    }

    // Atualizar elemento
    onElementUpdate(selectedElement.id, {
      position: {
        x: node.x(),
        y: node.y()
      },
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  }, [selectedElement, onElementUpdate]);

  // Manipular movimento (drag)
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!selectedElement) return;

    const node = e.target;
    
    onElementUpdate(selectedElement.id, {
      position: {
        x: node.x(),
        y: node.y()
      }
    });
  }, [selectedElement, onElementUpdate]);

  if (!selectedElement || selectedElement.locked) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      {...getTransformerConfig()}
      onTransformEnd={handleTransformEnd}
      onDragEnd={handleDragEnd}
    />
  );
};

export default TransformManager;

