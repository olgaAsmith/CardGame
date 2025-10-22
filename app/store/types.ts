export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
};

export type Player = {
  id: string;
  hand: Card[];
  role?: 'attack' | 'defense';
};

export type TableCard = {
  attack: Card;
  defense: Card | null;
};

export const RANK_VALUES: Record<Rank, number> = {
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUIT_ORDER = ['♠', '♥', '♦', '♣'];

export type GameState = {
  deck: Card[];
  trump: Card | null;
  players: Player[];
  activePlayerId: string;
  tableCards: TableCard[];
  gameResult: 'you win' | 'you lose' | 'draw' | null;

  createDeck: () => void;
  resetDeck: () => void;
  createPlayers: (count: number) => void;
  deal: (count: number) => void;
  identifyTrump: () => void;
  defineActivePlayer: () => void;
  endTurn: () => void;
  endRound: () => void;
  switchRoles: () => void;

  attack: (card: Card) => void;
  defend: (card: Card, attackIndex: number) => void;
  takeCards: (playerId: string) => void;
  drawCards: () => void;
  sortPlayerHandByNumber: (playerId: string) => void;
  checkGameEnd: () => void;
};
