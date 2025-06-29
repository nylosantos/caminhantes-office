export type PlayerPosition = 'GOL' | 'DEF' | 'MEI' | 'ATA';

export interface Player {
  id: string;
  name: string;
  number: string;
  position: PlayerPosition;
  imgUrl?: string[]; // Array de até 2 URLs de imagens
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerFormData {
  name: string;
  number: string;
  position: PlayerPosition;
}

export const PLAYER_POSITIONS: { [key in PlayerPosition]: string } = {
  GOL: 'Goleiro',
  DEF: 'Defensor',
  MEI: 'Meio-campo',
  ATA: 'Atacante'
};

export const POSITION_COLORS: { [key in PlayerPosition]: string } = {
  GOL: 'bg-yellow-100 text-yellow-800',
  DEF: 'bg-blue-100 text-blue-800',
  MEI: 'bg-green-100 text-green-800',
  ATA: 'bg-red-100 text-red-800'
};

// Elenco inicial do Liverpool
export const INITIAL_LIVERPOOL_SQUAD: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: "Alisson", number: "1", position: "GOL" },
  { name: "Kelleher", number: "62", position: "GOL" },
  { name: "Jaros", number: "56", position: "GOL" },
  { name: "Alexander-Arnold", number: "66", position: "DEF" },
  { name: "Bradley", number: "84", position: "DEF" },
  { name: "Konaté", number: "5", position: "DEF" },
  { name: "Quansah", number: "78", position: "DEF" },
  { name: "Virgil", number: "4", position: "DEF" },
  { name: "Gomez", number: "2", position: "DEF" },
  { name: "Robertson", number: "26", position: "DEF" },
  { name: "Tsimikas", number: "21", position: "DEF" },
  { name: "Gravenberch", number: "38", position: "MEI" },
  { name: "Endo", number: "3", position: "MEI" },
  { name: "Mac Allister", number: "10", position: "MEI" },
  { name: "Jones", number: "17", position: "MEI" },
  { name: "Szoboszlai", number: "8", position: "MEI" },
  { name: "Elliott", number: "19", position: "MEI" },
  { name: "Nyoni", number: "98", position: "MEI" },
  { name: "McConnell", number: "53", position: "MEI" },
  { name: "Morton", number: "80", position: "MEI" },
  { name: "Gakpo", number: "18", position: "ATA" },
  { name: "Díaz", number: "7", position: "ATA" },
  { name: "Jota", number: "20", position: "ATA" },
  { name: "Núñez", number: "9", position: "ATA" },
  { name: "Chiesa", number: "14", position: "ATA" },
  { name: "Salah", number: "11", position: "ATA" },
  { name: "Ngumoha", number: "73", position: "ATA" },
];

