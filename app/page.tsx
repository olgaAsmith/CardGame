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
  }, [
    resetDeck,
    createDeck,
    createPlayers,
    deal,
    identifyTrump,
    defineActivePlayer,
  ]);

  const humanId = players[0]?.id;
  const isHumanTurn = humanId === activePlayerId;
  const deckEmpty = deck.length === 0;

  const canEndRound =
    tableCards.length > 0 &&
    players[0]?.role === 'attack' &&
    tableCards.every((tc) => tc.attack !== null && tc.defense !== null);

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
    if (gameResult) return;
    if (activePlayerId === players[1]?.id) {
      setTimeout(() => {
        handleBotTurn();
      }, 1000);
    }
  }, [activePlayerId, players, handleBotTurn, gameResult]);

  return (
    <div className='flex flex-col h-dvh'>
      <main className='grow flex flex-col items-center justify-between mb-14 xl:mb-0 xl:justify-center gap-2 xl:gap-10 p-2 xl:p-8'>
        <div className='flex items-center justify-center flex-col'>
          {players[1] && !gameResult && (
            <PlayerHand
              hand={players[1].hand}
              trumpSuit={trump?.suit ?? null}
              isHumanTurn={false}
              onCardClick={() => {}}
              isHidden={true}
            />
          )}
        </div>
        {deck && players.length ? (
          <TableDisplay
            tableCards={tableCards}
            trumpCard={trump}
            gameResult={gameResult}
            deckEmpty={deckEmpty}
          />
        ) : (
          ''
        )}

        <div className='flex items-center justify-center flex-col'>
          {players[0] && !gameResult && (
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
          {deck && players.length && !gameResult ? (
            <div className='absolute bottom-2 left-0 xl:static flex gap-4 xl:gap-10 mt-2 xl:mt-12 xl:justify-center items-center'>
              <button
                onClick={endRound}
                disabled={!canEndRound}
                className='px-4 xl:px-6 py-2 text-[14px] xl:text-[18px] tracking-[2px] border-2 rounded-lg cursor-pointer transition duration-300 ease-in-out 
        border-purple-600 text-purple-500 shadow-[0_0_15px_#BD00FF] hover:shadow-[0_0_35px_#5555ff] hover:scale-110 hover:text-[#5555ff] hover:border-[#5555ff]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:border-slate-400 disabled:text-slate-400'
              >
                End Round
              </button>

              <button
                onClick={() => {
                  if (!isHumanTurn || players[0]?.role !== 'defense') return;
                  takeCards(humanId);
                }}
                disabled={!isHumanTurn || players[0]?.role !== 'defense'}
                className='px-4 xl:px-6 py-2 text-[14px] xl:text-[18px] tracking-[2px] border-2 rounded-lg cursor-pointer transition duration-300 ease-in-out 
        border-purple-600 text-purple-500 shadow-[0_0_15px_#BD00FF] hover:shadow-[0_0_35px_#5555ff] hover:scale-110 hover:text-[#5555ff] hover:border-[#5555ff]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 disabled:border-slate-400 disabled:text-slate-400'
              >
                Take Cards
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                resetDeck();
                startGame();
              }}
              className='px-16 py-6 text-[28px] tracking-[2px] border-2 rounded-lg cursor-pointer transition duration-300 ease-in-out 
      border-cyan-600 text-cyan-500 shadow-[0_0_25px_#00E5FF] hover:shadow-[0_0_200px_#00E5FF] hover:scale-130 
      disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100'
            >
              {gameResult ? 'Play Again' : 'Start Game'}
            </button>
          )}
        </div>
      </main>
      <div className='absolute bottom-2 right-2 xl:static flex items-end flex-col xl:p-2'>
        {deck && players.length && !gameResult ? (
          <button
            onClick={resetDeck}
            className='w-fit px-3 py-2 text-[12px] xl:text-[14px] tracking-[2px] border-2 rounded-lg cursor-pointer transition duration-300 ease-in-out 
            border-[#BD00FF] text-[#BD00FF] shadow-[0_0_10px_#BD00FF] hover:shadow-[0_0_0px_#ff073a]  hover:text-[#ff073a] hover:border-[#ff073a]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100'
          >
            End Game
          </button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
