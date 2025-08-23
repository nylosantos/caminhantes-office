// src/types/konva.ts

import { Player } from './squad';
import { Formation } from './formations';
import { Match, MatchFormData } from './matches';
import { Channel } from './channels';
import { BaseImage, IMAGE_SECTIONS, IMAGE_TYPES_ENUM } from './images';
import { GameArtType, Substitution } from './generator';
import { Stage } from 'konva/lib/Stage';

// ==================== TIPOS BÁSICOS ====================

export type ImageFormat = 'quadrada' | 'vertical' | 'horizontal';

export type ElementType =
  | 'background'
  | 'logo'
  | 'placar'
  | 'jogador'
  | 'texto-jogador'
  | 'lista-jogadores'
  | 'canais-tv'
  | 'grafico'
  | 'substituicoes'
  | 'background-usuario'
  | 'overlay'
  | 'info-partida';

export type GeneratorType =
  | 'escalacao'
  | 'matchday'
  | 'nextgame'
  | 'motm'
  | 'fulltime'
  | 'confronto'
  | 'gameart';

export type FontFamily =
  | 'Funnel Display'
  | 'Lovers Quarrel'
  | 'Montserrat'
  | 'placar-black';

export type TextAlign = 'left' | 'center' | 'right';

// ==================== POSIÇÃO E DIMENSÕES ====================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size { }

// ==================== CONFIGURAÇÕES DE TEXTO ====================

export interface TextStyle {
  fontFamily: FontFamily;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: TextAlign;
  lineHeight?: number;
  letterSpacing?: number;
  textShadow?: {
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
  };
}

// ==================== DADOS DOS ELEMENTOS ====================

export interface BackgroundElementData {
  imageUrl: string;
  section: IMAGE_SECTIONS;
  aspectRatio?: number;
  constraints?: ConstraintsData;
}

export interface LogoElementData {
  imageUrl: string;
  size: number;
  constraints?: ConstraintsData;
}

export interface PlacarElementData {
  selectedMatch: Match;
  homeScore?: number | null;
  awayScore?: number | null;
  homePenScore?: number | null;
  awayPenScore?: number | null;
  logoOffset?: number;
  logoFadePercentage?: number;
  constraints?: ConstraintsData;
}

export interface JogadorElementData {
  player: Player;
  imageUrl: string;
  aspectRatio: number; // 1062/666 para jogadores
  constraints?: ConstraintsData;
}

export interface TextoJogadorElementData {
  player: Player;
  showName: boolean;
  showNumber: boolean;
  nameStyle: TextStyle;
  numberStyle: TextStyle;
  constraints?: ConstraintsData;
}

export interface ListaJogadoresElementData {
  formation: Formation;
  selectedPlayers: { [positionId: string]: Player | null };
  reservePlayers: Player[];
  coach: string;
  colors: {
    primary: string;
    secondary: string;
  };
  styles: {
    playerNumber: TextStyle;
    playerName: TextStyle;
    reserveTitle: TextStyle;
    reserveNames: TextStyle;
    coachTitle: TextStyle;
    coachName: TextStyle;
  };
  constraints?: ConstraintsData;
}

export interface CanaisTvElementData {
  channels: Channel[];
  maxLogosPerRow: number;
  logoSize: {
    width: number;
    height: number;
  };
  spacing: {
    logo: number;
    line: number;
  };
  alignment: 'left' | 'right' | 'center';
  constraints?: ConstraintsData;
}

export interface GraficoElementData {
  homeWins: number;
  draws: number;
  awayWins: number;
  homeTeamName: string;
  awayTeamName: string;
  colors: {
    home: string;
    draw: string;
    away: string;
  };
  constraints?: ConstraintsData;
}

export interface SubstituicoesElementData {
  substitutions: Substitution[];
  styles: {
    playerOut: TextStyle;
    playerIn: TextStyle;
    arrow: TextStyle;
  };
  maxWidth: number;
  constraints?: ConstraintsData;
}

export interface BackgroundUsuarioElementData {
  imageUrl: string;
  aspectRatio: number;
  overlay?: {
    imageUrl: string;
    opacity: number;
  };
  constraints?: ConstraintsData;
}

export interface InfoPartidaElementData {
  matchData: MatchFormData;
  style: TextStyle;
  layout: 'quadrada ' | 'horizontal' | 'vertical';
  showReferee: boolean;
  constraints?: ConstraintsData;
}

export interface ConstraintsData {
  minSize?: Size;
  maxSize?: Size;
  lockAspectRatio?: boolean;
  allowResize?: boolean;
  allowMove?: boolean;
};

// ==================== ELEMENTO CANVAS ====================

export interface CanvasElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  selected: boolean;
  data:
  | BackgroundElementData
  | LogoElementData
  | PlacarElementData
  | JogadorElementData
  | TextoJogadorElementData
  | ListaJogadoresElementData
  | CanaisTvElementData
  | GraficoElementData
  | SubstituicoesElementData
  | BackgroundUsuarioElementData
  | InfoPartidaElementData;
}

// ==================== CONFIGURAÇÕES POR FORMATO ====================

export interface FormatConfig {
  canvasWidth: number;
  canvasHeight: number;
  elements: Record<ElementType, {
    defaultPosition: Position;
    defaultSize: Size;
    constraints?: ConstraintsData;
  }>;
}

// ==================== CONFIGURAÇÕES DO GERADOR ====================

export interface GeneratorConfig {
  type: GeneratorType;
  section: IMAGE_SECTIONS;
  supportedFormats: ImageFormat[];
  requiredElements: ElementType[];
  optionalElements: ElementType[];
  defaultRenderOrder: string[];
  formatConfigs: Record<ImageFormat, FormatConfig>;
}

