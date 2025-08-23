// src/components/konva/ui/ExportPanel.tsx

import React, { useState } from 'react';
import { ExportConfig, ImageFormat, GeneratorType } from '@/types/konva';

interface ExportPanelProps {
  onExport: (config?: ExportConfig) => void;
  isExporting: boolean;
  format: ImageFormat;
  generatorType: GeneratorType;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  onExport,
  isExporting,
  format,
  generatorType,
}) => {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(1);
  const [scale, setScale] = useState(1);

  const handleExport = () => {
    const config: ExportConfig = {
      format: exportFormat,
      quality: exportFormat === 'jpeg' ? quality : 1,
      scale,
    };

    onExport(config);
  };

  const getResolution = () => {
    const dimensions = {
      quadrada: { width: 1080, height: 1080 },
      vertical: { width: 1080, height: 1920 },
      horizontal: { width: 1920, height: 1080 },
    };

    const base = dimensions[format];
    return {
      width: base.width * scale,
      height: base.height * scale,
    };
  };

  const resolution = getResolution();

  return (
    <div className="export-panel space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-700 mb-2">EXPORTAR</h4>

        {/* Formato */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Formato</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setExportFormat('png')}
              className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                exportFormat === 'png'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              PNG
            </button>
            <button
              onClick={() => setExportFormat('jpeg')}
              className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                exportFormat === 'jpeg'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              JPEG
            </button>
          </div>
        </div>

        {/* Qualidade (apenas para JPEG) */}
        {exportFormat === 'jpeg' && (
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">
              Qualidade: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Escala */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">
            Escala: {scale}x
          </label>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  scale === s
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Resolução resultante */}
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <div>
            Resolução: {resolution.width}×{resolution.height}
          </div>
          <div>
            Tamanho estimado: {exportFormat === 'png' ? '~2-5MB' : '~500KB-2MB'}
          </div>
        </div>

        {/* Botão de exportar */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full px-4 py-3 text-sm font-medium rounded transition-colors ${
            isExporting
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
          }`}
        >
          {isExporting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exportando...
            </div>
          ) : (
            `📥 Exportar ${exportFormat.toUpperCase()}`
          )}
        </button>
      </div>

      {/* Atalhos */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="font-medium">Atalhos:</div>
          <div>Ctrl+E: Exportar rápido</div>
          <div>Ctrl+Z: Desfazer</div>
          <div>Ctrl+D: Duplicar</div>
          <div>Delete: Excluir</div>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
