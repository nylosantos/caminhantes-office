// src/components/konva/ui/ToolPanel.tsx

import React from 'react';
import { CanvasElement } from '@/types/konva';

interface ToolPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  selectedElements: CanvasElement[];
  onAlignElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributeElements: (direction: 'horizontal' | 'vertical') => void;
  onDuplicateElement: () => void;
  onDeleteElement: () => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  selectedElements,
  onAlignElements,
  onDistributeElements,
  onDuplicateElement,
  onDeleteElement
}) => {
  const hasSelection = selectedElements.length > 0;
  const hasMultipleSelection = selectedElements.length > 1;

  return (
    <div className="tool-panel space-y-4">
      {/* Histórico */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-2">HISTÓRICO</h4>
        <div className="flex space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
            title="Desfazer (Ctrl+Z)"
          >
            ↶ Desfazer
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
            title="Refazer (Ctrl+Y)"
          >
            ↷ Refazer
          </button>
        </div>
      </div>

      {/* Ações de elemento */}
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-2">ELEMENTO</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onDuplicateElement}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
            title="Duplicar (Ctrl+D)"
          >
            📋 Duplicar
          </button>
          <button
            onClick={onDeleteElement}
            disabled={!hasSelection}
            className="px-3 py-2 text-xs bg-red-100 hover:bg-red-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
            title="Excluir (Delete)"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>

      {/* Alinhamento */}
      {hasMultipleSelection && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">ALINHAMENTO</h4>
          <div className="grid grid-cols-3 gap-1 mb-2">
            <button
              onClick={() => onAlignElements('left')}
              className="px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Alinhar à esquerda"
            >
              ⫷
            </button>
            <button
              onClick={() => onAlignElements('center')}
              className="px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Centralizar horizontalmente"
            >
              ⫸
            </button>
            <button
              onClick={() => onAlignElements('right')}
              className="px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Alinhar à direita"
            >
              ⫷
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onAlignElements('top')}
              className="px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Alinhar ao topo"
            >
              ⫶
            </button>
            <button
              onClick={() => onAlignElements('middle')}
              className="px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Centralizar verticalmente"
            >
              ⫯
            </button>
            <button
              onClick={() => onAlignElements('bottom')}
              className="px-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Alinhar à base"
            >
              ⫷
            </button>
          </div>
        </div>
      )}

      {/* Distribuição */}
      {selectedElements.length >= 3 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">DISTRIBUIÇÃO</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDistributeElements('horizontal')}
              className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Distribuir horizontalmente"
            >
              ⟷ Horizontal
            </button>
            <button
              onClick={() => onDistributeElements('vertical')}
              className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Distribuir verticalmente"
            >
              ↕ Vertical
            </button>
          </div>
        </div>
      )}

      {/* Reset */}
      <div>
        <button
          onClick={onReset}
          className="w-full px-3 py-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors"
          title="Resetar todos os elementos"
        >
          🔄 Resetar Tudo
        </button>
      </div>

      {/* Info da seleção */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {hasSelection ? (
            selectedElements.length === 1 ? (
              <div>
                <div className="font-medium">1 elemento selecionado</div>
                <div>Tipo: {selectedElements[0].type}</div>
                <div>Posição: {Math.round(selectedElements[0].position.x)}, {Math.round(selectedElements[0].position.y)}</div>
                <div>Tamanho: {Math.round(selectedElements[0].size.width)}×{Math.round(selectedElements[0].size.height)}</div>
              </div>
            ) : (
              <div>
                <div className="font-medium">{selectedElements.length} elementos selecionados</div>
                <div>Use as ferramentas de alinhamento</div>
              </div>
            )
          ) : (
            <div>Nenhum elemento selecionado</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolPanel;

