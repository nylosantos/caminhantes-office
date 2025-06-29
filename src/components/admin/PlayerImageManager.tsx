import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSquad } from '@/contexts/SquadContext';
import { Player } from '@/types/squad';
import { showConfirmDialog } from '@/components/ui/ConfirmDialog';

interface PlayerImageManagerProps {
  player: Player;
  onClose: () => void;
}

const PlayerImageManager: React.FC<PlayerImageManagerProps> = ({ player, onClose }) => {
  const { uploadPlayerImage, removePlayerImage } = useSquad();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadPlayerImage(player.id, file);
      
      if (result.success) {
        // Sucesso - o estado será atualizado automaticamente pelo contexto
      } else {
        alert(result.error || 'Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro interno no upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    const confirmed = await showConfirmDialog({
      title: 'Remover Imagem',
      text: 'Tem certeza que deseja remover esta imagem?',
      confirmButtonText: 'Remover',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed) {
      const result = await removePlayerImage(player.id, imageUrl);
      
      if (!result.success) {
        alert(result.error || 'Erro ao remover imagem');
      }
    }
  };

  const currentImages = player.imgUrl || [];
  const canAddMore = currentImages.length < 2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-display-bold text-gray-800">
              Imagens do Jogador
            </h2>
            <p className="text-sm text-gray-600 font-display">
              {player.number} - {player.name}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Imagens atuais */}
          {currentImages.length > 0 && (
            <div>
              <h3 className="text-lg font-display-semibold text-gray-800 mb-4">
                Imagens Atuais ({currentImages.length}/2)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${player.name} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      onClick={() => handleRemoveImage(imageUrl)}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload de nova imagem */}
          {canAddMore && (
            <div>
              <h3 className="text-lg font-display-semibold text-gray-800 mb-4">
                {currentImages.length === 0 ? 'Adicionar Imagens' : 'Adicionar Mais Uma Imagem'}
              </h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-red-400 bg-red-50'
                    : uploading
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-300 hover:border-red-400 hover:bg-red-50 cursor-pointer'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => {
                  if (!uploading) {
                    document.getElementById('image-upload')?.click();
                  }
                }}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 text-red-600 animate-spin mb-2" />
                    <p className="text-gray-600 font-display">Fazendo upload...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-600 font-display-medium mb-1">
                      Clique ou arraste uma imagem aqui
                    </p>
                    <p className="text-sm text-gray-500 font-display">
                      PNG, JPG até 10MB
                    </p>
                  </div>
                )}
              </div>

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />
            </div>
          )}

          {/* Limite atingido */}
          {!canAddMore && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-display-medium">
                  Limite máximo de 2 imagens atingido
                </p>
              </div>
              <p className="text-yellow-700 text-sm mt-1 font-display">
                Remova uma imagem existente para adicionar uma nova.
              </p>
            </div>
          )}

          {/* Informações */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-display-medium text-gray-800 mb-2">Dicas:</h4>
            <ul className="text-sm text-gray-600 space-y-1 font-display">
              <li>• Cada jogador pode ter até 2 imagens</li>
              <li>• Formatos aceitos: PNG, JPG, WebP</li>
              <li>• Tamanho máximo: 10MB por imagem</li>
              <li>• Imagens são armazenadas no ImgBB</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
          >
            Concluído
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerImageManager;

