import { useEffect, useState } from 'react';

import {
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  User,
  Check,
} from 'lucide-react';

import { Player } from '@/types/squad';
import { useSquad } from '@/contexts/SquadContext';
import { useImages } from '@/contexts/ImagesContext'; // Importe ChannelLogo

import { EscalacaoData } from './EscalacaoGenerator';
import { Channel } from '@/types/channels';

// Importe o componente Switch (assumindo que você tem um componente de UI para isso)
// Se não tiver, você pode criar um simples com um input type="checkbox"

interface GameArtSelectorProps {
  onArtSelect: (
    gameArt: string,
    featuredPlayer: Player | null,
    featuredPlayerImageUrl: string | null
  ) => void;
  setEscalacaoData: React.Dispatch<React.SetStateAction<EscalacaoData>>;
  escalacaoData: EscalacaoData;
  offPlayer?: boolean;
  // NEW: Propriedades opcionais para o gerenciamento de logos de canais
  showChannelLogoSelection?: boolean; // Booleano para controlar a visibilidade da seção de logos
  setShowChannelLogoSelection?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedChannelLogos?: Channel[]; // Logos de canais já selecionadas
  onToggleChannelLogo?: (logo: Channel) => void; // Função para alternar a seleção de uma logo
  allChannelLogos?: Channel[]; // Todas as logos de canais disponíveis
}

