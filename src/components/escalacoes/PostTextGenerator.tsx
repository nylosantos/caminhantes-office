import { useState, useEffect, useCallback } from 'react';
import { Match } from '@/types/matches'; // Sua interface Match
import { useTeamCodes } from '@/hooks/useTeamCodes'; // Seu novo hook
import {
  formatDateToBrazilian,
  convertToSaoPauloTime,
  formatCompetitionRound,
} from '@/utils/dateUtils'; // Suas utils de data
import { RoundTranslationsDocument } from '@/types/translations'; // Sua interface de tradução
import { Copy, ClipboardCheck, Info } from 'lucide-react'; // Ícones úteis
import { Button } from '@/components/ui/button'; // Exemplo de botão (do seu componente MatchSelector)
import { Textarea } from '@/components/ui/textarea'; // Exemplo de textarea (se tiver)
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'; // Exemplo de Popover (para as variáveis)
import { ConfrontoData } from './ConfrontoGenerator';
import { Substitution } from '@/types/generator';

// Defina os tipos de postagem permitidos - EXPANDIDO com novos tipos de arte
export type PostType =
  | 'proximoJogo'
  | 'matchday'
  | 'fimDeJogo'
  | 'melhorDaPartida'
  | 'escalacao'
  | 'confronto'
  | 'inicioJogo'
  | 'intervalo'
  | 'inicioSegundoTempo'
  | 'inicioProrrogacao'
  | 'inicioSegundoTempoProrrogacao'
  | 'gol'
  | 'substituicao';

interface PostTextGeneratorProps {
  postType: PostType;
  match: Match;
  translations: RoundTranslationsDocument[];
  confrontoData?: ConfrontoData;
  escalacaoOficial?: boolean;
  playerName?: string; // Para gols
  substitutions?: Substitution[]; // Para substituições
  homeGoals?: string;
  awayGoals?: string;
}

