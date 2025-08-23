import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasElement } from '../escalacoes/BaseImageGenerator';

interface LayerManagerProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  renderOrder: string[];
  onRenderOrderChange: (order: string[]) => void;
  selectedElementId?: string | null;
  onElementSelect?: (elementId: string | null) => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({
  elements,
  onElementsChange,
  renderOrder,
  onRenderOrderChange,
  selectedElementId,
  onElementSelect,
}) => {
  // Função para obter nome amigável do elemento
  const getElementDisplayName = (elementId: string): string => {
    const nameMap: Record<string, string> = {
      background: 'Fundo',
      logo: 'Logo',
      placar: 'Placar',
      jogador: 'Jogador',
      info: 'Informações',
      tv: 'TV Logos',
      motmText: 'Texto MOTM',
      playerNumber: 'Número do Jogador',
      playerName: 'Nome do Jogador',
      birthdayText: 'Texto Aniversário',
      ageText: 'Idade',
      predictionText: 'Texto Palpite',
      infoText: 'Informações',
      escalacaoText: 'Escalação',
      matchInfo: 'Info da Partida',
      chart: 'Gráfico',
      stadiumText: 'Estádio',
      userBackground: 'Fundo Personalizado',
    };

    return (
      nameMap[elementId] ||
      elementId.charAt(0).toUpperCase() + elementId.slice(1)
    );
  };

  // Função para mover elemento para cima na ordem
  const moveElementUp = (elementId: string) => {
    const currentIndex = renderOrder.indexOf(elementId);
    if (currentIndex > 0) {
      const newOrder = [...renderOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
        newOrder[currentIndex - 1],
        newOrder[currentIndex],
      ];
      onRenderOrderChange(newOrder);
    }
  };

  // Função para mover elemento para baixo na ordem
  const moveElementDown = (elementId: string) => {
    const currentIndex = renderOrder.indexOf(elementId);
    if (currentIndex < renderOrder.length - 1) {
      const newOrder = [...renderOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
        newOrder[currentIndex + 1],
        newOrder[currentIndex],
      ];
      onRenderOrderChange(newOrder);
    }
  };

  // Função para alternar visibilidade do elemento
  const toggleElementVisibility = (elementId: string) => {
    const updatedElements = elements.map((element) =>
      element.id === elementId
        ? { ...element, visible: !element.visible }
        : element
    );
    onElementsChange(updatedElements);
  };

  // Função para alternar bloqueio do elemento
  const toggleElementLock = (elementId: string) => {
    const updatedElements = elements.map((element) =>
      element.id === elementId
        ? { ...element, locked: !element.locked }
        : element
    );
    onElementsChange(updatedElements);
  };

  // Função para selecionar elemento
  const handleElementSelect = (elementId: string) => {
    if (onElementSelect) {
      onElementSelect(selectedElementId === elementId ? null : elementId);
    }
  };

  // Ordenar elementos pela renderOrder (do topo para baixo na interface = do fundo para frente no z-index)
  const orderedElements = [...renderOrder]
    .reverse()
    .map((id) => elements.find((el) => el.id === id))
    .filter(Boolean) as CanvasElement[];

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 mb-3">
        Camadas (do topo para o fundo)
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto">
        {orderedElements.map((element, index) => {
          const isSelected = selectedElementId === element.id;
          const isFirst = index === 0;
          const isLast = index === orderedElements.length - 1;

          return (
            <div
              key={element.id}
              className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleElementSelect(element.id)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {/* Indicador de tipo */}
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    element.type === 'image'
                      ? 'bg-blue-500'
                      : element.type === 'text'
                      ? 'bg-green-500'
                      : 'bg-purple-500'
                  }`}
                />

                {/* Nome do elemento */}
                <span
                  className={`text-sm truncate ${
                    !element.visible
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700'
                  }`}
                >
                  {getElementDisplayName(element.id)}
                </span>

                {/* Indicadores de estado */}
                <div className="flex items-center space-x-1">
                  {element.locked && <Lock className="w-3 h-3 text-gray-400" />}
                  {!element.visible && (
                    <EyeOff className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Visibilidade */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleElementVisibility(element.id);
                  }}
                  title={element.visible ? 'Ocultar' : 'Mostrar'}
                >
                  {element.visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </Button>

                {/* Bloqueio */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleElementLock(element.id);
                  }}
                  title={element.locked ? 'Desbloquear' : 'Bloquear'}
                >
                  {element.locked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </Button>

                {/* Mover para cima */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementDown(element.id);
                  }}
                  disabled={isFirst}
                  title="Mover para frente"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>

                {/* Mover para baixo */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementUp(element.id);
                  }}
                  disabled={isLast}
                  title="Mover para trás"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="text-xs text-gray-500 mt-3 space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Imagem</span>
          <div className="w-2 h-2 rounded-full bg-green-500 ml-3"></div>
          <span>Texto</span>
          <div className="w-2 h-2 rounded-full bg-purple-500 ml-3"></div>
          <span>Componente</span>
        </div>
        <div className="text-xs text-gray-400">
          Clique para selecionar • Use os controles para ajustar
        </div>
      </div>
    </div>
  );
};

export default LayerManager;
