import React, { useEffect, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { EscalacaoData } from './EscalacaoGenerator';

interface ScoreImageSelectorProps {
    onScoreImageSelect: (scoreImageUrl: string) => void;
    escalacaoData: EscalacaoData;
    setEscalacaoData: React.Dispatch<React.SetStateAction<EscalacaoData>>;
}

const ScoreImageSelector: React.FC<ScoreImageSelectorProps> = ({
    onScoreImageSelect,
    escalacaoData, // Você ainda pode precisar disso para outros propósitos, mas não para o loop
    setEscalacaoData, // Você ainda pode precisar disso para outros propósitos, mas não para o loop
}) => {
    const { gameArt, uploadGameArt, removeGameArt } = useImages();
     console.log('ScoreImageSelector: Render, gameArt reference:', gameArt); // Adicione esta linha
    // ... restante do código ...
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    // UseEffect para notificar o componente pai quando a imagem do placar for selecionada
    // REMOVIDA A CHAMADA DUPLICADA PARA setEscalacaoData
    useEffect(() => {
        console.log('ScoreImageSelector: useEffect gameArt acionado. gameArt:', gameArt); // Adicione para depuração
        if (gameArt) {
            onScoreImageSelect(gameArt.url);
        } else {
            onScoreImageSelect(''); // Limpa a seleção se a imagem for removida
        }
    }, [gameArt, onScoreImageSelect]); // Removido setEscalacaoData das dependências, pois não é mais usado aqui

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        setUploadError(null);

        try {
            const result = await uploadGameArt(file);
            console.log('Upload result:', result);
            if (!(result.success && result.url)) {
                setUploadError(result.error || 'Erro ao fazer upload da imagem do placar');
            }
        } catch (error) {
            setUploadError('Erro inesperado ao fazer upload da imagem do placar');
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
            console.error('Erro ao remover imagem do placar:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* ... restante do seu JSX ... */}
            <div className="text-center">
                <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
                    Imagem do Placar Final
                </h2>
                <p className="text-gray-600 font-display">
                    Faça upload da imagem do placar com o resultado final da partida.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-display-semibold text-gray-800 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-red-600" />
                    Placar Final
                </h3>

                {gameArt ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                            <img
                                src={gameArt.url}
                                alt="Imagem do placar final"
                                className="w-24 h-24 object-contain rounded-lg border"
                            />
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                    <h4 className="font-display-semibold text-green-800">
                                        Imagem do Placar Carregada
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
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => {
                            if (!uploading) {
                                document.getElementById('score-image-file-input')?.click();
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
                                        id="score-image-file-input"
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
                            <p className="text-red-800 text-sm font-display-medium">{uploadError}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreImageSelector;