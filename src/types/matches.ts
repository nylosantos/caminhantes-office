
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
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    venue: {
      id: number
      name: string
      city: any
    }
    status: {
      long: string
      short: string
      elapsed: any
      extra: any
    }
  };
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
  };
  goals: { home: number; away: number };
  score?: {
    halftime?: { home: number; away: number },
    fulltime?: { home: number; away: number },
    extratime?: { home: number; away: number },
    penalty?: { home: number; away: number },
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
    round: string
    standings: boolean
  };
  // lastUpdated: Timestamp;
}

// export interface Match {
//   id: number;
//   utcDate: string;
//   status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED';
//   matchday: number;
//   stage: string;
//   group?: string;
//   lastUpdated: string;
//   homeTeam: Team;
//   awayTeam: Team;
//   score: {
//     winner?: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';
//     duration: string;
//     fullTime: {
//       home: number | null;
//       away: number | null;
//     };
//     halfTime: {
//       home: number | null;
//       away: number | null;
//     };
//   };
//   odds?: {
//     msg: string;
//   };
//   referees: Array<{
//     id: number;
//     name: string;
//     type: string;
//     nationality: string;
//   }>;
//   competition: Competition;
//   season: Season;
// }

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
  referee: string;
  // Novos campos obrigatórios
  stadium: string;
  date: string;
  competitionRound: string;
}

// Liverpool FC ID na API Football-Data.org
export const LIVERPOOL_TEAM_ID = 40;

// Competições principais
export const COMPETITIONS = {
  'Premier League': 39,
  'Community Shield': 528,
  'UEFA Champions League': 2,
  'UEFA Europa League': 3,
  'FA Cup': 45,
  'Carabao Cup': 48,
  'FIFA World Cup': 1,
  'FIFA Club World Cup': 15
};