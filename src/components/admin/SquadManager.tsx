import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Search, Filter, Download, Upload, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSquad } from '@/contexts/SquadContext';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Player, PlayerFormData, PLAYER_POSITIONS, POSITION_COLORS, PlayerPosition } from '@/types/squad';

const SquadManager: React.FC = () => {
  const { 
    players, 
    loading, 
    addPlayer, 
    updatePlayer, 
    deletePlayer, 
    getPlayersByPosition,
    isNumberTaken,
    initializeSquad 
  } = useSquad();
  
  const { showConfirmDialog } = useConfirmDialog();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<PlayerPosition | 'ALL'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar jogadores
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.number.includes(searchTerm);
    const matchesPosition = filterPosition === 'ALL' || player.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

  // Estatísticas por posição
  const positionStats = {
    GOL: getPlayersByPosition('GOL').length,
    DEF: getPlayersByPosition('DEF').length,
    MEI: getPlayersByPosition('MEI').length,
    ATA: getPlayersByPosition('ATA').length
  };

  const handleInitializeSquad = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Inicializar Elenco',
      message: 'Deseja carregar o elenco atual do Liverpool? Esta ação adicionará todos os jogadores do elenco oficial.',
      confirmText: 'Inicializar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setIsSubmitting(true);
      const result = await initializeSquad();
      setIsSubmitting(false);
      
      if (!result.success) {
        alert(`Erro: ${result.error}`);
      }
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    const confirmed = await showConfirmDialog({
      title: 'Deletar Jogador',
      message: `Tem certeza que deseja deletar ${player.name} (#${player.number})? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      const result = await deletePlayer(player.id);
      if (!result.success) {
        alert(`Erro ao deletar: ${result.error}`);
      }
    }
  };

  const PlayerModal: React.FC<{ 
    player?: Player; 
    onClose: () => void; 
    onSave: (data: PlayerFormData) => Promise<void>;
  }> = ({ player, onClose, onSave }) => {
    const [formData, setFormData] = useState<PlayerFormData>({
      name: player?.name || '',
      number: player?.number || '',
      position: player?.position || 'MEI'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        // Erro já tratado no onSave
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-xl font-display-bold text-gray-800 mb-4">
              {player ? 'Editar Jogador' : 'Adicionar Jogador'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-display-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-display"
                  placeholder="Nome do jogador"
                  required
                />
              </div>

              {/* Número */}
              <div>
                <label className="block text-sm font-display-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-display"
                  placeholder="Número da camisa"
                  required
                />
                {formData.number && isNumberTaken(formData.number, player?.id) && (
                  <p className="text-red-600 text-sm mt-1 font-display">
                    Número já está em uso
                  </p>
                )}
              </div>

              {/* Posição */}
              <div>
                <label className="block text-sm font-display-medium text-gray-700 mb-1">
                  Posição
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as PlayerPosition }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-display"
                  required
                >
                  {Object.entries(PLAYER_POSITIONS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 cursor-pointer font-display-medium"
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium"
                  disabled={saving || (formData.number && isNumberTaken(formData.number, player?.id))}
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    player ? 'Atualizar' : 'Adicionar'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-600 font-display">Carregando elenco...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
          Elenco do Liverpool
        </h2>
        <p className="text-gray-600 font-display">
          Gerencie o elenco completo do Liverpool FC com nomes, números e posições.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <p className="text-2xl font-display-bold text-teal-600">{players.length}</p>
          <p className="text-sm text-gray-600 font-display">Total</p>
        </div>
        {Object.entries(positionStats).map(([position, count]) => (
          <div key={position} className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <p className="text-2xl font-display-bold text-gray-800">{count}</p>
            <p className="text-sm text-gray-600 font-display">{PLAYER_POSITIONS[position as PlayerPosition]}</p>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Busca e Filtro */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-display w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value as PlayerPosition | 'ALL')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-display appearance-none bg-white"
              >
                <option value="ALL">Todas as posições</option>
                {Object.entries(PLAYER_POSITIONS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3">
            {players.length === 0 && (
              <Button
                onClick={handleInitializeSquad}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-display-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Carregar Elenco
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de jogadores */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-display-semibold text-gray-800 mb-2">
            {players.length === 0 ? 'Nenhum jogador cadastrado' : 'Nenhum jogador encontrado'}
          </h3>
          <p className="text-gray-600 font-display mb-4">
            {players.length === 0 
              ? 'Comece adicionando jogadores ao elenco ou carregue o elenco oficial.'
              : 'Tente ajustar os filtros de busca.'
            }
          </p>
          {players.length === 0 && (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleInitializeSquad}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-display-medium"
                disabled={isSubmitting}
              >
                <Upload className="w-4 h-4 mr-2" />
                Carregar Elenco Oficial
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Manualmente
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-display-semibold text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-semibold text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-semibold text-gray-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-display-bold">
                          {player.number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-display-medium text-gray-900">{player.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-display-medium rounded-full ${POSITION_COLORS[player.position]}`}>
                        {PLAYER_POSITIONS[player.position]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setEditingPlayer(player)}
                          variant="outline"
                          size="sm"
                          className="cursor-pointer font-display-medium"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePlayer(player)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer font-display-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de adicionar */}
      {showAddModal && (
        <PlayerModal
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            const result = await addPlayer(data);
            if (!result.success) {
              throw new Error(result.error);
            }
          }}
        />
      )}

      {/* Modal de editar */}
      {editingPlayer && (
        <PlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSave={async (data) => {
            const result = await updatePlayer(editingPlayer.id, data);
            if (!result.success) {
              throw new Error(result.error);
            }
          }}
        />
      )}
    </div>
  );
};

export default SquadManager;

