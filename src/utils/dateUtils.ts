// Utilitários para formatação de datas no padrão brasileiro

import { Match } from "@/types/matches";
import { RoundTranslationsDocument } from "@/types/translations";

export const formatDateToBrazilian = (date: Date): string => {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} de ${month} de ${year} às ${hours}:${minutes}`;
};

export const formatCompetitionRound = (match: Match, translations: RoundTranslationsDocument[]): string => {
  if (!match) {
    return 'Data não encontrada';
  }

  if (match.league.round.startsWith("Club Friendlies")) {
    return 'Amistoso'
  }

  if (translations) {
    const round = translations[0][match.league.id][match.league.round]
    return `${match.league.name} - ${round}`;
  }

  return ''
};

export const convertToSaoPauloTime = (utcDate: Date): Date => {
  // São Paulo está UTC-3 (horário padrão) ou UTC-2 (horário de verão)
  // Para simplificar, vamos usar UTC-3
  const saoPauloOffset = -3 * 60; // -3 horas em minutos
  const utcTime = utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000);
  const saoPauloTime = new Date(utcTime + (saoPauloOffset * 60000));

  return saoPauloTime;
};

