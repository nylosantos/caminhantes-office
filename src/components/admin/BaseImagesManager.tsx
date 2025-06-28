import React, { useState } from 'react';
import { Upload, Trash2, Image, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BaseImage, IMAGE_TYPES } from '@/types/images';

const BaseImagesManager: React.FC = () => {
  const { baseImages, loading, uploadBaseImage, deleteBaseImage, getBaseImageByType } = useImages();
  const { showConfirmDialog } = useConfirmDialog();
  const [uploadingType, setUploadingType] = useState<BaseImage['type'] | null>(null);

  const handleFileUpload = async (file: File, type: BaseImage['type']) => {
    setUploadingType(type);
    
    try {
      const result = await uploadBaseImage(file, type);
      
      if (result.success) {
        // Sucesso - mostrar feedback visual
        setTimeout(() => setUploadingType(null), 1000);
      } else {
        setUploadingType(null);
        alert(`Erro no upload: ${result.error}`);
      }
    } catch (error) {
      setUploadingType(null);
      alert('Erro inesperado no upload');
    }
  };

  const handleDelete = async (type: BaseImage['type']) => {
    const confirmed = await showConfirmDialog({
      title: 'Deletar Imagem Base',
      message: `Tem certeza que deseja deletar a imagem ${IMAGE_TYPES[type].label}? Esta ação não pode ser desfeita.`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      const result = await deleteBaseImage(type);
      if (!result.success) {
        alert(`Erro ao deletar: ${result.error}`);
      }
    }
  };

  const ImageCard: React.FC<{ type: BaseImage['type'] }> = ({ type }) => {
    const image = getBaseImageByType(type);
    const isUploading = uploadingType === type;
    const typeInfo = IMAGE_TYPES[type];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
              {typeInfo.label}
            </h3>
            <p className="text-sm text-gray-600 font-display">
              {typeInfo.description}
            </p>
            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-display-medium">
              {typeInfo.dimensions}
            </span>
          </div>

          {/* Preview da imagem */}
          <div className="mb-4">
            {image ? (
              <div className="relative">
                <img
                  src={image.url}
                  alt={`Imagem ${typeInfo.label}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-display">
                    Nenhuma imagem
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Informações da imagem */}
          {image && (
            <div className="mb-4 text-left bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-display">
                <strong>Arquivo:</strong> {image.filename}
              </p>
              <p className="text-xs text-gray-600 font-display">
                <strong>Upload:</strong> {image.uploadedAt.toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="space-y-2">
            {/* Upload */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, type);
                  }
                }}
                className="hidden"
                id={`upload-${type}`}
                disabled={isUploading}
              />
              <label
                htmlFor={`upload-${type}`}
                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-display-medium cursor-pointer transition-colors ${
                  isUploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {image ? 'Substituir' : 'Enviar'}
                  </>
                )}
              </label>
            </div>

            {/* Delete */}
            {image && !isUploading && (
              <Button
                onClick={() => handleDelete(type)}
                variant="outline"
                size="sm"
                className="w-full text-red-600 border-red-300 hover:bg-red-50 cursor-pointer font-display-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-600 font-display">Carregando imagens...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
          Gerenciar Imagens Base
        </h2>
        <p className="text-gray-600 font-display">
          Gerencie as imagens base utilizadas para gerar as escalações. 
          Você pode ter no máximo uma imagem de cada tipo.
        </p>
      </div>

      {/* Aviso sobre API Key */}
      {!import.meta.env.VITE_IMGBB_API_KEY && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-display-semibold text-yellow-800">Configuração Necessária</h3>
              <p className="text-sm text-yellow-700 font-display mt-1">
                Para usar o upload de imagens, você precisa configurar a chave da API do ImgBB no arquivo .env:
                <br />
                <code className="bg-yellow-100 px-1 rounded">VITE_IMGBB_API_KEY=sua-chave-aqui</code>
              </p>
              <p className="text-sm text-yellow-700 font-display mt-2">
                Obtenha sua chave gratuita em: <a href="https://api.imgbb.com/" target="_blank" rel="noopener noreferrer" className="underline">api.imgbb.com</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de imagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ImageCard type="square" />
        <ImageCard type="vertical" />
        <ImageCard type="horizontal" />
      </div>

      {/* Estatísticas */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-display-semibold text-gray-800 mb-2">Estatísticas</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display-bold text-teal-600">{baseImages.length}</p>
            <p className="text-sm text-gray-600 font-display">Imagens Configuradas</p>
          </div>
          <div>
            <p className="text-2xl font-display-bold text-gray-600">{3 - baseImages.length}</p>
            <p className="text-sm text-gray-600 font-display">Pendentes</p>
          </div>
          <div>
            <p className="text-2xl font-display-bold text-green-600">
              {Math.round((baseImages.length / 3) * 100)}%
            </p>
            <p className="text-sm text-gray-600 font-display">Completo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseImagesManager;