const PostTextGenerator: React.FC<PostTextGeneratorProps> = ({
  postType,
  match,
  translations,
  confrontoData,
  escalacaoOficial = false,
  playerName,
  substitutions,
  homeGoals,
  awayGoals,
}) => {
  const {
    getTeamCode,
    loading: codesLoading,
    error: codesError,
  } = useTeamCodes();
  const [homeTeamCode, setHomeTeamCode] = useState<string>('');
  const [awayTeamCode, setAwayTeamCode] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Efeito para carregar os códigos dos times e resetar o texto customizado
  useEffect(() => {
    const fetchCodesAndResetText = async () => {
      if (match) {
        const homeCode = await getTeamCode(
          match.teams.home.id,
          match.teams.home.name
        );
        const awayCode = await getTeamCode(
          match.teams.away.id,
          match.teams.away.name
        );
        setHomeTeamCode(homeCode);
        setAwayTeamCode(awayCode);

        // Define o texto inicial do campo customizável
        if (postType === 'fimDeJogo') {
          setCustomText(
            `Partidaça pela ${formatCompetitionRound(match, translations)} da ${
              match.league.name
            }! Resultado final no ${match.fixture.venue.name}.`
          );
        } else if (postType === 'melhorDaPartida' || postType === 'gol') {
          setCustomText(
            `Atuação de gala na partida entre ${match.teams.home.name} e ${match.teams.away.name}!`
          );
        } else {
          setCustomText(''); // Garante que seja vazio para tipos não customizáveis
        }
      }
    };
    fetchCodesAndResetText();
  }, [match, postType, getTeamCode, translations]);

  // Função para obter o texto gerado com base no tipo de postagem
  const getGeneratedText = useCallback(() => {
    if (!match || codesLoading) return 'Carregando informações da partida...';
    if (codesError) return `Erro ao carregar códigos dos times: ${codesError}`;

    const matchDateFormatted = formatDateToBrazilian(
      convertToSaoPauloTime(new Date(match.fixture.date))
    );
    const matchTimeFormatted = matchDateFormatted.split(' às ')[1];
    const competitionRound = formatCompetitionRound(match, translations);
    const leagueNameClean = match.league.name.replace(/\s/g, '');
    const confrontationHashtag = `${homeTeamCode}${awayTeamCode}`;

    // Funçao auxiliar para substituiçoes
    function getSubstitutionText(substitutions?: Substitution[]): string {
      if (!substitutions || substitutions.length === 0) return '';

      return substitutions
        .map(
          (sub, idx) =>
            (idx === 0 ? '\n' : '') +
            `🔴 #${sub.playerOut.number} ${sub.playerOut.name}\n🟢 #${sub.playerIn.number} ${sub.playerIn.name}` +
            (idx < substitutions.length - 1 ? '\n---\n' : '')
        )
        .join('');
    }

    // Função auxiliar para gerar placar
    const getPlacarText = () => {
      if (homeGoals != null && awayGoals != null) {
        return `${match.teams.home.name} ${homeGoals}-${awayGoals} ${match.teams.away.name}`;
      }
      if (match.goals?.home != null && match.goals?.away != null) {
        return `${match.teams.home.name} ${match.goals.home}-${match.goals.away} ${match.teams.away.name}`;
      }
      return `${match.teams.home.name} x ${match.teams.away.name}`;
    };

    let text = '';
    let hashtags = '';

    switch (postType) {
      case 'proximoJogo':
        text = `
⚽️ PRÓXIMO JOGO: ${match.teams.home.name} 🆚 ${match.teams.away.name}!
🏆 ${competitionRound}
🗣️ Arbitragem: ${match.fixture.referee || 'A definir'}
🏟️ Local: ${match.fixture.venue.name}
🗓️ Data e Hora: ${matchDateFormatted} (Horário de Brasília)
Prepare-se para torcer! 🔥
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag}${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'matchday':
        text = `
🎉 É DIA DE JOGO! ${match.teams.home.name} 🆚 ${match.teams.away.name}!
🏆 ${competitionRound}
🗣️ Arbitragem: ${match.fixture.referee || 'A definir'}
🏟️ Local: ${match.fixture.venue.name}
⏰ Horário: ${matchTimeFormatted} (Horário de Brasília)!
🔥 A torcida já está aquecida!
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #DiaDeJogo #Matchday${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'escalacao':
        text = `
⚽️ ${escalacaoOficial ? 'TIME PRONTO PARA' : 'NOSSA ESCALAÇÃO:'} ${
          match.teams.home.name
        } 🆚 ${match.teams.away.name}! ⚽️
🏆 ${competitionRound}
🗣️ Arbitragem: ${match.fixture.referee || 'A definir'}
🏟️ Local: ${match.fixture.venue.name}
🗓️ Data e Hora: ${matchDateFormatted} (Horário de Brasília)
🎬 Pré-jogo já está no nosso canal!
Durante o jogo teremos REACT AO VIVO no Youtube!
${
  escalacaoOficial
    ? 'Assim vem o Liverpool hoje, o que você achou? Conta nos comentários! '
    : 'Essa é a escalação que imaginamos para hoje! Qual seria a sua? '
}👇
`.trim();
        hashtags = `\n#${confrontationHashtag} #${leagueNameClean}${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'confronto':
        text = `
🔥 HISTÓRICO DO CONFRONTO: ${match.teams.home.name} 🆚 ${
          match.teams.away.name
        } 🔥

${
  confrontoData
    ? `Até aqui, foram ${
        confrontoData.awayWins + confrontoData.draws + confrontoData.homeWins
      } confrontos:
✅ ${match.teams.home.name}: ${confrontoData.homeWins} vitórias  
✅ ${match.teams.away.name}: ${confrontoData.awayWins} vitórias  
🤝 Empates: ${confrontoData.draws}

📊 Veja a distribuição completa na imagem!`
    : ''
}
🗓️ Próximo capítulo dessa história: ${matchDateFormatted} (Horário de Brasília)

Quem leva a melhor dessa vez? Comenta aí! 👇
`.trim();
        hashtags = `\n#${confrontationHashtag} #${leagueNameClean}${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'fimDeJogo':
        text = `
🔚 FIM DE JOGO! ${getPlacarText()}.
${customText}
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #ResultadoFinal #FullTime${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'melhorDaPartida':
        text = `
✨ CRAQUE DO JOGO! ✨
${customText}
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #MelhorDaPartida #Destaque #MOTM #MVP #ManOfTheMatch${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      // NOVOS TIPOS DE ARTE
      case 'inicioJogo':
        text = `
🚀 A BOLA VAI ROLAR! ${getPlacarText()}!
🏆 ${competitionRound}
🏟️ ${match.fixture.venue.name}
Que comece o espetáculo! 🔥
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #InicioDeJogo #KickOff${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'intervalo':
        text = `
⏸️ INTERVALO! ${getPlacarText()}!
🏆 ${competitionRound}
🏟️ ${match.fixture.venue.name}
Primeiro tempo encerrado! Vamos para o segundo! 💪
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #Intervalo #HalfTime${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'inicioSegundoTempo':
        text = `
🔄 SEGUNDO TEMPO! ${getPlacarText()}!
🏆 ${competitionRound}
🏟️ ${match.fixture.venue.name}
A bola volta a rolar! Vamos em busca do resultado! ⚽
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #SegundoTempo #SecondHalf${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'inicioProrrogacao':
        text = `
⏱️ PRORROGAÇÃO! ${getPlacarText()}!
🏆 ${competitionRound}
🏟️ ${match.fixture.venue.name}
Mais 30 minutos de emoção! Quem vai decidir? 🔥
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #Prorrogacao #ExtraTime${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'inicioSegundoTempoProrrogacao':
        text = `
⏱️ SEGUNDO TEMPO DA PRORROGAÇÃO! ${getPlacarText()}!
🏆 ${competitionRound}
🏟️ ${match.fixture.venue.name}
Últimos 15 minutos! Tudo pode acontecer! 💥
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #Prorrogacao #ExtraTime${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'gol':
        text = `
⚽ GOOOOOOL! ${playerName ? `${playerName}!` : ''} ${getPlacarText()}!
🏆 ${competitionRound}
🏟️ ${match.fixture.venue.name}
${customText}
`.trim();
        hashtags = `\n#${leagueNameClean} #${confrontationHashtag} #Gol #Goal${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      case 'substituicao':
        text = `
🔄 SUBSTITUIÇÃO! ${getPlacarText()}!
🏆 ${competitionRound}
🏟️ ${match.fixture.venue.name}
${getSubstitutionText(substitutions)}
`.trim();
        hashtags = `\n\n#${leagueNameClean} #${confrontationHashtag} #Substituicao #Substitution${
          match.league.name === 'Premier League' ? ' #PremierLeagueNaESPN' : ''
        }`;
        break;

      default:
        text = 'Selecione um tipo de postagem válido.';
        break;
    }
    return text + hashtags;
  }, [
    postType,
    match,
    codesLoading,
    codesError,
    homeTeamCode,
    awayTeamCode,
    customText,
    translations,
    playerName,
  ]);

  const generatedText = getGeneratedText();

  // Função para copiar o texto para o clipboard
  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Resetar o status após 2 segundos
    } catch (err) {
      console.error('Falha ao copiar texto: ', err);
      alert('Erro ao copiar texto. Por favor, copie manualmente.');
    }
  }, [generatedText]);

  // Variáveis para o menu de inserção
  const variablesList = useCallback(() => {
    if (!match) return [];
    const matchDateFormatted = formatDateToBrazilian(
      convertToSaoPauloTime(new Date(match.fixture.date))
    );
    const matchTimeFormatted = matchDateFormatted.split(' às ')[1];
    const competitionRound = formatCompetitionRound(match, translations);

    const commonVariables = [
      {
        label: `Time da Casa (${match.teams.home.name})`,
        value: match.teams.home.name,
      },
      {
        label: `Time Visitante (${match.teams.away.name})`,
        value: match.teams.away.name,
      },
      {
        label: `Competição/Rodada (${competitionRound})`,
        value: competitionRound,
      },
      {
        label: `Estádio (${match.fixture.venue.name})`,
        value: match.fixture.venue.name,
      },
      { label: `Data (${matchDateFormatted})`, value: matchDateFormatted },
      { label: `Hora (${matchTimeFormatted})`, value: matchTimeFormatted },
      {
        label: `Árbitro (${match.fixture.referee || 'Não Informado'})`,
        value: match.fixture.referee || 'Não Informado',
      },
    ];

    if (
      postType === 'fimDeJogo' ||
      postType === 'melhorDaPartida' ||
      postType === 'gol'
    ) {
      return [
        ...commonVariables,
        {
          label: `Placar (${match.goals?.home || 0} x ${
            match.goals?.away || 0
          })`,
          value: `${match.goals?.home || 0} x ${match.goals?.away || 0}`,
        },
      ];
    }
    return commonVariables;
  }, [match, postType, translations]);

  // Determinar se o tipo permite customização
  const allowsCustomization = ['fimDeJogo', 'melhorDaPartida', 'gol'].includes(
    postType
  );

  if (!match) {
    return (
      <div className="p-4 text-gray-600 font-display-medium">
        Nenhuma partida selecionada para gerar o texto.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-display-bold text-gray-800 text-center mb-4">
        Gerador de Texto para Postagem
      </h2>

      {allowsCustomization && (
        <div className="space-y-3">
          <label className="block text-sm font-display-medium text-gray-700 mb-2">
            Edite o Conteúdo da Postagem:
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={6}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-display"
                placeholder="Escreva sua mensagem aqui..."
              />
            </div>
            <div className="w-full md:w-64">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-display-medium border-dashed border-gray-300"
                  >
                    <Info className="w-4 h-4 mr-2" /> Inserir Variáveis
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2 bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="text-sm font-display-semibold text-gray-800 mb-2">
                    Variáveis da Partida:
                  </div>
                  <div className="space-y-1">
                    {variablesList().map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCustomText((prev) => prev + item.value + ' ')
                        }
                        className="w-full justify-start text-left text-gray-700 hover:bg-red-50 hover:text-red-700 font-display"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-display-medium text-gray-700 mb-2">
          Preview da Postagem (Clique para Copiar):
        </label>
        <div
          onClick={handleCopyToClipboard}
          className={`relative p-4 border rounded-lg cursor-pointer transition-all min-h-[100px]
            ${
              copied
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
            }
            font-display whitespace-pre-wrap break-words text-gray-800`}
          style={{ whiteSpace: 'pre-wrap' }} // Garante que as quebras de linha sejam respeitadas
        >
          {codesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Info className="w-5 h-5 animate-spin text-red-600 mr-2" />
              <span className="text-gray-600">Preparando texto...</span>
            </div>
          ) : (
            generatedText
          )}
          {copied && (
            <div className="absolute top-2 right-2 flex items-center text-green-600 text-sm">
              <ClipboardCheck className="w-4 h-4 mr-1" /> Copiado!
            </div>
          )}
          {!copied && (
            <div className="absolute top-2 right-2 text-gray-400">
              <Copy className="w-4 h-4" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 font-display mt-1">
          O texto acima será copiado para todas as suas redes sociais.
        </p>
      </div>
    </div>
  );
};

export default PostTextGenerator;
