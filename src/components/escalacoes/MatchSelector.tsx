import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, MapPin, Users, Trophy, Loader, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getLiverpoolUpcomingMatches, 
  getLiverpoolRecentMatches, 
  matchToFormData, 
  formatMatchDate,
  isApiConfigured,
  getApiInfo
} from '@/lib/footballApi';
import { Match, MatchFormData } from '@/types/matches';

interface MatchSelectorProps {
  onMatchSelect: (matchData: MatchFormData) => void;
  onManualEntry: () => void;
}

const MatchSelector: React.FC<MatchSelectorProps> = ({ onMatchSelect, onManualEntry }) => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');

  const apiConfigured = isApiConfigured();
  const apiInfo = getApiInfo();

  useEffect(() => {
    if (apiConfigured) {
      loadMatches();
    }
  }, [apiConfigured]);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const [upcomingResult, recentResult] = await Promise.all([
        getLiverpoolUpcomingMatches(8),
        getLiverpoolRecentMatches(8)
      ]);

      if (upcomingResult.success) {
        setUpcomingMatches(upcomingResult.data || []);
      } else {
        setError(upcomingResult.error || 'Erro ao carregar próximas partidas');
      }

      if (recentResult.success) {
        setRecentMatches(recentResult.data || []);
      }
    } catch (err) {
      setError('Erro de conexão com a API');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match: Match) => {
    const formData = matchToFormData(match);
    onMatchSelect(formData);
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'LIVE': case 'IN_PLAY': return 'bg-green-100 text-green-800';
      case 'FINISHED': return 'bg-gray-100 text-gray-800';
      case 'POSTPONED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Agendada';
      case 'LIVE': return 'Ao Vivo';
      case 'IN_PLAY': return 'Em Andamento';
      case 'FINISHED': return 'Finalizada';
      case 'POSTPONED': return 'Adiada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  if (!apiConfigured) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-display-semibold text-gray-800 mb-4">
            API de Partidas Não Configurada
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-display-medium text-yellow-800 mb-2">
              Para usar a busca automática de partidas:
            </h4>
            <ol className="text-sm text-yellow-700 space-y-1 text-left">
              <li>1. Registre-se gratuitamente em: <strong>{apiInfo.provider}</strong></li>
              <li>2. Obtenha sua chave da API (100 requests/dia grátis)</li>
              <li>3. Adicione no arquivo .env: <code className="bg-yellow-100 px-1 rounded">VITE_FOOTBALL_API_KEY=sua-chave</code></li>
              <li>4. Reinicie o servidor de desenvolvimento</li>
            </ol>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.open(apiInfo.signupUrl, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-display-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Registrar na API
            </Button>
            <Button
              onClick={onManualEntry}
              variant="outline"
              className="cursor-pointer font-display-medium"
            >
              Preencher Manualmente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-display-bold text-gray-800 mb-2">
          Selecionar Partida do Liverpool
        </h3>
        <p className="text-gray-600 font-display">
          Escolha uma partida da API ou preencha manualmente os dados
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-display-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Próximas Partidas
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-display-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Partidas Recentes
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-red-600 mr-2" />
          <span className="text-gray-600 font-display">Carregando partidas...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 font-display-medium">{error}</span>
          </div>
          <Button
            onClick={loadMatches}
            variant="outline"
            size="sm"
            className="mt-3 cursor-pointer font-display-medium"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Matches List */}
      {!loading && !error && (
        <div className="space-y-3">
          {(activeTab === 'upcoming' ? upcomingMatches : recentMatches).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-display">
                {activeTab === 'upcoming' 
                  ? 'Nenhuma partida próxima encontrada'
                  : 'Nenhuma partida recente encontrada'
                }
              </p>
            </div>
          ) : (
            (activeTab === 'upcoming' ? upcomingMatches : recentMatches).map((match) => (
              <div
                key={match.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleMatchSelect(match)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-gray-400" />
                    <span className="font-display-medium text-gray-800">
                      {match.competition.name}
                    </span>
                    {match.matchday && (
                      <span className="text-sm text-gray-500 font-display">
                        Rodada {match.matchday}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-display-medium ${getMatchStatusColor(match.status)}`}>
                    {getMatchStatusText(match.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-display-semibold text-gray-800">
                        {match.homeTeam.name}
                      </p>
                      <p className="text-sm text-gray-500 font-display">Casa</p>
                    </div>
                    
                    <div className="text-center px-4">
                      {match.status === 'FINISHED' && match.score.fullTime.home !== null ? (
                        <div className="text-lg font-display-bold text-gray-800">
                          {match.score.fullTime.home} - {match.score.fullTime.away}
                        </div>
                      ) : (
                        <div className="text-lg font-display-bold text-gray-400">
                          VS
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <p className="font-display-semibold text-gray-800">
                        {match.awayTeam.name}
                      </p>
                      <p className="text-sm text-gray-500 font-display">Visitante</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="font-display">{formatMatchDate(match.utcDate)}</span>
                  </div>
                  {match.referees?.[0] && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-display">{match.referees[0].name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Manual Entry Button */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Button
          onClick={onManualEntry}
          variant="outline"
          className="cursor-pointer font-display-medium"
        >
          <Search className="w-4 h-4 mr-2" />
          Preencher Dados Manualmente
        </Button>
      </div>
    </div>
  );
};

export default MatchSelector;

