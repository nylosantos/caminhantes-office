import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { FORMATIONS, Formation, getPositionsByType } from '@/types/formations';
import { PLAYER_POSITIONS } from '@/types/squad';

interface FormationSelectorProps {
  selectedFormation: Formation | null;
  onFormationSelect: (formation: Formation) => void;
}

const FormationSelector: React.FC<FormationSelectorProps> = ({ 
  selectedFormation, 
  onFormationSelect 
}) => {
  const [hoveredFormation, setHoveredFormation] = useState<Formation | null>(null);

  const FormationPreview: React.FC<{ formation: Formation; isSelected?: boolean; isHovered?: boolean }> = ({ 
    formation, 
    isSelected = false,
    isHovered = false 
  }) => {
    const scale = 0.8; // Escala menor para preview
    
    return (
      <div className="relative w-32 h-48 bg-green-100 rounded-lg overflow-hidden border-2 border-green-200">
        {/* Campo de futebol simplificado */}
        <div className="absolute inset-0">
          {/* Linhas do campo */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-green-300"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-green-300 rounded-full"></div>
          
          {/* Área do goleiro */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-6 border-t border-l border-r border-green-300"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-3 border-t border-l border-r border-green-300"></div>
        </div>

        {/* Jogadores */}
        {formation.positions.map((position) => (
          <div
            key={position.id}
            className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
              position.position === 'GOL' ? 'bg-yellow-500' :
              position.position === 'DEF' ? 'bg-blue-500' :
              position.position === 'MEI' ? 'bg-green-600' :
              'bg-red-500'
            }`}
            style={{
              left: `${position.x * scale}%`,
              top: `${(100 - position.y) * scale + 10}%`
            }}
          />
        ))}

        {/* Overlay de seleção */}
        {isSelected && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-lg flex items-center justify-center">
            <Check className="w-6 h-6 text-red-600" />
          </div>
        )}

        {/* Overlay de hover */}
        {isHovered && !isSelected && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-10 border-2 border-gray-400 rounded-lg"></div>
        )}
      </div>
    );
  };

  const getFormationStats = (formation: Formation) => {
    const stats = {
      GOL: getPositionsByType(formation, 'GOL').length,
      DEF: getPositionsByType(formation, 'DEF').length,
      MEI: getPositionsByType(formation, 'MEI').length,
      ATA: getPositionsByType(formation, 'ATA').length
    };
    return stats;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-display-bold text-gray-800 mb-2">
          Escolher Formação Tática
        </h3>
        <p className="text-gray-600 font-display">
          Selecione a formação que será usada na escalação
        </p>
      </div>

      {/* Grid de formações */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {FORMATIONS.map((formation) => {
          const isSelected = selectedFormation?.id === formation.id;
          const isHovered = hoveredFormation?.id === formation.id;
          const stats = getFormationStats(formation);

          return (
            <div
              key={formation.id}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? 'border-red-500 shadow-lg' 
                  : 'border-gray-200 hover:border-red-300'
              }`}
              onClick={() => onFormationSelect(formation)}
              onMouseEnter={() => setHoveredFormation(formation)}
              onMouseLeave={() => setHoveredFormation(null)}
            >
              {/* Preview da formação */}
              <div className="flex justify-center mb-3">
                <FormationPreview 
                  formation={formation} 
                  isSelected={isSelected}
                  isHovered={isHovered}
                />
              </div>

              {/* Nome da formação */}
              <div className="text-center mb-2">
                <h4 className="font-display-semibold text-gray-800 text-sm">
                  {formation.displayName}
                </h4>
                <p className="text-xs text-gray-500 font-display mt-1">
                  {formation.description}
                </p>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-4 gap-1 text-xs">
                <div className="text-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                  <span className="font-display-medium text-gray-600">{stats.GOL}</span>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                  <span className="font-display-medium text-gray-600">{stats.DEF}</span>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mx-auto mb-1"></div>
                  <span className="font-display-medium text-gray-600">{stats.MEI}</span>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                  <span className="font-display-medium text-gray-600">{stats.ATA}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informações da formação selecionada */}
      {selectedFormation && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <FormationPreview formation={selectedFormation} isSelected />
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-display-semibold text-gray-800 mb-2">
                {selectedFormation.displayName}
              </h4>
              <p className="text-gray-600 font-display mb-4">
                {selectedFormation.description}
              </p>

              {/* Detalhes das posições */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(PLAYER_POSITIONS).map(([key, label]) => {
                  const count = getPositionsByType(selectedFormation, key as any).length;
                  if (count === 0) return null;

                  return (
                    <div key={key} className="text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${
                        key === 'GOL' ? 'bg-yellow-500' :
                        key === 'DEF' ? 'bg-blue-500' :
                        key === 'MEI' ? 'bg-green-600' :
                        'bg-red-500'
                      }`}></div>
                      <p className="text-sm font-display-medium text-gray-800">{count}</p>
                      <p className="text-xs text-gray-600 font-display">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <Info className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm font-display-medium text-gray-700">Legenda das Posições</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="font-display text-gray-600">Goleiro</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="font-display text-gray-600">Defensor</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
            <span className="font-display text-gray-600">Meio-campo</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="font-display text-gray-600">Atacante</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormationSelector;

