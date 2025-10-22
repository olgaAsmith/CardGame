import { Suit, Card, Player, SUITS, RANKS } from './types';

export function sortHandByNumber(hand: Card[], trump: Suit | null) {
  const trumpCards = trump ? hand.filter((card) => card.suit === trump) : [];
  const normalCards = trump
    ? hand.filter((card) => card.suit !== trump)
    : [...hand];

  normalCards.sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));

  trumpCards.sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));

  return [...normalCards, ...trumpCards];
}

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({ id: `${s}${r}`, suit: s, rank: r });
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dealCards(
  deck: Card[],
  playersCount: number,
  cardsPerPlayer = 6
): Player[] {
  const totalCards = playersCount * cardsPerPlayer;
  const dealt = deck.slice(0, totalCards);

  const players: Player[] = Array.from({ length: playersCount }, (_, i) => ({
    id: `player-${i + 1}`,
    hand: [],
  }));

  dealt.forEach((card, index) => {
    const playerIndex = index % playersCount;
    players[playerIndex].hand.push(card);
  });

  return players;
}
