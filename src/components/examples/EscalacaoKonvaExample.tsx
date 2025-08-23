// src/components/examples/EscalacaoKonvaExample.tsx

import React, { useState } from 'react';

import KonvaGeneratorWrapper from '../konva/KonvaGeneratorWrapper';
import { ImageFormat } from '@/types/konva';
import { BaseImage } from '@/types/images';
import { EscalacaoData } from '../escalacoes/EscalacaoGenerator';
import { Match } from '@/types/matches';
import { useImages } from '@/contexts';

// Contextos existentes (assumindo que existem)
// import { ImagesContext } from '@/contexts/ImagesContext';
// import { SquadContext } from '@/contexts/SquadContext';
// import { MatchesContext } from '@/contexts/MatchesContext';

interface EscalacaoKonvaExampleProps {
  // Props que viriam do componente pai (similar ao EscalacaoGenerator atual)
  escalacaoData: EscalacaoData;
  matchData: Match;
  onImageGenerated?: (dataUrl: string) => void;
}

const EscalacaoKonvaExample: React.FC<EscalacaoKonvaExampleProps> = ({
  escalacaoData,
  matchData,
  onImageGenerated,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('quadrada');

  // Em um cenário real, estes dados viriam dos contextos
  const { baseImages } = useImages();

  // Converter dados para o formato esperado pelo sistema Konva

  const handleExport = (dataUrl: string, format: ImageFormat) => {
    console.log('Imagem exportada:', {
      format,
      dataUrl: dataUrl.substring(0, 50) + '...',
    });

    if (onImageGenerated) {
      onImageGenerated(dataUrl);
    }
  };

  return (
    <div className="escalacao-konva-example">
      {/* Header com controles de formato */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Gerador de Escalação - Sistema Konva
          </h2>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Formato:
              </label>
              <select
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as ImageFormat)
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quadrada">Quadrada (1080x1080)</option>
                <option value="vertical">Vertical (1080x1920)</option>
                <option value="horizontal">Horizontal (1920x1080)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Informações do estado atual */}
        <div className="mt-3 text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Partida:</span>{' '}
              {matchData ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-medium">Jogador:</span>{' '}
              {escalacaoData.featuredPlayer ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-medium">Formação:</span>{' '}
              {escalacaoData.formation ? '✅' : '❌'}
            </div>
            <div>
              <span className="font-medium">Técnico:</span>{' '}
              {escalacaoData.coach ? '✅' : '❌'}
            </div>
          </div>
        </div>
      </div>

      {/* Sistema Konva */}
      <div
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
        // style={{ height: '800px' }}
      >
        <KonvaGeneratorWrapper
          generatorType="escalacao"
          matchData={matchData}
          format={selectedFormat}
          generatorData={escalacaoData}
          baseImages={baseImages}
          onExport={handleExport}
          showUI={true}
          className="h-full"
        />
      </div>

      {/* Instruções de uso */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Como usar:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>Selecionar:</strong> Clique em qualquer elemento para
            selecioná-lo
          </li>
          <li>
            • <strong>Mover:</strong> Arraste elementos selecionados para
            reposicioná-los
          </li>
          <li>
            • <strong>Redimensionar:</strong> Use as alças de redimensionamento
            nos elementos selecionados
          </li>
          <li>
            • <strong>Camadas:</strong> Use o painel lateral para gerenciar
            visibilidade e ordem
          </li>
          <li>
            • <strong>Exportar:</strong> Use o painel de exportação ou Ctrl+E
          </li>
          <li>
            • <strong>Desfazer/Refazer:</strong> Ctrl+Z / Ctrl+Y
          </li>
        </ul>
      </div>

      {/* Comparação com sistema antigo */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-sm font-semibold text-green-800 mb-2">
          Vantagens do novo sistema:
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <h4 className="font-medium mb-1">Funcionalidades:</h4>
            <ul className="space-y-1">
              <li>✅ Edição visual em tempo real</li>
              <li>✅ Undo/Redo completo</li>
              <li>✅ Gerenciamento de camadas</li>
              <li>✅ Alinhamento automático</li>
              <li>✅ Múltiplos formatos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Técnico:</h4>
            <ul className="space-y-1">
              <li>✅ Código modular e reutilizável</li>
              <li>✅ Tipagem completa TypeScript</li>
              <li>✅ Performance otimizada</li>
              <li>✅ Fácil manutenção</li>
              <li>✅ Extensível para novos tipos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscalacaoKonvaExample;
