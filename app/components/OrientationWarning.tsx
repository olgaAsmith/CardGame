'use client';

import React, { useEffect, useState } from 'react';

export const OrientationWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  const checkOrientation = () => {
    if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  useEffect(() => {
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!showWarning) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-300 text-gray-700 p-6 rounded-lg shadow-lg text-center'>
        <h2 className='text-2xl font-bold mb-4'>
          Please, rotate your device
        </h2>
        <p className='text-md font-bold'>
          This game works best in landscape orientation.
        </p>
      </div>
    </div>
  );
};
