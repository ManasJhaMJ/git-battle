// ScoreCounter.jsx
import { useState, useEffect } from 'react';

const ScoreCounter = ({ label, value, icon, isWinner }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (value > 0) {
      const duration = 1000; // ms
      const interval = 50; // ms
      const steps = duration / interval;
      const increment = value / steps;
      
      let currentCount = 0;
      const timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(currentCount));
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [value]);
  
  return (
    <div className={`score-item ${isWinner ? 'winner' : ''}`}>
      <h4>{label}</h4>
      <div className="score-value">
        {icon && <span className="icon">{icon}</span>}
        <span className="count">{count}</span>
      </div>
      {isWinner && <div className="winner-tag">Winner</div>}
    </div>
  );
};

export default ScoreCounter;