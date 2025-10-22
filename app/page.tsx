'use client';
import { useEffect, useCallback } from 'react';
import { useGameStore } from './store/useGameStore';
import { RANK_VALUES, Card } from './store/types';
import { PlayerHand } from './components/PlayerHand';
import { TableDisplay } from './components/TableDisplay';

export default function Home() {
  const {
    // Game state
    players,
    trump,
    activePlayerId,
    tableCards,
    deck,
    gameResult,
    // Game actions
    createDeck,
    resetDeck,
    createPlayers,
    deal,
    identifyTrump,
    defineActivePlayer,
    endRound,
    // Player actions
    attack,
    defend,
    takeCards,
  } = useGameStore();

  const startGame = useCallback(() => {
    resetDeck();
    createDeck();
    createPlayers(2);
    deal(2);
    identifyTrump();
    defineActivePlayer();
  }, [resetDeck, createDeck, createPlayers, deal, identifyTrump, defineActivePlayer]);

  const humanId = players[0]?.id;
  const isHumanTurn = humanId === activePlayerId;
  const deckEmpty = deck.length === 0;

  const handleBotTurn = useCallback(() => {
    const bot = players[1];
    if (!bot) return;

    const tableCard = tableCards.find((tc) => !tc.defense);

    if (tableCard) {
      const defendCard = bot.hand.find((card) => {
        const attackCard = tableCard.attack;
        const attackValue = RANK_VALUES[attackCard.rank];
        const defendValue = RANK_VALUES[card.rank];

        if (card.suit === attackCard.suit && defendValue > attackValue) {
          return true;
        }
        if (card.suit === trump?.suit) {
          if (attackCard.suit !== trump?.suit) return true;
          if (attackCard.suit === trump?.suit && defendValue > attackValue) {
            return true;
          }
        }
        return false;
      });

      if (defendCard) {
        defend(defendCard, tableCards.indexOf(tableCard));
        console.log(
          `🤖 Бот отбился картой ${defendCard.suit}${defendCard.rank}`
        );
      } else {
        takeCards(bot.id);
        console.log('🤖 Бот не смог отбить, берёт карты');
      }
    } else if (tableCards.length === 0) {
      const nonTrumpCards = bot.hand.filter((c) => c.suit !== trump?.suit);
      let cardToAttack: Card | undefined;
      if (nonTrumpCards.length > 0) {
        cardToAttack = nonTrumpCards.reduce((min, c) =>
          RANK_VALUES[c.rank] < RANK_VALUES[min.rank] ? c : min
        );
      } else if (bot.hand.length > 0) {
        const trumpCards = bot.hand.filter((c) => c.suit === trump?.suit);
        cardToAttack = trumpCards.reduce((min, c) =>
          RANK_VALUES[c.rank] < RANK_VALUES[min.rank] ? c : min
        );
      }

      if (cardToAttack) {
        attack(cardToAttack);
        console.log(
          `🤖 Бот атакует картой ${cardToAttack.suit}${cardToAttack.rank}`
        );
      } else {
        endRound();
      }
    } else {
      const ranksOnTable = tableCards
        .flatMap((tc) => [tc.attack.rank, tc.defense?.rank])
        .filter(Boolean);

      const cardsToThrowIn = bot.hand.filter((card) =>
        ranksOnTable.includes(card.rank)
      );

      if (cardsToThrowIn.length > 0 && tableCards.length < 6) {
        const nonTrumpThrowInCards = cardsToThrowIn.filter(
          (c) => c.suit !== trump?.suit
        );
        let throwInCard: Card | undefined;

        if (nonTrumpThrowInCards.length > 0) {
          throwInCard = nonTrumpThrowInCards.reduce((min, c) =>
            RANK_VALUES[c.rank] < RANK_VALUES[min.rank] ? c : min
          );
        } else {
          throwInCard = cardsToThrowIn.reduce((min, c) =>
            RANK_VALUES[c.rank] < RANK_VALUES[min.rank] ? c : min
          );
        }

        if (throwInCard) {
          attack(throwInCard);
          console.log(
            `🤖 Бот подкидывает карту ${throwInCard.suit}${throwInCard.rank}`
          );
        } else {
          endRound();
        }
      } else {
        endRound();
      }
    }
  }, [players, tableCards, trump, attack, defend, takeCards, endRound]);

  useEffect(() => {
    const result = gameResult;
    if (result) {
      resetDeck();
    }
  }, [gameResult, resetDeck]);

  useEffect(() => {
    if (activePlayerId === players[1]?.id) {
      setTimeout(() => {
        handleBotTurn();
      }, 1000);
    }
  }, [activePlayerId, players, handleBotTurn]);

  return (
    <div className='flex flex-col h-dvh'>
      <header>
        <div className='flex justify-center gap-2 mb-4 p-4'>
          <button
            onClick={startGame}
            className='px-4 py-2 bg-blue-600 text-white rounded'
          >
            Начать игру
          </button>
          <button
            onClick={resetDeck}
            className='px-4 py-2 bg-red-500 text-white rounded'
          >
            Закончить игру
          </button>
        </div>
      </header>
      <main className='grow flex flex-col items-center justify-center'>
        <div className='h-20 flex items-center justify-center flex-col'>
          {players[1] && (
            <PlayerHand
              hand={players[1].hand}
              trumpSuit={trump?.suit ?? null}
              isHumanTurn={false}
              onCardClick={() => {}}
              isHidden={true}
            />
          )}
        </div>

        <TableDisplay
          tableCards={tableCards}
          trumpCard={trump}
          gameResult={gameResult}
          deckEmpty={deckEmpty}
        />

        <div className='h-20 flex items-center justify-center flex-col'>
          {deck && players.length ? (
            <div className='flex gap-5 mb-5'>
              <button
                className='border-1 bg-yellow-600 px-6 py-2 cursor-pointer'
                onClick={endRound}
              >
                Бито
              </button>
              <button
                className='border-1 bg-pink-600 px-6 py-2 cursor-pointer'
                onClick={() => {
                  if (!isHumanTurn || players[0]?.role !== 'defense') return;
                  takeCards(humanId);
                }}
                disabled={!isHumanTurn || players[0]?.role !== 'defense'}
              >
                Взять
              </button>
            </div>
          ) : (
            ''
          )}

          {players[0] && (
            <PlayerHand
              hand={players[0].hand}
              trumpSuit={trump?.suit ?? null}
              isHumanTurn={isHumanTurn}
              onCardClick={(card) => {
                if (!isHumanTurn) return;
                console.log(players[0]);
                if (players[0]?.role === 'attack') {
                  attack(card);
                } else if (players[0]?.role === 'defense') {
                  const attackIndex = tableCards.findIndex((t) => !t.defense);
                  if (attackIndex !== -1) {
                    defend(card, attackIndex);
                  }
                }
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
