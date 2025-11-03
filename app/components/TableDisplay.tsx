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
    <div className='flex justify-center flex-col w-full min-h-[160px]'>
      {gameResult && (
        <div className='w-full text-[52px] font-semibold text-white text-center'>
          {gameResult}
        </div>
      )}
      <div className='flex gap-28 pointer-events-none'>
        {deckEmpty ? (
          ''
        ) : (
          <div className='relative w-[90px] h-[140px]'>
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
