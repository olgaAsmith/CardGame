import React from 'react';
import { Card, TableCard } from '../store/types';
import { CardComponent } from './CardComponent';

interface TableDisplayProps {
  tableCards: TableCard[];
  trumpCard: Card | null;
  gameResult: 'you win' | 'you lose' | 'draw' | null;
  deckEmpty: boolean;
}

export const TableDisplay: React.FC<TableDisplayProps> = ({
  tableCards,
  trumpCard,
  gameResult,
  deckEmpty,
}) => {
  return (
    <div className='h-[33%] flex justify-center flex-col min-w-1/3'>
      {gameResult && (
        <div className='w-full text-[52px] font-semibold text-white text-center'>
          {gameResult}
        </div>
      )}
      <div className='flex gap-10'>
        {deckEmpty ? (
          ''
        ) : (
          <div className='flex flex-wrap gap-2 border border-white p-2'>
            <CardComponent
              card={{ id: 'deck', suit: '♠', rank: 'A' }}
              isHidden={true}
              className='bg-sky-500 border-sky-500 text-white'
            />
            {trumpCard && (
              <CardComponent
                card={trumpCard}
                isTrump={true}
                className='border-red-500 text-red-500 bg-white'
              />
            )}
          </div>
        )}

        <div className='flex gap-10'>
          {tableCards.map((tableCard, index) => (
            <div key={index} className='relative w-12 h-20'>
              <CardComponent
                card={tableCard.attack}
                className='absolute bottom-0 left-0 border-sky-500 text-black bg-white'
              />

              {tableCard.defense && (
                <CardComponent
                  card={tableCard.defense}
                  isTrump={tableCard.defense.suit === trumpCard?.suit}
                  className='absolute bottom-4 left-8 text-black bg-white'
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
