import React from 'react';
import { Card, Suit } from '../store/types';
import { CardComponent } from './CardComponent';

interface PlayerHandProps {
  hand: Card[];
  trumpSuit: Suit | null;
  isHumanTurn: boolean;
  onCardClick: (card: Card) => void;
  isHidden?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  trumpSuit,
  isHumanTurn,
  onCardClick,
  isHidden = false,
}) => {
  return (
    <div className='flex flex-wrap gap-2'>
      {hand.map((card) => (
        <CardComponent
          key={card.id}
          card={card}
          onClick={onCardClick}
          isClickable={isHumanTurn && !isHidden}
          isHidden={isHidden}
          isTrump={card.suit === trumpSuit}
        />
      ))}
    </div>
  );
};
