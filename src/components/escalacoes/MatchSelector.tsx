import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Search, Calendar, MapPin, Trophy, Loader, AlertCircle, CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUpcomingMatches, getPastMatches } from '@/lib/footballApi';
import { Match } from '@/types/matches';
import { formatDateToBrazilian, formatCompetitionRound, convertToSaoPauloTime } from '@/utils/dateUtils';
import { EscalacaoData } from './EscalacaoGenerator'; // Assumindo que EscalacaoData vem daqui
import { RoundTranslationsDocument } from '@/types/translations';

interface MatchData {
  stadium: string;
  date: string;
  competition: string;
  referee: string | null;
}

// Defina as props para o ref
export interface MatchSelectorRef {
  submitManualData: () => boolean;
  canProceed: boolean;
}

interface MatchSelectorProps {
  onMatchSelected: (matchData: Match) => void;
  escalacaoData: EscalacaoData;
  onValidationChange: (isValid: boolean) => void;
  translations: RoundTranslationsDocument[]
  pastMatches?: boolean
}

const MatchSelector: React.FC<MatchSelectorProps & { ref?: React.Ref<MatchSelectorRef> }> = forwardRef(({ onMatchSelected, escalacaoData, onValidationChange, translations, pastMatches = false }, ref) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [manualMode, setManualMode] = useState(false);

  // Campos manuais obrigatórios
  const [manualData, setManualData] = useState<MatchData>({
    stadium: escalacaoData.matchData?.stadium || '',
    date: escalacaoData.matchData?.date || '',
    competition: escalacaoData.matchData?.competition || '',
    referee: escalacaoData.matchData?.referee || ''
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<MatchData>>({});

  useEffect(() => {
    const isValid = !!selectedMatch || (manualMode && !!manualData.stadium && !!manualData.date && !!manualData.competition);
    onValidationChange(isValid);
  }, [selectedMatch, manualMode, manualData, onValidationChange]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      if (pastMatches) {
        const pastResult = await getPastMatches();

        if (pastResult.success && pastResult.matches && pastResult.matches.length > 0) {
          setMatches(pastResult.matches);
        } else {
          const upcomingResult = await getUpcomingMatches(); // supondo que essa seja a função
          if (upcomingResult.success && upcomingResult.matches && upcomingResult.matches.length > 0) {
            setMatches(upcomingResult.matches);
          } else {
            setError('Não foi possível carregar partidas da API. Use o modo manual.');
            setManualMode(true);
          }
        }
      } else {
        const upcomingResult = await getUpcomingMatches();
        if (upcomingResult.success && upcomingResult.matches && upcomingResult.matches.length > 0) {
          setMatches(upcomingResult.matches);
        } else {
          const pastResult = await getPastMatches();
          if (pastResult.success && pastResult.matches && pastResult.matches.length > 0) {
            setMatches(pastResult.matches);
          } else {
            setError('Não foi possível carregar partidas da API. Use o modo manual.');
            setManualMode(true);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar partidas:', err);
      setError('Erro ao conectar com a API de partidas. Use o modo manual.');
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);

    // const matchDate = new Date(match.fixture.date);
    // const saoPauloDate = convertToSaoPauloTime(matchDate);

    // const matchData: MatchData = {
    //   stadium: match.fixture.venue.name || 'Estádio não informado',
    //   date: formatDateToBrazilian(saoPauloDate),
    //   competition: formatCompetitionRound(match, translations),
    //   referee: match.fixture.referee
    // };

    onMatchSelected(match);
  };

  const validateManualFields = (): boolean => {
    const errors: Partial<MatchData> = {};

    if (!manualData.stadium.trim()) {
      errors.stadium = 'Estádio é obrigatório';
    }

    if (!manualData.date.trim()) {
      errors.date = 'Data é obrigatória';
    }

    if (!manualData.competition.trim()) {
      errors.competition = 'Competição é obrigatória';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (manualMode && manualData.stadium && manualData.date && manualData.competition) {
      if (validateManualFields()) {
        // variavel 'fake' com as propriedades do tipo Match para satisfazer a tipagem da funçao. Porem com os dados relevantes reais, stadium, date, competition
        const fakeMatch: Match = {
          fixture: {
            id: Date.now(), // ID único temporário
            referee: null,
            timezone: 'UTC',
            date: manualData.date,
            timestamp: new Date(manualData.date).getTime() / 1000,
            venue: {
              id: 0,
              name: manualData.stadium,
              city: '',
            },
            status: {
              long: 'Not Started',
              short: 'NS',
              elapsed: null,
              extra: null,
            },
          },
          teams: {
            home: {
              id: 0,
              name: 'Time da Casa',
              logo: '',
              winner: null,
            },
            away: {
              id: 1,
              name: 'Time Visitante',
              logo: '',
              winner: null,
            },
          },
          goals: {
            home: 0,
            away: 0,
          },
          league: {
            id: 0,
            name: manualData.competition,
            country: '',
            logo: '',
            flag: '',
            season: new Date(manualData.date).getFullYear(),
            round: '',
            standings: false,
          },
        };
        onMatchSelected(fakeMatch);
        setSelectedMatch({} as Match);
      }
    }
  }, [manualData.stadium, manualData.date, manualData.competition, manualMode]);

  const submitManualData = () => {
    if (validateManualFields()) {
      // variavel 'fake' com as propriedades do tipo Match para satisfazer a tipagem da funçao. Porem com os dados relevantes reais, stadium, date, competition
      const fakeMatch: Match = {
        fixture: {
          id: Date.now(), // ID único temporário
          referee: null,
          timezone: 'UTC',
          date: manualData.date,
          timestamp: new Date(manualData.date).getTime() / 1000,
          venue: {
            id: 0,
            name: manualData.stadium,
            city: '',
          },
          status: {
            long: 'Not Started',
            short: 'NS',
            elapsed: null,
            extra: null,
          },
        },
        teams: {
          home: {
            id: 0,
            name: 'Time da Casa',
            logo: '',
            winner: null,
          },
          away: {
            id: 1,
            name: 'Time Visitante',
            logo: '',
            winner: null,
          },
        },
        goals: {
          home: 0,
          away: 0,
        },
        league: {
          id: 0,
          name: manualData.competition,
          country: '',
          logo: '',
          flag: '',
          season: new Date(manualData.date).getFullYear(),
          round: '',
          standings: false,
        },
      };
      onMatchSelected(fakeMatch);
      setSelectedMatch({} as Match);
      return true;
    }
    return false;
  };

  // Expor função para o componente pai
  useImperativeHandle(ref, () => ({
    submitManualData,
    canProceed: !!selectedMatch || (manualMode && !!manualData.stadium && !!manualData.date && !!manualData.competition)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-display-bold text-gray-800 mb-2">
          Dados da Partida
        </h2>
        <p className="text-gray-600 font-display">
          Selecione uma partida da API ou preencha manualmente
        </p>
      </div>

      {/* Toggle entre API e Manual */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <Button
            onClick={() => {
              setManualMode(false);
              setSelectedMatch(null);
              if (matches.length === 0 && !loading) {
                loadMatches();
              }
            }}
            variant={!manualMode ? "default" : "ghost"}
            size="sm"
            className={`cursor-pointer font-display-medium ${!manualMode
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar da API
          </Button>
          <Button
            onClick={() => {
              setManualMode(true);
              setSelectedMatch(null);
              setError(null);
            }}
            variant={manualMode ? "default" : "ghost"}
            size="sm"
            className={`cursor-pointer font-display-medium ${manualMode
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Preencher Manual
          </Button>
        </div>
      </div>

      {/* Modo API */}
      {!manualMode && (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-red-600 mr-2" />
              <span className="text-gray-600 font-display">Buscando partidas...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 font-display-medium">Erro na API</p>
              </div>
              <p className="text-red-700 text-sm mt-1 font-display">{error}</p>
              <Button
                onClick={() => setManualMode(true)}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
                size="sm"
              >
                Usar Modo Manual
              </Button>
            </div>
          )}

          {!loading && !error && matches.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display-semibold text-gray-800">
                Partidas Disponíveis ({matches.length})
              </h3>
              <div className="grid gap-3">
                {matches.map((match) => {
                  const matchDate = new Date(match.fixture.date);
                  const saoPauloDate = convertToSaoPauloTime(matchDate);
                  const isSelected = selectedMatch?.fixture.id === match.fixture.id;

                  return (
                    <div
                      key={match.fixture.id}
                      onClick={() => handleMatchSelect(match)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center space-x-2">
                              <img
                                src={match.teams.home.logo}
                                alt={match.teams.home.name}
                                className="w-6 h-6 object-contain"
                              />
                              <span className="font-display-medium text-gray-800">
                                {match.teams.home.name}
                              </span>
                            </div>
                            {pastMatches ?
                              <strong className="text-gray-500 font-bold">
                                {`${match.goals.home}-${match.goals.away}`}
                              </strong>
                              : <span className="text-gray-500 font-display">vs</span>
                            }
                            <div className="flex items-center space-x-2">
                              <span className="font-display-medium text-gray-800">
                                {match.teams.away.name}
                              </span>
                              <img
                                src={match.teams.away.logo}
                                alt={match.teams.away.name}
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span className="font-display">
                                {formatDateToBrazilian(saoPauloDate)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="font-display">
                                {match.fixture.venue.name || 'Estádio não informado'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="w-4 h-4 mr-1" />
                              <span className="font-display">
                                {formatCompetitionRound(match, translations)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modo Manual */}
      {manualMode && (
        <div className="space-y-4">
          <h3 className="font-display-semibold text-gray-800">
            Preencher Dados Manualmente
          </h3>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-2">
                Estádio *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={manualData.stadium}
                  onChange={(e) => {
                    setManualData(prev => ({ ...prev, stadium: e.target.value }));
                    if (fieldErrors.stadium) {
                      setFieldErrors(prev => ({ ...prev, stadium: undefined }));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display ${fieldErrors.stadium ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ex: Anfield, Old Trafford, Estádio do Maracanã"
                />
              </div>
              {fieldErrors.stadium && (
                <p className="text-red-500 text-sm mt-1 font-display">{fieldErrors.stadium}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-2">
                Data e Horário *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={manualData.date}
                  onChange={(e) => {
                    setManualData(prev => ({ ...prev, date: e.target.value }));
                    if (fieldErrors.date) {
                      setFieldErrors(prev => ({ ...prev, date: undefined }));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display ${fieldErrors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ex: 28 de junho de 2025 às 20:00"
                />
              </div>
              {fieldErrors.date && (
                <p className="text-red-500 text-sm mt-1 font-display">{fieldErrors.date}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 font-display">
                Formato: DD de mês de AAAA às HH:MM
              </p>
            </div>

            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-2">
                Competição / Rodada *
              </label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={manualData.competition}
                  onChange={(e) => {
                    setManualData(prev => ({ ...prev, competition: e.target.value }));
                    if (fieldErrors.competition) {
                      setFieldErrors(prev => ({ ...prev, competition: undefined }));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display ${fieldErrors.competition ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ex: Premier League - 38ª Rodada, Champions League - Final"
                />
              </div>
              {fieldErrors.competition && (
                <p className="text-red-500 text-sm mt-1 font-display">{fieldErrors.competition}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 font-display">
                Formato: Competição - Rodada/Fase
              </p>
            </div>
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-2">
                Árbitro *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={manualData.referee ?? ''}
                  onChange={(e) => {
                    setManualData(prev => ({ ...prev, referee: e.target.value }));
                    if (fieldErrors.referee) {
                      setFieldErrors(prev => ({ ...prev, referee: undefined }));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display ${fieldErrors.referee ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ex: Darren England, Craig Pawson, Chris Kavanagh"
                />
              </div>
              {fieldErrors.referee && (
                <p className="text-red-500 text-sm mt-1 font-display">{fieldErrors.referee}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dados selecionados */}
      {selectedMatch && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-display-semibold text-green-800">
              Dados da Partida Confirmados
            </h4>
          </div>
          <div className="space-y-1 text-sm text-green-700 font-display">
            <p><strong>Estádio:</strong> {manualMode ? manualData.stadium : selectedMatch.fixture.venue.name || 'Não informado'}</p>
            <p><strong>Data:</strong> {manualMode ? manualData.date : formatDateToBrazilian(convertToSaoPauloTime(new Date(selectedMatch.fixture.date || '')))}</p>
            <p><strong>Competição:</strong> {manualMode ? manualData.competition : formatCompetitionRound(selectedMatch, translations)}</p>
            <p><strong>Árbitro:</strong> {manualMode ? manualData.competition : selectedMatch.fixture.referee}</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default MatchSelector;

