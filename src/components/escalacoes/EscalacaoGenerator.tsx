import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download, Loader, Check, Calendar, Users, Target, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImages } from '@/contexts/ImagesContext';
import { useSquad } from '@/contexts/SquadContext';
import MatchSelector from './MatchSelector';
import FormationSelector from './FormationSelector';
import PlayerSelector from './PlayerSelector';
import { MatchFormData } from '@/types/matches';
import { Formation, getFormationById } from '@/types/formations';
import { Player } from '@/types/squad';

interface EscalacaoGeneratorProps {
  onBack: () => void;
}

interface SelectedPlayers {
  [positionId: string]: Player | null;
}

interface EscalacaoData {
  matchData: MatchFormData | null;
  formation: Formation | null;
  selectedPlayers: SelectedPlayers;
  reservePlayers: Player[];
  coach: string;
}

const EscalacaoGenerator: React.FC<EscalacaoGeneratorProps> = ({ onBack }) => {
  const { baseImages } = useImages();
  const { players } = useSquad();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [escalacaoData, setEscalacaoData] = useState<EscalacaoData>({
    matchData: null,
    formation: null,
    selectedPlayers: {},
    reservePlayers: [],
    coach: ''
  });

  const steps = [
    { id: 1, title: 'Dados da Partida', icon: Calendar, description: 'Selecione ou preencha os dados da partida' },
    { id: 2, title: 'Formação Tática', icon: Target, description: 'Escolha a formação que será utilizada' },
    { id: 3, title: 'Seleção de Jogadores', icon: Users, description: 'Selecione os jogadores para cada posição' },
    { id: 4, title: 'Gerar Escalação', icon: ImageIcon, description: 'Gere a imagem final da escalação' }
  ];

  // Verificar se pode avançar para próximo passo
  const canAdvanceToStep = (step: number): boolean => {
    switch (step) {
      case 2: return !!escalacaoData.matchData;
      case 3: return !!escalacaoData.formation;
      case 4: 
        const allPositionsFilled = escalacaoData.formation?.positions.every(pos => 
          escalacaoData.selectedPlayers[pos.id]
        );
        return !!allPositionsFilled;
      default: return true;
    }
  };

  // Handlers para cada etapa
  const handleMatchSelect = (matchData: MatchFormData) => {
    setEscalacaoData(prev => ({ ...prev, matchData }));
    setCurrentStep(2);
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
      referee: ''
    };
    setEscalacaoData(prev => ({ ...prev, matchData: manualData }));
    setCurrentStep(2);
  };

  const handleFormationSelect = (formation: Formation) => {
    setEscalacaoData(prev => ({ 
      ...prev, 
      formation,
      selectedPlayers: {} // Reset players when formation changes
    }));
    setCurrentStep(3);
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

      // Fundo vermelho com gradiente
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#dc2626');
      gradient.addColorStop(1, '#991b1b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Textura de fundo (padrão geométrico)
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i * 54 + (j % 2) * 27, j * 54, 27, 27);
        }
      }
      ctx.globalAlpha = 1;

      // Carregar e desenhar imagens
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      // Logo do canal (canto superior direito)
      try {
        const logoImg = await loadImage('/src/assets/caminhantes-clock.png');
        const logoSize = 120;
        ctx.drawImage(logoImg, canvas.width - logoSize - 30, 30, logoSize, logoSize);
      } catch (error) {
        console.warn('Erro ao carregar logo do canal:', error);
      }

      // Arte do placar (topo)
      const placarImage = baseImages.find(img => img.type === 'horizontal');
      if (placarImage) {
        try {
          const placarImg = await loadImage(placarImage.url);
          const placarWidth = 400;
          const placarHeight = 120;
          ctx.drawImage(placarImg, (canvas.width - placarWidth) / 2, 20, placarWidth, placarHeight);
        } catch (error) {
          console.warn('Erro ao carregar arte do placar:', error);
        }
      }

      // Jogador destaque (lado direito)
      const jogadorImage = baseImages.find(img => img.type === 'vertical');
      if (jogadorImage) {
        try {
          const jogadorImg = await loadImage(jogadorImage.url);
          const jogadorWidth = 300;
          const jogadorHeight = 400;
          ctx.drawImage(jogadorImg, canvas.width - jogadorWidth - 20, 200, jogadorWidth, jogadorHeight);
        } catch (error) {
          console.warn('Erro ao carregar jogador destaque:', error);
        }
      }

      // Texto "ESCALAÇÃO" vertical (lado esquerdo)
      ctx.save();
      ctx.translate(60, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px "Funnel Display", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ESCALAÇÃO', 0, 0);
      ctx.restore();

      // Lista de jogadores titulares
      const startY = 200;
      const lineHeight = 45;
      let currentY = startY;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Funnel Display", sans-serif';

      escalacaoData.formation.positions.forEach((position, index) => {
        const player = escalacaoData.selectedPlayers[position.id];
        if (player) {
          // Número do jogador (azul)
          ctx.fillStyle = '#3b82f6';
          ctx.font = 'bold 28px "Funnel Display", sans-serif';
          ctx.fillText(player.number, 120, currentY);

          // Nome do jogador (branco)
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px "Funnel Display", sans-serif';
          ctx.fillText(player.name.toUpperCase(), 180, currentY);

          currentY += lineHeight;
        }
      });

      // Banco de reservas
      if (escalacaoData.reservePlayers.length > 0) {
        currentY += 30;
        
        // Título "BANCO"
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px "Funnel Display", sans-serif';
        ctx.fillText('BANCO', 120, currentY);
        currentY += 35;

        // Lista de reservas
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px "Funnel Display", sans-serif';
        
        const reserveNames = escalacaoData.reservePlayers.map(p => p.name).join(', ');
        const maxWidth = 400;
        const words = reserveNames.split(' ');
        let line = '';
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, 120, currentY);
            line = words[i] + ' ';
            currentY += 25;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 120, currentY);
        currentY += 35;
      }

      // Técnico
      if (escalacaoData.coach) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px "Funnel Display", sans-serif';
        ctx.fillText('TÉCNICO', 120, currentY);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Funnel Display", sans-serif';
        ctx.fillText(escalacaoData.coach.toUpperCase(), 120, currentY + 30);
        currentY += 65;
      }

      // Informações da partida (rodapé)
      const footerY = canvas.height - 120;
      
      // Local e data
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Funnel Display", sans-serif';
      ctx.fillText(escalacaoData.matchData.venue.toUpperCase(), 120, footerY);
      
      const matchDate = new Date(escalacaoData.matchData.matchDate + 'T' + escalacaoData.matchData.matchTime);
      const dateStr = matchDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      }) + ' ÀS ' + escalacaoData.matchData.matchTime;
      
      ctx.fillText(dateStr, 120, footerY + 25);
      
      // Competição
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 16px "Funnel Display", sans-serif';
      ctx.fillText(escalacaoData.matchData.competition.toUpperCase(), 120, footerY + 50);

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
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isCompleted
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
                  <p className={`text-sm font-display-medium ${
                    isActive ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 font-display">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
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
              onMatchSelect={handleMatchSelect}
              onManualEntry={handleManualEntry}
            />
          )}

          {currentStep === 2 && (
            <FormationSelector
              selectedFormation={escalacaoData.formation}
              onFormationSelect={handleFormationSelect}
            />
          )}

          {currentStep === 3 && escalacaoData.formation && (
            <div className="space-y-6">
              <PlayerSelector
                formation={escalacaoData.formation}
                selectedPlayers={escalacaoData.selectedPlayers}
                onPlayersChange={handlePlayersChange}
                reservePlayers={escalacaoData.reservePlayers}
                onReservePlayersChange={handleReservePlayersChange}
                maxReserves={7}
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

          {currentStep === 4 && (
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
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={currentStep === 4 || !canAdvanceToStep(currentStep + 1)}
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

