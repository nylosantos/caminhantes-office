// src/components/konva/KonvaGeneratorWrapper.tsx

import React, { useRef, useCallback, useState, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';

import {
  GeneratorType,
  ImageFormat,
  GeneratorData,
  CanvasElement,
  ExportConfig,
} from '@/types/konva';
import { BaseImage } from '@/types/images';

import KonvaImageGenerator from './KonvaImageGenerator';
import { useKonvaGenerator } from './hooks/useKonvaGenerator';
import LayerManager from './ui/LayerManager';
import ToolPanel from './ui/ToolPanel';
import ExportPanel from './ui/ExportPanel';
import { Match } from '@/types/matches';
import Konva from 'konva';

interface KonvaGeneratorWrapperProps {
  generatorType: GeneratorType;
  matchData: Match;
  format: ImageFormat;
  generatorData: GeneratorData;
  baseImages: BaseImage[];
  onExport?: (dataUrl: string, format: ImageFormat) => void;
  showUI?: boolean;
  className?: string;
}

const KonvaGeneratorWrapper: React.FC<KonvaGeneratorWrapperProps> = ({
  generatorType,
  format,
  generatorData,
  matchData,
  baseImages,
  onExport,
  showUI = true,
  className = '',
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Hook principal do sistema Konva
  const {
    elements,
    selectedElementId,
    selectElement,
    updateElement,
    addElement,
    removeElement,
    duplicateElement,
    reorderElements,
    selectMultipleElements,
    alignSelectedElements,
    distributeSelectedElements,
    canUndo,
    canRedo,
    undo,
    redo,
    saveToHistory,
    exportImage,
    resetElements,
    getSelectedElements,
    isValidState,
  } = useKonvaGenerator({
    generatorType,
    format,
    generatorData,
    matchData,
    baseImages,
    enableHistory: true,
    maxHistoryStates: 50,
  });

  // Adicionar DEPOIS da linha 47 (após o hook useKonvaGenerator):
  const [isDragging, setIsDragging] = useState(false);

  // Manipular exportação
  const handleExport = useCallback(
    async (config?: ExportConfig) => {
      if (!stageRef.current) return;

      setIsExporting(true);

      try {
        const result = await exportImage(stageRef, format, config);

        if (onExport) {
          onExport(result.dataUrl, format);
        }

        // Também fazer download automático
        const link = document.createElement('a');
        link.download = `${generatorType}-${format}-${Date.now()}.${
          config?.format || 'png'
        }`;
        link.href = result.dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Erro ao exportar imagem:', error);
        alert('Erro ao exportar imagem. Tente novamente.');
      } finally {
        setIsExporting(false);
      }
    },
    [exportImage, onExport, format, generatorType]
  );

  // Manipular reordenação de elementos
  const handleElementsReorder = useCallback(
    (newOrder: string[]) => {
      reorderElements(newOrder);
      saveToHistory('Reorder elements');
    },
    [reorderElements, saveToHistory]
  );

  // Manipular atualização de elemento
  const handleElementUpdate = useCallback(
    (elementId: string, updates: Partial<CanvasElement>) => {
      updateElement(elementId, updates);
      // Não salvar no histórico aqui pois será salvo pelo próprio elemento
    },
    [updateElement]
  );

  // Adicionar DEPOIS da linha 60 (após as outras funções):

  // Elementos estáveis durante drag
  const stableElements = useMemo(() => {
    return isDragging ? elements : elements;
  }, [elements, isDragging]);

  // Handlers para drag
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (newOrder: string[]) => {
      setIsDragging(false);
      handleElementsReorder(newOrder);
    },
    [handleElementsReorder]
  );

  // Atalhos de teclado
  React.useEffect(() => {
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
          case 'd':
            e.preventDefault();
            if (selectedElementId) {
              duplicateElement(selectedElementId);
              saveToHistory('Duplicate element');
            }
            break;
          case 'a':
            e.preventDefault();
            selectMultipleElements(elements.map((el) => el.id));
            break;
          case 'e':
            e.preventDefault();
            handleExport();
            break;
        }
      }

      // Delete key
      if (e.key === 'Delete' && selectedElementId) {
        removeElement(selectedElementId);
        saveToHistory('Delete element');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    selectedElementId,
    duplicateElement,
    saveToHistory,
    selectMultipleElements,
    elements,
    handleExport,
    removeElement,
  ]);

  const selectedElements = getSelectedElements();

  return (
    <div className={`konva-generator-wrapper ${className}`}>
      <div className="flex">
        {/* Painel lateral esquerdo */}
        {showUI && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Ferramentas */}
            <div className="p-4 border-b border-gray-200">
              <ToolPanel
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onReset={resetElements}
                selectedElements={selectedElements}
                onAlignElements={alignSelectedElements}
                onDistributeElements={distributeSelectedElements}
                onDuplicateElement={() => {
                  if (selectedElementId) {
                    duplicateElement(selectedElementId);
                    saveToHistory('Duplicate element');
                  }
                }}
                onDeleteElement={() => {
                  if (selectedElementId) {
                    removeElement(selectedElementId);
                    saveToHistory('Delete element');
                  }
                }}
              />
            </div>

            {/* Gerenciador de camadas */}
            <div className="flex-1 overflow-y-auto">
              <LayerManager
                key="layer-manager-stable"
                elements={stableElements} // ← Usar stableElements
                selectedElementId={selectedElementId}
                onElementSelect={selectElement}
                onElementToggleVisibility={(elementId) => {
                  const element = elements.find((el) => el.id === elementId);
                  if (element) {
                    updateElement(elementId, { visible: !element.visible });
                    saveToHistory(`Toggle visibility: ${elementId}`);
                  }
                }}
                onElementToggleLock={(elementId) => {
                  const element = elements.find((el) => el.id === elementId);
                  if (element) {
                    updateElement(elementId, { locked: !element.locked });
                    saveToHistory(`Toggle lock: ${elementId}`);
                  }
                }}
                onElementsReorder={handleDragEnd} // ← Usar handleDragEnd
                onDragStart={handleDragStart} // ← Adicionar onDragStart
              />
            </div>

            {/* Painel de exportação */}
            <div className="p-4 border-t border-gray-200">
              <ExportPanel
                onExport={handleExport}
                isExporting={isExporting}
                format={format}
                generatorType={generatorType}
              />
            </div>
          </div>
        )}

        {/* Canvas principal */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <KonvaImageGenerator
              stageRef={stageRef}
              generatorType={generatorType}
              format={format}
              elements={elements}
              selectedElementId={selectedElementId}
              onElementSelect={selectElement}
              onElementUpdate={handleElementUpdate}
              onElementsReorder={handleElementsReorder}
              onExport={(dataUrl) => onExport?.(dataUrl, format)}
              baseImages={baseImages}
              responsive={true}
              showGrid={false}
              showGuides={true}
              enableUndo={true}
              enableFilters={false}
            />
          </div>

          {/* Barra de status */}
          {showUI && (
            <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Elementos: {elements.length}</span>
                <span>
                  Selecionado:{' '}
                  {selectedElementId
                    ? elements.find((el) => el.id === selectedElementId)?.type
                    : 'Nenhum'}
                </span>
                <span>Formato: {format}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Estado: {isValidState() ? 'Válido' : 'Inválido'}</span>
                {process.env.NODE_ENV === 'development' && (
                  <span>Debug: Ativo</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KonvaGeneratorWrapper;
