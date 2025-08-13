import React from 'react';
import { Player } from '@/types/squad';
import SimplePlayerSelector from './SimplePlayerSelector';

interface GoalPlayerSelectorProps {
  selectedPlayer: Player | null;
  selectedPlayerImageUrl: string | null;
  selectedPlayerImgIndex: number | null;
  onPlayerSelect: (
    player: Player | null,
    imageUrl: string | null,
    imgIndex: number | null
  ) => void;
}

const GoalPlayerSelector: React.FC<GoalPlayerSelectorProps> = ({
  selectedPlayer,
  selectedPlayerImageUrl,
  selectedPlayerImgIndex,
  onPlayerSelect,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-display-semibold text-gray-800 mb-2">
          Selecionar Jogador
        </h3>
        <p className="text-sm text-gray-600 font-display">
          Escolha o jogador que marcou o gol
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-display-medium text-green-800">
            Autor do Gol
          </span>
        </div>

        <SimplePlayerSelector
          selectedPlayer={selectedPlayer}
          selectedPlayerImageUrl={selectedPlayerImageUrl}
          selectedPlayerImgIndex={selectedPlayerImgIndex}
          onPlayerSelect={onPlayerSelect}
          placeholder="Selecione o jogador que marcou o gol"
          showImageSelector={true}
        />
      </div>

      {selectedPlayer && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-display-semibold text-gray-800 mb-2">
            Resumo da Seleção
          </h4>
          <div className="flex items-center space-x-3">
            {selectedPlayerImageUrl && (
              <img
                src={selectedPlayerImageUrl}
                alt={selectedPlayer.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
              />
            )}
            <div>
              <p className="font-display-semibold text-gray-800">
                {selectedPlayer.name}
              </p>
              <p className="text-sm text-gray-600 font-display">
                #{selectedPlayer.number} • {selectedPlayer.position}
              </p>
            </div>
          </div>
          {selectedPlayerImageUrl && (
            <p className="text-xs text-green-600 font-display mt-2">
              ✓ Imagem selecionada para a arte
            </p>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 font-display text-center">
        O jogador selecionado aparecerá destacado na imagem final
      </div>
    </div>
  );
};

export default GoalPlayerSelector;
