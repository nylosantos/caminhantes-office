import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download, Loader, Check, Calendar, Users, Target, Image as ImageIcon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { useSquad } from '@/contexts/SquadContext';
import MatchSelector from './MatchSelector';
import FormationSelector from './FormationSelector';
import PlayerSelector from './PlayerSelector';
import GameArtSelector from './GameArtSelector';
import { MatchFormData } from '@/types/matches';
import { Formation, getFormationById } from '@/types/formations';
import { Player } from '@/types/squad';

interface EscalacaoGeneratorProps {
  onBack: () => void;
}

interface SelectedPlayers {
  [positionId: string]: Player | null;
}

export interface EscalacaoData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  featuredPlayer: Player | null;
  featuredPlayerImageUrl: string | null;
  featuredPlayerImgIndex: number | null;
  formation: Formation | null;
  selectedPlayers: SelectedPlayers;
  reservePlayers: Player[];
  coach: string;
}

const EscalacaoGenerator: React.FC<EscalacaoGeneratorProps> = ({ onBack }) => {
  const { baseImages } = useImages();
  const { players } = useSquad();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = {
    primary: '#ffffff',
    secondary: '#1ae9de',
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [escalacaoData, setEscalacaoData] = useState<EscalacaoData>({
    matchData: null,
    gameArt: null,
    featuredPlayer: null,
    featuredPlayerImageUrl: null,
    featuredPlayerImgIndex: null,
    formation: null,
    selectedPlayers: {},
    reservePlayers: [],
    coach: 'Arne Slot'
  });

  const steps = [
    { id: 1, title: 'Dados da Partida', icon: Calendar, description: 'Selecione ou preencha os dados da partida' },
    { id: 2, title: 'Arte do Jogo', icon: Palette, description: 'Selecione a arte do jogo e jogador destaque' },
    { id: 3, title: 'Formação Tática', icon: Target, description: 'Escolha a formação que será utilizada' },
    { id: 4, title: 'Seleção de Jogadores', icon: Users, description: 'Selecione os jogadores para cada posição' },
    { id: 5, title: 'Gerar Escalação', icon: ImageIcon, description: 'Gere a imagem final da escalação' }
  ];
  // Estado para controlar se os dados do passo 1 estão válidos
  const [step1Valid, setStep1Valid] = useState(false);

  // Verificar se pode avançar para o próximo passo
  const canAdvanceToStep = (step: number): boolean => {
    switch (step) {
      case 2: return step1Valid || !!escalacaoData.matchData;
      case 3: return !!escalacaoData.gameArt && !!escalacaoData.featuredPlayer;
      case 4: return !!escalacaoData.formation;
      case 5:
        const allPositionsFilled = escalacaoData.formation?.positions.every(pos =>
          escalacaoData.selectedPlayers[pos.id]
        );
        return !!allPositionsFilled;
      default: return true;
    }
  };
  // Handlers para cada etapa
  const handleMatchSelect = (matchData: { stadium: string; date: string; competition: string }) => {
    // Converter MatchData para MatchFormData
    const formData: MatchFormData = {
      homeTeam: 'Liverpool',
      awayTeam: 'Adversário',
      competition: matchData.competition,
      matchDate: new Date().toISOString().split('T')[0],
      matchTime: '16:00',
      venue: matchData.stadium,
      matchday: '',
      stage: '',
      referee: '',
      // Novos campos obrigatórios
      stadium: matchData.stadium,
      date: matchData.date,
      competitionRound: matchData.competition
    };

    setEscalacaoData(prev => ({ ...prev, matchData: formData }));
    setStep1Valid(true); // Marcar passo 1 como válido
    // Não avança automaticamente, deixa o MatchSelector controlar via onNext
  };

  const handleManualEntry = () => {
    // Implementar formulário manual
    const manualData: MatchFormData = {
      homeTeam: 'Liverpool',
      awayTeam: 'Time Adversário',
      competition: 'Premier League',
      matchDate: new Date().toISOString().split('T')[0],
      matchTime: '16:00',
      venue: 'Anfield',
      matchday: '',
      stage: '',
      referee: '',
      // Novos campos obrigatórios
      stadium: 'Anfield',
      date: new Date().toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' às 16:00',
      competitionRound: 'Premier League - 1ª Rodada'
    };
    setEscalacaoData(prev => ({ ...prev, matchData: manualData }));
    setCurrentStep(2);
  };

  const handleGameArtSelect = (gameArt: string, featuredPlayer: Player, featuredPlayerImageUrl: string) => {
    setEscalacaoData(prev => ({
      ...prev,
      gameArt,
      featuredPlayer,
      featuredPlayerImageUrl
    }));
    // setCurrentStep(3);
  };

  const handleFormationSelect = (formation: Formation) => {
    setEscalacaoData(prev => ({
      ...prev,
      formation,
      selectedPlayers: {} // Reset players when formation changes
    }));
    setCurrentStep(4);
  };

  const handlePlayersChange = (selectedPlayers: SelectedPlayers) => {
    setEscalacaoData(prev => ({ ...prev, selectedPlayers }));
  };

  const handleReservePlayersChange = (reservePlayers: Player[]) => {
    setEscalacaoData(prev => ({ ...prev, reservePlayers }));
  };

  // Gerar imagem da escalação
  const generateEscalacao = async () => {
    if (!canvasRef.current || !escalacaoData.formation || !escalacaoData.matchData) return;

    setGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Configurar canvas
      canvas.width = 1080;
      canvas.height = 1080;

      // Carregar e desenhar imagem de fundo
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      try {
        const imgUrl = baseImages.find(img => img.type === 'quadrada')?.url;
        console.error(baseImages)
        if (!imgUrl) throw new Error('Imagem de fundo não encontrada');
        const bgImg = await loadImage(imgUrl); // Altere o caminho conforme sua imagem
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.warn('Erro ao carregar imagem de fundo:', error);
        // Se quiser, pode manter o gradiente como fallback:
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#dc2626');
        gradient.addColorStop(1, '#991b1b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Logo do canal (canto superior direito)
      try {
        const logoImg = await loadImage('/src/assets/caminhantes-clock.png');
        const logoSize = 123;
        ctx.drawImage(logoImg, canvas.width - logoSize - 36, 31, logoSize, logoSize);
      } catch (error) {
        console.warn('Erro ao carregar logo do canal:', error);
      }

      // Arte do placar (topo)
      const placarImage = escalacaoData.gameArt;
      if (placarImage) {
        try {
          const originalWidth = 1280;
          const originalHeight = 720;

          // Calcule o height proporcional
          const placarImg = await loadImage(placarImage);
          const placarWidth = 450;
          const placarHeight = (placarWidth * originalHeight) / originalWidth;
          ctx.drawImage(placarImg, 82, -75, placarWidth, placarHeight);
        } catch (error) {
          console.warn('Erro ao carregar arte do placar:', error);
        }
      }

      // Jogador destaque (lado direito)
      const jogadorImage = escalacaoData.featuredPlayerImageUrl
      if (jogadorImage) {
        try {
          const jogadorImg = await loadImage(jogadorImage);
          const jogadorWidth = 666;
          const jogadorHeight = 1062;
          ctx.drawImage(jogadorImg, canvas.width - jogadorWidth + 70, 100, jogadorWidth, jogadorHeight);
        } catch (error) {
          console.warn('Erro ao carregar jogador destaque:', error);
        }
      }

      // Lista de jogadores titulares
      const startY = 229;
      const lineHeight = 54.5;
      let currentY = startY;

      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 24px "Funnel Display", sans-serif';

      escalacaoData.formation.positions.forEach((position) => {
        const player = escalacaoData.selectedPlayers[position.id];
        if (player) {
          // Número do jogador (azul), alinhado à direita
          ctx.fillStyle = colors.secondary;
          ctx.font = '800 28px "Funnel Display", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(player.number, 183, currentY); // 188 é o limite direito da área do número

          // Nome do jogador (esquerda)
          ctx.fillStyle = colors.primary;
          ctx.font = '800 47px "Funnel Display", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(player.name.toUpperCase(), 198, currentY); // 198 é o início da área do nome

          currentY += lineHeight;
        }
      });

      // Banco de reservas
      if (escalacaoData.reservePlayers.length > 0) {
        currentY += -30;

        // --- 1. Quebra as linhas dos reservas antes de desenhar ---
        ctx.font = '18px "Funnel Display", sans-serif';
        const reserveNames = escalacaoData.reservePlayers.map(p => p.name).join(', ');
        const maxWidth = 300;
        const words = reserveNames.split(' ');
        let lines: string[] = [];
        let line = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && i > 0) {
            lines.push(line.trim());
            line = words[i] + ' ';
          } else {
            line = testLine;
          }
        }
        if (line) lines.push(line.trim());

        // --- 2. Calcula altura total do bloco de reservas ---
        const lineHeight = 25;
        const blockHeight = lines.length * lineHeight;

        // --- 3. Centraliza verticalmente o "BANCO" ---
        ctx.fillStyle = colors.secondary;
        ctx.font = '800 18px "Funnel Display", sans-serif';
        ctx.textAlign = 'right';
        // O Y do "BANCO" é o topo do bloco + metade da altura do bloco - metade da altura da fonte
        const bancoY = currentY + blockHeight / 2 + 9; // 9 ≈ metade de 18px (altura da fonte)
        ctx.fillText('BANCO', 184, bancoY);

        // --- 4. Desenha as linhas dos reservas alinhadas à esquerda ---
        ctx.fillStyle = colors.primary;
        ctx.font = '800 24px "Funnel Display", sans-serif';
        ctx.textAlign = 'left';
        let reservasY = currentY;
        for (const l of lines) {
          ctx.fillText(l.toUpperCase(), 198, reservasY + lineHeight);
          reservasY += lineHeight;
        }
        currentY += blockHeight + 67;
      }

      // Técnico
      if (escalacaoData.coach) {
        // "TÉCNICO" alinhado à direita
        ctx.fillStyle = colors.secondary;
        ctx.font = '800 18px "Funnel Display", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('TÉCNICO', 184, currentY);

        // Nome do técnico alinhado à esquerda
        ctx.fillStyle = colors.primary;
        ctx.font = '800 31px "Funnel Display", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(escalacaoData.coach.toUpperCase(), 198, currentY);

        currentY += 65;
      }

      // Informações da partida (rodapé)
      const footerY = canvas.height - 75;

      // Local e data
      ctx.fillStyle = colors.primary;
      ctx.font = '800 20px "Funnel Display", sans-serif';
      ctx.fillText(escalacaoData.matchData.stadium.toUpperCase(), 198, footerY);

      const matchDate = new Date(escalacaoData.matchData.matchDate + 'T' + escalacaoData.matchData.matchTime);
      const dateStr = escalacaoData.matchData.date.toUpperCase();

      ctx.fillText(dateStr, 198, footerY + 25);

      // Competição
      ctx.fillStyle = colors.primary;
      ctx.font = '800 20px "Funnel Display", sans-serif';
      ctx.fillText(escalacaoData.matchData.competitionRound.toUpperCase(), 198, footerY + 50);

    } catch (error) {
      console.error('Erro ao gerar escalação:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Download da imagem
  const downloadEscalacao = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `escalacao-liverpool-${escalacaoData.matchData?.matchDate || 'custom'}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="mr-4 cursor-pointer font-display-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-display-bold text-gray-800">
                Gerador de Escalações
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const canAccess = canAdvanceToStep(step.id);

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isCompleted
                    ? 'bg-green-600 border-green-600 text-white'
                    : isActive
                      ? 'bg-red-600 border-red-600 text-white'
                      : canAccess
                        ? 'border-gray-300 text-gray-500 hover:border-red-300 cursor-pointer'
                        : 'border-gray-200 text-gray-300'
                    }`}
                  onClick={() => canAccess && setCurrentStep(step.id)}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>

                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-display-medium ${isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 font-display">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {currentStep === 1 && (
            <MatchSelector
              onMatchSelected={handleMatchSelect}
              escalacaoData={escalacaoData}
            />
          )}

          {currentStep === 2 && (
            <GameArtSelector
              onArtSelect={handleGameArtSelect}
              escalacaoData={escalacaoData}
              setEscalacaoData={setEscalacaoData}
            />
          )}

          {currentStep === 3 && (
            <FormationSelector
              selectedFormation={escalacaoData.formation}
              onFormationSelect={handleFormationSelect}
            />
          )}

          {currentStep === 4 && escalacaoData.formation && (
            <div className="space-y-6">
              <PlayerSelector
                formation={escalacaoData.formation}
                selectedPlayers={escalacaoData.selectedPlayers}
                onPlayersChange={handlePlayersChange}
                reservePlayers={escalacaoData.reservePlayers}
                onReservePlayersChange={handleReservePlayersChange}
                maxReserves={11}
              />

              {/* Campo para técnico */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-display-medium text-gray-700 mb-2">
                  Técnico
                </label>
                <input
                  type="text"
                  value={escalacaoData.coach}
                  onChange={(e) => setEscalacaoData(prev => ({ ...prev, coach: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display"
                  placeholder="Nome do técnico"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-display-bold text-gray-800 mb-2">
                  Gerar Escalação Final
                </h3>
                <p className="text-gray-600 font-display">
                  Clique em "Gerar Escalação" para criar a imagem final
                </p>
              </div>

              {/* Preview da escalação */}
              <div className="bg-gray-100 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border border-gray-300 rounded"
                  style={{ display: 'block', margin: '0 auto' }}
                />
              </div>

              {/* Botões de ação */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={generateEscalacao}
                  disabled={generating}
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
                >
                  {generating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Gerar Escalação
                    </>
                  )}
                </Button>

                <Button
                  onClick={downloadEscalacao}
                  disabled={generating}
                  variant="outline"
                  className="cursor-pointer font-display-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            variant="outline"
            className="cursor-pointer font-display-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            disabled={currentStep === 5 || !canAdvanceToStep(currentStep + 1)}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EscalacaoGenerator;

