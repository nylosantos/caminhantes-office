import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Match } from '@/types/matches';

interface ScoreEditorProps {
  selectedMatch: Match | null;
  homeScore: string;
  awayScore: string;
  showPenalties: boolean;
  homePenaltyScore: string;
  awayPenaltyScore: string;
  onHomeScoreChange: (value: string) => void;
  onAwayScoreChange: (value: string) => void;
  onShowPenaltiesChange: (value: boolean) => void;
  onHomePenaltyScoreChange: (value: string) => void;
  onAwayPenaltyScoreChange: (value: string) => void;
}

const ScoreEditor: React.FC<ScoreEditorProps> = ({
  selectedMatch,
  homeScore,
  awayScore,
  showPenalties,
  homePenaltyScore,
  awayPenaltyScore,
  onHomeScoreChange,
  onAwayScoreChange,
  onShowPenaltiesChange,
  onHomePenaltyScoreChange,
  onAwayPenaltyScoreChange,
}) => {
  if (!selectedMatch) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-display-semibold text-gray-800 mb-4">
          Editar Placar
        </h3>
        <p className="text-sm text-gray-600 font-display mb-6">
          {selectedMatch.teams.home.name} vs {selectedMatch.teams.away.name}
        </p>
      </div>

      {/* Placar Normal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="homeScore"
            className="font-display-medium"
          >
            {selectedMatch.teams.home.name}
          </Label>
          <Input
            id="homeScore"
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => onHomeScoreChange(e.target.value)}
            placeholder="0"
            className="text-center text-lg font-display-semibold"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="awayScore"
            className="font-display-medium"
          >
            {selectedMatch.teams.away.name}
          </Label>
          <Input
            id="awayScore"
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => onAwayScoreChange(e.target.value)}
            placeholder="0"
            className="text-center text-lg font-display-semibold"
          />
        </div>
      </div>

      {/* Switch para Pênaltis */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="space-y-1">
          <Label className="font-display-medium">Disputa de Pênaltis</Label>
          <p className="text-sm text-gray-600 font-display">
            Ativar para incluir o placar dos pênaltis
          </p>
        </div>
        <Switch
          checked={showPenalties}
          onCheckedChange={onShowPenaltiesChange}
        />
      </div>

      {/* Placar dos Pênaltis */}
      {showPenalties && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="space-y-2">
            <Label
              htmlFor="homePenaltyScore"
              className="font-display-medium text-yellow-800"
            >
              Pênaltis - {selectedMatch.teams.home.name}
            </Label>
            <Input
              id="homePenaltyScore"
              type="number"
              min="0"
              value={homePenaltyScore}
              onChange={(e) => onHomePenaltyScoreChange(e.target.value)}
              placeholder="0"
              className="text-center text-lg font-display-semibold border-yellow-300 focus:border-yellow-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="awayPenaltyScore"
              className="font-display-medium text-yellow-800"
            >
              Pênaltis - {selectedMatch.teams.away.name}
            </Label>
            <Input
              id="awayPenaltyScore"
              type="number"
              min="0"
              value={awayPenaltyScore}
              onChange={(e) => onAwayPenaltyScoreChange(e.target.value)}
              placeholder="0"
              className="text-center text-lg font-display-semibold border-yellow-300 focus:border-yellow-500"
            />
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 font-display text-center">
        Os valores inseridos aqui serão usados na geração da imagem final
      </div>
    </div>
  );
};

export default ScoreEditor;
