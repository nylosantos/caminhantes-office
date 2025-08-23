// src/components/konva/ui/LayerManagerNew.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';

import { LayerManagerProps } from '@/types/konva';

// Ícones (mesmos de antes)
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {visible ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
      />
    )}
  </svg>
);

const LockIcon = ({ locked }: { locked: boolean }) => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {locked ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
      />
    )}
  </svg>
);

const DragIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 8h16M4 16h16"
    />
  </svg>
);

// Mapeamento de tipos
const ELEMENT_TYPE_NAMES: Record<string, string> = {
  background: 'Fundo',
  logo: 'Logo',
  placar: 'Placar',
  jogador: 'Jogador',
  'texto-jogador': 'Texto do Jogador',
  'lista-jogadores': 'Lista de Jogadores',
  'canais-tv': 'Canais de TV',
  grafico: 'Gráfico',
  substituicoes: 'Substituições',
  'background-usuario': 'Fundo do Usuário',
  'info-partida': 'Info da Partida',
  overlay: 'Sobreposição',
};

// Componente do item individual
interface LayerItemProps {
  element: any;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  isDraggedOver: boolean;
}

const LayerItem: React.FC<LayerItemProps> = ({
  element,
  index,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  isDraggedOver,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return combine(
      draggable({
        element: el,
        getInitialData: () => ({ elementId: element.id, index }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: el,
        getData: () => ({ index }),
        canDrop: ({ source }) => source.data.elementId !== element.id,
      })
    );
  }, [element.id, index]);

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'background':
      case 'background-usuario':
        return '🖼️';
      case 'logo':
        return '🏷️';
      case 'placar':
        return '⚽';
      case 'jogador':
        return '👤';
      case 'texto-jogador':
        return '📝';
      case 'lista-jogadores':
        return '📋';
      case 'canais-tv':
        return '📺';
      case 'grafico':
        return '📊';
      case 'substituicoes':
        return '🔄';
      case 'info-partida':
        return 'ℹ️';
      default:
        return '📄';
    }
  };

  return (
    <div
      ref={ref}
      className={`
        flex items-center p-2 mb-1 rounded-lg border transition-all duration-200
        ${
          isSelected
            ? 'bg-blue-100 border-blue-300 shadow-sm'
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }
        ${isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
        ${element.locked ? 'opacity-60' : ''}
        ${isDraggedOver ? 'bg-blue-50' : ''}
      `}
    >
      {/* Drag handle */}
      <div
        className={`mr-2 transition-colors ${
          element.locked
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing'
        }`}
      >
        <DragIcon />
      </div>

      {/* Element icon and info */}
      <div
        className="flex-1 flex items-center cursor-pointer"
        onClick={onSelect}
      >
        <span className="mr-2 text-sm">{getElementIcon(element.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {ELEMENT_TYPE_NAMES[element.type] || element.type}
          </div>
          <div className="text-xs text-gray-500">
            z: {element.zIndex} • {Math.round(element.position.x)},{' '}
            {Math.round(element.position.y)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-1 ml-2">
        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={`
            p-1 rounded transition-colors
            ${
              element.visible
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-gray-300 hover:text-gray-500'
            }
          `}
          title={element.visible ? 'Ocultar' : 'Mostrar'}
        >
          <EyeIcon visible={element.visible} />
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={`
            p-1 rounded transition-colors
            ${
              element.locked
                ? 'text-red-500 hover:text-red-700'
                : 'text-gray-400 hover:text-gray-600'
            }
          `}
          title={element.locked ? 'Desbloquear' : 'Bloquear'}
        >
          <LockIcon locked={element.locked} />
        </button>
      </div>

      {/* Drop indicator */}
      {isDraggedOver && <DropIndicator edge="bottom" />}
    </div>
  );
};

// Componente principal
const LayerManagerNew: React.FC<LayerManagerProps> = ({
  elements,
  selectedElementId,
  onElementSelect,
  onElementToggleVisibility,
  onElementToggleLock,
  onElementsReorder,
}) => {
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ordenar elementos por z-index (maior para menor)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter: ({ source }) => {
        const index = source.data.index as number;
        setDraggedOverIndex(index);
      },
      onDragLeave: () => {
        setDraggedOverIndex(null);
      },
      onDrop: ({ source, location }) => {
        setDraggedOverIndex(null);

        const sourceIndex = source.data.index as number;
        const target = location.current.dropTargets[0];

        if (!target) return;

        const destinationIndex = target.data.index as number;

        if (sourceIndex === destinationIndex) return;

        // Reordenar elementos
        const reorderedElements = reorder({
          list: sortedElements,
          startIndex: sourceIndex,
          finishIndex: destinationIndex,
        });

        // Converter de volta para ordem por z-index
        const newOrder = reorderedElements.reverse().map((el) => el.id);
        onElementsReorder(newOrder);
      },
    });
  }, [sortedElements, onElementsReorder]);

  return (
    <div className="layer-manager">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Camadas</h3>
        <p className="text-xs text-gray-500 mt-1">
          Arraste para reordenar • Topo = Frente
        </p>
      </div>

      <div
        ref={containerRef}
        className="overflow-y-auto max-h-96 p-2"
      >
        {sortedElements.map((element, index) => (
          <LayerItem
            key={element.id}
            element={element}
            index={index}
            isSelected={element.id === selectedElementId}
            onSelect={() => onElementSelect(element.id)}
            onToggleVisibility={() => onElementToggleVisibility(element.id)}
            onToggleLock={() => onElementToggleLock(element.id)}
            isDraggedOver={draggedOverIndex === index}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Total: {elements.length} elementos</div>
          <div>Visíveis: {elements.filter((el) => el.visible).length}</div>
          <div>Bloqueados: {elements.filter((el) => el.locked).length}</div>
        </div>
      </div>
    </div>
  );
};

export default LayerManagerNew;
