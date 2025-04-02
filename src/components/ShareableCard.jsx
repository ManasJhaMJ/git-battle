// ShareableCard.jsx
import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

const ShareableCard = ({ battleData, websiteUrl }) => {
  const { user1, user2, analysis } = battleData;
  const cardRef = useRef(null);
  const [cardImage, setCardImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateImage = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        backgroundColor: '#282c34',
        logging: false
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setCardImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Two-step Twitter sharing process
  const shareToTwitter = () => {
    if (!cardImage) return;
    
    const winnerName = analysis.winner === user1.login ? user1.login : user2.login;
    const loserName = analysis.winner !== user1.login ? user1.login : user2.login;
    
    // Instructions message
    alert("To share with the image on Twitter:\n\n1. The image will now be downloaded to your device\n2. When Twitter opens, click to add an image and select the downloaded image");
    
    // Download the image first
    const link = document.createElement('a');
    link.href = cardImage;
    link.download = 'github-battle.png';
    link.click();
    
    // Then open Twitter intent
    const text = `${winnerName} just defeated ${loserName} in an epic GitHub battle! 🏆 Check out who's the better coder!`;
    const url = websiteUrl;
    
    setTimeout(() => {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    }, 1000);
  };
  
  // General share function using Web Share API
  const shareCard = async () => {
    if (!cardImage || !navigator.share) return;
    
    try {
      const blob = await fetch(cardImage).then(res => res.blob());
      const file = new File([blob], 'github-battle.png', { type: 'image/png' });
      
      await navigator.share({
        title: 'GitHub Battle Results',
        text: `Check out who won in this GitHub battle!`,
        files: [file]
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback - allow direct download
      const link = document.createElement('a');
      link.href = cardImage;
      link.download = 'github-battle.png';
      link.click();
    }
  };
  
  return (
    <div className="shareable-card-container">
      <div className="card-preview-container">
        {/* This div will be converted to an image */}
        <div className="card-content" ref={cardRef}>
          <div className="card-header">
            <h2>GitHub Battle Results</h2>
          </div>
          
          <div className="battle-competitors">
            <div className="competitor">
              <img 
                src={user1.avatar_url} 
                alt={user1.login} 
                className={`avatar ${analysis.winner === user1.login ? 'winner' : 'loser'}`}
              />
              <h3>{user1.login}</h3>
              <div className="stats">
                <div className="stat">⭐ {analysis.user1.totalStars}</div>
                <div className="stat">🍴 {analysis.user1.totalForks}</div>
              </div>
            </div>
            
            <div className="vs">VS</div>
            
            <div className="competitor">
              <img 
                src={user2.avatar_url} 
                alt={user2.login} 
                className={`avatar ${analysis.winner === user2.login ? 'winner' : 'loser'}`}
              />
              <h3>{user2.login}</h3>
              <div className="stats">
                <div className="stat">⭐ {analysis.user2.totalStars}</div>
                <div className="stat">🍴 {analysis.user2.totalForks}</div>
              </div>
            </div>
          </div>
          
          <div className="battle-result">
            <h3>WINNER: {analysis.winner}</h3>
            <div className="summary">
              {analysis.summary.split('\n').slice(0, 3).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          
          <div className="watermark">
            {websiteUrl} • Compare your GitHub profiles now!
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="generate-button" 
          onClick={generateImage} 
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Shareable Image'}
        </button>
        
        {cardImage && (
          <>
            <button 
              className="share-button twitter" 
              onClick={shareToTwitter}
            >
              Share to Twitter
            </button>
            <button className="share-button general" onClick={shareCard}>
              Share Image
            </button>
            <a 
              href={cardImage} 
              download="github-battle.png" 
              className="download-button"
            >
              Download Image
            </a>
          </>
        )}
      </div>
      
      <style jsx>{`
        .shareable-card-container {
          margin: 2rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .card-preview-container {
          width: 100%;
          max-width: 600px;
          margin-bottom: 1rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .card-content {
          background-color: #282c34;
          color: white;
          padding: 1.5rem;
          position: relative;
        }
        
        .card-header {
          text-align: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 0.5rem;
        }
        
        .battle-competitors {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .competitor {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40%;
        }
        
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #666;
        }
        
        .avatar.winner {
          border-color: gold;
          box-shadow: 0 0 10px gold;
        }
        
        .avatar.loser {
          filter: grayscale(80%);
        }
        
        .vs {
          font-size: 1.5rem;
          font-weight: bold;
          background-color: rgba(255,255,255,0.1);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stats {
          display: flex;
          gap: 10px;
          margin-top: 0.5rem;
        }
        
        .stat {
          font-size: 0.9rem;
        }
        
        .battle-result {
          background-color: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .battle-result h3 {
          margin-top: 0;
          color: gold;
          text-align: center;
        }
        
        .summary {
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .watermark {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 0.8rem;
          opacity: 0.7;
        }
        
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        
        button, .download-button {
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .generate-button {
          background-color: #4caf50;
          color: white;
        }
        
        .generate-button:hover {
          background-color: #45a049;
        }
        
        .generate-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .share-button.twitter {
          background-color: #1da1f2;
          color: white;
        }
        
        .share-button.general {
          background-color: #6c5ce7;
          color: white;
        }
        
        .download-button {
          background-color: #2d3436;
          color: white;
        }
        
        button:hover, .download-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default ShareableCard;