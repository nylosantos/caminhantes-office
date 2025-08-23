// src/components/konva/KonvaImageGenerator.tsx

import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

import {
  KonvaImageGeneratorProps,
  CanvasElement,
  ImageFormat,
  GeneratorType,
  HistoryManager,
  HistoryState,
  ExportConfig,
  CANVAS_DIMENSIONS,
  PlacarElementData,
} from '@/types/konva';
import { getGeneratorConfig, getFormatConfig } from '@/config/konva-generators';

// Componentes dos elementos
import BackgroundElement from './elements/BackgroundElement';
import LogoElement from './elements/LogoElement';
import PlacarElement from './elements/PlacarElement';
import JogadorElement from './elements/JogadorElement';
import TextoJogadorElement from './elements/TextoJogadorElement';
import ListaJogadoresElement from './elements/ListaJogadoresElement';
import CanaisTvElement from './elements/CanaisTvElement';
import GraficoElement from './elements/GraficoElement';
import SubstituicoesElement from './elements/SubstituicoesElement';
import BackgroundUsuarioElement from './elements/BackgroundUsuarioElement';
import InfoPartidaElement from './elements/InfoPartidaElement';
import domtoimage from 'dom-to-image';

// Componentes de funcionalidades
import ResponsiveStage from './features/ResponsiveStage';
import TransformManager from './features/TransformManager';
import SelectionBox from './features/SelectionBox';
import { AppProviders } from '@/contexts';
import { createRoot } from 'react-dom/client';
import SplitRectangleDisplay from '../SplitRectangleDisplay';

interface KonvaImageGeneratorState {
  stageScale: number;
  stagePosition: { x: number; y: number };
  containerSize: { width: number; height: number };
  history: HistoryManager;
}

