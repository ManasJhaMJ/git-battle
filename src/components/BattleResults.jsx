// BattleResults.jsx
import React, { useEffect, useRef, useState } from 'react';
import ProfileCard from './ProfileCard';
import ScoreCounter from './ScoreCounter';
import ShareableCard from './ShareableCard';

const BattleResults = ({ battleData, resetBattle }) => {
  const { user1, user2, analysis } = battleData;
  const codeRef = useRef(null);
  const [showShareCard, setShowShareCard] = useState(false);
  
  // Your website URL for the watermark
  const websiteUrl = "GitBattleHub.Vercel.App";
  
  useEffect(() => {
    // Highlight code when component mounts or when summary changes
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [analysis.summary]);
  
  return (
    <div className="battle-results">
      <div className="profiles-container">
        <div className="profile">
          <ProfileCard profile={user1} />
          <div className="metrics">
            <ScoreCounter 
              label="REPO" 
              value={user1.public_repos} 
              isWinner={user1.public_repos > user2.public_repos} 
            />
            <ScoreCounter 
              label="Stars" 
              value={analysis.user1.totalStars} 
              icon="⭐" 
              isWinner={analysis.user1.totalStars > analysis.user2.totalStars} 
            />
            <ScoreCounter 
              label="Languages" 
              value={analysis.user1.languages.length} 
              isWinner={analysis.user1.languages.length > analysis.user2.languages.length} 
            />
            <ScoreCounter 
              label="Forks" 
              value={analysis.user1.totalForks} 
              icon="🍴" 
              isWinner={analysis.user1.totalForks > analysis.user2.totalForks} 
            />
          </div>
        </div>
        
        <div className="battle-summary">
          <h2>BATTLE SUMMARY</h2>
          <p>{analysis.summary}</p>
          <div className="result-container">
            <div className="trophy">🏆</div>
            <h3>{analysis.winner === user1.login ? user1.login : user2.login}</h3>
            <div className="sad-face">😢</div>
            <h3>{analysis.winner === user1.login ? user2.login : user1.login}</h3>
          </div>      
        </div>
        
        <div className="profile">
          <ProfileCard profile={user2} />
          <div className="metrics">
            <ScoreCounter 
              label="REPO" 
              value={user2.public_repos} 
              isWinner={user2.public_repos > user1.public_repos} 
            />
            <ScoreCounter 
              label="Stars" 
              value={analysis.user2.totalStars} 
              icon="⭐" 
              isWinner={analysis.user2.totalStars > analysis.user1.totalStars} 
            />
            <ScoreCounter 
              label="Languages" 
              value={analysis.user2.languages.length} 
              isWinner={analysis.user2.languages.length > analysis.user1.languages.length} 
            />
            <ScoreCounter 
              label="Forks" 
              value={analysis.user2.totalForks} 
              icon="🍴" 
              isWinner={analysis.user2.totalForks > analysis.user1.totalForks} 
            />
          </div>
        </div>
      </div>

      <button 
            className="share-toggle-button gradient-border"
            onClick={() => setShowShareCard(!showShareCard)}
          >
            {showShareCard ? 'Hide Share Options' : 'Generate Results'}
          </button>
          
          {showShareCard && (
            <ShareableCard 
              battleData={battleData} 
              websiteUrl={websiteUrl} 
            />
          )}
      
      <button className="battle-again-button" onClick={resetBattle}>
        Battle Again
      </button>
    </div>
  );
};

export default BattleResults;