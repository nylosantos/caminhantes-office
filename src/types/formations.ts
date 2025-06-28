import { PlayerPosition } from './squad';

export interface FormationPosition {
  id: string;
  x: number; // Posição X no campo (0-100)
  y: number; // Posição Y no campo (0-100)
  position: PlayerPosition;
  label: string; // Ex: "GK", "RB", "CB", "LB", etc.
}

export interface Formation {
  id: string;
  name: string;
  displayName: string;
  positions: FormationPosition[];
  description: string;
}

// Formações táticas disponíveis
export const FORMATIONS: Formation[] = [
  {
    id: '4-3-3',
    name: '4-3-3',
    displayName: '4-3-3 (Clássico)',
    description: 'Formação ofensiva com 3 atacantes',
    positions: [
      // Goleiro
      { id: 'gk', x: 50, y: 5, position: 'GOL', label: 'GK' },
      
      // Defesa (4)
      { id: 'rb', x: 80, y: 20, position: 'DEF', label: 'RB' },
      { id: 'cb1', x: 60, y: 20, position: 'DEF', label: 'CB' },
      { id: 'cb2', x: 40, y: 20, position: 'DEF', label: 'CB' },
      { id: 'lb', x: 20, y: 20, position: 'DEF', label: 'LB' },
      
      // Meio-campo (3)
      { id: 'cdm', x: 50, y: 40, position: 'MEI', label: 'CDM' },
      { id: 'cm1', x: 35, y: 50, position: 'MEI', label: 'CM' },
      { id: 'cm2', x: 65, y: 50, position: 'MEI', label: 'CM' },
      
      // Ataque (3)
      { id: 'lw', x: 25, y: 75, position: 'ATA', label: 'LW' },
      { id: 'st', x: 50, y: 80, position: 'ATA', label: 'ST' },
      { id: 'rw', x: 75, y: 75, position: 'ATA', label: 'RW' }
    ]
  },
  {
    id: '4-4-2',
    name: '4-4-2',
    displayName: '4-4-2 (Equilibrado)',
    description: 'Formação equilibrada com 2 atacantes',
    positions: [
      // Goleiro
      { id: 'gk', x: 50, y: 5, position: 'GOL', label: 'GK' },
      
      // Defesa (4)
      { id: 'rb', x: 80, y: 20, position: 'DEF', label: 'RB' },
      { id: 'cb1', x: 60, y: 20, position: 'DEF', label: 'CB' },
      { id: 'cb2', x: 40, y: 20, position: 'DEF', label: 'CB' },
      { id: 'lb', x: 20, y: 20, position: 'DEF', label: 'LB' },
      
      // Meio-campo (4)
      { id: 'rm', x: 80, y: 50, position: 'MEI', label: 'RM' },
      { id: 'cm1', x: 60, y: 45, position: 'MEI', label: 'CM' },
      { id: 'cm2', x: 40, y: 45, position: 'MEI', label: 'CM' },
      { id: 'lm', x: 20, y: 50, position: 'MEI', label: 'LM' },
      
      // Ataque (2)
      { id: 'st1', x: 40, y: 75, position: 'ATA', label: 'ST' },
      { id: 'st2', x: 60, y: 75, position: 'ATA', label: 'ST' }
    ]
  },
  {
    id: '3-5-2',
    name: '3-5-2',
    displayName: '3-5-2 (Defensivo)',
    description: 'Formação com 3 zagueiros e meio-campo forte',
    positions: [
      // Goleiro
      { id: 'gk', x: 50, y: 5, position: 'GOL', label: 'GK' },
      
      // Defesa (3)
      { id: 'cb1', x: 70, y: 20, position: 'DEF', label: 'CB' },
      { id: 'cb2', x: 50, y: 18, position: 'DEF', label: 'CB' },
      { id: 'cb3', x: 30, y: 20, position: 'DEF', label: 'CB' },
      
      // Meio-campo (5)
      { id: 'rwb', x: 85, y: 40, position: 'DEF', label: 'RWB' },
      { id: 'cm1', x: 65, y: 50, position: 'MEI', label: 'CM' },
      { id: 'cdm', x: 50, y: 45, position: 'MEI', label: 'CDM' },
      { id: 'cm2', x: 35, y: 50, position: 'MEI', label: 'CM' },
      { id: 'lwb', x: 15, y: 40, position: 'DEF', label: 'LWB' },
      
      // Ataque (2)
      { id: 'st1', x: 40, y: 75, position: 'ATA', label: 'ST' },
      { id: 'st2', x: 60, y: 75, position: 'ATA', label: 'ST' }
    ]
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    displayName: '4-2-3-1 (Moderno)',
    description: 'Formação moderna com meio-campo criativo',
    positions: [
      // Goleiro
      { id: 'gk', x: 50, y: 5, position: 'GOL', label: 'GK' },
      
      // Defesa (4)
      { id: 'rb', x: 80, y: 20, position: 'DEF', label: 'RB' },
      { id: 'cb1', x: 60, y: 20, position: 'DEF', label: 'CB' },
      { id: 'cb2', x: 40, y: 20, position: 'DEF', label: 'CB' },
      { id: 'lb', x: 20, y: 20, position: 'DEF', label: 'LB' },
      
      // Meio-campo defensivo (2)
      { id: 'cdm1', x: 40, y: 40, position: 'MEI', label: 'CDM' },
      { id: 'cdm2', x: 60, y: 40, position: 'MEI', label: 'CDM' },
      
      // Meio-campo ofensivo (3)
      { id: 'lam', x: 25, y: 60, position: 'MEI', label: 'LAM' },
      { id: 'cam', x: 50, y: 65, position: 'MEI', label: 'CAM' },
      { id: 'ram', x: 75, y: 60, position: 'MEI', label: 'RAM' },
      
      // Ataque (1)
      { id: 'st', x: 50, y: 80, position: 'ATA', label: 'ST' }
    ]
  },
  {
    id: '3-4-3',
    name: '3-4-3',
    displayName: '3-4-3 (Ofensivo)',
    description: 'Formação muito ofensiva com 3 atacantes',
    positions: [
      // Goleiro
      { id: 'gk', x: 50, y: 5, position: 'GOL', label: 'GK' },
      
      // Defesa (3)
      { id: 'cb1', x: 70, y: 20, position: 'DEF', label: 'CB' },
      { id: 'cb2', x: 50, y: 18, position: 'DEF', label: 'CB' },
      { id: 'cb3', x: 30, y: 20, position: 'DEF', label: 'CB' },
      
      // Meio-campo (4)
      { id: 'rm', x: 80, y: 45, position: 'MEI', label: 'RM' },
      { id: 'cm1', x: 60, y: 50, position: 'MEI', label: 'CM' },
      { id: 'cm2', x: 40, y: 50, position: 'MEI', label: 'CM' },
      { id: 'lm', x: 20, y: 45, position: 'MEI', label: 'LM' },
      
      // Ataque (3)
      { id: 'rw', x: 75, y: 75, position: 'ATA', label: 'RW' },
      { id: 'st', x: 50, y: 80, position: 'ATA', label: 'ST' },
      { id: 'lw', x: 25, y: 75, position: 'ATA', label: 'LW' }
    ]
  },
  {
    id: '5-3-2',
    name: '5-3-2',
    displayName: '5-3-2 (Ultra Defensivo)',
    description: 'Formação muito defensiva com 5 defensores',
    positions: [
      // Goleiro
      { id: 'gk', x: 50, y: 5, position: 'GOL', label: 'GK' },
      
      // Defesa (5)
      { id: 'rwb', x: 85, y: 25, position: 'DEF', label: 'RWB' },
      { id: 'cb1', x: 65, y: 20, position: 'DEF', label: 'CB' },
      { id: 'cb2', x: 50, y: 18, position: 'DEF', label: 'CB' },
      { id: 'cb3', x: 35, y: 20, position: 'DEF', label: 'CB' },
      { id: 'lwb', x: 15, y: 25, position: 'DEF', label: 'LWB' },
      
      // Meio-campo (3)
      { id: 'cm1', x: 35, y: 55, position: 'MEI', label: 'CM' },
      { id: 'cdm', x: 50, y: 50, position: 'MEI', label: 'CDM' },
      { id: 'cm2', x: 65, y: 55, position: 'MEI', label: 'CM' },
      
      // Ataque (2)
      { id: 'st1', x: 40, y: 75, position: 'ATA', label: 'ST' },
      { id: 'st2', x: 60, y: 75, position: 'ATA', label: 'ST' }
    ]
  },
  {
    id: '4-1-4-1',
    name: '4-1-4-1',
    displayName: '4-1-4-1 (Controle)',
    description: 'Formação com volante de contenção',
    positions: [
      // Goleiro
      { id: 'gk', x: 50, y: 5, position: 'GOL', label: 'GK' },
      
      // Defesa (4)
      { id: 'rb', x: 80, y: 20, position: 'DEF', label: 'RB' },
      { id: 'cb1', x: 60, y: 20, position: 'DEF', label: 'CB' },
      { id: 'cb2', x: 40, y: 20, position: 'DEF', label: 'CB' },
      { id: 'lb', x: 20, y: 20, position: 'DEF', label: 'LB' },
      
      // Volante (1)
      { id: 'cdm', x: 50, y: 35, position: 'MEI', label: 'CDM' },
      
      // Meio-campo (4)
      { id: 'rm', x: 80, y: 55, position: 'MEI', label: 'RM' },
      { id: 'cm1', x: 60, y: 50, position: 'MEI', label: 'CM' },
      { id: 'cm2', x: 40, y: 50, position: 'MEI', label: 'CM' },
      { id: 'lm', x: 20, y: 55, position: 'MEI', label: 'LM' },
      
      // Ataque (1)
      { id: 'st', x: 50, y: 80, position: 'ATA', label: 'ST' }
    ]
  }
];

// Obter formação por ID
export const getFormationById = (id: string): Formation | undefined => {
  return FORMATIONS.find(formation => formation.id === id);
};

// Obter posições por tipo
export const getPositionsByType = (formation: Formation, positionType: PlayerPosition): FormationPosition[] => {
  return formation.positions.filter(pos => pos.position === positionType);
};

