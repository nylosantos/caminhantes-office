// Utilitários para formatação de datas no padrão brasileiro

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

export const formatCompetitionRound = (competition: string, round?: string): string => {
  if (!round) {
    return competition;
  }

  // Verificar se é uma rodada numérica
  const roundNumber = parseInt(round);
  if (!isNaN(roundNumber)) {
    return `${competition} - ${roundNumber}ª Rodada`;
  }

  // Para fases eliminatórias
  const phaseMap: { [key: string]: string } = {
    'round_of_16': 'Oitavas de Final',
    'quarter_final': 'Quartas de Final',
    'semi_final': 'Semifinal',
    'final': 'Final',
    'third_place': 'Disputa do 3º Lugar'
  };

  const phase = phaseMap[round.toLowerCase()] || round;
  return `${competition} - ${phase}`;
};

export const convertToSaoPauloTime = (utcDate: Date): Date => {
  // São Paulo está UTC-3 (horário padrão) ou UTC-2 (horário de verão)
  // Para simplificar, vamos usar UTC-3
  const saoPauloOffset = -3 * 60; // -3 horas em minutos
  const utcTime = utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000);
  const saoPauloTime = new Date(utcTime + (saoPauloOffset * 60000));
  
  return saoPauloTime;
};

