// src/utils/infoContentGenerator.ts

import { PageArtType } from '@/types/generator';
import React from 'react';

// Define a interface para o objeto que a função irá retornar
export interface InfoElementData {
    content: string[];
    style: React.CSSProperties;
}

export const getInfoElementData = (
    pageType: PageArtType,
    generatorData: any,
    config: any,
    activeImageType: 'quadrada' | 'vertical' | 'horizontal'
): InfoElementData | null => {
    // Retorna null se não houver dados de partida
    if (!generatorData || !generatorData.matchData) {
        return null;
    }

    const colors = { primary: '#ffffff', secondary: '#1ae9de' };

    const {
        stadium,
        date,
        referee,
        competitionRound,
        homeTeam,
        awayTeam,
    } = generatorData.matchData;

    // Estilos base para todos os textos, conforme sua solicitação
    const baseStyle: React.CSSProperties = {
        fontWeight: '800',
        fontFamily: '"Funnel Display", sans-serif',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    };

    switch (pageType) {
        case 'GAMEART':
            const gameArtText = `${stadium.toUpperCase()} - ${competitionRound.toUpperCase()}`;
            return {
                content: [gameArtText],
                style: {
                    ...baseStyle,
                    fontSize: '8px',
                    textAlign: 'center',
                    color: colors.primary, // Utiliza uma variável CSS, pois a cor pode variar
                },
            };

        case 'CONFRONTO':
            const line1Parts = [competitionRound.toUpperCase()];
            if (referee) {
                line1Parts.push(`ÁRBITRO: ${referee.toUpperCase()}`);
            }
            const line1Text = line1Parts.join(' - ');
            const line2Text = `${stadium.toUpperCase()} - ${date.toUpperCase()}`;
            return {
                content: [line1Text, line2Text],
                style: {
                    ...baseStyle,
                    fontSize: `${config.footerSize || 20}px`,
                    textAlign: 'center',
                    lineHeight: 1.4, // Espaçamento entre as linhas
                    color: '#FFFFFF',
                },
            };

        case 'MATCHDAY':
        case 'PROXIMO_JOGO':
            const scale = config.footerSize || 1;
            const textLines: string[] = [];
            textLines.push(
                `${homeTeam?.toUpperCase()} 🆚 ${awayTeam?.toUpperCase()}`
            );
            textLines.push(stadium.toUpperCase());
            textLines.push(date.toUpperCase());
            textLines.push(competitionRound.toUpperCase());
            if (referee) {
                textLines.push(`ÁRBITRO: ${referee.toUpperCase()}`);
            }
            return {
                content: textLines,
                style: {
                    ...baseStyle,
                    fontSize: `${20 * scale}px`,
                    textAlign: activeImageType === 'quadrada' ? 'right' : 'left',
                    lineHeight: 1.25, // Espaçamento entre as linhas para este caso
                    color: '#FFFFFF',
                },
            };

        // Para os tipos sem uma configuração específica de texto de info
        case 'ESCALACAO':
        case 'ANIVERSARIO':
        case 'MOTM':
        case 'PALPITES':
        default:
            return null;
    }
};