const KonvaImageGenerator: React.FC<KonvaImageGeneratorProps> = ({
  stageRef,
  generatorType,
  format,
  elements,
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onElementsReorder,
  onExport,
  baseImages,
  responsive = true,
  showGrid = false,
  showGuides = false,
  enableUndo = true,
  enableFilters = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<KonvaImageGeneratorState>({
    stageScale: 1,
    stagePosition: { x: 0, y: 0 },
    containerSize: {
      width: format === 'horizontal' ? 1920 : 1080,
      height: format === 'vertical' ? 1920 : 1080,
    },
    history: {
      states: [],
      currentIndex: -1,
      maxStates: 50,
    },
  });

  // Configurações do gerador
  const generatorConfig = useMemo(
    () => getGeneratorConfig(generatorType),
    [generatorType]
  );

  const formatConfig = useMemo(
    () => getFormatConfig(generatorType, format),
    [generatorType, format]
  );

  // Dimensões do canvas
  const canvasDimensions = useMemo(() => CANVAS_DIMENSIONS[format], [format]);

  // Elementos ordenados por z-index
  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements]
  );

  // Elemento selecionado
  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedElementId) || null,
    [elements, selectedElementId]
  );

  // ==================== RESPONSIVIDADE ====================

  const calculateContainerSize = (
    format: ImageFormat,
    availableWidth: number,
    availableHeight: number
  ) => {
    // Calcular escalas
    const scaleX = availableWidth / canvasDimensions.width;
    const scaleY = availableHeight / canvasDimensions.height;

    // Usar menor escala (fit completo)
    const scale = Math.min(scaleX, scaleY);

    return {
      width: canvasDimensions.width * scale,
      height: canvasDimensions.height * scale,
      scale: scale,
    };
  };

  const updateStageScale = useCallback(() => {
    if (!responsive || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const containerSize = calculateContainerSize(
      format,
      containerWidth,
      containerHeight
    );

    const scaleX = containerSize.width / canvasDimensions.width;
    const scaleY = containerSize.height / canvasDimensions.height;
    const scale = Math.min(scaleX, scaleY, 1); // Não aumentar além do tamanho original

    setState((prev) => ({
      ...prev,
      stageScale: scale,
      containerSize: {
        width: containerSize.width,
        height: containerSize.height,
      },
    }));
  }, [responsive, canvasDimensions]);

  useEffect(() => {
    if (!responsive) return;

    updateStageScale();

    const handleResize = () => updateStageScale();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [responsive, updateStageScale]);

  // ==================== HISTÓRICO (UNDO/REDO) ====================

  const saveToHistory = useCallback(
    (description: string) => {
      if (!enableUndo) return;

      const newState: HistoryState = {
        elements: JSON.parse(JSON.stringify(elements)),
        timestamp: Date.now(),
        description,
      };

      setState((prev) => {
        const newHistory = { ...prev.history };

        // Remove estados futuros se estivermos no meio do histórico
        if (newHistory.currentIndex < newHistory.states.length - 1) {
          newHistory.states = newHistory.states.slice(
            0,
            newHistory.currentIndex + 1
          );
        }

        // Adiciona novo estado
        newHistory.states.push(newState);
        newHistory.currentIndex++;

        // Remove estados antigos se exceder o limite
        if (newHistory.states.length > newHistory.maxStates) {
          newHistory.states.shift();
          newHistory.currentIndex--;
        }

        return { ...prev, history: newHistory };
      });
    },
    [enableUndo, elements]
  );

  const undo = useCallback(() => {
    if (!enableUndo || state.history.currentIndex <= 0) return;

    const prevState = state.history.states[state.history.currentIndex - 1];
    if (prevState) {
      // Restaurar elementos do estado anterior
      prevState.elements.forEach((element) => {
        onElementUpdate(element.id, element);
      });

      setState((prev) => ({
        ...prev,
        history: {
          ...prev.history,
          currentIndex: prev.history.currentIndex - 1,
        },
      }));
    }
  }, [enableUndo, state.history, onElementUpdate]);

  const redo = useCallback(() => {
    if (
      !enableUndo ||
      state.history.currentIndex >= state.history.states.length - 1
    )
      return;

    const nextState = state.history.states[state.history.currentIndex + 1];
    if (nextState) {
      // Restaurar elementos do próximo estado
      nextState.elements.forEach((element) => {
        onElementUpdate(element.id, element);
      });

      setState((prev) => ({
        ...prev,
        history: {
          ...prev.history,
          currentIndex: prev.history.currentIndex + 1,
        },
      }));
    }
  }, [enableUndo, state.history, onElementUpdate]);

  // ==================== MANIPULAÇÃO DE ELEMENTOS ====================

  const handleElementClick = useCallback(
    (elementId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      onElementSelect(elementId);
    },
    [onElementSelect]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Desselecionar se clicar no stage vazio
      if (e.target === e.target.getStage()) {
        onElementSelect(null);
      }
    },
    [onElementSelect]
  );

  const handleElementDragEnd = useCallback(
    (elementId: string, newPosition: { x: number; y: number }) => {
      onElementUpdate(elementId, { position: newPosition });
      saveToHistory(`Moved ${elementId}`);
    },
    [onElementUpdate, saveToHistory]
  );

  const handleElementTransform = useCallback(
    (elementId: string, newAttrs: Partial<CanvasElement>) => {
      onElementUpdate(elementId, newAttrs);
      saveToHistory(`Transformed ${elementId}`);
    },
    [onElementUpdate, saveToHistory]
  );

  // ==================== EXPORTAÇÃO ====================

  const exportImage = useCallback(
    async (config: ExportConfig = { format: 'png', quality: 1, scale: 1 }) => {
      if (!stageRef.current) return;

      const stage = stageRef.current;

      // Temporariamente remover seleção para exportação limpa
      const wasSelected = selectedElementId;
      if (wasSelected) {
        onElementSelect(null);
      }

      // Aguardar próximo frame para garantir que a seleção foi removida
      await new Promise((resolve) => requestAnimationFrame(resolve));

      try {
        const dataUrl = stage.toDataURL({
          mimeType: config.format === 'jpeg' ? 'image/jpeg' : 'image/png',
          quality: config.quality,
          pixelRatio: config.scale,
        });

        onExport(dataUrl, format);
      } catch (error) {
        console.error('Erro ao exportar imagem:', error);
      } finally {
        // Restaurar seleção
        if (wasSelected) {
          onElementSelect(wasSelected);
        }
      }
    },
    [selectedElementId, onElementSelect, onExport, format]
  );

  // ==================== RENDERIZAÇÃO DOS ELEMENTOS ====================

  const renderElement = useCallback(
    (element: CanvasElement) => {
      // console.log('elemento renderizado: ', element.type);
      // 1. A chave 'key' foi removida do objeto `commonProps`.
      const commonProps = {
        element,
        isSelected: element.id === selectedElementId,
        onClick: (e: Konva.KonvaEventObject<MouseEvent>) =>
          handleElementClick(element.id, e),
        onDragEnd: (newPosition: { x: number; y: number }) =>
          handleElementDragEnd(element.id, newPosition),
        onTransform: (newAttrs: Partial<CanvasElement>) =>
          handleElementTransform(element.id, newAttrs),
        baseImages,
        formatConfig,
      };

      switch (element.type) {
        // 2. A chave 'key' é agora passada diretamente para cada componente.
        case 'background':
          return (
            <BackgroundElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'logo':
          return (
            <LogoElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'placar':
          return (
            <PlacarElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'jogador':
          return (
            <JogadorElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'texto-jogador':
          return (
            <TextoJogadorElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'lista-jogadores':
          return (
            <ListaJogadoresElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'canais-tv':
          return (
            <CanaisTvElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'grafico':
          return (
            <GraficoElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'substituicoes':
          return (
            <SubstituicoesElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'background-usuario':
          return (
            <BackgroundUsuarioElement
              key={element.id}
              {...commonProps}
            />
          );
        case 'info-partida':
          return (
            <InfoPartidaElement
              key={element.id}
              {...commonProps}
            />
          );
        default:
          return null;
      }
    },
    [
      selectedElementId,
      handleElementClick,
      handleElementDragEnd,
      handleElementTransform,
      baseImages,
      formatConfig,
    ]
  );

  // ==================== KEYBOARD SHORTCUTS ====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'e':
            e.preventDefault();
            exportImage();
            break;
        }
      }

      // Delete key para remover elemento selecionado
      if (e.key === 'Delete' && selectedElementId) {
        // Implementar remoção se necessário
        console.log('Delete element:', selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, exportImage, selectedElementId]);

  // ==================== RENDER ====================

  if (!generatorConfig || !formatConfig) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Configuração do gerador não encontrada</p>
      </div>
    );
  }

  return (
    <div className="konva-image-generator w-full h-full">
      <div
        ref={containerRef}
        className="konva-container w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
      >
        <Stage
          ref={stageRef}
          width={state.containerSize.width}
          height={state.containerSize.height}
          scaleX={state.stageScale}
          scaleY={state.stageScale}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          {/* Layer de transformação */}
          <Layer>
            {/* {selectedElement && ( */}
            <TransformManager
              selectedElement={selectedElement}
              onElementUpdate={onElementUpdate}
            />
            {/* )} */}
          </Layer>
          <Layer>
            {/* Grid de fundo (opcional) */}
            {showGrid && (
              <React.Fragment>
                {/* Implementar grid aqui se necessário */}
              </React.Fragment>
            )}

            {/* Elementos do canvas */}
            {sortedElements
              .filter((element) => element.visible)
              .map(renderElement)}

            {/* Guias de alinhamento (opcional) */}
            {showGuides && selectedElement && (
              <React.Fragment>
                {/* Implementar guias aqui se necessário */}
              </React.Fragment>
            )}
          </Layer>
        </Stage>
      </div>

      {/* Informações de debug (desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <div>
            Formato: {format} ({canvasDimensions.width}x
            {canvasDimensions.height})
          </div>
          <div>Escala: {state.stageScale.toFixed(2)}</div>
          <div>Elementos: {elements.length}</div>
          <div>Selecionado: {selectedElementId || 'Nenhum'}</div>
          {enableUndo && (
            <div>
              Histórico: {state.history.currentIndex + 1}/
              {state.history.states.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KonvaImageGenerator;
