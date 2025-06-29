export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string; // Three Letter Abbreviation
  crest: string; // URL do escudo
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
}

export interface Match {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED';
  matchday: number;
  stage: string;
  group?: string;
  lastUpdated: string;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner?: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
  odds?: {
    msg: string;
  };
  referees: Array<{
    id: number;
    name: string;
    type: string;
    nationality: string;
  }>;
  competition: Competition;
  season: Season;
}

export interface MatchesResponse {
  filters: {
    season: string;
    matchday?: string;
  };
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
  competition: Competition;
  matches: Match[];
}

export interface MatchFormData {
  homeTeam?: string;
  awayTeam?: string;
  competition?: string;
  matchDate?: string;
  matchTime?: string;
  venue?: string;
  matchday?: string;
  stage?: string;
  referee?: string;
  // Novos campos obrigatórios
  stadium: string;
  date: string;
  competitionRound: string;
}

// Liverpool FC ID na API Football-Data.org
export const LIVERPOOL_TEAM_ID = 64;

// Competições principais
export const COMPETITIONS = {
  PREMIER_LEAGUE: { id: 2021, name: 'Premier League', code: 'PL' },
  CHAMPIONS_LEAGUE: { id: 2001, name: 'UEFA Champions League', code: 'CL' },
  FA_CUP: { id: 2057, name: 'FA Cup', code: 'FAC' },
  CARABAO_CUP: { id: 2058, name: 'League Cup', code: 'LC' },
  EUROPA_LEAGUE: { id: 2018, name: 'UEFA Europa League', code: 'EL' }
};

