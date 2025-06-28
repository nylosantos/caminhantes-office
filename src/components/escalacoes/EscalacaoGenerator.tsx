import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Save, Users, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface MatchData {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  date: string;
  time: string;
  venue: string;
}

interface Player {
  id: string;
  name: string;
  number: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  isStarter: boolean;
  x?: number;
  y?: number;
}

interface EscalacaoGeneratorProps {
  onBack: () => void;
}

const EscalacaoGenerator: React.FC<EscalacaoGeneratorProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showConfirmDialog } = useConfirmDialog();
  
  const [matchData, setMatchData] = useState<MatchData>({
    homeTeam: '',
    awayTeam: '',
    competition: '',
    date: '',
    time: '',
    venue: ''
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [formation, setFormation] = useState('4-3-3');
  const [images, setImages] = useState({
    logo: null as File | null,
    playerHighlight: null as File | null,
    scoreboard: null as File | null
  });

  const [currentStep, setCurrentStep] = useState(1);

  // Formações predefinidas
  const formations = {
    '4-3-3': [
      { position: 'GK', x: 50, y: 85 },
      { position: 'DEF', x: 20, y: 65 },
      { position: 'DEF', x: 40, y: 65 },
      { position: 'DEF', x: 60, y: 65 },
      { position: 'DEF', x: 80, y: 65 },
      { position: 'MID', x: 30, y: 45 },
      { position: 'MID', x: 50, y: 45 },
      { position: 'MID', x: 70, y: 45 },
      { position: 'ATT', x: 25, y: 25 },
      { position: 'ATT', x: 50, y: 25 },
      { position: 'ATT', x: 75, y: 25 }
    ],
    '4-4-2': [
      { position: 'GK', x: 50, y: 85 },
      { position: 'DEF', x: 20, y: 65 },
      { position: 'DEF', x: 40, y: 65 },
      { position: 'DEF', x: 60, y: 65 },
      { position: 'DEF', x: 80, y: 65 },
      { position: 'MID', x: 20, y: 45 },
      { position: 'MID', x: 40, y: 45 },
      { position: 'MID', x: 60, y: 45 },
      { position: 'MID', x: 80, y: 45 },
      { position: 'ATT', x: 35, y: 25 },
      { position: 'ATT', x: 65, y: 25 }
    ],
    '3-5-2': [
      { position: 'GK', x: 50, y: 85 },
      { position: 'DEF', x: 30, y: 65 },
      { position: 'DEF', x: 50, y: 65 },
      { position: 'DEF', x: 70, y: 65 },
      { position: 'MID', x: 15, y: 45 },
      { position: 'MID', x: 35, y: 45 },
      { position: 'MID', x: 50, y: 45 },
      { position: 'MID', x: 65, y: 45 },
      { position: 'MID', x: 85, y: 45 },
      { position: 'ATT', x: 35, y: 25 },
      { position: 'ATT', x: 65, y: 25 }
    ]
  };

  // Inicializar jogadores com formação padrão
  useEffect(() => {
    const defaultPlayers: Player[] = formations[formation as keyof typeof formations].map((pos, index) => ({
      id: `player-${index}`,
      name: `Jogador ${index + 1}`,
      number: (index + 1).toString(),
      position: pos.position as Player['position'],
      isStarter: true,
      x: pos.x,
      y: pos.y
    }));

    // Adicionar jogadores do banco
    const benchPlayers: Player[] = Array.from({ length: 7 }, (_, index) => ({
      id: `bench-${index}`,
      name: `Reserva ${index + 1}`,
      number: (index + 12).toString(),
      position: 'MID' as Player['position'],
      isStarter: false
    }));

    setPlayers([...defaultPlayers, ...benchPlayers]);
  }, [formation]);

  const handleImageUpload = (type: keyof typeof images, file: File) => {
    setImages(prev => ({ ...prev, [type]: file }));
  };

  const handleFormationChange = (newFormation: string) => {
    setFormation(newFormation);
  };

  const generateEscalacao = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas com proporções da imagem de exemplo
    canvas.width = 1080;
    canvas.height = 1080;

    // Criar fundo vermelho com textura
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#dc2626');
    gradient.addColorStop(1, '#991b1b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Adicionar textura de fundo
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Desenhar arte do placar no topo (se disponível)
    if (images.scoreboard) {
      await drawScoreboardImage(ctx, images.scoreboard, canvas.width);
    } else {
      // Placeholder para arte do placar
      drawPlaceholderScoreboard(ctx, matchData, canvas.width);
    }

    // Desenhar logo do canal no canto superior direito
    if (images.logo) {
      await drawLogoImage(ctx, images.logo, canvas.width);
    } else {
      // Usar logo padrão do Caminhantes
      await drawDefaultLogo(ctx, canvas.width);
    }

    // Desenhar jogador destaque à direita
    if (images.playerHighlight) {
      await drawPlayerHighlightImage(ctx, images.playerHighlight, canvas.width, canvas.height);
    } else {
      // Placeholder para jogador
      drawPlaceholderPlayer(ctx, canvas.width, canvas.height);
    }

    // Desenhar "ESCALAÇÃO" vertical à esquerda
    drawEscalacaoTitle(ctx, canvas.height);

    // Desenhar lista de titulares
    drawStartersList(ctx, players.filter(p => p.isStarter));

    // Desenhar banco de reservas
    drawBenchList(ctx, players.filter(p => !p.isStarter), canvas.height);

    // Desenhar técnico
    drawCoachInfo(ctx, canvas.height);

    // Desenhar informações da partida no rodapé
    drawMatchFooter(ctx, matchData, canvas.width, canvas.height);
  };

  const drawScoreboardImage = async (ctx: CanvasRenderingContext2D, file: File, canvasWidth: number) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Desenhar arte do placar centralizada no topo
        const aspectRatio = img.width / img.height;
        const maxWidth = canvasWidth * 0.6;
        const maxHeight = 150;
        
        let drawWidth = maxWidth;
        let drawHeight = maxWidth / aspectRatio;
        
        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = maxHeight * aspectRatio;
        }
        
        const x = (canvasWidth - drawWidth) / 2;
        const y = 30;
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const drawPlaceholderScoreboard = (ctx: CanvasRenderingContext2D, match: MatchData, canvasWidth: number) => {
    // Fundo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(canvasWidth * 0.2, 30, canvasWidth * 0.6, 120);
    
    // Texto do confronto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Funnel Display"';
    ctx.textAlign = 'center';
    ctx.fillText(`${match.homeTeam} VS ${match.awayTeam}`, canvasWidth / 2, 80);
    
    ctx.font = '18px "Funnel Display"';
    ctx.fillText(match.competition, canvasWidth / 2, 110);
  };

  const drawLogoImage = async (ctx: CanvasRenderingContext2D, file: File, canvasWidth: number) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const size = 80;
        const x = canvasWidth - size - 30;
        const y = 30;
        
        // Círculo de fundo
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2 + 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const drawDefaultLogo = async (ctx: CanvasRenderingContext2D, canvasWidth: number) => {
    // Usar logo padrão do Caminhantes
    const img = new Image();
    img.onload = () => {
      const size = 80;
      const x = canvasWidth - size - 30;
      const y = 30;
      
      ctx.drawImage(img, x, y, size, size);
    };
    img.src = '/src/assets/caminhantes-clock.png';
  };

  const drawPlayerHighlightImage = async (ctx: CanvasRenderingContext2D, file: File, canvasWidth: number, canvasHeight: number) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = canvasWidth * 0.4;
        const maxHeight = canvasHeight * 0.7;
        const x = canvasWidth * 0.55;
        const y = canvasHeight * 0.2;
        
        // Manter proporção da imagem
        const aspectRatio = img.width / img.height;
        let drawWidth = maxWidth;
        let drawHeight = maxWidth / aspectRatio;
        
        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = maxHeight * aspectRatio;
        }
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const drawPlaceholderPlayer = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const x = canvasWidth * 0.55;
    const y = canvasHeight * 0.2;
    const width = canvasWidth * 0.4;
    const height = canvasHeight * 0.7;
    
    // Placeholder retangular
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, y, width, height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
    
    // Texto placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '24px "Funnel Display"';
    ctx.textAlign = 'center';
    ctx.fillText('JOGADOR', x + width/2, y + height/2);
    ctx.fillText('DESTAQUE', x + width/2, y + height/2 + 30);
  };

  const drawEscalacaoTitle = (ctx: CanvasRenderingContext2D, canvasHeight: number) => {
    ctx.save();
    ctx.translate(40, canvasHeight / 2);
    ctx.rotate(-Math.PI / 2);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Funnel Display"';
    ctx.textAlign = 'center';
    ctx.fillText('ESCALAÇÃO', 0, 0);
    
    ctx.restore();
  };

  const drawStartersList = (ctx: CanvasRenderingContext2D, starters: Player[]) => {
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    const startX = 100;
    let startY = 220;
    
    starters.forEach((player, index) => {
      // Número em destaque
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 32px "Funnel Display"';
      ctx.fillText(player.number, startX, startY);
      
      // Nome do jogador
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px "Funnel Display"';
      ctx.fillText(player.name.toUpperCase(), startX + 60, startY);
      
      startY += 45;
    });
  };

  const drawBenchList = (ctx: CanvasRenderingContext2D, bench: Player[], canvasHeight: number) => {
    const startY = canvasHeight - 200;
    
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 20px "Funnel Display"';
    ctx.textAlign = 'left';
    ctx.fillText('BANCO', 100, startY);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px "Funnel Display"';
    
    const benchText = bench.map(p => p.name.toUpperCase()).join(', ');
    const maxWidth = 400;
    
    // Quebrar texto se necessário
    const words = benchText.split(', ');
    let line = '';
    let y = startY + 25;
    
    words.forEach((word) => {
      const testLine = line + (line ? ', ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, 100, y);
        line = word;
        y += 22;
      } else {
        line = testLine;
      }
    });
    
    if (line) {
      ctx.fillText(line, 100, y);
    }
  };

  const drawCoachInfo = (ctx: CanvasRenderingContext2D, canvasHeight: number) => {
    const y = canvasHeight - 120;
    
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 20px "Funnel Display"';
    ctx.textAlign = 'left';
    ctx.fillText('TÉCNICO', 100, y);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Funnel Display"';
    ctx.fillText('JÜRGEN KLOPP', 100, y + 30); // Placeholder - pode ser editável
  };

  const drawMatchFooter = (ctx: CanvasRenderingContext2D, match: MatchData, canvasWidth: number, canvasHeight: number) => {
    const y = canvasHeight - 60;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Funnel Display"';
    ctx.textAlign = 'left';
    
    if (match.venue) {
      ctx.fillText(match.venue.toUpperCase(), 100, y);
    }
    
    if (match.date && match.time) {
      const dateStr = new Date(match.date).toLocaleDateString('pt-BR');
      ctx.fillText(`${dateStr} ÀS ${match.time}`, 100, y + 25);
    }
    
    if (match.competition) {
      ctx.fillText(match.competition.toUpperCase(), 100, y + 50);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `escalacao-${matchData.homeTeam}-vs-${matchData.awayTeam}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-display-semibold text-gray-800 mb-4">
        Informações da Partida
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-display-medium text-gray-700 mb-2">
            Time da Casa
          </label>
          <input
            type="text"
            value={matchData.homeTeam}
            onChange={(e) => setMatchData(prev => ({ ...prev, homeTeam: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-display"
            placeholder="Ex: Liverpool"
          />
        </div>

        <div>
          <label className="block text-sm font-display-medium text-gray-700 mb-2">
            Time Visitante
          </label>
          <input
            type="text"
            value={matchData.awayTeam}
            onChange={(e) => setMatchData(prev => ({ ...prev, awayTeam: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-display"
            placeholder="Ex: Manchester City"
          />
        </div>

        <div>
          <label className="block text-sm font-display-medium text-gray-700 mb-2">
            Competição
          </label>
          <input
            type="text"
            value={matchData.competition}
            onChange={(e) => setMatchData(prev => ({ ...prev, competition: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-display"
            placeholder="Ex: Premier League"
          />
        </div>

        <div>
          <label className="block text-sm font-display-medium text-gray-700 mb-2">
            Local
          </label>
          <input
            type="text"
            value={matchData.venue}
            onChange={(e) => setMatchData(prev => ({ ...prev, venue: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-display"
            placeholder="Ex: Anfield"
          />
        </div>

        <div>
          <label className="block text-sm font-display-medium text-gray-700 mb-2">
            Data
          </label>
          <input
            type="date"
            value={matchData.date}
            onChange={(e) => setMatchData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-display"
          />
        </div>

        <div>
          <label className="block text-sm font-display-medium text-gray-700 mb-2">
            Horário
          </label>
          <input
            type="time"
            value={matchData.time}
            onChange={(e) => setMatchData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-display"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setCurrentStep(2)}
          className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium"
          disabled={!matchData.homeTeam || !matchData.awayTeam}
        >
          Próximo: Imagens
          <Calendar className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-display-semibold text-gray-800 mb-4">
        Upload de Imagens
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logo do Canal */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-display-medium text-gray-700 mb-2">Logo do Canal</h4>
          <p className="text-sm text-gray-500 mb-4 font-display">
            Logo que aparecerá na escalação
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-display-medium inline-block"
          >
            Escolher Arquivo
          </label>
          {images.logo && (
            <p className="text-sm text-teal-600 mt-2 font-display">{images.logo.name}</p>
          )}
        </div>

        {/* Jogador Destaque */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-display-medium text-gray-700 mb-2">Jogador Destaque</h4>
          <p className="text-sm text-gray-500 mb-4 font-display">
            Foto do jogador em destaque
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload('playerHighlight', e.target.files[0])}
            className="hidden"
            id="player-upload"
          />
          <label
            htmlFor="player-upload"
            className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-display-medium inline-block"
          >
            Escolher Arquivo
          </label>
          {images.playerHighlight && (
            <p className="text-sm text-teal-600 mt-2 font-display">{images.playerHighlight.name}</p>
          )}
        </div>

        {/* Placar */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-display-medium text-gray-700 mb-2">Arte do Placar</h4>
          <p className="text-sm text-gray-500 mb-4 font-display">
            Arte com logos dos times
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload('scoreboard', e.target.files[0])}
            className="hidden"
            id="scoreboard-upload"
          />
          <label
            htmlFor="scoreboard-upload"
            className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-display-medium inline-block"
          >
            Escolher Arquivo
          </label>
          {images.scoreboard && (
            <p className="text-sm text-teal-600 mt-2 font-display">{images.scoreboard.name}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="cursor-pointer font-display-medium"
        >
          Voltar
        </Button>
        <Button
          onClick={() => setCurrentStep(3)}
          className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium"
        >
          Próximo: Escalação
          <Users className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-display-semibold text-gray-800">
          Montar Escalação
        </h3>
        
        <div className="flex items-center space-x-4">
          <select
            value={formation}
            onChange={(e) => handleFormationChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-display"
          >
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
            <option value="3-5-2">3-5-2</option>
          </select>
          
          <Button
            onClick={generateEscalacao}
            className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer font-display-medium"
          >
            Gerar Escalação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Jogadores */}
        <div className="space-y-4">
          <h4 className="font-display-semibold text-gray-800">Titulares</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {players.filter(p => p.isStarter).map((player, index) => (
              <div key={player.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={player.number}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    const playerIndex = newPlayers.findIndex(p => p.id === player.id);
                    newPlayers[playerIndex].number = e.target.value;
                    setPlayers(newPlayers);
                  }}
                  className="w-12 px-2 py-1 text-center border border-gray-300 rounded font-display"
                />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    const playerIndex = newPlayers.findIndex(p => p.id === player.id);
                    newPlayers[playerIndex].name = e.target.value;
                    setPlayers(newPlayers);
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded font-display"
                />
              </div>
            ))}
          </div>

          <h4 className="font-display-semibold text-gray-800 mt-6">Banco</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {players.filter(p => !p.isStarter).map((player) => (
              <div key={player.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={player.number}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    const playerIndex = newPlayers.findIndex(p => p.id === player.id);
                    newPlayers[playerIndex].number = e.target.value;
                    setPlayers(newPlayers);
                  }}
                  className="w-12 px-2 py-1 text-center border border-gray-300 rounded font-display"
                />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => {
                    const newPlayers = [...players];
                    const playerIndex = newPlayers.findIndex(p => p.id === player.id);
                    newPlayers[playerIndex].name = e.target.value;
                    setPlayers(newPlayers);
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded font-display"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="w-full max-w-md mx-auto border border-gray-300 rounded-lg bg-white"
              style={{ aspectRatio: '1080/1350' }}
            />
          </div>
          
          <div className="flex justify-center mt-4 space-x-4">
            <Button
              onClick={downloadImage}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer font-display-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Imagem
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={() => setCurrentStep(2)}
          variant="outline"
          className="cursor-pointer font-display-medium"
        >
          Voltar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
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
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-display-medium ${
                      step === currentStep
                        ? 'bg-teal-600 text-white'
                        : step < currentStep
                        ? 'bg-teal-200 text-teal-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </main>
    </div>
  );
};

export default EscalacaoGenerator;

