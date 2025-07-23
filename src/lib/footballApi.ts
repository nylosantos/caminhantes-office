import { Match, LIVERPOOL_TEAM_ID } from '@/types/matches';

// API-Sports Football API details
const API_BASE_URL = "https://v3.football.api-sports.io";
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || 'sua-chave-aqui'; // Using VITE_API_FOOTBALL_KEY
const API_HOST = "v3.football.api-sports.io";

// Headers padrão para as requisições
const getHeaders = () => ({
  "x-rapidapi-host": API_HOST,
  "x-apisports-key": API_KEY,
  'Content-Type': 'application/json' // Ensure content type is set
});

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to fetch data
const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      if (response.status === 403) {
        return { success: false, error: 'Chave da API inválida ou expirada. Verifique sua chave API-Sports.' };
      }
      if (response.status === 429) {
        return { success: false, error: 'Limite de requisições excedido. Tente novamente mais tarde. Verifique seu plano API-Sports.' };
      }
      return { success: false, error: `Erro na API: ${response.status} - ${response.statusText}` };
    }

    const data: T = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Erro de conexão com a API:', error);
    return { success: false, error: 'Erro de conexão com a API' };
  }
};

// Buscar próximas partidas do Liverpool
export const getLiverpoolUpcomingMatches = async (limit: number = 10) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);

    // API-Sports uses season and team ID for filtering, and status for upcoming
    // You'll need the current season year. Assuming current year for example.
    const currentYear = today.getFullYear();

    // Note: API-Sports `fixtures` endpoint is generally used for getting matches.
    // To get upcoming matches, we'd typically filter by status (NS - Not Started)
    // and potentially by date range if the API supports it efficiently with this endpoint.
    // For a specific team, we use the `team` parameter.
    // API-Sports 'fixtures' endpoint: GET /fixtures
    // Parameters: team (ID), season (YYYY), status (NS for Not Started)

    // You might need to adjust 'currentYear' depending on when the season starts/ends
    const url = `${API_BASE_URL}/fixtures?team=${LIVERPOOL_TEAM_ID}&season=${currentYear}&status=NS&timezone=Europe/London`; // Added timezone for accurate results
    const response = await fetchData<{ response: Match[] }>(url); // API-Sports wraps data in 'response' array

    if (response.success && response.data) {
      // Filter by date range manually if the API doesn't do it perfectly with status
      const filteredMatches = response.data.response
        .filter(match => {
          const matchDate = new Date(match.fixture.date);
          return matchDate >= today && matchDate <= futureDate;
        })
        .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()) // Sort by date ascending
        .slice(0, limit); // Apply limit after filtering and sorting

      return { success: true, matches: filteredMatches };
    }
    return { success: false, error: response.error };
  } catch (error) {
    console.error('Erro ao buscar partidas do Liverpool:', error);
    return { success: false, error: 'Erro ao buscar partidas futuras do Liverpool' };
  }
};

// Buscar partidas recentes do Liverpool
export const getLiverpoolRecentMatches = async (limit: number = 10) => {
  try {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    const currentYear = today.getFullYear();
    // API-Sports 'fixtures' endpoint: GET /fixtures
    // Parameters: team (ID), season (YYYY), status (FT - Full Time, AET - After Extra Time, PEN - Penalty Shootout, CANC - Cancelled, POST - Postponed, INT - Interrupted)
    // For recent, we generally look for 'FT' (Full Time)
    const url = `${API_BASE_URL}/fixtures?team=${LIVERPOOL_TEAM_ID}&season=${currentYear}&status=FT&timezone=Europe%2FLondon`;
    const res = await fetchData<{ response: Match[] }>(url);

    if (res.success && res.data) {
      const games = res.data.response
      // Filter by date range manually and sort descending for recent matches
      const filteredMatches = games
        .filter(match => {
          const matchDate = new Date(match.fixture.date);
          return matchDate <= today && matchDate >= pastDate;
        })
        .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()) // Sort by date descending
        .slice(0, limit); // Apply limit after filtering and sorting

      return { success: true, matches: filteredMatches };
    }
    return { success: false, error: res.error };
  } catch (error) {
    console.error('Erro ao buscar partidas recentes do Liverpool:', error);
    return { success: false, error: 'Erro ao buscar partidas recentes do Liverpool' };
  }
};

// Buscar partida específica por ID
export const getMatchById = async (matchId: number): Promise<ApiResponse<Match>> => {
  try {
    // API-Sports 'fixtures' endpoint: GET /fixtures
    // Parameters: id (fixture ID)
    const url = `${API_BASE_URL}/fixtures?id=${matchId}`;
    const response = await fetchData<{ response: Match[] }>(url); // API-Sports returns an array even for single ID

    if (response.success && response.data && response.data.response.length > 0) {
      return { success: true, data: response.data.response[0] };
    } else if (response.success && response.data && response.data.response.length === 0) {
      return { success: false, error: `Partida com ID ${matchId} não encontrada.` };
    }
    return { success: false, error: response.error };
  } catch (error) {
    console.error('Erro ao buscar partida:', error);
    return { success: false, error: 'Erro de conexão ao buscar partida' };
  }
};

// Converter dados da API para formulário (Adjusted for API-Sports structure)
export const matchToFormData = (match: Match) => {
  const matchDate = new Date(match.fixture.date);
  const isLiverpoolHome = match.teams.home.id === LIVERPOOL_TEAM_ID;

  return {
    homeTeam: match.teams.home.name,
    awayTeam: match.teams.away.name,
    competition: match.league.name, // Access league name from API-Sports structure
    matchDate: matchDate.toISOString().split('T')[0],
    matchTime: matchDate.toTimeString().slice(0, 5),
    venue: match.fixture.venue.name || (isLiverpoolHome ? 'Anfield' : `${match.teams.away.name} Stadium`), // Use API venue if available
    matchday: match.league.round?.toString() || '', // API-Sports uses 'round' for matchday
    stage: match.league.round || '', // You might map this or keep as round
    referee: match.fixture.referee || '' // Access referee from fixture
  };
};

// Formatar data para exibição (No changes needed, as it processes standard date strings)
export const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Verificar se a API está configurada
export const isApiConfigured = (): boolean => {
  return API_KEY !== 'sua-chave-aqui' && API_KEY.length > 10;
};

// Obter informações sobre o plano gratuito (Updated for API-Sports)
export const getApiInfo = () => ({
  provider: 'API-Sports.io',
  plan: 'Free Tier',
  limits: '100 requests/day', // Typical free tier limit for API-Sports, confirm with their docs
  features: [
    'Major Leagues Coverage',
    'Live Scores',
    'Statistics',
    'Head2Head',
    // Specific leagues depend on your API-Sports subscription.
    // For free tier, it usually includes major leagues but can vary.
  ],
  signupUrl: 'https://www.api-sports.io/documentation/football/v3' // API-Sports documentation URL
});

// Aliases para compatibilidade com MatchSelector
export const getUpcomingMatches = getLiverpoolUpcomingMatches;
export const getPastMatches = getLiverpoolRecentMatches;