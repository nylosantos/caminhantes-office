// src/components/admin/ChannelManager.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tv,
  Loader,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChannelContextType, useChannels } from '@/contexts/ChannelContext';
import {
  Channel,
  ChannelFormData,
  CHANNEL_TYPES,
  ChannelType,
} from '@/types/channels';
import { showConfirmDialog } from '@/components/ui/ConfirmDialog'; // Reutilizando seu componente de confirmação

const ChannelManager: React.FC = () => {
  const { channels, loading, addChannel, updateChannel, deleteChannel } =
    useChannels();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (channel: Channel | null = null) => {
    setEditingChannel(channel);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingChannel(null);
    setShowModal(false);
  };

  const handleDeleteChannel = async (channel: Channel) => {
    const confirmed = await showConfirmDialog({
      title: 'Deletar Canal',
      text: `Tem certeza que deseja deletar o canal ${channel.name}?`,
      confirmButtonText: 'Deletar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmed) {
      const result = await deleteChannel(channel.id, channel.name);
      if (!result.success) {
        alert(result.error || 'Erro ao deletar canal');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600 font-display">
          Carregando canais...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display-bold text-gray-800">
            Canais de TV
          </h2>
          <p className="text-gray-600 font-display">
            Gerencie os canais para exibição nos jogos
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white cursor-pointer font-display-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Canal
        </Button>
      </div>

      {/* Filtro */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome do canal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-display"
          />
        </div>
      </div>

      {/* Lista de Canais */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredChannels.length === 0 ? (
          <div className="p-8 text-center">
            <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-display-medium text-gray-800 mb-2">
              Nenhum canal encontrado
            </h3>
            <p className="text-gray-600 font-display">
              {channels.length === 0
                ? 'Clique em "Novo Canal" para começar.'
                : 'Tente ajustar sua busca.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-display-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChannels.map((channel) => (
                  <tr
                    key={channel.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      {channel.logoUrl ? (
                        <img
                          src={channel.logoUrl}
                          alt={`Logo ${channel.name}`}
                          className="h-8 w-auto object-contain"
                        />
                      ) : (
                        <div className="h-8 w-12 bg-gray-100 flex items-center justify-center rounded">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-display-medium text-gray-800">
                      {channel.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-display">
                      {CHANNEL_TYPES[channel.type]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => handleOpenModal(channel)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteChannel(channel)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
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

      {/* Modal para Criar/Editar Canal */}
      {showModal && (
        <ChannelModal
          channel={editingChannel}
          onClose={handleCloseModal}
          addChannel={addChannel}
          updateChannel={updateChannel}
        />
      )}
    </div>
  );
};

// Componente do Modal
interface ChannelModalProps {
  channel: Channel | null;
  onClose: () => void;
  addChannel: ChannelContextType['addChannel'];
  updateChannel: ChannelContextType['updateChannel'];
}

const ChannelModal: React.FC<ChannelModalProps> = ({
  channel,
  onClose,
  addChannel,
  updateChannel,
}) => {
  const [formData, setFormData] = useState<ChannelFormData>({
    name: channel?.name || '',
    type: channel?.type || 'TV_FECHADA',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    channel?.logoUrl || null
  );
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false); // Novo estado para feedback visual de drag

  // Efeito para limpar a URL do preview quando o modal é fechado ou o canal muda
  useEffect(() => {
    if (channel?.logoUrl) {
      setPreview(channel.logoUrl);
    } else if (!channel && !logoFile) {
      setPreview(null);
    }
    // Cleanup function for object URLs to prevent memory leaks
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [channel, logoFile]); // Dependências para re-executar o efeito

  // Função unificada para lidar com a seleção de arquivo (input ou drag-and-drop)
  const processFile = (file: File | undefined) => {
    if (file) {
      if (
        file.type.startsWith('image/png') ||
        file.type.startsWith('image/jpeg')
      ) {
        setLogoFile(file);
        // Revoke previous object URL if it exists to prevent memory leaks
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
        setPreview(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Por favor, selecione um arquivo de imagem PNG ou JPEG.');
        setLogoFile(null);
        setPreview(channel?.logoUrl || null); // Reverte para a logo original ou null
      }
    } else {
      setLogoFile(null);
      setPreview(channel?.logoUrl || null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  };

  // Previne o comportamento padrão para permitir o drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  // Lida com o drop do arquivo
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false); // Reseta o estado de dragOver
    processFile(event.dataTransfer.files?.[0]); // Usa a função unificada para processar o arquivo
  };

  // Lida quando um item entra na área de drag
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  // Lida quando um item sai da área de drag
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('O nome do canal é obrigatório.');
      return;
    }
    // Se for um novo canal e não houver logo ou for um canal existente mas a logo foi removida e não substituída
    if (!channel && !logoFile) {
      setError('A logo é obrigatória para um novo canal.');
      return;
    }
    // Se for um canal existente e a logo foi removida (preview é null, mas logoFile é null)
    if (channel && !logoFile && !preview) {
      setError(
        'A logo é obrigatória. Por favor, mantenha a logo existente ou faça upload de uma nova.'
      );
      return;
    }

    setError('');

    let result;
    if (channel) {
      // Se logoFile for null, mas preview não for, significa que a logo existente deve ser mantida.
      // Se logoFile for null e preview também for, significa que a logo foi removida.
      // Se logoFile não for null, a nova logo será usada.
      result = await updateChannel(
        channel.id,
        formData,
        logoFile === null && preview ? undefined : logoFile || undefined
      );
    } else {
      result = await addChannel(formData, logoFile);
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Ocorreu um erro.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {channel ? 'Editar Canal' : 'Novo Canal'}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            ×
          </Button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Canal
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Ex: ESPN"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Canal
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as ChannelType,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {Object.entries(CHANNEL_TYPES).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo do Canal (PNG transparente)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                         ${
                           isDragOver
                             ? 'border-green-500 bg-green-50'
                             : 'border-gray-300 hover:border-green-500'
                         }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                className="hidden"
              />
              {preview ? (
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Pré-visualização"
                    className="max-h-24 mx-auto rounded-md shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que o clique propague para o div pai
                      setPreview(null);
                      setLogoFile(null);
                      setError(''); // Limpa erro relacionado à logo se houver
                    }}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Remover logo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="mx-auto h-8 w-8 mb-2" />
                  <p>
                    {isDragOver
                      ? 'Solte o arquivo aqui!'
                      : 'Clique para fazer upload ou arraste e solte'}
                  </p>
                  <p className="text-xs">Recomendado: PNG sem fundo</p>
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {channel ? 'Atualizar' : 'Criar Canal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelManager;
