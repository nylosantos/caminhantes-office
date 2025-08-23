// // src/components/konva/ui/LayerManager.tsx

// import React, { useState, useCallback } from 'react';
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// import { LayerManagerProps } from '@/types/konva';

// // Ícones simples (você pode substituir por uma biblioteca de ícones)
// const EyeIcon = ({ visible }: { visible: boolean }) => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     {visible ? (
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//     ) : (
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
//     )}
//   </svg>
// );

// const LockIcon = ({ locked }: { locked: boolean }) => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     {locked ? (
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//     ) : (
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
//     )}
//   </svg>
// );

// const DragIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
//   </svg>
// );

// // Mapeamento de tipos para nomes amigáveis
// const ELEMENT_TYPE_NAMES: Record<string, string> = {
//   'background': 'Fundo',
//   'logo': 'Logo',
//   'placar': 'Placar',
//   'jogador': 'Jogador',
//   'texto-jogador': 'Texto do Jogador',
//   'lista-jogadores': 'Lista de Jogadores',
//   'canais-tv': 'Canais de TV',
//   'grafico': 'Gráfico',
//   'substituicoes': 'Substituições',
//   'background-usuario': 'Fundo do Usuário',
//   'info-partida': 'Info da Partida',
//   'overlay': 'Sobreposição'
// };

// const LayerManager: React.FC<LayerManagerProps> = ({
//   elements,
//   selectedElementId,
//   onElementSelect,
//   onElementToggleVisibility,
//   onElementToggleLock,
//   onElementsReorder
// }) => {
//   const [draggedElementId, setDraggedElementId] = useState<string | null>(null);

//   // Ordenar elementos por z-index (do maior para o menor, pois o topo da lista é o que aparece na frente)
//   const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

//   const handleDragEnd = useCallback((result: DropResult) => {
//     setDraggedElementId(null);

//     if (!result.destination) return;

//     const sourceIndex = result.source.index;
//     const destinationIndex = result.destination.index;

//     if (sourceIndex === destinationIndex) return;

//     // Reordenar elementos
//     const reorderedElements = Array.from(sortedElements);
//     const [removed] = reorderedElements.splice(sourceIndex, 1);
//     reorderedElements.splice(destinationIndex, 0, removed);

//     // Converter de volta para ordem por z-index
//     const newOrder = reorderedElements.reverse().map(el => el.id);
//     onElementsReorder(newOrder);
//   }, [sortedElements, onElementsReorder]);

//   const handleDragStart = useCallback((start: any) => {
//     setDraggedElementId(start.draggableId);
//   }, []);

//   const getElementIcon = (type: string) => {
//     switch (type) {
//       case 'background':
//       case 'background-usuario':
//         return '🖼️';
//       case 'logo':
//         return '🏷️';
//       case 'placar':
//         return '⚽';
//       case 'jogador':
//         return '👤';
//       case 'texto-jogador':
//         return '📝';
//       case 'lista-jogadores':
//         return '📋';
//       case 'canais-tv':
//         return '📺';
//       case 'grafico':
//         return '📊';
//       case 'substituicoes':
//         return '🔄';
//       case 'info-partida':
//         return 'ℹ️';
//       default:
//         return '📄';
//     }
//   };

//   return (
//     <div className="layer-manager">
//       <div className="p-3 border-b border-gray-200">
//         <h3 className="text-sm font-semibold text-gray-700">Camadas</h3>
//         <p className="text-xs text-gray-500 mt-1">
//           Arraste para reordenar • Topo = Frente
//         </p>
//       </div>

//       <div className="overflow-y-auto max-h-96">
//         <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
//           <Droppable droppableId="layers">
//             {(provided, snapshot) => (
//               <div
//                 {...provided.droppableProps}
//                 ref={provided.innerRef}
//                 className={`p-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
//               >
//                 {sortedElements.map((element, index) => (
//                   <Draggable
//                     key={element.id}
//                     draggableId={element.id}
//                     index={index}
//                   >
//                     {(provided, snapshot) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         className={`
//                           flex items-center p-2 mb-1 rounded-lg border transition-all duration-200
//                           ${element.id === selectedElementId
//                             ? 'bg-blue-100 border-blue-300 shadow-sm'
//                             : 'bg-white border-gray-200 hover:bg-gray-50'
//                           }
//                           ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
//                           ${draggedElementId === element.id ? 'opacity-50' : ''}
//                         `}
//                       >
//                         {/* Drag handle */}
//                         <div
//                           {...provided.dragHandleProps}
//                           className="mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
//                         >
//                           <DragIcon />
//                         </div>

