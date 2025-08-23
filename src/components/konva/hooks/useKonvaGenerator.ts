// src/components/konva/hooks/useKonvaGenerator.ts

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Konva from 'konva';

import {
  CanvasElement,
  GeneratorType,
  ImageFormat,
  GeneratorData,
  HistoryManager,
  HistoryState,
  ExportConfig,
  CanvasExportResult
} from '@/types/konva';
import { BaseImage } from '@/types/images';
import {
  convertGeneratorDataToElements,
  exportCanvasAsImage,
  validateElements,
  duplicateElement,
  alignElements,
  distributeElements
} from '@/utils/konva-utils';
import { Match } from '@/types/matches';

interface UseKonvaGeneratorProps {
  generatorType: GeneratorType;
  format: ImageFormat;
  generatorData: GeneratorData;
  matchData: Match;
  baseImages: BaseImage[];
  enableHistory?: boolean;
  maxHistoryStates?: number;
}

interface UseKonvaGeneratorReturn {
  // Estado dos elementos
  elements: CanvasElement[];
  selectedElementId: string | null;

  // Manipulação de elementos
  selectElement: (elementId: string | null) => void;
  updateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  addElement: (element: CanvasElement) => void;
  removeElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  reorderElements: (newOrder: string[]) => void;

  // Operações em lote
  selectMultipleElements: (elementIds: string[]) => void;
  updateMultipleElements: (updates: Record<string, Partial<CanvasElement>>) => void;
  alignSelectedElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelectedElements: (direction: 'horizontal' | 'vertical') => void;

  // Histórico (undo/redo)
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveToHistory: (description: string) => void;

  // Exportação
  exportImage: (stageRef: React.RefObject<Konva.Stage | null>, imageFormat: ImageFormat, config?: ExportConfig) => Promise<CanvasExportResult>;

  // Utilitários
  resetElements: () => void;
  getElementsCount: () => number;
  getSelectedElements: () => CanvasElement[];
  isValidState: () => boolean;
}