const GameArtSelector: React.FC<GameArtSelectorProps> = ({
  onArtSelect,
  escalacaoData,
  offPlayer = false,
  // NEW: Desestruturando as novas props com valores padrão (undefined)
  showChannelLogoSelection = false,
  setShowChannelLogoSelection,
  selectedChannelLogos,
  onToggleChannelLogo,
  allChannelLogos,
}) => {
  const { gameArt } = useImages();
  const { players } = useSquad();

  // const [uploading, setUploading] = useState(false);
  // const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    escalacaoData.featuredPlayer?.id || ''
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(
    escalacaoData.featuredPlayerImgIndex || 0
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
    escalacaoData.featuredPlayer?.imgUrl?.[0] || ''
  );
  // const [dragOver, setDragOver] = useState(false);

  // NEW: Estado local para controlar a exibição da seção de logos de canais
  // Inicializa com o valor da prop, se fornecido, caso contrário, false.
  // const [showChannelLogosLocal, setShowChannelLogosLocal] = useState(
  //   showChannelLogoSelection || false
  // );

  // NEW: Sincroniza o estado local com a prop, se a prop mudar
  // useEffect(() => {
  //   if (showChannelLogoSelection !== undefined) {
  //     setShowChannelLogosLocal(showChannelLogoSelection);
  //   }
  // }, [showChannelLogoSelection]);

  // Filtrar jogadores que têm pelo menos uma imagem
  const playersWithImages = players.filter(
    (player) => player.imgUrl && player.imgUrl.length > 0
  );

  useEffect(() => {
    if (gameArt && offPlayer) {
      onArtSelect(gameArt.url, null, null);
    }
    if (selectedPlayerId && gameArt && selectedImageUrl) {
      const featuredPlayer = players.find((p) => p.id === selectedPlayerId);
      if (featuredPlayer) {
        onArtSelect(gameArt.url, featuredPlayer, selectedImageUrl);
      }
    }
  }, [
    selectedImageUrl,
    gameArt,
    selectedPlayerId,
    offPlayer,
    // onArtSelect,
    players,
  ]); // Adicionei dependências faltantes

  // const handleFileUpload = async (file: File) => {
  //   setUploading(true);
  //   setUploadError(null);

  //   try {
  //     const result = await uploadGameArt(file);

  //     if (!(result.success && result.url)) {
  //       setUploadError(result.error || 'Erro ao fazer upload da imagem');
  //     }
  //   } catch (error) {
  //     setUploadError('Erro inesperado ao fazer upload');
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // // const handleDrop = (e: React.DragEvent) => {
  // //   e.preventDefault();
  // //   setDragOver(false);

  // //   const files = Array.from(e.dataTransfer.files);
  // //   const imageFile = files.find((file) => file.type.startsWith('image/'));

  // //   if (imageFile) {
  // //     handleFileUpload(imageFile);
  // //   }
  // // };

  // // const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  // //   const file = e.target.files?.[0];
  // //   if (file) {
  // //     handleFileUpload(file);
  // //   }
  // // };

  // // const handleRemoveGameArt = async () => {
  // //   try {
  // //     await removeGameArt();
  // //   } catch (error) {
  // //     console.error('Erro ao remover arte do jogo:', error);
  // //   }
  // // };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setSelectedImageIndex(0); // Reset para primeira imagem

    const player = players.find((p) => p.id === playerId);
    if (player && player.imgUrl && player.imgUrl.length > 0) {
      setSelectedImageUrl(player.imgUrl[0]);
    }
  };

  const handleImageSelect = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);

    const player = players.find((p) => p.id === selectedPlayerId);
    if (player && player.imgUrl && player.imgUrl[imageIndex]) {
      setSelectedImageUrl(player.imgUrl[imageIndex]);
    }
  };

  // NEW: Função para verificar se uma logo está selecionada
  const isLogoSelected = (logo: Channel) => {
    return selectedChannelLogos?.some((l) => l.id === logo.id) || false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="text-center">
        <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
          {offPlayer ? 'Arte do Jogo' : 'Arte do Jogo e Jogador Destaque'}
        </h2>
        <p className="text-gray-600 font-display">
          Faça upload da arte do jogo
          {!offPlayer && ' e selecione o jogador destaque'}
        </p>
      </div> */}

      <div className="text-center">
        <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
          {offPlayer
            ? 'Canais de transmissão'
            : showChannelLogoSelection
            ? 'Jogador Destaque e Canais de transmissão'
            : 'Jogador Destaque'}
        </h2>
        <p className="text-gray-600 font-display">
          {offPlayer
            ? showChannelLogoSelection
              ? 'Escolha os canais que transmitirão o jogo'
              : ''
            : showChannelLogoSelection
            ? 'Selecione o jogador destaque e/ou as logos dos canais que transmitirão o jogo'
            : 'Selecione o jogador destaque'}
        </p>
      </div>

      {/* Arte do Jogo */}
      {/* <div className="space-y-4">
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
                      //@ts-expect-error
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
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
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
              <p className="text-red-800 text-sm font-display-medium">
                {uploadError}
              </p>
            </div>
          </div>
        )}
      </div> */}

      {/* NEW: Seção de Seleção de Logos de Canais (Condicional) */}
      {allChannelLogos &&
        selectedChannelLogos &&
        setShowChannelLogoSelection &&
        onToggleChannelLogo && (
          <div className="space-y-4">
            <h3 className="text-lg font-display-semibold text-gray-800 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-red-600" />
              Logos de Canais
            </h3>

            {/* Switch para ativar/desativar a seção de seleção de logos */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display-semibold text-gray-800">
                    Adicionar logos dos canais?
                  </h4>
                  <p className="font-display text-sm text-gray-600">
                    {showChannelLogoSelection
                      ? 'Adicionando as logos na arte.'
                      : 'Logos não serão adicionadas a arte.'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-display text-sm ${
                      !showChannelLogoSelection
                        ? 'text-red-600 font-display-semibold'
                        : 'text-gray-500'
                    }`}
                  >
                    Não adicionar
                  </span>
                  <button
                    onClick={() =>
                      setShowChannelLogoSelection(!showChannelLogoSelection)
                    }
                    className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showChannelLogoSelection ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={showChannelLogoSelection}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showChannelLogoSelection
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span
                    className={`font-display text-sm ${
                      showChannelLogoSelection
                        ? 'text-red-600 font-display-semibold'
                        : 'text-gray-500'
                    }`}
                  >
                    Adicionar
                  </span>
                </div>
              </div>
            </div>

            {showChannelLogoSelection && (
              <>
                {allChannelLogos.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 font-display-medium">
                        Nenhuma logo de canal disponível.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                    {allChannelLogos
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((logo) => (
                        <div
                          key={logo.id}
                          className={`relative cursor-pointer rounded-lg border-2 transition-all p-2 flex flex-col items-center justify-center text-center
                        ${
                          isLogoSelected(logo)
                            ? 'border-red-500 ring-2 ring-red-200 bg-red-300'
                            : 'border-gray-200 hover:border-red-300 bg-red-100'
                        }`}
                          onClick={() => onToggleChannelLogo(logo)}
                        >
                          <img
                            src={logo.logoUrl || ''}
                            alt={`${logo.name} Logo`}
                            className="w-16 h-16 object-contain mb-2" // Ajuste o tamanho conforme necessário
                          />
                          <p className="text-xs font-display-medium text-gray-700 truncate w-full px-1">
                            {logo.name}
                          </p>
                          {isLogoSelected(logo) && (
                            <div className="absolute top-1 right-1 bg-red-600 rounded-full p-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      {/* Jogador Destaque */}
      {!offPlayer && (
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
                Adicione imagens aos jogadores na seção de administração do
                elenco.
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
                    <option
                      key={player.id}
                      value={player.id}
                    >
                      {player.number} - {player.name} ({player.imgUrl?.length}{' '}
                      image{player.imgUrl?.length !== 1 ? 'ns' : 'm'})
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
                      .find((p) => p.id === selectedPlayerId)
                      ?.imgUrl?.map((imageUrl, index) => (
                        <div
                          key={index}
                          onClick={() => handleImageSelect(index)}
                          className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-red-500 ring-2 ring-red-200'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`${
                              players.find((p) => p.id === selectedPlayerId)
                                ?.name
                            } - Imagem ${index + 1}`}
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
                      src={
                        players.find((p) => p.id === selectedPlayerId)
                          ?.imgUrl?.[selectedImageIndex]
                      }
                      alt="Jogador destaque"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div>
                      <p className="font-display-semibold text-green-800">
                        {players.find((p) => p.id === selectedPlayerId)?.name}
                      </p>
                      <p className="text-green-700 text-sm font-display">
                        Número{' '}
                        {players.find((p) => p.id === selectedPlayerId)?.number}{' '}
                        • Imagem {selectedImageIndex + 1}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameArtSelector;
