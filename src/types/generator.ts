// import { MatchFormData } from './matches';
// import { Player } from './squad'; // Certifique-se de que Player está corretamente importado

// // Interface genérica para dados de geração de imagem (MatchDay, NextGame, MOTM)
// export interface BaseGeneratorData {
//     matchData: MatchFormData | null;
//     gameArt: string | null; // A arte do placar/tema de fundo
//     featuredPlayer: Player | null; // O jogador destaque
//     featuredPlayerImageUrl: string | null;
//     featuredPlayerImgIndex: number | null; // Se precisar controlar qual imagem do player usar
// }

// // Interface específica para o MOTM
// export interface MotmGeneratorData extends BaseGeneratorData {
//     // Nada extra por enquanto, mas pode ser expandida
// }

// // Interface específica para o FullTime
// export interface FullTimeGeneratorData {
//     matchData: MatchFormData | null;
//     gameArt: string | null; // A arte do placar/tema de fundo (ainda pode ser usada para um fundo base se houver)
//     userUploadedImageUrl: string | null; // URL da imagem do usuário (substitui featuredPlayer)
// }

import { MatchFormData } from './matches';
import { Player } from './squad';

// Tipo base para dados do gerador (mantido para compatibilidade)
export interface BaseGeneratorData {
    matchData: MatchFormData | null;
    gameArt: string | null;
    featuredPlayer: Player | null;
    featuredPlayerImageUrl: string | null;
    featuredPlayerImgIndex: number | null;
}

// Tipos de paginas de arte que podem ser gerados
export type PageArtType =
    | 'GAMEART'
    | 'ESCALACAO'
    | 'ANIVERSARIO'
    | 'CONFRONTO'
    | 'MATCHDAY'
    | 'MOTM'
    | 'PROXIMO_JOGO'
    | 'PALPITES';

// Tipos de arte que podem ser gerados
export type GameArtType =
    | 'INICIO_JOGO'
    | 'INTERVALO'
    | 'INICIO_SEGUNDO_TEMPO'
    | 'FIM_DE_JOGO'
    | 'INICIO_PRORROGACAO'
    | 'INICIO_SEGUNDO_TEMPO_PRORROGACAO'
    | 'GOL'
    | 'SUBSTITUICAO';

// Interface para uma única substituição
export interface Substitution {
    playerOut: Player;
    playerIn: Player;
}

// Interface principal para dados do GameArtGenerator
export interface GameArtGeneratorData {
    // Dados básicos da partida
    matchData: MatchFormData | null;
    artType: GameArtType | null;

    // Placar editável
    homeScore: string;
    awayScore: string;
    showPenalties: boolean;
    homePenaltyScore: string;
    awayPenaltyScore: string;

    // Imagem de fundo do usuário
    userBackgroundImg: string | null;
    userBackgroundImgAspectRatio: number | null;

    // Dados específicos por tipo de arte
    goal?: {
        scorer: Player | null;
        scorerImageUrl: string | null;
        scorerImgIndex: number | null;
    };
    substitutions?: Substitution[];
}

// Configurações de texto para cada tipo de arte
export interface GameArtTextConfig {
    artType: GameArtType;
    generateText: (
        homeTeam: string,
        awayTeam: string,
        homeScore?: string,
        awayScore?: string,
        playerName?: string
    ) => string;
}

// Configurações de texto para cada tipo de arte
export const GAME_ART_TEXT_CONFIGS: Record<GameArtType, GameArtTextConfig> = {
    INICIO_JOGO: {
        artType: 'INICIO_JOGO',
        generateText: (homeTeam, awayTeam, homeScore, awayScore) => {
            if (homeScore && awayScore) {
                return `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`;
            }
            return `${homeTeam} x ${awayTeam}`;
        }
    },
    INTERVALO: {
        artType: 'INTERVALO',
        generateText: (homeTeam, awayTeam, homeScore, awayScore) => {
            if (homeScore && awayScore) {
                return `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`;
            }
            return `${homeTeam} x ${awayTeam}`;
        }
    },
    INICIO_SEGUNDO_TEMPO: {
        artType: 'INICIO_SEGUNDO_TEMPO',
        generateText: (homeTeam, awayTeam, homeScore, awayScore) => {
            if (homeScore && awayScore) {
                return `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`;
            }
            return `${homeTeam} x ${awayTeam}`;
        }
    },
    FIM_DE_JOGO: {
        artType: 'FIM_DE_JOGO',
        generateText: (homeTeam, awayTeam, homeScore, awayScore) => {
            if (homeScore && awayScore) {
                return `Resultado final: ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}. Uma partida emocionante que ficará na memória dos torcedores.`;
            }
            return `Fim de jogo entre ${homeTeam} e ${awayTeam}. Uma partida emocionante que ficará na memória dos torcedores.`;
        }
    },
    INICIO_PRORROGACAO: {
        artType: 'INICIO_PRORROGACAO',
        generateText: (homeTeam, awayTeam, homeScore, awayScore) => {
            if (homeScore && awayScore) {
                return `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`;
            }
            return `${homeTeam} x ${awayTeam}`;
        }
    },
    INICIO_SEGUNDO_TEMPO_PRORROGACAO: {
        artType: 'INICIO_SEGUNDO_TEMPO_PRORROGACAO',
        generateText: (homeTeam, awayTeam, homeScore, awayScore) => {
            if (homeScore && awayScore) {
                return `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`;
            }
            return `${homeTeam} x ${awayTeam}`;
        }
    },
    GOL: {
        artType: 'GOL',
        generateText: (homeTeam, awayTeam, homeScore, awayScore, playerName) => {
            const scoreText = homeScore && awayScore ? ` ${homeScore}-${awayScore}` : '';
            const playerText = playerName ? ` Gol de ${playerName}!` : '';
            return `${homeTeam} x ${awayTeam}${scoreText}.${playerText}`;
        }
    },
    SUBSTITUICAO: {
        artType: 'SUBSTITUICAO',
        generateText: (homeTeam, awayTeam, homeScore, awayScore) => {
            const scoreText = homeScore && awayScore ? ` ${homeScore}-${awayScore}` : '';
            return `${homeTeam} x ${awayTeam}${scoreText}. Mudanças táticas em campo.`;
        }
    }
};

// Labels para exibição na interface
export const GAME_ART_LABELS: Record<GameArtType, string> = {
    INICIO_JOGO: 'Início de Jogo',
    INTERVALO: 'Intervalo',
    INICIO_SEGUNDO_TEMPO: 'Início do Segundo Tempo',
    FIM_DE_JOGO: 'Fim de Jogo',
    INICIO_PRORROGACAO: 'Início da Prorrogação',
    INICIO_SEGUNDO_TEMPO_PRORROGACAO: 'Início do Segundo Tempo da Prorrogação',
    GOL: 'Gol',
    SUBSTITUICAO: 'Substituição'
};

// Mapeamento de tipos de arte para seções de imagem
export const GAME_ART_TO_IMAGE_SECTION: Record<GameArtType, string> = {
    INICIO_JOGO: 'inicio_jogo',
    INTERVALO: 'intervalo',
    INICIO_SEGUNDO_TEMPO: 'inicio_segundo_tempo',
    FIM_DE_JOGO: 'fim_de_jogo',
    INICIO_PRORROGACAO: 'inicio_prorrogacao',
    INICIO_SEGUNDO_TEMPO_PRORROGACAO: 'inicio_segundo_tempo_prorrogacao',
    GOL: 'gol',
    SUBSTITUICAO: 'substituicao'
};

