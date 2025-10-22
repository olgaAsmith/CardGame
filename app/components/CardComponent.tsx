import { Card } from '../store/types';

interface CardComponentProps {
  card: Card;
  onClick?: (card: Card) => void;
  isClickable?: boolean;
  isHidden?: boolean;
  isTrump?: boolean;
  className?: string;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onClick,
  isClickable = false,
  isHidden = false,
  isTrump = false,
  className = '',
}) => {
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(card);
    }
  };

  const cardClasses = `
    px-2 py-1 border rounded shadow text-sm h-20 w-12 flex items-center justify-center text-xl
    transition-all duration-300
    ${isClickable && !isHidden ? 'cursor-pointer hover:bg-sky-500' : ''}
    ${
      isHidden
        ? 'bg-sky-500 border-yellow-500'
        : isTrump
        ? 'border-red-500 text-red-500'
        : 'border-sky-500'
    }
    ${className}
  `;

  return (
    <span onClick={handleClick} className={cardClasses}>
      {!isHidden && (
        <>
          {card.rank}
          {card.suit}
        </>
      )}
    </span>
  );
};