//                         {/* Element icon and info */}
//                         <div
//                           className="flex-1 flex items-center cursor-pointer"
//                           onClick={() => onElementSelect(element.id)}
//                         >
//                           <span className="mr-2 text-sm">
//                             {getElementIcon(element.type)}
//                           </span>
//                           <div className="flex-1 min-w-0">
//                             <div className="text-sm font-medium text-gray-900 truncate">
//                               {ELEMENT_TYPE_NAMES[element.type] || element.type}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               z: {element.zIndex} • {Math.round(element.position.x)}, {Math.round(element.position.y)}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Controls */}
//                         <div className="flex items-center space-x-1 ml-2">
//                           {/* Visibility toggle */}
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onElementToggleVisibility(element.id);
//                             }}
//                             className={`
//                               p-1 rounded transition-colors
//                               ${element.visible
//                                 ? 'text-gray-600 hover:text-gray-800'
//                                 : 'text-gray-300 hover:text-gray-500'
//                               }
//                             `}
//                             title={element.visible ? 'Ocultar' : 'Mostrar'}
//                           >
//                             <EyeIcon visible={element.visible} />
//                           </button>

//                           {/* Lock toggle */}
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onElementToggleLock(element.id);
//                             }}
//                             className={`
//                               p-1 rounded transition-colors
//                               ${element.locked
//                                 ? 'text-red-500 hover:text-red-700'
//                                 : 'text-gray-400 hover:text-gray-600'
//                               }
//                             `}
//                             title={element.locked ? 'Desbloquear' : 'Bloquear'}
//                           >
//                             <LockIcon locked={element.locked} />
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>
//       </div>

//       {/* Summary */}
//       <div className="p-3 border-t border-gray-200 bg-gray-50">
//         <div className="text-xs text-gray-500 space-y-1">
//           <div>Total: {elements.length} elementos</div>
//           <div>Visíveis: {elements.filter(el => el.visible).length}</div>
//           <div>Bloqueados: {elements.filter(el => el.locked).length}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LayerManager;

// src/components/konva/ui/LayerManagerFixed.tsx

import React, { useState, useCallback } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

import { LayerManagerProps } from '@/types/konva';

// Ícones simples (você pode substituir por uma biblioteca de ícones)
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

// Mapeamento de tipos para nomes amigáveis
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

const LayerManagerFixed: React.FC<LayerManagerProps> = ({
  elements,
  selectedElementId,
  onElementSelect,
  onElementToggleVisibility,
  onElementToggleLock,
  onElementsReorder,
}) => {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);

  // Ordenar elementos por z-index (do maior para o menor, pois o topo da lista é o que aparece na frente)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setDraggedElementId(null);

      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      // Reordenar elementos
      const reorderedElements = Array.from(sortedElements);
      const [removed] = reorderedElements.splice(sourceIndex, 1);
      reorderedElements.splice(destinationIndex, 0, removed);

      // Converter de volta para ordem por z-index
      const newOrder = reorderedElements.reverse().map((el) => el.id);
      onElementsReorder(newOrder);
    },
    [sortedElements, onElementsReorder]
  );

  const handleDragStart = useCallback((start: any) => {
    setDraggedElementId(start.draggableId);
  }, []);

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
    <div className="layer-manager">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Camadas</h3>
        <p className="text-xs text-gray-500 mt-1">
          Arraste para reordenar • Topo = Frente
        </p>
      </div>

      <div className="overflow-y-auto max-h-96">
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <Droppable
            droppableId="layers"
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`p-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
              >
                {sortedElements.map((element, index) => (
                  <Draggable
                    key={element.id}
                    draggableId={element.id}
                    index={index}
                    isDragDisabled={element.locked}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          flex items-center p-2 mb-1 rounded-lg border transition-all duration-200
                          ${
                            element.id === selectedElementId
                              ? 'bg-blue-100 border-blue-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }
                          ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
                          ${draggedElementId === element.id ? 'opacity-50' : ''}
                          ${element.locked ? 'opacity-60' : ''}
                        `}
                      >
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
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
                          onClick={() => onElementSelect(element.id)}
                        >
                          <span className="mr-2 text-sm">
                            {getElementIcon(element.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {ELEMENT_TYPE_NAMES[element.type] || element.type}
                            </div>
                            <div className="text-xs text-gray-500">
                              z: {element.zIndex} •{' '}
                              {Math.round(element.position.x)},{' '}
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
                              onElementToggleVisibility(element.id);
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
                              onElementToggleLock(element.id);
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
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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

export default LayerManagerFixed;