// ==================== DADOS DO GERADOR ====================

export interface EscalacaoGeneratorData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  featuredPlayer: Player | null;
  featuredPlayerImageUrl: string | null;
  featuredPlayerImgIndex: number | null;
  formation: Formation | null;
  selectedPlayers: { [positionId: string]: Player | null };
  reservePlayers: Player[];
  coach: string;
}

export interface MatchDayGeneratorData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  featuredPlayer: Player | null;
  featuredPlayerImageUrl: string | null;
  featuredPlayerImgIndex: number | null;
  selectedChannels: Channel[];
}

export interface NextGameGeneratorData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  featuredPlayer: Player | null;
  featuredPlayerImageUrl: string | null;
  featuredPlayerImgIndex: number | null;
  selectedChannels: Channel[];
}

export interface MotmGeneratorData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  featuredPlayer: Player | null;
  featuredPlayerImageUrl: string | null;
  featuredPlayerImgIndex: number | null;
}

export interface FullTimeGeneratorData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  userUploadedImageUrl: string | null;
  userUploadedImageAspectRatio: number | null;
}

export interface ConfrontoGeneratorData {
  matchData: MatchFormData | null;
  gameArt: string | null;
  featuredPlayer: Player | null;
  featuredPlayerImageUrl: string | null;
  featuredPlayerImgIndex: number | null;
  homeWins: number;
  draws: number;
  awayWins: number;
}

export interface GameArtGeneratorData {
  matchData: MatchFormData | null;
  artType: GameArtType | null;
  homeScore: string;
  awayScore: string;
  showPenalties: boolean;
  homePenaltyScore: string;
  awayPenaltyScore: string;
  userBackgroundImg: string | null;
  userBackgroundImgAspectRatio: number | null;
  goal?: {
    scorer: Player | null;
    scorerImageUrl: string | null;
    scorerImgIndex: number | null;
  };
  substitutions?: Substitution[];
}

export type GeneratorData =
  | EscalacaoGeneratorData
  | MatchDayGeneratorData
  | NextGameGeneratorData
  | MotmGeneratorData
  | FullTimeGeneratorData
  | ConfrontoGeneratorData
  | GameArtGeneratorData;

// ==================== HISTÓRICO (UNDO/REDO) ====================

export interface HistoryState {
  elements: CanvasElement[];
  timestamp: number;
  description: string;
}

export interface HistoryManager {
  states: HistoryState[];
  currentIndex: number;
  maxStates: number;
}

// ==================== FILTROS ====================

export interface FilterConfig {
  brightness: number; // 0-200, 100 = normal
  contrast: number;   // 0-200, 100 = normal
  saturation: number; // 0-200, 100 = normal
  blur: number;       // 0-10, 0 = no blur
  opacity: number;    // 0-100, 100 = opaque
}

// ==================== EXPORTAÇÃO ====================

export interface ExportConfig {
  format: 'png' | 'jpeg';
  quality: number; // 0-1 para JPEG
  scale: number;   // Multiplicador de resolução
}

// ==================== PROPS DOS COMPONENTES ====================

export interface KonvaImageGeneratorProps {
  stageRef: React.RefObject<Stage | null>
  generatorType: GeneratorType;
  format: ImageFormat;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
  onElementsReorder: (newOrder: string[]) => void;
  onExport: (dataUrl: string, format: ImageFormat) => void;
  baseImages: BaseImage[];
  responsive?: boolean;
  showGrid?: boolean;
  showGuides?: boolean;
  enableUndo?: boolean;
  enableFilters?: boolean;
}

export interface ResponsiveStageProps {
  width: number;
  height: number;
  children: React.ReactNode;
  onStageClick: () => void;
}

export interface LayerManagerProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onElementSelect: (elementId: string | null) => void;
  onElementToggleVisibility: (elementId: string) => void;
  onElementToggleLock: (elementId: string) => void;
  onElementsReorder: (newOrder: string[]) => void;
  onDragStart?: () => void; // ← Adicionar esta
}

export interface TransformManagerProps {
  selectedElement: CanvasElement | null;
  onElementUpdate: (elementId: string, updates: Partial<CanvasElement>) => void;
}

export interface DropZoneProps {
  onImageDrop: (file: File, position: Position) => void;
  children: React.ReactNode;
}

export interface FilterPanelProps {
  selectedElement: CanvasElement | null;
  onFilterUpdate: (elementId: string, filters: FilterConfig) => void;
}

// ==================== UTILITÁRIOS ====================

export interface LoadImageResult {
  image: HTMLImageElement;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface CanvasExportResult {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
}

// ==================== CONSTANTES ====================

export const DEFAULT_COLORS = {
  primary: '#ffffff',
  secondary: '#1ae9de',
  background: '#000000',
  text: '#ffffff',
  accent: '#ff0000'
} as const;

export const DEFAULT_FONTS: Record<FontFamily, string> = {
  'Funnel Display': 'Funnel Display, sans-serif',
  'Lovers Quarrel': 'Lovers Quarrel, cursive',
  'Montserrat': 'Montserrat, sans-serif',
  'placar-black': 'placar-black, sans-serif'
} as const;

export const CANVAS_DIMENSIONS: Record<ImageFormat, Size> = {
  quadrada: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  horizontal: { width: 1920, height: 1080 }
} as const;

export const ELEMENT_Z_INDEX: Record<ElementType, number> = {
  'background': 1,
  'background-usuario': 2,
  'overlay': 3,
  'placar': 10,
  'logo': 20,
  'jogador': 15,
  'texto-jogador': 25,
  'lista-jogadores': 25,
  'canais-tv': 25,
  'grafico': 25,
  'substituicoes': 25,
  'info-partida': 30
} as const;

