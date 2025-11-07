import { Card } from '../store/types';

interface CardComponentProps {
  card: Card;
  onClick?: (card: Card) => void;
  isClickable?: boolean;
  isHidden?: boolean;
  isTrump?: boolean;
  className?: string;
}

const suitStyles: Record<string, string> = {
  '♥': 'text-[#ff00ff] drop-shadow-[0_0_5px_#ff00ff] drop-shadow-[0_0_5px_#ff66ff] border-[#ff00ff] shadow-[0_0_1px_#ff00ff] hover:shadow-[0_0_15px_#ff66ff]',
  '♦': 'text-[#fcee0c] drop-shadow-[0_0_5px_#fcee0c] drop-shadow-[0_0_5px_#ffbb00] border-[#fcee0c] shadow-[0_0_1px_#fcee0c] hover:shadow-[0_0_15px_#ffbb00]',
  '♣': 'text-[#39ff14] drop-shadow-[0_0_5px_#39ff14] drop-shadow-[0_0_5px_#00ff99] border-[#39ff14] shadow-[0_0_1px_#39ff14] hover:shadow-[0_0_15px_#00ff99]',
  '♠': 'text-[#00e5ff] drop-shadow-[0_0_5px_#00e5ff] drop-shadow-[0_0_5px_#00ffff] border-[#00e5ff] shadow-[0_0_1px_#00e5ff] hover:shadow-[0_0_15px_#00ffff]',
};

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onClick,
  isClickable = false,
  isHidden = false,
  className = '',
}) => {
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(card);
    }
  };

  const suitClass = suitStyles[card.suit] || '';

  const cardClasses = `
    shrink-0 w-[60px] h-[90px] xl:w-[90px] xl:h-[140px] rounded-[12px] bg-[#0a0a1a] flex items-center justify-center text-[32px] xl:text-[52px]
    transition-all duration-400 ease-in-out
    border-2
    ${
      isClickable && !isHidden
        ? 'xl:cursor-pointer xl:hover:scale-102 xl:hover:translate-y-[-20px]'
        : ''
    }
    ${
      isHidden
        ? 'border border-[#050505] bg-gradient-to-tr from-[#1a1718] via-[#1c34a3] to-[#1a1718]  shadow-[0_0_10px_#000000]'
        : suitClass
    }
    ${className}
  `;

  const cornerClasses = `
    absolute text-[14px] text-bold xl:text-[20px] leading-[0.9] flex flex-col items-center justify-center
  `;

  return (
    <div onClick={handleClick} className={cardClasses}>
      {!isHidden && (
        <>
          <div className={`${cornerClasses} top-1 left-2`}>
            <span>{card.rank}</span>
            <span>{card.suit}</span>
          </div>
          <div className={`${cornerClasses} bottom-1 right-2 rotate-180`}>
            <span>{card.rank}</span>
            <span>{card.suit}</span>
          </div>
          <div className='transition-transform duration-300 ease-in-out group-hover:scale-125'>
            {card.suit}
          </div>
        </>
      )}
    </div>
  );
};
