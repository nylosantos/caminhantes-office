import React, { useEffect, useState } from 'react';
import { Search, AlertCircle, Check, X } from 'lucide-react';
import { useSquad } from '@/contexts/SquadContext';
import { Formation } from '@/types/formations';
import { Player, PlayerPosition, PLAYER_POSITIONS, POSITION_COLORS } from '@/types/squad';
import { Button } from '@/components/ui/button'; // Re-adicionado

interface SelectedPlayers {
  [positionId: string]: Player | null;
}

interface PlayerSelectorProps {
  formation: Formation;
  selectedPlayers: SelectedPlayers;
  onPlayersChange: (players: SelectedPlayers) => void;
  reservePlayers: Player[];
  onReservePlayersChange: (players: Player[]) => void;
  onOfficialStatusChange: (isOfficial: boolean) => void;
  isOfficialLineUp?: boolean;
  maxReserves?: number;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  formation,
  selectedPlayers,
  onPlayersChange,
  reservePlayers,
  onReservePlayersChange,
  onOfficialStatusChange,
  maxReserves = 7,
  isOfficialLineUp = false
}) => {
  const { players, loading } = useSquad();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<PlayerPosition | 'ALL'>('ALL');
  const [isOfficial, setIsOfficial] = useState(false);

  const getTitularPlayerIds = () => {
    return new Set(Object.values(selectedPlayers).filter(Boolean).map(p => p!.id));
  };

  // Retorna Player[] para GOL, e um objeto para os outros.
  const getAvailablePlayersForPosition = (position: PlayerPosition): Player[] | { specificPositionPlayers: Player[]; otherAvailablePlayers: Player[]; } => {
    const titularIds = getTitularPlayerIds();

    if (position === 'GOL') {
      return players.filter(p =>
        p.position === 'GOL' && !titularIds.has(p.id)
      ).sort((a, b) => parseInt(a.number) - parseInt(b.number));
    }

    const specificPositionPlayers = players.filter(p =>
      p.position === position && !titularIds.has(p.id)
    ).sort((a, b) => parseInt(a.number) - parseInt(b.number));

    const otherAvailablePlayers = players.filter(p =>
      p.position !== 'GOL' && p.position !== position && !titularIds.has(p.id)
    ).sort((a, b) => parseInt(a.number) - parseInt(b.number));

    return { specificPositionPlayers, otherAvailablePlayers };
  };

  const getAvailablePlayersForReserves = () => {
    const usedPlayerIds = new Set([
      ...getTitularPlayerIds(),
      ...reservePlayers.map(p => p.id)
    ]);

    return players.filter(player => {
      if (usedPlayerIds.has(player.id)) return false;
      if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase()) && !player.number.toString().includes(searchTerm)) return false;
      if (filterPosition !== 'ALL' && player.position !== filterPosition) return false;
      return true;
    }).sort((a, b) => parseInt(a.number) - parseInt(b.number));
  };

  const selectPlayerForPosition = (positionId: string, player: Player) => {
    const isReserve = reservePlayers.some(p => p.id === player.id);
    onPlayersChange({ ...selectedPlayers, [positionId]: player });
    if (isReserve) {
      onReservePlayersChange(reservePlayers.filter(p => p.id !== player.id));
    }
  };

  const removePlayerFromPosition = (positionId: string) => {
    onPlayersChange({ ...selectedPlayers, [positionId]: null });
  };

  const addToReserves = (player: Player) => {
    if (reservePlayers.length < maxReserves) {
      onReservePlayersChange([...reservePlayers, player]);
    }
  };

  const removeFromReserves = (playerId: string) => {
    onReservePlayersChange(reservePlayers.filter(p => p.id !== playerId));
  };

  const handleOfficialStatusToggle = () => {
    const newStatus = !isOfficialLineUp;
    onOfficialStatusChange(newStatus);
  };

  useEffect(() => {
    const newStatus = !isOfficialLineUp;
    setIsOfficial(!newStatus)
  }, [isOfficialLineUp])
  

  if (loading) { return <div>Carregando...</div>; }
  if (players.length === 0) { return <div>Nenhum jogador cadastrado.</div>; }

  const allPositionsFilled = formation.positions.every(pos => selectedPlayers[pos.id]);
  const positionsByType = {
    GOL: formation.positions.filter(pos => pos.position === 'GOL'),
    DEF: formation.positions.filter(pos => pos.position === 'DEF'),
    MEI: formation.positions.filter(pos => pos.position === 'MEI'),
    ATA: formation.positions.filter(pos => pos.position === 'ATA')
  };

  return (
    <div className="space-y-6">
      {/* Header e Progresso */}
      <div className="text-center">
        <h3 className="text-xl font-display-bold text-gray-800 mb-2">
          Selecionar Jogadores - {formation.displayName}
        </h3>
        <p className="text-gray-600 font-display">
          Escolha os jogadores para cada posição da formação
        </p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-display-medium text-gray-700">Progresso da Escalação</span>
          <span className="text-sm font-display text-gray-600">
            {Object.values(selectedPlayers).filter(Boolean).length} / {formation.positions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.values(selectedPlayers).filter(Boolean).length / formation.positions.length) * 100}%` }}
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
                <div className={`w-4 h-4 rounded-full mr-3 ${positionType === 'GOL' ? 'bg-yellow-500' :
                    positionType === 'DEF' ? 'bg-blue-500' :
                      positionType === 'MEI' ? 'bg-green-600' : 'bg-red-500'
                  }`}></div>
                {PLAYER_POSITIONS[positionType as PlayerPosition]} ({positions.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions.map((position) => {
                  const selectedPlayer = selectedPlayers[position.id];
                  const available = getAvailablePlayersForPosition(position.position);

                  // CORREÇÃO: Verificação de tipo para ajudar o TypeScript
                  const isGoleiroPosition = position.position === 'GOL';
                  const hasAvailablePlayers = isGoleiroPosition
                    ? (available as Player[]).length > 0
                    : (available as any).specificPositionPlayers.length > 0 || (available as any).otherAvailablePlayers.length > 0;

                  return (
                    <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display-medium text-gray-700">{position.label}</span>
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
                                <p className="font-display-medium text-gray-800">{selectedPlayer.name}</p>
                                <p className="text-xs text-gray-600 font-display">{PLAYER_POSITIONS[selectedPlayer.position]}</p>
                              </div>
                            </div>
                            <Button onClick={() => removePlayerFromPosition(position.id)} variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {hasAvailablePlayers ? (
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display"
                              value=""
                              onChange={(e) => {
                                const player = players.find(p => p.id === e.target.value);
                                if (player) selectPlayerForPosition(position.id, player);
                              }}
                            >
                              <option value="">Selecionar jogador...</option>
                              {/* CORREÇÃO: Usar a verificação de tipo para renderizar as opções */}
                              {isGoleiroPosition ? (
                                (available as Player[]).map(player => (
                                  <option key={player.id} value={player.id}>#{player.number} {player.name}</option>
                                ))
                              ) : (
                                <>
                                  <optgroup label={PLAYER_POSITIONS[position.position]}>
                                    {(available as any).specificPositionPlayers.map((player: Player) => (
                                      <option key={player.id} value={player.id}>#{player.number} {player.name}</option>
                                    ))}
                                  </optgroup>
                                  {(available as any).otherAvailablePlayers.length > 0 && (
                                    <optgroup label="Outros Jogadores">
                                      {(available as any).otherAvailablePlayers.map((player: Player) => (
                                        <option key={player.id} value={player.id}>#{player.number} {player.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                </>
                              )}
                            </select>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                              <AlertCircle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                              <p className="text-sm text-yellow-700 font-display">Nenhum jogador disponível</p>
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
          <h4 className="text-lg font-display-semibold text-gray-800">Banco de Reservas</h4>
          <span className="text-sm text-gray-600 font-display">{reservePlayers.length} / {maxReserves}</span>
        </div>
        {reservePlayers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {reservePlayers.map((player) => (
              <div key={player.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-display-bold mr-2">{player.number}</div>
                    <div>
                      <p className="text-sm font-display-medium text-gray-800">{player.name}</p>
                      <p className="text-xs text-gray-600 font-display">{PLAYER_POSITIONS[player.position]}</p>
                    </div>
                  </div>
                  <Button onClick={() => removeFromReserves(player.id)} variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {reservePlayers.length < maxReserves && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Buscar jogador para o banco..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full" />
              </div>
              <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value as PlayerPosition | 'ALL')} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="ALL">Todas as posições</option>
                {Object.entries(PLAYER_POSITIONS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {getAvailablePlayersForReserves().map((player) => (
                <div key={player.id} className="bg-white border border-gray-200 rounded-lg p-2 hover:border-red-300 cursor-pointer" onClick={() => addToReserves(player)}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-display-bold mr-2">{player.number}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display-medium text-gray-800 truncate">{player.name}</p>
                      <p className="text-xs text-gray-600 font-display">{PLAYER_POSITIONS[player.position]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Switch para Escalação Oficial */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display-semibold text-gray-800">Status da Escalação</h4>
            <p className="font-display text-sm text-gray-600">{isOfficial ? "Esta é uma escalação oficial." : "Isto é uma previsão de escalação."}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-display text-sm ${!isOfficial ? 'text-red-600 font-display-semibold' : 'text-gray-500'}`}>Previsão</span>
            <button onClick={handleOfficialStatusToggle} className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOfficial ? 'bg-red-600' : 'bg-gray-300'}`} role="switch" aria-checked={isOfficial}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOfficial ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`font-display text-sm ${isOfficial ? 'text-red-600 font-display-semibold' : 'text-gray-500'}`}>Oficial</span>
          </div>
        </div>
      </div>

      {/* Status de conclusão */}
      {allPositionsFilled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-display-medium">Escalação completa!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSelector;