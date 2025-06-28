import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSquad } from '@/contexts/SquadContext';
import { Formation, FormationPosition, getPositionsByType } from '@/types/formations';
import { Player, PlayerPosition, PLAYER_POSITIONS, POSITION_COLORS } from '@/types/squad';

interface SelectedPlayers {
  [positionId: string]: Player | null;
}

interface PlayerSelectorProps {
  formation: Formation;
  selectedPlayers: SelectedPlayers;
  onPlayersChange: (players: SelectedPlayers) => void;
  reservePlayers: Player[];
  onReservePlayersChange: (players: Player[]) => void;
  maxReserves?: number;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  formation,
  selectedPlayers,
  onPlayersChange,
  reservePlayers,
  onReservePlayersChange,
  maxReserves = 7
}) => {
  const { players, loading } = useSquad();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<PlayerPosition | 'ALL'>('ALL');
  const [selectingFor, setSelectingFor] = useState<string | null>(null);

  // Filtrar jogadores disponíveis
  const getAvailablePlayers = (forPosition?: PlayerPosition) => {
    const usedPlayerIds = new Set([
      ...Object.values(selectedPlayers).filter(Boolean).map(p => p!.id),
      ...reservePlayers.map(p => p.id)
    ]);

    return players.filter(player => {
      // Não mostrar jogadores já selecionados
      if (usedPlayerIds.has(player.id)) return false;
      
      // Filtrar por posição se especificado
      if (forPosition && player.position !== forPosition) return false;
      
      // Filtrar por busca
      if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !player.number.includes(searchTerm)) return false;
      
      // Filtrar por posição selecionada
      if (filterPosition !== 'ALL' && player.position !== filterPosition) return false;
      
      return true;
    });
  };

  // Selecionar jogador para uma posição
  const selectPlayerForPosition = (positionId: string, player: Player) => {
    onPlayersChange({
      ...selectedPlayers,
      [positionId]: player
    });
    setSelectingFor(null);
  };

  // Remover jogador de uma posição
  const removePlayerFromPosition = (positionId: string) => {
    onPlayersChange({
      ...selectedPlayers,
      [positionId]: null
    });
  };

  // Adicionar jogador às reservas
  const addToReserves = (player: Player) => {
    if (reservePlayers.length < maxReserves) {
      onReservePlayersChange([...reservePlayers, player]);
    }
  };

  // Remover jogador das reservas
  const removeFromReserves = (playerId: string) => {
    onReservePlayersChange(reservePlayers.filter(p => p.id !== playerId));
  };

  // Verificar se todas as posições estão preenchidas
  const allPositionsFilled = formation.positions.every(pos => selectedPlayers[pos.id]);

  // Agrupar posições por tipo
  const positionsByType = {
    GOL: formation.positions.filter(pos => pos.position === 'GOL'),
    DEF: formation.positions.filter(pos => pos.position === 'DEF'),
    MEI: formation.positions.filter(pos => pos.position === 'MEI'),
    ATA: formation.positions.filter(pos => pos.position === 'ATA')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-display">Carregando elenco...</p>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-display-semibold text-gray-800 mb-2">
          Nenhum jogador cadastrado
        </h3>
        <p className="text-gray-600 font-display mb-4">
          Cadastre jogadores na área administrativa para montar escalações.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-display-bold text-gray-800 mb-2">
          Selecionar Jogadores - {formation.displayName}
        </h3>
        <p className="text-gray-600 font-display">
          Escolha os jogadores para cada posição da formação
        </p>
      </div>

      {/* Progresso */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-display-medium text-gray-700">
            Progresso da Escalação
          </span>
          <span className="text-sm font-display text-gray-600">
            {Object.values(selectedPlayers).filter(Boolean).length} / {formation.positions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(selectedPlayers).filter(Boolean).length / formation.positions.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Seleção por posições */}
      <div className="space-y-6">
        {Object.entries(positionsByType).map(([positionType, positions]) => {
          if (positions.length === 0) return null;

          return (
            <div key={positionType} className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-display-semibold text-gray-800 mb-4 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  positionType === 'GOL' ? 'bg-yellow-500' :
                  positionType === 'DEF' ? 'bg-blue-500' :
                  positionType === 'MEI' ? 'bg-green-600' :
                  'bg-red-500'
                }`}></div>
                {PLAYER_POSITIONS[positionType as PlayerPosition]} ({positions.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions.map((position) => {
                  const selectedPlayer = selectedPlayers[position.id];
                  const availablePlayers = getAvailablePlayers(position.position);

                  return (
                    <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display-medium text-gray-700">
                          {position.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-display-medium ${POSITION_COLORS[position.position]}`}>
                          {PLAYER_POSITIONS[position.position]}
                        </span>
                      </div>

                      {selectedPlayer ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-display-bold mr-3">
                                {selectedPlayer.number}
                              </div>
                              <div>
                                <p className="font-display-medium text-gray-800">
                                  {selectedPlayer.name}
                                </p>
                                <p className="text-xs text-gray-600 font-display">
                                  {PLAYER_POSITIONS[selectedPlayer.position]}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => removePlayerFromPosition(position.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availablePlayers.length > 0 ? (
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display"
                              value=""
                              onChange={(e) => {
                                const player = availablePlayers.find(p => p.id === e.target.value);
                                if (player) {
                                  selectPlayerForPosition(position.id, player);
                                }
                              }}
                            >
                              <option value="">Selecionar jogador...</option>
                              {availablePlayers.map((player) => (
                                <option key={player.id} value={player.id}>
                                  #{player.number} {player.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                              <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                              <p className="text-sm text-yellow-700 font-display">
                                Nenhum {PLAYER_POSITIONS[position.position].toLowerCase()} disponível
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reservas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-display-semibold text-gray-800">
            Banco de Reservas
          </h4>
          <span className="text-sm text-gray-600 font-display">
            {reservePlayers.length} / {maxReserves}
          </span>
        </div>

        {/* Jogadores no banco */}
        {reservePlayers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {reservePlayers.map((player) => (
              <div key={player.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-display-bold mr-2">
                      {player.number}
                    </div>
                    <div>
                      <p className="text-sm font-display-medium text-gray-800">
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-600 font-display">
                        {PLAYER_POSITIONS[player.position]}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFromReserves(player.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar reservas */}
        {reservePlayers.length < maxReserves && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar jogador para o banco..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display w-full"
                />
              </div>
              
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value as PlayerPosition | 'ALL')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display"
              >
                <option value="ALL">Todas as posições</option>
                {Object.entries(PLAYER_POSITIONS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {getAvailablePlayers().map((player) => (
                <div
                  key={player.id}
                  className="bg-white border border-gray-200 rounded-lg p-2 hover:border-red-300 cursor-pointer transition-colors"
                  onClick={() => addToReserves(player)}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-display-bold mr-2">
                      {player.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display-medium text-gray-800 truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-600 font-display">
                        {PLAYER_POSITIONS[player.position]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reservePlayers.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-display">Nenhum jogador no banco</p>
          </div>
        )}
      </div>

      {/* Status */}
      {allPositionsFilled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-display-medium">
              Escalação completa! Todas as posições foram preenchidas.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSelector;

