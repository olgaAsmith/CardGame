import React, { useMemo } from 'react';
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
  isHumanTurn,
  onCardClick,
  isHidden = false,
}) => {
  const BASE_MARGIN = 8;

  const margin = useMemo(() => {
    const screenWidth = window.innerWidth;

    if (screenWidth < 1280) {
      if (hand.length >= 30) {
        return -42;
      }
      if (hand.length >= 24) {
        return -40;
      }
      if (hand.length >= 18) {
        return -30;
      }
      if (hand.length >= 14) {
        return -20;
      }
      if (hand.length >= 10) {
        return -10;
      }
      if (hand.length >= 6) {
        return 8;
      }
    }

    if (hand.length <= 10) {
      return BASE_MARGIN;
    }

    return -(BASE_MARGIN + hand.length + 25);
  }, [hand.length]);

  return (
    <div className='flex w-full justify-center min-h-[90px] xl:min-h-[140px]'>
      {hand.map((card, index) => (
        <div
          key={card.id}
          style={{
            marginLeft: index === 0 ? 0 : `${margin}px`,
            transition: 'margin 0.2s ease',
          }}
        >
          <CardComponent
            card={card}
            onClick={onCardClick}
            isClickable={isHumanTurn && !isHidden}
            isHidden={isHidden}
          />
        </div>
      ))}
    </div>
  );
};
