// src/components/SplitRectangleDisplay.tsx
import { useSportDbTeams } from '@/contexts';
import { Match } from '@/types/matches';
import React, { useEffect, useState } from 'react';

interface SplitRectangleDisplayProps {
  parentFadePercentage?: number;
  childFadePercentage?: number;
  selectedMatch: Match;
  homeScore: number | null;
  homePenScore: number | null;
  awayScore: number | null;
  awayPenScore: number | null;
  logoOffset?: number;
  logoFadePercentage?: number; // Nova prop: porcentagem para o gradiente da logo (0-100)
}

// Array de IDs de times cujas logos devem ser coloridas de branco
const WHITE_LOGO_TEAMS_IDS = [
  40, // Exemplo: Liverpool
  // Adicione outros IDs de times aqui conforme necessário
];

interface TrophyProps {
  url: string;
  size: number;
}

const SplitRectangleDisplay: React.FC<SplitRectangleDisplayProps> = ({
  parentFadePercentage = 30,
  childFadePercentage = 20,
  selectedMatch,
  homeScore,
  homePenScore,
  awayScore,
  awayPenScore,
  logoOffset = 50,
  logoFadePercentage = 70, // Default para 20%
}) => {
  const [trophyImage, setTrophyImage] = useState<TrophyProps>();
  const parentFadePcnt = `${parentFadePercentage}%`;
  const childFadePcnt = `${childFadePercentage}%`;
  const logoFadePcnt = `${logoFadePercentage}%`; // Variável para o gradiente da logo

  function handleTrophyUrl(competitionId: number) {
    if (competitionId === 39) {
      // Premier League
      return { url: 'premierLeagueTrophy.png', size: 500 };
    } else if (competitionId === 48) {
      // Carabao Cup
      return { url: 'carabaoCupTrophy.png', size: 450 };
    } else if (competitionId === 45) {
      // FA Cup
      return { url: 'faCupTrophy.png', size: 350 };
    } else if (competitionId === 2) {
      // UEFA Champions League
      return { url: 'uclTrophy.png', size: 475 };
    } else if (competitionId === 3) {
      // UEFA Europa League
      return { url: 'uelTrophy.png', size: 425 };
    } else if (competitionId === 848) {
      // UEFA Conference League
      return { url: 'uconflTrophy.png', size: 450 };
    } else if (competitionId === 531) {
      return { url: 'superCupTrophy.png', size: 425 };
    } else if (competitionId === 1) {
      // World Cup
      return { url: 'wcTrophy.png', size: 425 };
    } else if (competitionId === 15) {
      // Clubs World Cup
      return { url: 'FIFA-Club-World-Cup-Trophy.png', size: 500 };
    } else if (competitionId === 528) {
      // Community Shield
      return { url: 'cShieldTrophy.png', size: 300 };
    } else {
      return undefined;
    }
  }

  const { homeTeam, awayTeam, loading } = useSportDbTeams(selectedMatch);

  useEffect(() => {
    if (selectedMatch) {
      setTrophyImage(handleTrophyUrl(selectedMatch.league.id || 0));
    }
  }, [selectedMatch]);

  const sizes = {
    parentWidth: 1280,
    parentHeight: 720,
    childWidth: 900,
    childHeight: 327,
    childHalfWidth: 900 / 2,
    logoHeight: 400,
  };

  const homeLogoOffsetX = -logoOffset;
  const awayLogoOffsetX = logoOffset;

  // Z-index atualizado
  const mainComponentZIndex = 1; // Retângulos coloridos
  const vsBackgroundTextZIndex = 5; // "VS" grande de fundo
  const logoAndTrophyZIndex = 20; // Logos: à frente do VS grande, atrás do placar/VS condicional
  const scoreTextZIndex = 20; // Placar/VS condicional: à frente de tudo

  // ✅ SOLUÇÃO: Verifique se os dados ainda estão sendo carregados
  if (loading || !homeTeam || !awayTeam) {
    // Se ainda estiver carregando, não retorne o JSX do placar.
    // Isso evita que o dom-to-image capture um estado incompleto.
    return null;
  }

  return (
    <div
      className="relative bg-transparent overflow-hidden"
      style={{
        width: `${sizes.parentWidth}px`,
        height: `${sizes.parentHeight}px`,
      }}
    >
      {/* Container principal dos retângulos e logos (sem overflow-hidden para as logos "vazarem") */}
      {/* O overflow-hidden que estava aqui foi removido para este container */}
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black"
        style={
          {
            width: `${sizes.childWidth}px`,
            height: `${sizes.childHeight}px`,
            '--parent-fade-pcnt': parentFadePcnt,
            '--child-fade-pcnt': childFadePcnt,
            maskImage: `linear-gradient(to right,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,1) var(--parent-fade-pcnt),
            rgba(0,0,0,1) calc(100% - var(--parent-fade-pcnt)),
            rgba(0,0,0,0) 100%
          )`,
            WebkitMaskImage: `linear-gradient(to right,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,1) var(--parent-fade-pcnt),
            rgba(0,0,0,1) calc(100% - var(--parent-fade-pcnt)),
            rgba(0,0,0,0) 100%
          )`,
            zIndex: mainComponentZIndex,
          } as React.CSSProperties
        }
      >
        {/* Retângulo Filho Esquerdo */}
        <div
          className="absolute top-0 left-0 h-full"
          style={
            {
              width: `${sizes.childHalfWidth}px`,
              backgroundColor:
                homeTeam?.strColour1 === '#FFFFFF'
                  ? homeTeam?.strColour2
                  : homeTeam?.strColour1,
              maskImage: `linear-gradient(to right,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,1) calc(100% - var(--child-fade-pcnt)),
                rgba(0,0,0,0) 100%
              )`,
              WebkitMaskImage: `linear-gradient(to right,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,1) calc(100% - var(--child-fade-pcnt)),
                rgba(0,0,0,0) 100%
              )`,
            } as React.CSSProperties
          }
        ></div>

        {/* Retângulo Filho Direito */}
        <div
          className="absolute top-0 right-0 h-full"
          style={
            {
              width: `${sizes.childHalfWidth}px`,
              backgroundColor:
                awayTeam?.strColour1 === '#FFFFFF'
                  ? awayTeam?.strColour2
                  : awayTeam?.strColour1,
              maskImage: `linear-gradient(to right,
                rgba(0,0,0,0) 0%,
                rgba(0,0,0,1) var(--child-fade-pcnt),
                rgba(0,0,0,1) 100%
              )`,
              WebkitMaskImage: `linear-gradient(to right,
                rgba(0,0,0,0) 0%,
                rgba(0,0,0,1) var(--child-fade-pcnt),
                rgba(0,0,0,1) 100%
              )`,
            } as React.CSSProperties
          }
        ></div>
      </div>{' '}
      {/* Fim do container da div preta principal */}
      {/* Novo elemento <p> para o texto "VS" de fundo (grande) */}
      <p
        className="absolute text-[400px] font-placar-black text-white/20 uppercase leading-[1.414] text-center"
        style={{
          top: '65.7%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: vsBackgroundTextZIndex, // Z-index para o VS de fundo
        }}
      >
        VS
      </p>
      {/* IMAGEM DA TAÇA DA COMPETIÇÃO */}
      {trophyImage && (
        <img
          src={trophyImage.url}
          alt={`${selectedMatch.league.name} Trophy`}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" // Centraliza no meio do canvas de 1280x720
          style={{
            top: '65.7%',
            height: `${trophyImage.size}px`, // Altura da taça, ajuste conforme necessário
            width: 'auto',
            zIndex: logoAndTrophyZIndex,
          }}
        />
      )}
      {/* LOGO TIME DA CASA (ESQUERDA) */}
      {!loading && homeTeam && homeTeam.strBadge && (
        <img
          src={`https://slow-hare-89.deno.dev/proxy?url=${encodeURIComponent(
            homeTeam.strBadge
          )}`}
          alt={`${selectedMatch.teams.home.name} logo`}
          className={`absolute -translate-y-1/2 ${
            WHITE_LOGO_TEAMS_IDS.includes(selectedMatch.teams.home.id)
              ? 'invert brightness-0 white-logo'
              : ''
          }`}
          style={{
            top: '93.7%',
            height: `${sizes.logoHeight}px`,
            width: 'auto',
            left: `${
              sizes.parentWidth / 2 -
              sizes.childWidth / 2 +
              sizes.childHalfWidth / 2 +
              homeLogoOffsetX
            }px`,
            transform: `translate(-50%, -50%)`,
            zIndex: logoAndTrophyZIndex,
            // Máscara condicional para a logo da casa
            ...((selectedMatch.fixture.status.long === 'Match Finished' ||
              (homeScore !== null && awayScore !== null)) &&
              ({
                maskImage: `linear-gradient(to right,
                  rgba(0,0,0,1) ${100 - logoFadePercentage}%,
                  rgba(0,0,0,0) 100%
                )`,
                WebkitMaskImage: `linear-gradient(to right,
                  rgba(0,0,0,1) ${100 - logoFadePercentage}%,
                  rgba(0,0,0,0) 100%
                )`,
              } as React.CSSProperties)),
          }}
        />
      )}
      {/* LOGO TIME DE FORA (DIREITA) */}
      {!loading && awayTeam && awayTeam.strBadge && (
        <img
          src={`https://slow-hare-89.deno.dev/proxy?url=${encodeURIComponent(
            awayTeam.strBadge
          )}`}
          alt={`${selectedMatch.teams.away.name} logo`}
          className={`absolute -translate-y-1/2 ${
            WHITE_LOGO_TEAMS_IDS.includes(selectedMatch.teams.away.id)
              ? 'invert brightness-0 white-logo'
              : ''
          }`}
          style={{
            top: '93.7%',
            height: `${sizes.logoHeight}px`,
            width: 'auto',
            left: `${
              sizes.parentWidth / 2 -
              sizes.childWidth / 2 +
              sizes.childHalfWidth +
              sizes.childHalfWidth / 2 +
              awayLogoOffsetX
            }px`,
            transform: `translate(-50%, -50%)`,
            zIndex: logoAndTrophyZIndex,
            // Máscara condicional para a logo de fora
            ...((selectedMatch.fixture.status.long === 'Match Finished' ||
              (homeScore !== null && awayScore !== null)) &&
              ({
                maskImage: `linear-gradient(to right,
                  rgba(0,0,0,0) 0%,
                  rgba(0,0,0,1) ${logoFadePcnt},
                  rgba(0,0,0,1) 100%
                )`,
                WebkitMaskImage: `linear-gradient(to right,
                  rgba(0,0,0,0) 0%,
                  rgba(0,0,0,1) ${logoFadePcnt},
                  rgba(0,0,0,1) 100%
                )`,
              } as React.CSSProperties)),
          }}
        />
      )}
      {/* Placar: VS para jogos não finalizados ou Gols para jogos finalizados */}
      {selectedMatch.fixture.status.long !== 'Match Finished' &&
      homeScore === null &&
      awayScore === null ? (
        <>
          <p
            className="absolute text-[150px] font-placar-black text-white uppercase leading-[1.414] text-center left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              top: '65.7%',
              zIndex: scoreTextZIndex, // Z-index para o placar/VS condicional
            }}
          >
            VS
          </p>
        </>
      ) : (
        <>
          <p
            className="absolute w-full text-[266px] font-placar-black text-white uppercase leading-[1.414] text-center left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              top: '65.7%',
              zIndex: scoreTextZIndex, // Z-index para o placar/VS condicional
              textShadow: '2px 2px 4px #000000',
            }}
          >
            {homeScore}-{awayScore}
          </p>
          {((selectedMatch.fixture.status.short === 'PEN' &&
            homePenScore != null &&
            awayPenScore != null) ||
            (homePenScore != null && awayPenScore != null)) && (
            <p
              className="absolute w-full text-[40px] font-placar-black text-white leading-[1.414] text-center left-1/2 -translate-x-1/2 -translate-y-1/2 mt-32"
              style={{
                top: '65.7%',
                zIndex: scoreTextZIndex, // Z-index para o placar/VS condicional
                textShadow: '2px 2px 4px #000000',
              }}
            >
              ({homePenScore}-{awayPenScore} pen.)
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SplitRectangleDisplay;
