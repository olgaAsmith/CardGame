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
    <div className='relative flex justify-center flex-col  w-1/2  min-h-[160px]'>
      {deckEmpty ? (
        ''
      ) : (
        <div className='absolute w-[90px] h-[140px] top-0 -left-60 '>
          <CardComponent
            card={{ id: 'deck', suit: '♠', rank: 'A' }}
            isHidden={true}
            className='absolute top-0 left-0 z-[10]'
          />
          {trumpCard && (
            <CardComponent
              card={trumpCard}
              className='absolute left-[50%] top-0 rotate-90 '
            />
          )}
        </div>
      )}
      {gameResult && (
        <div className='w-full text-[52px] font-semibold text-white text-center'>
          {gameResult}
        </div>
      )}
      <div className='relative flex pointer-events-none'>
        <div className='flex gap-12'>
          {tableCards.map((tableCard, index) => (
            <div key={index} className='relative'>
              <CardComponent card={tableCard.attack} />

              {tableCard.defense && (
                <CardComponent
                  card={tableCard.defense}
                  className='absolute left-8 -top-4'
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
