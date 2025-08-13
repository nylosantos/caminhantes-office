import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Player } from '@/types/squad';
import { Substitution } from '@/types/generator';
import SimplePlayerSelector from './SimplePlayerSelector';

interface SubstitutionsManagerProps {
  substitutions: Substitution[];
  onSubstitutionsChange: (substitutions: Substitution[]) => void;
}

const SubstitutionsManager: React.FC<SubstitutionsManagerProps> = ({
  substitutions,
  onSubstitutionsChange,
}) => {
  const [localSubstitutions, setLocalSubstitutions] =
    useState<Substitution[]>(substitutions);

  useEffect(() => {
    setLocalSubstitutions(substitutions);
  }, [substitutions]);

  // Função para obter jogadores já utilizados em outras substituições
  const getUsedPlayers = (excludeIndex?: number): Player[] => {
    const usedPlayers: Player[] = [];
    localSubstitutions.forEach((sub, index) => {
      if (excludeIndex !== undefined && index === excludeIndex) return;
      if (sub.playerOut) usedPlayers.push(sub.playerOut);
      if (sub.playerIn) usedPlayers.push(sub.playerIn);
    });
    return usedPlayers;
  };

  // Função para verificar se um jogador já está sendo usado
  const isPlayerUsed = (player: Player, excludeIndex?: number): boolean => {
    const usedPlayers = getUsedPlayers(excludeIndex);
    return usedPlayers.some((usedPlayer) => usedPlayer.id === player.id);
  };

  // Adicionar nova substituição
  const addSubstitution = () => {
    if (localSubstitutions.length >= 5) return;

    const newSubstitution: Partial<Substitution> = {};
    const updatedSubs = [
      ...localSubstitutions,
      newSubstitution as Substitution,
    ];
    setLocalSubstitutions(updatedSubs);
    // Não chama onSubstitutionsChange aqui porque a substituição ainda está vazia
  };

  // Remover substituição
  const removeSubstitution = (index: number) => {
    const updatedSubs = localSubstitutions.filter((_, i) => i !== index);
    setLocalSubstitutions(updatedSubs);

    // Atualiza o estado pai com todas as substituições restantes (completas e incompletas)
    onSubstitutionsChange(updatedSubs);
  };

  // Atualizar jogador que sai
  const updatePlayerOut = (index: number, player: Player | null) => {
    const updatedSubs = [...localSubstitutions];

    if (player) {
      updatedSubs[index] = { ...updatedSubs[index], playerOut: player };
    } else {
      // Remove a propriedade se player for null
      const { playerOut, ...rest } = updatedSubs[index];
      updatedSubs[index] = rest as Substitution;
    }

    setLocalSubstitutions(updatedSubs);

    // CORREÇÃO: Atualiza o estado pai com TODAS as substituições, não apenas as completas
    // Isso mantém as substituições em progresso no estado pai
    onSubstitutionsChange(updatedSubs);
  };

  // Atualizar jogador que entra
  const updatePlayerIn = (index: number, player: Player | null) => {
    const updatedSubs = [...localSubstitutions];

    if (player) {
      updatedSubs[index] = { ...updatedSubs[index], playerIn: player };
    } else {
      // Remove a propriedade se player for null
      const { playerIn, ...rest } = updatedSubs[index];
      updatedSubs[index] = rest as Substitution;
    }

    setLocalSubstitutions(updatedSubs);

    // CORREÇÃO: Atualiza o estado pai com TODAS as substituições, não apenas as completas
    // Isso mantém as substituições em progresso no estado pai
    onSubstitutionsChange(updatedSubs);
  };

  // Validar se um jogador pode ser selecionado
  const canSelectPlayer = (
    player: Player,
    currentIndex: number,
    isPlayerOut: boolean
  ): boolean => {
    // Não pode selecionar um jogador já usado em outras substituições
    if (isPlayerUsed(player, currentIndex)) return false;

    // Se estamos selecionando quem sai, não pode ser o mesmo que entra na mesma substituição
    if (
      isPlayerOut &&
      localSubstitutions[currentIndex]?.playerIn?.id === player.id
    )
      return false;

    // Se estamos selecionando quem entra, não pode ser o mesmo que sai na mesma substituição
    if (
      !isPlayerOut &&
      localSubstitutions[currentIndex]?.playerOut?.id === player.id
    )
      return false;

    return true;
  };

  // Função para obter apenas as substituições completas (para validação)
  const getCompleteSubstitutions = (): Substitution[] => {
    return localSubstitutions.filter(
      (sub) => sub.playerOut && sub.playerIn
    ) as Substitution[];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-display-semibold text-gray-800 mb-2">
          Gerenciar Substituições
        </h3>
        <p className="text-sm text-gray-600 font-display">
          Adicione até 5 substituições para a imagem
        </p>
      </div>

      {/* Lista de Substituições */}
      <div className="space-y-4">
        {localSubstitutions.map((substitution, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display-semibold text-gray-800">
                Substituição {index + 1}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSubstitution(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Jogador que sai */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-display-medium text-red-700">
                    Sai de campo
                  </span>
                </div>
                <SimplePlayerSelector
                  selectedPlayer={substitution.playerOut || null}
                  selectedPlayerImageUrl={null}
                  selectedPlayerImgIndex={null}
                  onPlayerSelect={(player) => updatePlayerOut(index, player)}
                  placeholder="Selecione quem sai"
                  showImageSelector={false}
                  filterFunction={(player) =>
                    canSelectPlayer(player, index, true)
                  }
                />
              </div>

              {/* Ícone de troca */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-gray-400" />
              </div>

              {/* Jogador que entra */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-display-medium text-green-700">
                    Entra em campo
                  </span>
                </div>
                <SimplePlayerSelector
                  selectedPlayer={substitution.playerIn || null}
                  selectedPlayerImageUrl={null}
                  selectedPlayerImgIndex={null}
                  onPlayerSelect={(player) => updatePlayerIn(index, player)}
                  placeholder="Selecione quem entra"
                  showImageSelector={false}
                  filterFunction={(player) =>
                    canSelectPlayer(player, index, false)
                  }
                />
              </div>
            </div>

            {/* Validação da substituição */}
            {substitution.playerOut && substitution.playerIn && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-display">
                ✓ Substituição válida: {substitution.playerOut.name} →{' '}
                {substitution.playerIn.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botão para adicionar nova substituição */}
      {localSubstitutions.length < 5 && (
        <Button
          onClick={addSubstitution}
          variant="outline"
          className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Substituição ({localSubstitutions.length}/5)
        </Button>
      )}

      {/* Resumo - Mostra apenas substituições completas */}
      {getCompleteSubstitutions().length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-display-semibold text-gray-800 mb-2">
            Resumo das Substituições
          </h4>
          <div className="space-y-1">
            {getCompleteSubstitutions().map((sub, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 font-display"
              >
                {index + 1}. {sub.playerOut.name} → {sub.playerIn.name}
              </div>
            ))}
          </div>

          {/* Contador de substituições completas vs total */}
          <div className="mt-2 text-xs text-gray-500 font-display">
            {getCompleteSubstitutions().length} de {localSubstitutions.length}{' '}
            substituições completas
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 font-display text-center">
        Cada jogador só pode participar de uma substituição por imagem
      </div>
    </div>
  );
};

export default SubstitutionsManager;
