import React, { useState } from 'react';
import {
  Upload,
  Trash2,
  Image,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  IMAGE_SECTIONS,
  IMAGE_TYPES_ENUM,
  SECTIONS_CONFIG,
  ImageIdentifier,
  getSectionConfig,
  getImageTypeConfig,
  getAllowedTypesForSection,
} from '@/types/images';

const BaseImagesManager: React.FC = () => {
  const {
    baseImages,
    loading,
    uploadBaseImage,
    removeBaseImage,
    getImageByIdentifier,
    getImagesBySection,
  } = useImages();
  const { showConfirmDialog } = useConfirmDialog();
  const [uploadingIdentifier, setUploadingIdentifier] =
    useState<ImageIdentifier | null>(null);
  const [activeSection, setActiveSection] = useState<IMAGE_SECTIONS>(
    IMAGE_SECTIONS.ESCALACAO
  );

  const handleFileUpload = async (
    file: File,
    section: IMAGE_SECTIONS,
    type: IMAGE_TYPES_ENUM
  ) => {
    const identifier = { section, type };
    setUploadingIdentifier(identifier);

    try {
      const result = await uploadBaseImage(file, section, type);
      if (!result.success) {
        alert(`Erro no upload: ${result.error}`);
      }
    } catch (error) {
      alert('Erro inesperado no upload');
    } finally {
      setUploadingIdentifier(null);
    }
  };

  const handleDelete = async (
    section: IMAGE_SECTIONS,
    type: IMAGE_TYPES_ENUM
  ) => {
    const sectionConfig = getSectionConfig(section);
    const typeConfig = getImageTypeConfig(type);

    const confirmed = await showConfirmDialog({
      title: 'Deletar Imagem',
      text: `Tem certeza que deseja deletar a imagem ${typeConfig.label} da seção ${sectionConfig.label}? Esta ação não pode ser desfeita.`,
      confirmButtonText: 'Deletar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmed) {
      const result = await removeBaseImage(section, type);
      if (!result.success) {
        alert(`Erro ao deletar: ${result.error}`);
      }
    }
  };

  const isUploading = (
    section: IMAGE_SECTIONS,
    type: IMAGE_TYPES_ENUM
  ): boolean => {
    return (
      uploadingIdentifier?.section === section &&
      uploadingIdentifier?.type === type
    );
  };

  const ImageCard: React.FC<{
    section: IMAGE_SECTIONS;
    type: IMAGE_TYPES_ENUM;
  }> = ({ section, type }) => {
    const image = getImageByIdentifier({ section, type });
    const isUploadingThis = isUploading(section, type);
    const typeConfig = getImageTypeConfig(type);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-xl font-display-semibold text-gray-800 mb-2">
              {typeConfig.label}
            </h3>
            <p className="text-sm text-gray-600 font-display">
              {typeConfig.description}
            </p>
            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-display-medium">
              {typeConfig.dimensions}
            </span>
          </div>
          <div className="mb-4">
            {image ? (
              <div className="relative">
                <img
                  src={image.url}
                  alt={`Imagem ${typeConfig.label}`}
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
          {image && (
            <div className="mb-4 text-left bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-display">
                <strong>Arquivo:</strong> {image.filename}
              </p>
              <p className="text-xs text-gray-600 font-display">
                <strong>Upload:</strong>{' '}
                {image.uploadedAt.toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, section, type);
                  }
                }}
                className="hidden"
                id={`upload-${section}-${type}`}
                disabled={isUploadingThis}
              />
              <label
                htmlFor={`upload-${section}-${type}`}
                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-display-medium cursor-pointer transition-colors ${
                  isUploadingThis
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {isUploadingThis ? (
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
            {image && !isUploadingThis && (
              <Button
                onClick={() => handleDelete(section, type)}
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

  const SectionContent: React.FC<{ section: IMAGE_SECTIONS }> = ({
    section,
  }) => {
    const sectionConfig = getSectionConfig(section);
    const allowedTypes = getAllowedTypesForSection(section);
    const sectionImages = getImagesBySection(section);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-display-bold text-gray-800 mb-2">
            {sectionConfig.label}
          </h3>
          <p className="text-gray-600 font-display">
            {sectionConfig.description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allowedTypes.map((type) => (
            <ImageCard
              key={`${section}-${type}`}
              section={section}
              type={type}
            />
          ))}
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-display-semibold text-gray-800 mb-2">
            Estatísticas - {sectionConfig.label}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-display-bold text-teal-600">
                {sectionImages.length}
              </p>
              <p className="text-sm text-gray-600 font-display">Configuradas</p>
            </div>
            <div>
              <p className="text-2xl font-display-bold text-gray-600">
                {allowedTypes.length - sectionImages.length}
              </p>
              <p className="text-sm text-gray-600 font-display">Pendentes</p>
            </div>
            <div>
              <p className="text-2xl font-display-bold text-green-600">
                {Math.round((sectionImages.length / allowedTypes.length) * 100)}
                %
              </p>
              <p className="text-sm text-gray-600 font-display">Completo</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-600 font-display">
          Carregando imagens...
        </span>
      </div>
    );
  }

  const totalImages = baseImages.length;
  const totalPossibleImages = Object.values(SECTIONS_CONFIG).reduce(
    (acc, section) => acc + section.allowedTypes.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
          Gerenciar Imagens por Seção
        </h2>
        <p className="text-gray-600 font-display">
          Gerencie as imagens base organizadas por seção. Cada seção tem tipos
          específicos de imagem permitidos.
        </p>
      </div>
      {/* // @ts-expect-error */}
      {!import.meta.env.VITE_IMGBB_API_KEY && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-display-semibold text-yellow-800">
                Configuração Necessária
              </h3>
              <p className="text-sm text-yellow-700 font-display mt-1">
                Para usar o upload de imagens, você precisa configurar a chave
                da API do ImgBB no arquivo .env:
                <code className="bg-yellow-100 px-1 rounded">
                  VITE_IMGBB_API_KEY=sua-chave-aqui
                </code>
              </p>
              <p className="text-sm text-yellow-700 font-display mt-2">
                Obtenha sua chave gratuita em:{' '}
                <a
                  href="https://api.imgbb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  api.imgbb.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {Object.values(IMAGE_SECTIONS).map((section) => {
            const sectionConfig = getSectionConfig(section);
            const sectionImages = getImagesBySection(section);
            const allowedTypes = getAllowedTypesForSection(section);
            const isActive = activeSection === section;
            const completionPercentage =
              allowedTypes.length > 0
                ? Math.round((sectionImages.length / allowedTypes.length) * 100)
                : 0;

            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-display-medium text-sm transition-colors ${
                  isActive
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="flex items-center space-x-2">
                  <span>{sectionConfig.label}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-display-medium ${
                      completionPercentage === 100
                        ? 'bg-green-100 text-green-800'
                        : completionPercentage > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {sectionImages.length}/{allowedTypes.length}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
      <SectionContent section={activeSection} />
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-display-semibold text-gray-800 mb-2">
          Estatísticas Gerais
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-display-bold text-teal-600">
              {totalImages - 3}
            </p>
            <p className="text-sm text-gray-600 font-display">
              Total Configuradas
            </p>
          </div>
          <div>
            <p className="text-2xl font-display-bold text-gray-600">
              {totalPossibleImages - (totalImages - 3)}
            </p>
            <p className="text-sm text-gray-600 font-display">
              Total Pendentes
            </p>
          </div>
          <div>
            <p className="text-2xl font-display-bold text-green-600">
              {totalPossibleImages > 0
                ? Math.round(((totalImages - 3) / totalPossibleImages) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-gray-600 font-display">
              Progresso Geral
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseImagesManager;
