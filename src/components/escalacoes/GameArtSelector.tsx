import React, { useEffect, useState } from 'react';
import { Upload, Image as ImageIcon, User, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { useSquad } from '@/contexts/SquadContext';
import { Player } from '@/types/squad';
import { EscalacaoData } from './EscalacaoGenerator';

interface FeaturedPlayer {
  playerId: string;
  imageUrl: string;
}

interface GameArtSelectorProps {
  onArtSelect: (gameArt: string, featuredPlayer: Player, featuredPlayerImageUrl: string) => void;
  setEscalacaoData: React.Dispatch<React.SetStateAction<EscalacaoData>>
  escalacaoData: EscalacaoData
}

const GameArtSelector: React.FC<GameArtSelectorProps> = ({
  onArtSelect, escalacaoData
}) => {
  const { gameArt, uploadGameArt, removeGameArt } = useImages();
  const { players } = useSquad();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(escalacaoData.featuredPlayer?.id || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(escalacaoData.featuredPlayerImgIndex || 0);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(escalacaoData.featuredPlayer?.imgUrl?.[0] || '');
  const [dragOver, setDragOver] = useState(false);

  // Filtrar jogadores que têm pelo menos uma imagem
  const playersWithImages = players.filter(player => player.imgUrl && player.imgUrl.length > 0);

  useEffect(() => {
    if (selectedPlayerId && gameArt && selectedImageUrl) {
      const featuredPlayer = players.find(p => p.id === selectedPlayerId);
      if (featuredPlayer) {
        onArtSelect(gameArt.url, featuredPlayer, selectedImageUrl);
      }
    }
  }, [selectedImageUrl, gameArt, selectedPlayerId]);


  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadGameArt(file);

      console.log('Upload result:', result);
      if (!(result.success && result.url)) {
        setUploadError(result.error || 'Erro ao fazer upload da imagem');
      }
    } catch (error) {
      setUploadError('Erro inesperado ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveGameArt = async () => {
    try {
      await removeGameArt();
    } catch (error) {
      console.error('Erro ao remover arte do jogo:', error);
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setSelectedImageIndex(0); // Reset para primeira imagem

    const player = players.find(p => p.id === playerId);
    if (player && player.imgUrl && player.imgUrl.length > 0) {
      setSelectedImageUrl(player.imgUrl[0]);
    }
  };

  const handleImageSelect = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);

    const player = players.find(p => p.id === selectedPlayerId);
    if (player && player.imgUrl && player.imgUrl[imageIndex]) {
      setSelectedImageUrl(player.imgUrl[imageIndex]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
          Arte do Jogo e Jogador Destaque
        </h2>
        <p className="text-gray-600 font-display">
          Faça upload da arte do jogo e selecione o jogador destaque
        </p>
      </div>

      {/* Arte do Jogo */}
      <div className="space-y-4">
        <h3 className="text-lg font-display-semibold text-gray-800 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-red-600" />
          Arte do Jogo
        </h3>

        {gameArt ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <img
                src={gameArt.url}
                alt="Arte do jogo"
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-display-semibold text-green-800">
                    Arte do Jogo Carregada
                  </h4>
                </div>
                <p className="text-green-700 text-sm font-display mb-3">
                  {gameArt.filename}
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleRemoveGameArt}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer font-display-medium"
                  >
                    Remover
                  </Button>
                  <label className="cursor-pointer">
                    <Button
                      as="span"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer font-display-medium"
                    >
                      Substituir
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // <div
          //   onDrop={handleDrop}
          //   onDragOver={(e) => {
          //     e.preventDefault();
          //     setDragOver(true);
          //   }}
          //   onDragLeave={() => setDragOver(false)}
          //   className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          //     dragOver
          //       ? 'border-red-400 bg-red-50'
          //       : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
          //   }`}
          // >
          //   {uploading ? (
          //     <div className="flex flex-col items-center">
          //       <Loader className="w-8 h-8 animate-spin text-red-600 mb-2" />
          //       <p className="text-gray-600 font-display">Fazendo upload...</p>
          //     </div>
          //   ) : (
          //     <div className="flex flex-col items-center">
          //       <Upload className="w-8 h-8 text-gray-400 mb-2" />
          //       <p className="text-gray-600 font-display mb-2">
          //         Arraste uma imagem aqui ou clique para selecionar
          //       </p>
          //       <div>
          //         <input
          //           type="file"
          //           accept="image/*"
          //           onChange={handleFileSelect}
          //           className="hidden"
          //           id="game-art-file-input"
          //         />
          //         <label 
          //           htmlFor="game-art-file-input"
          //           className="cursor-pointer"
          //         >
          //           <Button
          //             type="button"
          //             className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
          //           >
          //             Selecionar Arquivo
          //           </Button>
          //         </label>
          //       </div>
          //       <p className="text-gray-500 text-xs mt-2 font-display">
          //         PNG, JPG até 10MB
          //       </p>
          //     </div>
          //   )}
          // </div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => {
              if (!uploading) {
                document.getElementById('game-art-file-input')?.click();
              }
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-red-400 hover:bg-red-50 cursor-pointer'
              }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader className="w-8 h-8 animate-spin text-red-600 mb-2" />
                <p className="text-gray-600 font-display">Fazendo upload...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-600 font-display mb-2">
                  Arraste uma imagem aqui ou clique para selecionar
                </p>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="game-art-file-input"
                    disabled={uploading}
                  />
                  {/* <label htmlFor="game-art-file-input" className="cursor-pointer">
                    <Button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
                    >
                      Selecionar Arquivo
                    </Button>
                  </label> */}
                </div>
                <p className="text-gray-500 text-xs mt-2 font-display">
                  PNG, JPG até 10MB
                </p>
              </div>
            )}
          </div>
        )}

        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-red-800 text-sm font-display-medium">{uploadError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Jogador Destaque */}
      <div className="space-y-4">
        <h3 className="text-lg font-display-semibold text-gray-800 flex items-center">
          <User className="w-5 h-5 mr-2 text-red-600" />
          Jogador Destaque
        </h3>

        {playersWithImages.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 font-display-medium">
                Nenhum jogador com imagem disponível
              </p>
            </div>
            <p className="text-yellow-700 text-sm mt-1 font-display">
              Adicione imagens aos jogadores na seção de administração do elenco.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Seleção do Jogador */}
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-2">
                Selecionar Jogador
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => handlePlayerSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display"
              >
                <option value="">Selecione um jogador...</option>
                {playersWithImages.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.number} - {player.name} ({player.imgUrl?.length} imagem{player.imgUrl?.length !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção da Imagem */}
            {selectedPlayerId && (
              <div>
                <label className="block text-sm font-display-medium text-gray-700 mb-2">
                  Selecionar Imagem
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {players
                    .find(p => p.id === selectedPlayerId)
                    ?.imgUrl?.map((imageUrl, index) => (
                      <div
                        key={index}
                        onClick={() => handleImageSelect(index)}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all ${selectedImageIndex === index
                          ? 'border-red-500 ring-2 ring-red-200'
                          : 'border-gray-200 hover:border-red-300'
                          }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${players.find(p => p.id === selectedPlayerId)?.name} - Imagem ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {selectedImageIndex === index && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-red-600 bg-white rounded-full" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded font-display">
                          Imagem {index + 1}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Preview do Jogador Selecionado */}
            {selectedPlayerId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-display-semibold text-green-800">
                    Jogador Destaque Selecionado
                  </h4>
                </div>
                <div className="flex items-center space-x-3">
                  <img
                    src={players.find(p => p.id === selectedPlayerId)?.imgUrl?.[selectedImageIndex]}
                    alt="Jogador destaque"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="font-display-semibold text-green-800">
                      {players.find(p => p.id === selectedPlayerId)?.name}
                    </p>
                    <p className="text-green-700 text-sm font-display">
                      Número {players.find(p => p.id === selectedPlayerId)?.number} •
                      Imagem {selectedImageIndex + 1}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameArtSelector;

