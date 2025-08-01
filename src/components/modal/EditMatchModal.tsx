import {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Trophy, User, CheckCircle, Repeat } from 'lucide-react';
import { Match } from '@/types/matches';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchToEdit: Match | null;
  onSave: (editedMatch: Match) => void;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  isOpen,
  onClose,
  matchToEdit,
  onSave,
}) => {
  const [editedMatch, setEditedMatch] = useState<Match | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [selectedDate, setSelectedDate] = useState({
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
  });

  useEffect(() => {
    if (matchToEdit) {
      const matchDate = new Date(matchToEdit.fixture.date);
      setEditedMatch(JSON.parse(JSON.stringify(matchToEdit)));
      setSelectedDate({
        day: String(matchDate.getDate()).padStart(2, '0'),
        month: String(matchDate.getMonth()),
        year: String(matchDate.getFullYear()),
        hour: String(matchDate.getHours()).padStart(2, '0'),
        minute: String(matchDate.getMinutes()).padStart(2, '0'),
      });
    }
  }, [matchToEdit]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
      const { value } = e.target;
      setEditedMatch((prev) => {
        if (!prev) return null;
        const newMatch = { ...prev };
        switch (field) {
          case 'homeTeamName':
            newMatch.teams.home.name = value;
            break;
          case 'awayTeamName':
            newMatch.teams.away.name = value;
            break;
          case 'stadium':
            newMatch.fixture.venue.name = value;
            break;
          case 'competition':
            newMatch.league.name = value;
            break;
          case 'round':
            newMatch.league.round = value;
            break;
          case 'referee':
            newMatch.fixture.referee = value;
            break;
        }
        return newMatch;
      });
    },
    []
  );

  const handleDateChange = useCallback(
    (
      e: ChangeEvent<HTMLSelectElement>,
      field: 'day' | 'month' | 'year' | 'hour' | 'minute'
    ) => {
      setSelectedDate((prev) => {
        const newDate = { ...prev, [field]: e.target.value };
        const { day, month, year, hour, minute } = newDate;

        if (day && month && year && hour && minute) {
          const isoDateString = `${year}-${String(Number(month) + 1).padStart(
            2,
            '0'
          )}-${day}T${hour}:${minute}:00+00:00`;
          setEditedMatch((prevMatch) => {
            if (!prevMatch) return null;
            return {
              ...prevMatch,
              fixture: {
                ...prevMatch.fixture,
                date: isoDateString,
                timestamp: new Date(isoDateString).getTime() / 1000,
              },
            };
          });
        }
        return newDate;
      });
    },
    []
  );

  const validateFields = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!editedMatch?.fixture?.venue?.name) {
      errors.stadium = 'Estádio é obrigatório';
    }
    if (!editedMatch?.fixture?.date) {
      errors.date = 'Data é obrigatória';
    }
    if (!editedMatch?.league?.name) {
      errors.competition = 'Competição é obrigatória';
    }
    if (!editedMatch?.teams?.home?.name) {
      errors.homeTeam = 'Nome do time da casa é obrigatório';
    }
    if (!editedMatch?.teams?.away?.name) {
      errors.awayTeam = 'Nome do time visitante é obrigatório';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editedMatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateFields() && editedMatch) {
      onSave(editedMatch);
      onClose();
    }
  };

  const handleInvertTeams = () => {
    if (editedMatch) {
      setEditedMatch((prev) => {
        if (!prev) return null;
        const newMatch = JSON.parse(JSON.stringify(prev));
        [newMatch.teams.home, newMatch.teams.away] = [
          newMatch.teams.away,
          newMatch.teams.home,
        ];
        return newMatch;
      });
    }
  };

  if (!isOpen || !editedMatch) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i);
  const daysInSelectedMonth =
    selectedDate.year && selectedDate.month
      ? getDaysInMonth(
          Number(selectedDate.year),
          Number(selectedDate.month) + 1
        )
      : 31;
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-display-bold text-gray-800">
            Editar Dados da Partida
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="cursor-pointer"
          >
            ×
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-display-medium text-gray-700">Times</h4>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleInvertTeams}
              title="Inverter Times"
            >
              <Repeat className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-1">
                Time da Casa *
              </label>
              <input
                type="text"
                value={editedMatch.teams.home.name}
                onChange={(e) => handleInputChange(e, 'homeTeamName')}
                className={`w-full px-3 py-2 border rounded-lg font-display ${
                  fieldErrors.homeTeam ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome do Time da Casa"
              />
            </div>
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-1">
                Time Visitante *
              </label>
              <input
                type="text"
                value={editedMatch.teams.away.name}
                onChange={(e) => handleInputChange(e, 'awayTeamName')}
                className={`w-full px-3 py-2 border rounded-lg font-display ${
                  fieldErrors.awayTeam ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome do Time Visitante"
              />
            </div>
          </div>
          <hr className="border-gray-200" />
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-1">
                Estádio *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={editedMatch.fixture.venue.name}
                  onChange={(e) => handleInputChange(e, 'stadium')}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 font-display ${
                    fieldErrors.stadium ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Anfield"
                />
              </div>
              {fieldErrors.stadium && (
                <p className="text-red-500 text-sm mt-1 font-display">
                  {fieldErrors.stadium}
                </p>
              )}
            </div>
            {/* Bloco de seleção de data e hora */}
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-1">
                Data e Horário *
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedDate.day}
                  onChange={(e) => handleDateChange(e, 'day')}
                  className={`w-1/4 px-3 py-2 border rounded-lg font-display ${
                    fieldErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {days.map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDate.month}
                  onChange={(e) => handleDateChange(e, 'month')}
                  className={`w-2/4 px-3 py-2 border rounded-lg font-display ${
                    fieldErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {months.map((month, index) => (
                    <option
                      key={month}
                      value={index}
                    >
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDate.year}
                  onChange={(e) => handleDateChange(e, 'year')}
                  className={`w-1/4 px-3 py-2 border rounded-lg font-display ${
                    fieldErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {years.map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2 mt-2">
                <select
                  value={selectedDate.hour}
                  onChange={(e) => handleDateChange(e, 'hour')}
                  className={`w-1/2 px-3 py-2 border rounded-lg font-display ${
                    fieldErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {hours.map((hour) => (
                    <option
                      key={hour}
                      value={hour}
                    >
                      {hour}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDate.minute}
                  onChange={(e) => handleDateChange(e, 'minute')}
                  className={`w-1/2 px-3 py-2 border rounded-lg font-display ${
                    fieldErrors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {minutes.map((minute) => (
                    <option
                      key={minute}
                      value={minute}
                    >
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.date && (
                <p className="text-red-500 text-sm mt-1 font-display">
                  {fieldErrors.date}
                </p>
              )}
            </div>
            {/* Fim do bloco de seleção de data e hora */}
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-1">
                Competição *
              </label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={editedMatch.league.name}
                  onChange={(e) => handleInputChange(e, 'competition')}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 font-display ${
                    fieldErrors.competition
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Ex: Premier League"
                />
              </div>
              {fieldErrors.competition && (
                <p className="text-red-500 text-sm mt-1 font-display">
                  {fieldErrors.competition}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-1">
                Rodada
              </label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={editedMatch.league.round}
                  onChange={(e) => handleInputChange(e, 'round')}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 font-display border-gray-300"
                  placeholder="Ex: 38ª Rodada"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-display-medium text-gray-700 mb-1">
                Árbitro
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={editedMatch.fixture.referee || ''}
                  onChange={(e) => handleInputChange(e, 'referee')}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 font-display border-gray-300"
                  placeholder="Ex: Craig Pawson"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="cursor-pointer font-display-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-display-medium"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
