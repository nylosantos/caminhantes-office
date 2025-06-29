import { Match, MatchesResponse, LIVERPOOL_TEAM_ID, COMPETITIONS } from '@/types/matches';

// Chave da API Football-Data.org (gratuita)
const FOOTBALL_API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY || 'sua-chave-aqui';
const FOOTBALL_API_BASE_URL = 'https://api.football-data.org/v4';

// Headers padrão para as requisições
const getHeaders = () => ({
  'X-Auth-Token': FOOTBALL_API_KEY,
  'Content-Type': 'application/json'
});

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Buscar próximas partidas do Liverpool
export const getLiverpoolUpcomingMatches = async (limit: number = 10) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const endDate = futureDate.toISOString().split('T')[0];

    const response = await fetch(
      `${FOOTBALL_API_BASE_URL}/teams/${LIVERPOOL_TEAM_ID}/matches?dateFrom=${today}&dateTo=${endDate}&limit=${limit}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return { success: false, error: 'Chave da API inválida ou expirada' };
      }
      if (response.status === 429) {
        return { success: false, error: 'Limite de requisições excedido. Tente novamente mais tarde.' };
      }
      return { success: false, error: `Erro na API: ${response.status}` };
    }

    const data: MatchesResponse = await response.json();
    return { success: true, matches: data.matches };
  } catch (error) {
    console.error('Erro ao buscar partidas do Liverpool:', error);
    return { success: false, error: 'Erro de conexão com a API' };
  }
};

// Buscar partidas recentes do Liverpool
export const getLiverpoolRecentMatches = async (limit: number = 10) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);
    const startDate = pastDate.toISOString().split('T')[0];

    const response = await fetch(
      `${FOOTBALL_API_BASE_URL}/teams/${LIVERPOOL_TEAM_ID}/matches?dateFrom=${startDate}&dateTo=${today}&limit=${limit}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return { success: false, error: 'Chave da API inválida ou expirada' };
      }
      if (response.status === 429) {
        return { success: false, error: 'Limite de requisições excedido. Tente novamente mais tarde.' };
      }
      return { success: false, error: `Erro na API: ${response.status}` };
    }

    const data: MatchesResponse = await response.json();
    return { success: true, matches: data.matches.reverse() }; // Mais recentes primeiro
  } catch (error) {
    console.error('Erro ao buscar partidas recentes do Liverpool:', error);
    return { success: false, error: 'Erro de conexão com a API' };
  }
};

// Buscar partida específica por ID
export const getMatchById = async (matchId: number): Promise<ApiResponse<Match>> => {
  try {
    const response = await fetch(
      `${FOOTBALL_API_BASE_URL}/matches/${matchId}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      return { success: false, error: `Erro na API: ${response.status}` };
    }

    const data: Match = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar partida:', error);
    return { success: false, error: 'Erro de conexão com a API' };
  }
};

// Converter dados da API para formulário
export const matchToFormData = (match: Match) => {
  const matchDate = new Date(match.utcDate);
  const isLiverpoolHome = match.homeTeam.id === LIVERPOOL_TEAM_ID;
  
  return {
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    competition: match.competition.name,
    matchDate: matchDate.toISOString().split('T')[0],
    matchTime: matchDate.toTimeString().slice(0, 5),
    venue: isLiverpoolHome ? 'Anfield' : `${match.awayTeam.name} Stadium`,
    matchday: match.matchday?.toString() || '',
    stage: match.stage || '',
    referee: match.referees?.[0]?.name || ''
  };
};

// Formatar data para exibição
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
  return FOOTBALL_API_KEY !== 'sua-chave-aqui' && FOOTBALL_API_KEY.length > 10;
};

// Obter informações sobre o plano gratuito
export const getApiInfo = () => ({
  provider: 'Football-Data.org',
  plan: 'Free Tier',
  limits: '100 requests/day',
  features: ['Premier League', 'Champions League', 'FA Cup', 'Carabao Cup'],
  signupUrl: 'https://www.football-data.org/client/register'
});

// Aliases para compatibilidade com MatchSelector
export const getUpcomingMatches = getLiverpoolUpcomingMatches;
export const getPastMatches = getLiverpoolRecentMatches;

