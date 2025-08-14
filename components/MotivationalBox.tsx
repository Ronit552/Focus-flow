import React, { useState, useEffect } from 'react';

interface MotivationalBoxProps {
  quotes: string[];
}

const MotivationalBox: React.FC<MotivationalBoxProps> = ({ quotes }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 10000); // Change quote every 10 seconds

    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg ring-1 ring-slate-700">
      <p className="text-lg italic text-slate-300">"{quotes[currentQuoteIndex]}"</p>
    </div>
  );
};

export default MotivationalBox;