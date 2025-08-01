// src/contexts/TeamsContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Bottleneck from 'bottleneck';
import { SportsDbTeam, SportsDbTeamResponse } from '@/types/images';
import { Match } from '@/types/matches';
import { getTeamAlias } from '@/utils/getAlias';

type TeamsState = {
  homeTeam?: SportsDbTeam;
  awayTeam?: SportsDbTeam;
};

type TeamsContextType = {
  getTeams: (match: Match | undefined) => void;
  teams: TeamsState;
  loading: boolean;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

// Cache em memória (compartilhado por todo o app)
const teamDataCache: { [teamName: string]: SportsDbTeam } = {};

// Rate limiter (máx. 100 req/minuto)
const limiter = new Bottleneck({
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000,
});

async function fetchTeamData(
  teamName: string
): Promise<SportsDbTeam | undefined> {
  const formattedName = teamName.replace(/\./g, '');

  if (teamDataCache[formattedName]) {
    return teamDataCache[formattedName];
  }

  try {
    const response = await limiter.schedule(() =>
      fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${formattedName}`
      )
    );

    const data: SportsDbTeamResponse = await response.json();

    const team = data.teams?.[0]; // 👈 já pega o primeiro time
    if (team) {
      teamDataCache[formattedName] = team; // salva só o objeto do time, não o array completo
    }

    return team;
  } catch (error) {
    console.error(`Erro ao buscar time "${formattedName}"`, error);
    return undefined;
  }
}

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [teams, setTeams] = useState<TeamsState>({});
  const [loading, setLoading] = useState(false);

  const getTeams = useCallback(async (match: Match | undefined) => {
    if (!match) return;

    setLoading(true);
    try {
      const homeOriginal = match.teams.home.name.replace(/\./g, '');
      const awayOriginal = match.teams.away.name.replace(/\./g, '');

      // 👇 Busca os aliases antes de chamar o fetch
      const [homeAlias, awayAlias] = await Promise.all([
        getTeamAlias(homeOriginal),
        getTeamAlias(awayOriginal),
      ]);

      const [homeTeam, awayTeam] = await Promise.all([
        fetchTeamData(homeAlias),
        fetchTeamData(awayAlias),
      ]);

      setTeams({ homeTeam, awayTeam });
    } catch (error) {
      console.error('Erro ao buscar dados dos times:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TeamsContext.Provider value={{ teams, getTeams, loading }}>
      {children}
    </TeamsContext.Provider>
  );
};

export function useSportDbTeams(match: Match | undefined) {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams deve ser usado dentro de <TeamsProvider>');
  }

  const { getTeams, teams, loading } = context;

  useEffect(() => {
    if (match) getTeams(match);
  }, [match, getTeams]);

  return { ...teams, loading };
}
