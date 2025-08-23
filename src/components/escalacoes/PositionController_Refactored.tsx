import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Move, Maximize2 } from 'lucide-react';

interface SelectedElementData {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface PositionControllerProps {
  selectedElement: SelectedElementData | null;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, width: number, height: number) => void;
  maxSize?: number;
}

const PositionController: React.FC<PositionControllerProps> = ({
  selectedElement,
  onPositionChange,
  onSizeChange,
  maxSize = 500, // Permite até 500% por padrão
}) => {
  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        <Move className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">
          Selecione um elemento para ajustar sua posição e tamanho
        </p>
      </div>
    );
  }

  // Função para resetar posição para o centro
  const resetPosition = () => {
    onPositionChange(selectedElement.id, 50, 50);
  };

  // Função para resetar tamanho para 100%
  const resetSize = () => {
    onSizeChange(selectedElement.id, 100, 100);
  };

  // Função para ajuste rápido de posição
  const quickPositionAdjust = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 1; // 1% por clique
    let newX = selectedElement.position.x;
    let newY = selectedElement.position.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, newY - step);
        break;
      case 'down':
        newY = Math.min(100, newY + step);
        break;
      case 'left':
        newX = Math.max(0, newX - step);
        break;
      case 'right':
        newX = Math.min(100, newX + step);
        break;
    }

    onPositionChange(selectedElement.id, newX, newY);
  };

  // Função para ajuste rápido de tamanho
  const quickSizeAdjust = (type: 'increase' | 'decrease') => {
    const step = 5; // 5% por clique
    const currentWidth = selectedElement.size.width;
    const currentHeight = selectedElement.size.height;

    let newWidth, newHeight;

    if (type === 'increase') {
      newWidth = Math.min(maxSize, currentWidth + step);
      newHeight = Math.min(maxSize, currentHeight + step);
    } else {
      newWidth = Math.max(5, currentWidth - step);
      newHeight = Math.max(5, currentHeight - step);
    }

    onSizeChange(selectedElement.id, newWidth, newHeight);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Controles de Posição</h4>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={resetPosition}
            title="Centralizar elemento"
          >
            <Move className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSize}
            title="Resetar tamanho (100%)"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Controles de Posição */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Posição</label>

          {/* Controles direcionais */}
          <div className="flex items-center justify-center mb-3">
            <div className="grid grid-cols-3 gap-1 w-24">
              <div></div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => quickPositionAdjust('up')}
                title="Mover para cima"
              >
                ↑
              </Button>
              <div></div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => quickPositionAdjust('left')}
                title="Mover para esquerda"
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={resetPosition}
                title="Centralizar"
              >
                ⌂
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => quickPositionAdjust('right')}
                title="Mover para direita"
              >
                →
              </Button>

              <div></div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => quickPositionAdjust('down')}
                title="Mover para baixo"
              >
                ↓
              </Button>
              <div></div>
            </div>
          </div>

          {/* Inputs precisos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">X (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={selectedElement.position.x.toFixed(1)}
                onChange={(e: any) => {
                  const value = parseFloat(e.target.value) || 0;
                  onPositionChange(
                    selectedElement.id,
                    Math.max(0, Math.min(100, value)),
                    selectedElement.position.y
                  );
                }}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Y (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={selectedElement.position.y.toFixed(1)}
                onChange={(e: any) => {
                  const value = parseFloat(e.target.value) || 0;
                  onPositionChange(
                    selectedElement.id,
                    selectedElement.position.x,
                    Math.max(0, Math.min(100, value))
                  );
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Controles de Tamanho */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tamanho</label>

          {/* Controles rápidos de tamanho */}
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickSizeAdjust('decrease')}
              title="Diminuir (5%)"
            >
              -
            </Button>
            <span className="text-xs text-gray-600 min-w-0 px-2">
              {selectedElement.size.width.toFixed(0)}% ×{' '}
              {selectedElement.size.height.toFixed(0)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickSizeAdjust('increase')}
              title="Aumentar (5%)"
            >
              +
            </Button>
          </div>

          {/* Inputs precisos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Largura (%)</label>
              <Input
                type="number"
                min="5"
                max={maxSize}
                step="0.1"
                value={selectedElement.size.width.toFixed(1)}
                onChange={(e: any) => {
                  const value = parseFloat(e.target.value) || 5;
                  onSizeChange(
                    selectedElement.id,
                    Math.max(5, Math.min(maxSize, value)),
                    selectedElement.size.height
                  );
                }}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Altura (%)</label>
              <Input
                type="number"
                min="5"
                max={maxSize}
                step="0.1"
                value={selectedElement.size.height.toFixed(1)}
                onChange={(e: any) => {
                  const value = parseFloat(e.target.value) || 5;
                  onSizeChange(
                    selectedElement.id,
                    selectedElement.size.width,
                    Math.max(5, Math.min(maxSize, value))
                  );
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Proporção */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Tamanho máximo: {maxSize}%</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => {
              const avgSize =
                (selectedElement.size.width + selectedElement.size.height) / 2;
              onSizeChange(selectedElement.id, avgSize, avgSize);
            }}
            title="Manter proporção quadrada"
          >
            1:1
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PositionController;