export const useKonvaGenerator = ({
  generatorType,
  format,
  generatorData,
  matchData,
  baseImages,
  enableHistory = true,
  maxHistoryStates = 50
}: UseKonvaGeneratorProps): UseKonvaGeneratorReturn => {

  // Estado principal
  const [elements, setElements] = useState<CanvasElement[]>(() =>
    convertGeneratorDataToElements(generatorType, format, generatorData, matchData, baseImages)
  );

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Histórico
  const [history, setHistory] = useState<HistoryManager>({
    states: [],
    currentIndex: -1,
    maxStates: maxHistoryStates
  });

  // Elementos selecionados (para seleção múltipla)
  const selectedElements = useMemo(() =>
    elements.filter(el => el.selected),
    [elements]
  );

  // ==================== MANIPULAÇÃO DE ELEMENTOS ====================

  const selectElement = useCallback((elementId: string | null) => {
    setSelectedElementId(elementId);

    // Atualizar propriedade selected dos elementos
    setElements(prev => prev.map(el => ({
      ...el,
      selected: el.id === elementId
    })));
  }, []);

  const updateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));
  }, []);

  const addElement = useCallback((element: CanvasElement) => {
    if (!validateElements([element])) {
      console.error('Invalid element:', element);
      return;
    }

    setElements(prev => [...prev, element].sort((a, b) => a.zIndex - b.zIndex));
  }, []);

  const removeElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));

    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  }, [selectedElementId]);

  const duplicateElementById = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const duplicated = duplicateElement(element);
    addElement(duplicated);
    selectElement(duplicated.id);
  }, [elements, addElement, selectElement]);

  const reorderElements = useCallback((newOrder: string[]) => {
    setElements(prev => {
      const reordered = newOrder.map(id => prev.find(el => el.id === id)).filter(Boolean) as CanvasElement[];

      // Atualizar z-index baseado na nova ordem
      return reordered.map((el, index) => ({
        ...el,
        zIndex: index + 1
      }));
    });
  }, []);

  // ==================== OPERAÇÕES EM LOTE ====================

  const selectMultipleElements = useCallback((elementIds: string[]) => {
    setElements(prev => prev.map(el => ({
      ...el,
      selected: elementIds.includes(el.id)
    })));

    // Se apenas um elemento selecionado, definir como selectedElementId
    if (elementIds.length === 1) {
      setSelectedElementId(elementIds[0]);
    } else {
      setSelectedElementId(null);
    }
  }, []);

  const updateMultipleElements = useCallback((updates: Record<string, Partial<CanvasElement>>) => {
    setElements(prev => prev.map(el => {
      const elementUpdates = updates[el.id];
      return elementUpdates ? { ...el, ...elementUpdates } : el;
    }));
  }, []);

  const alignSelectedElements = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length < 2) return;

    const aligned = alignElements(selectedElements, alignment);
    const updates: Record<string, Partial<CanvasElement>> = {};

    aligned.forEach(el => {
      updates[el.id] = { position: el.position };
    });

    updateMultipleElements(updates);
    saveToHistory(`Align elements ${alignment}`);
  }, [selectedElements, updateMultipleElements]);

  const distributeSelectedElements = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 3) return;

    const distributed = distributeElements(selectedElements, direction);
    const updates: Record<string, Partial<CanvasElement>> = {};

    distributed.forEach(el => {
      updates[el.id] = { position: el.position };
    });

    updateMultipleElements(updates);
    saveToHistory(`Distribute elements ${direction}`);
  }, [selectedElements, updateMultipleElements]);

  // ==================== HISTÓRICO ====================

  const saveToHistory = useCallback((description: string) => {
    if (!enableHistory) return;

    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(elements)),
      timestamp: Date.now(),
      description
    };

    setHistory(prev => {
      const newHistory = { ...prev };

      // Remove estados futuros se estivermos no meio do histórico
      if (newHistory.currentIndex < newHistory.states.length - 1) {
        newHistory.states = newHistory.states.slice(0, newHistory.currentIndex + 1);
      }

      // Adiciona novo estado
      newHistory.states.push(newState);
      newHistory.currentIndex++;

      // Remove estados antigos se exceder o limite
      if (newHistory.states.length > newHistory.maxStates) {
        newHistory.states.shift();
        newHistory.currentIndex--;
      }

      return newHistory;
    });
  }, [enableHistory, elements]);

  const undo = useCallback(() => {
    if (!enableHistory || history.currentIndex <= 0) return;

    const prevState = history.states[history.currentIndex - 1];
    if (prevState) {
      setElements(prevState.elements);
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1
      }));

      // Limpar seleção
      setSelectedElementId(null);
    }
  }, [enableHistory, history]);

  const redo = useCallback(() => {
    if (!enableHistory || history.currentIndex >= history.states.length - 1) return;

    const nextState = history.states[history.currentIndex + 1];
    if (nextState) {
      setElements(nextState.elements);
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));

      // Limpar seleção
      setSelectedElementId(null);
    }
  }, [enableHistory, history]);

  // ==================== EXPORTAÇÃO ====================

  const exportImage = useCallback(async (
    stageRef: React.RefObject<Konva.Stage | null>,
    imageFormat: ImageFormat,
    config: ExportConfig = { format: 'png', quality: 1, scale: 1 }
  ): Promise<CanvasExportResult> => {
    if (!stageRef.current) {
      throw new Error('Stage reference is required for export');
    }
    console.log('esse é o formato: ', imageFormat)
    // Temporariamente remover seleções para exportação limpa
    const wasSelected = selectedElementId;
    if (wasSelected) {
      selectElement(null);
    }

    // Aguardar próximo frame para garantir que a seleção foi removida
    await new Promise(resolve => requestAnimationFrame(resolve));
    try {
      const result = await exportCanvasAsImage(stageRef.current, imageFormat, config.format, config.quality, config.scale);
      return result;
    } finally {
      // Restaurar seleção
      if (wasSelected) {
        selectElement(wasSelected);
      }
    }
  }, [selectedElementId, selectElement]);

  // ==================== UTILITÁRIOS ====================

  const resetElements = useCallback(() => {
    const newElements = convertGeneratorDataToElements(generatorType, format, generatorData, matchData, baseImages);
    setElements(newElements);
    setSelectedElementId(null);

    if (enableHistory) {
      saveToHistory('Reset elements');
    }
  }, [generatorType, format, generatorData, baseImages, enableHistory, saveToHistory]);

  const getElementsCount = useCallback(() => elements.length, [elements]);

  const getSelectedElements = useCallback(() => selectedElements, [selectedElements]);

  const isValidState = useCallback(() => validateElements(elements), [elements]);

  // ==================== COMPUTED VALUES ====================

  const canUndo = enableHistory && history.currentIndex > 0;
  const canRedo = enableHistory && history.currentIndex < history.states.length - 1;

  // ==================== EFEITOS ====================

  // Atualizar elementos quando dados do gerador mudarem
  useEffect(() => {
    const newElements = convertGeneratorDataToElements(generatorType, format, generatorData, matchData, baseImages);
    setElements(newElements);
    setSelectedElementId(null);
  }, [generatorType, format, generatorData, baseImages]);

  // Salvar estado inicial no histórico
  useEffect(() => {
    if (enableHistory && history.states.length === 0) {
      saveToHistory('Initial state');
    }
  }, [enableHistory, history.states.length, saveToHistory]);

  return {
    // Estado dos elementos
    elements,
    selectedElementId,

    // Manipulação de elementos
    selectElement,
    updateElement,
    addElement,
    removeElement,
    duplicateElement: duplicateElementById,
    reorderElements,

    // Operações em lote
    selectMultipleElements,
    updateMultipleElements,
    alignSelectedElements,
    distributeSelectedElements,

    // Histórico
    canUndo,
    canRedo,
    undo,
    redo,
    saveToHistory,

    // Exportação
    exportImage,

    // Utilitários
    resetElements,
    getElementsCount,
    getSelectedElements,
    isValidState
  };
};

