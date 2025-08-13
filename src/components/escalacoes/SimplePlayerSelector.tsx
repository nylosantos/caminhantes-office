import React, { useState, useEffect } from 'react';
import { Search, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Player } from '@/types/squad';
import { useSquad } from '@/contexts/SquadContext';

interface SimplePlayerSelectorProps {
  selectedPlayer: Player | null;
  selectedPlayerImageUrl: string | null;
  selectedPlayerImgIndex: number | null;
  onPlayerSelect: (
    player: Player | null,
    imageUrl: string | null,
    imgIndex: number | null
  ) => void;
  placeholder?: string;
  showImageSelector?: boolean;
  filterFunction?: (player: Player) => boolean;
}

const SimplePlayerSelector: React.FC<SimplePlayerSelectorProps> = ({
  selectedPlayer,
  selectedPlayerImageUrl,
  selectedPlayerImgIndex,
  onPlayerSelect,
  placeholder = 'Selecione um jogador',
  showImageSelector = true,
  filterFunction,
}) => {
  const { players } = useSquad();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  useEffect(() => {
    let filtered = players.filter(
      (player) =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.number.toString().includes(searchTerm)
    );

    if (filterFunction) {
      filtered = filtered.filter(filterFunction);
    }

    setFilteredPlayers(filtered);
  }, [players, searchTerm, filterFunction]);

  const handlePlayerSelect = (player: Player) => {
    onPlayerSelect(player, null, null);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    onPlayerSelect(null, null, null);
    setSearchTerm('');
  };

  const handleImageSelect = (imageUrl: string, imgIndex: number) => {
    if (selectedPlayer) {
      onPlayerSelect(selectedPlayer, imageUrl, imgIndex);
    }
  };

  return (
    <div className="space-y-4">
      {/* Seleção do Jogador */}
      <div className="relative">
        {selectedPlayer ? (
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-display-semibold text-gray-800">
                  {selectedPlayer.name}
                </p>
                <p className="text-sm text-gray-600 font-display">
                  #{selectedPlayer.number} • {selectedPlayer.position}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e: any) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-10 font-display"
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerSelect(player)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-display-semibold text-cyan-600">
                            {player.number}
                          </span>
                        </div>
                        <div>
                          <p className="font-display-semibold text-gray-800">
                            {player.name}
                          </p>
                          <p className="text-sm text-gray-600 font-display">
                            {player.position}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500 font-display">
                    {searchTerm
                      ? 'Nenhum jogador encontrado'
                      : 'Digite para buscar jogadores'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seleção de Imagem (se habilitado e jogador selecionado) */}
      {showImageSelector && selectedPlayer && (
        <div className="space-y-3">
          <h4 className="font-display-semibold text-gray-800">
            Selecionar Imagem do Jogador
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedPlayer.imgUrl?.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(imageUrl, index)}
                className={`
                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                  ${
                    selectedPlayerImgIndex === index
                      ? 'border-cyan-500 ring-2 ring-cyan-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <img
                  src={imageUrl}
                  alt={`${selectedPlayer.name} - Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedPlayerImgIndex === index && (
                  <div className="absolute inset-0 bg-cyan-500 bg-opacity-20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            )) || (
              <div className="col-span-full text-center py-8 text-gray-500 font-display">
                Nenhuma imagem disponível para este jogador
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clique fora para fechar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default SimplePlayerSelector;
