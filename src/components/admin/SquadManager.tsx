import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, Image as ImageIcon, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSquad } from '@/contexts/SquadContext';
import { Player, PlayerFormData, PLAYER_POSITIONS, POSITION_COLORS } from '@/types/squad';
import { showConfirmDialog } from '@/components/ui/ConfirmDialog';
import PlayerImageManager from './PlayerImageManager';

const SquadManager: React.FC = () => {
  const { 
    players, 
    loading, 
    addPlayer, 
    updatePlayer, 
    deletePlayer, 
    initializeSquad,
    getPlayersByPosition 
  } = useSquad();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showImageManager, setShowImageManager] = useState<Player | null>(null);

  // Filtrar jogadores
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.number.includes(searchTerm);
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  // Estatísticas por posição
  const positionStats = {
    GOL: getPlayersByPosition('GOL').length,
    DEF: getPlayersByPosition('DEF').length,
    MEI: getPlayersByPosition('MEI').length,
    ATA: getPlayersByPosition('ATA').length,
  };

  const handleCreatePlayer = async (playerData: PlayerFormData) => {
    const result = await addPlayer(playerData);
    
    if (result.success) {
      setShowCreateModal(false);
    } else {
      alert(result.error || 'Erro ao criar jogador');
    }
  };

  const handleUpdatePlayer = async (playerData: PlayerFormData) => {
    if (!editingPlayer) return;
    
    const result = await updatePlayer(editingPlayer.id, playerData);
    
    if (result.success) {
      setEditingPlayer(null);
    } else {
      alert(result.error || 'Erro ao atualizar jogador');
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    const confirmed = await showConfirmDialog({
      title: 'Deletar Jogador',
      text: `Tem certeza que deseja deletar ${player.name}?`,
      confirmButtonText: 'Deletar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed) {
      const result = await deletePlayer(player.id);
      
      if (!result.success) {
        alert(result.error || 'Erro ao deletar jogador');
      }
    }
  };

  const handleInitializeSquad = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Inicializar Elenco',
      text: 'Isso irá adicionar o elenco oficial do Liverpool. Continuar?',
      confirmButtonText: 'Inicializar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed) {
      const result = await initializeSquad();
      
      if (!result.success) {
        alert(result.error || 'Erro ao inicializar elenco');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600 font-display">Carregando elenco...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display-bold text-gray-800">
            Elenco do Liverpool
          </h2>
          <p className="text-gray-600 font-display">
            Gerencie os jogadores do elenco oficial
          </p>
        </div>
        
        <div className="flex gap-2">
          {players.length === 0 && (
            <Button
              onClick={handleInitializeSquad}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer font-display-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              Inicializar Elenco
            </Button>
          )}
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer font-display-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Jogador
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(positionStats).map(([position, count]) => (
          <div key={position} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-display">
                  {PLAYER_POSITIONS[position as keyof typeof PLAYER_POSITIONS]}
                </p>
                <p className="text-2xl font-display-bold text-gray-800">{count}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${POSITION_COLORS[position as keyof typeof POSITION_COLORS].split(' ')[0]}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-display"
              />
            </div>
          </div>
          
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-display"
          >
            <option value="all">Todas as posições</option>
            {Object.entries(PLAYER_POSITIONS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de jogadores */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-display-medium text-gray-800 mb-2">
              {players.length === 0 ? 'Nenhum jogador cadastrado' : 'Nenhum jogador encontrado'}
            </h3>
            <p className="text-gray-600 font-display">
              {players.length === 0 
                ? 'Clique em "Inicializar Elenco" para adicionar o elenco oficial do Liverpool'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Jogador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Imagens
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-display-medium text-gray-800">{player.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display-medium bg-gray-100 text-gray-800">
                        #{player.number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display-medium ${POSITION_COLORS[player.position]}`}>
                        {PLAYER_POSITIONS[player.position]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 font-display mr-2">
                          {player.imgUrl?.length || 0}/2
                        </span>
                        <Button
                          onClick={() => setShowImageManager(player)}
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => setEditingPlayer(player)}
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePlayer(player)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 cursor-pointer"
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
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreatePlayerModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePlayer}
        />
      )}

      {editingPlayer && (
        <CreatePlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSubmit={handleUpdatePlayer}
        />
      )}

      {showImageManager && (
        <PlayerImageManager
          player={showImageManager}
          onClose={() => setShowImageManager(null)}
        />
      )}
    </div>
  );
};

// Modal para criar/editar jogador
interface CreatePlayerModalProps {
  player?: Player;
  onClose: () => void;
  onSubmit: (data: PlayerFormData) => void;
}

const CreatePlayerModal: React.FC<CreatePlayerModalProps> = ({ player, onClose, onSubmit }) => {
  const { isNumberTaken } = useSquad();
  const [formData, setFormData] = useState<PlayerFormData>({
    name: player?.name || '',
    number: player?.number || '',
    position: player?.position || 'ATA'
  });
  const [errors, setErrors] = useState<Partial<PlayerFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PlayerFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Número é obrigatório';
    } else {
      const numberInt = parseInt(formData.number.trim());
      if (isNaN(numberInt) || numberInt < 1 || numberInt > 99) {
        newErrors.number = 'Número deve ser entre 1 e 99';
      } else if (isNumberTaken(formData.number.trim(), player?.id)) {
        newErrors.number = 'Este número já está em uso';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-display-bold text-gray-800">
            {player ? 'Editar Jogador' : 'Novo Jogador'}
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="cursor-pointer">
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-display-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-display ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome do jogador"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 font-display">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-display-medium text-gray-700 mb-2">
              Número
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-display ${
                errors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Número da camisa"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1 font-display">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-display-medium text-gray-700 mb-2">
              Posição
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-display"
            >
              {Object.entries(PLAYER_POSITIONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="cursor-pointer font-display-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer font-display-medium"
            >
              {player ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SquadManager;

