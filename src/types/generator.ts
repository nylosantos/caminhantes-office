import { MatchFormData } from './matches';
import { Player } from './squad'; // Certifique-se de que Player está corretamente importado

// Interface genérica para dados de geração de imagem (MatchDay, NextGame, MOTM)
export interface BaseGeneratorData {
    matchData: MatchFormData | null;
    gameArt: string | null; // A arte do placar/tema de fundo
    featuredPlayer: Player | null; // O jogador destaque
    featuredPlayerImageUrl: string | null;
    featuredPlayerImgIndex: number | null; // Se precisar controlar qual imagem do player usar
}

// Interface específica para o MOTM
export interface MotmGeneratorData extends BaseGeneratorData {
    // Nada extra por enquanto, mas pode ser expandida
}

// Interface específica para o FullTime
export interface FullTimeGeneratorData {
    matchData: MatchFormData | null;
    gameArt: string | null; // A arte do placar/tema de fundo (ainda pode ser usada para um fundo base se houver)
    userUploadedImageUrl: string | null; // URL da imagem do usuário (substitui featuredPlayer)
}