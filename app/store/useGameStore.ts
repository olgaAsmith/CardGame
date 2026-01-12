import { create } from 'zustand';
import { sortHandByNumber, generateDeck, shuffle, dealCards } from './utils';
import { Card, Player, RANK_VALUES, GameState } from './types';

export const useGameStore = create<GameState>((set, get) => ({
  deck: [],
  trump: null,
  players: [],
  activePlayerId: '',
  tableCards: [],
  gameResult: null,

  createDeck: () =>
    set(() => ({
      gameResult: null,
      deck: shuffle(generateDeck()),
    })),
  resetDeck: () =>
    set(() => ({
      deck: [],
      trump: null,
      players: [],
      activePlayerId: '',
      tableCards: [],
    })),
  createPlayers: (count) =>
    set(() => ({
      players: Array.from({ length: count }, (_, i) => ({
        id: `player-${i + 1}`,
        hand: [],
      })),
    })),
  deal: (playersCount: number) => {
    const { deck } = get();
    const players = dealCards(deck, playersCount);
    set({ players, deck: deck.slice(playersCount * 6) });
  },
  identifyTrump: () => {
    const { deck } = get();
    const trump = deck[0];
    const newDeck = [...deck.slice(1), trump];
    set({ trump, deck: newDeck });
  },
  defineActivePlayer: () => {
    const { trump, players } = get();
    if (!trump || players.length !== 2) {
      console.warn('Нужно ровно 2 игрока и определён козырь');
      return;
    }
    const [p1, p2] = players;
    const getLowestTrumpRank = (player: Player) => {
      const trumps = player.hand.filter((c) => c.suit === trump.suit);
      if (trumps.length === 0) return Infinity;
      return Math.min(...trumps.map((c) => RANK_VALUES[c.rank]));
    };
    const p1Rank = getLowestTrumpRank(p1);
    const p2Rank = getLowestTrumpRank(p2);
    const attackerId = p1Rank < p2Rank ? p1.id : p2.id;
    const defenderId = attackerId === p1.id ? p2.id : p1.id;
    const updatedPlayers = players.map((p) => ({
      ...p,
      role:
        p.id === attackerId
          ? ('attack' as const)
          : p.id === defenderId
          ? ('defense' as const)
          : undefined,
    }));
    set({
      players: updatedPlayers,
      activePlayerId: attackerId,
    });
    get().sortPlayerHandByNumber('player-1');
    get().sortPlayerHandByNumber('player-2');
    console.log(`Первым ходит ${attackerId} (атака), защищается ${defenderId}`);
  },
  endTurn: () => {
    const { players, activePlayerId } = get();
    const currentIndex = players.findIndex((p) => p.id === activePlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    set({ activePlayerId: players[nextIndex].id });
  },
  endRound: () => {
    const { tableCards } = get();
    const allDefended = tableCards.every((tc) => tc.defense !== null);
    if (!allDefended) {
      console.log('Раунд не может закончиться: есть непокрытые атаки');
      return;
    }
    console.log('Конец раунда');
    set({ tableCards: [] });
    get().drawCards();
    get().switchRoles();
    get().checkGameEnd();
  },
  switchRoles: () => {
    const { players } = get();
    const newPlayers = players.map((p): Player => {
      if (p.role === 'attack') return { ...p, role: 'defense' as const };
      if (p.role === 'defense') return { ...p, role: 'attack' as const };
      return p;
    });
    const newActivePlayer = newPlayers.find((p) => p.role === 'attack');
    set({
      players: newPlayers,
      activePlayerId: newActivePlayer?.id,
    });
    console.log(newActivePlayer?.id);
    console.log('Роли поменялись, активный игрок:', newActivePlayer);
  },

  attack: (card) => {
    const { tableCards, activePlayerId, players, endTurn } = get();
    const activePlayer = players.find((p) => p.id === activePlayerId);
    const defender = players.find((p) => p.id !== activePlayerId);

    if (!defender) return;
    if (!activePlayer) return;

    if (defender.hand.length === 0) {
      if (get().deck.length === 0) {
        get().checkGameEnd();
      } else {
        get().endRound();
      }
      return;
    }

    if (activePlayer.role === 'defense') {
      console.log('Сейчас защита — атаковать нельзя!');
      return;
    }
    if (tableCards.length > 0) {
      const ranksOnTable = tableCards
        .flatMap((tc) => [tc.attack.rank, tc.defense?.rank])
        .filter(Boolean);
      if (!ranksOnTable.includes(card.rank)) {
        console.log('Можно подкидывать только карту с таким же рангом!');
        return;
      }
      if (tableCards.length >= 6) {
        console.log('Нельзя подкидывать больше 6 карт!');
        return;
      }
    }
    const updatedPlayers = players.map((p) =>
      p.id === activePlayerId
        ? { ...p, hand: p.hand.filter((c) => c.id !== card.id) }
        : p
    );
    const newTableCards = [...tableCards, { attack: card, defense: null }];
    set({
      tableCards: newTableCards,
      players: updatedPlayers,
    });
    console.log(
      `Игрок ${activePlayerId} атакует картой ${card.suit}${card.rank}`
    );
    endTurn();
  },
  defend: (card, attackIndex) => {
    const { tableCards, activePlayerId, trump, players, endTurn } = get();
    const attackCard = tableCards[attackIndex]?.attack;
    if (!attackCard) return;
    let canDefend = false;
    if (
      card.suit === attackCard.suit &&
      RANK_VALUES[card.rank] > RANK_VALUES[attackCard.rank]
    ) {
      canDefend = true;
    } else if (card.suit === trump?.suit) {
      if (attackCard.suit !== trump?.suit) canDefend = true;
      else if (RANK_VALUES[card.rank] > RANK_VALUES[attackCard.rank])
        canDefend = true;
    }
    if (!canDefend) {
      console.log('Эта карта не может отбить выбранную атаку!');
      return;
    }
    const newTableCards = tableCards.map((t, index) =>
      index === attackIndex ? { ...t, defense: card } : t
    );
    const updatedPlayers = players.map((p) =>
      p.id === activePlayerId
        ? { ...p, hand: p.hand.filter((c) => c.id !== card.id) }
        : p
    );
    set({
      tableCards: newTableCards,
      players: updatedPlayers,
    });
    console.log(
      `Игрок ${activePlayerId} отбился картой ${card.suit}${card.rank}`
    );
    endTurn();
  },
  takeCards: (playerId: string) => {
    set((state) => {
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return state;
      const cardsToTake: Card[] = state.tableCards.flatMap((tc) => [
        tc.attack,
        ...(tc.defense ? [tc.defense] : []),
      ]);
      const newPlayers = state.players.map((p) =>
        p.id === playerId ? { ...p, hand: [...p.hand, ...cardsToTake] } : p
      );
      return {
        players: newPlayers,
        tableCards: [],
      };
    });
    get().drawCards();
    get().endTurn();
    get().checkGameEnd();
  },
  drawCards: () => {
    set((state) => {
      let newDeck = [...state.deck];
      const newPlayers = state.players.map((player) => {
        let newHand = [...player.hand];
        const cardsNeeded = 6 - newHand.length;
        if (cardsNeeded > 0 && newDeck.length > 0) {
          const cardsToDraw = newDeck.slice(0, cardsNeeded);
          newHand = [...newHand, ...cardsToDraw];
          newDeck = newDeck.slice(cardsToDraw.length);
        }
        return { ...player, hand: newHand };
      });
      return { deck: newDeck, players: newPlayers };
    });
    get().sortPlayerHandByNumber('player-1');
    get().sortPlayerHandByNumber('player-2');
    get().checkGameEnd();
  },
  sortPlayerHandByNumber: (playerId) =>
    set((state) => ({
      players: state.players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            hand: sortHandByNumber(player.hand, state.trump?.suit ?? null),
          };
        }
        return player;
      }),
    })),
  checkGameEnd: () => {
    const { players, deck } = get();
    const [player1, player2] = players;

    if (deck.length === 0) {
      set({ tableCards: [] });

      if (player1.hand.length === 0 && player2.hand.length === 0) {
        set({ gameResult: 'draw' });
        console.log('Игра окончена: Ничья!');
        return;
      }
      if (player1.hand.length === 0) {
        set({ gameResult: 'you win' });
        console.log(`Игра окончена: ${player1.id} победил!`);
        return;
      }
      if (player2.hand.length === 0) {
        set({ gameResult: 'you lose' });
        console.log(`Игра окончена: ${player2.id} победил!`);
        return;
      }
    }
  },
}));
