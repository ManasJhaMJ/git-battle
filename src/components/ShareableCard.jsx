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
        backgroundColor: '#1e1e2e', // Darker background
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
          
          <div className="battle-layout">
            <div className="competitors-section">
              <div className="battle-competitors">
                <div className="competitor left">
                  <img 
                    src={user1.avatar_url} 
                    alt={user1.login} 
                    className={`avatar ${analysis.winner === user1.login ? 'winner' : 'loser'}`}
                  />
                  <h3>{user1.login}</h3>
                  <div className="stats">
                    <div className="stat">⭐ {analysis.user1.totalStars}</div>
                    <div className="stat">🍴 {analysis.user1.totalForks}</div>
                    <div className="stat">💻 {analysis.user1.totalCommits || 0}</div>
                  </div>
                </div>
                
                <div className="vs">VS</div>
                
                <div className="competitor right">
                  <img 
                    src={user2.avatar_url} 
                    alt={user2.login} 
                    className={`avatar ${analysis.winner === user2.login ? 'winner' : 'loser'}`}
                  />
                  <h3>{user2.login}</h3>
                  <div className="stats">
                    <div className="stat">⭐ {analysis.user2.totalStars}</div>
                    <div className="stat">🍴 {analysis.user2.totalForks}</div>
                    <div className="stat">💻 {analysis.user2.totalCommits || 0}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="battle-result">
              <div className="winner-section">
                <div className="winner-name"><span>👑</span>{analysis.winner}</div>
              </div>
              
              <div className="summary">
                {analysis.summary.split('\n').slice(0, 3).map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
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
          max-width: 900px; /* Wider for landscape */
          margin-bottom: 1rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
        }
        
        .card-content {
          background-color: #1e1e2e; /* Darker background */
          color: #cdd6f4; /* Light text */
          padding: 1.5rem;
          position: relative;
          aspect-ratio: 16 / 9; /* Landscape aspect ratio */
        }
        
        .card-header {
          text-align: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(205, 214, 244, 0.2);
          padding-bottom: 0.5rem;
        }
        
        .card-header h2 {
          color: #cba6f7; /* Purple accent */
          margin: 0;
        }
        
        .battle-layout {
          display: flex;
          height: calc(100% - 80px);
        }
        
        .competitors-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .battle-competitors {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .competitor {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 45%;
        }
        
        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #6c7086; /* Muted border */
        }
        
        .avatar.winner {
          border-color: #f9e2af; /* Yellow gold */
          box-shadow: 0 0 15px rgba(249, 226, 175, 0.5);
        }
        
        .avatar.loser {
          filter: grayscale(70%);
        }
        
        .vs {
          font-size: 1.8rem;
          font-weight: bold;
          background-color: rgba(249, 226, 175, 0.15);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f9e2af; /* Yellow gold */
        }
        
        .competitor h3 {
          margin: 0.75rem 0 0.5rem;
          color: #89b4fa; /* Blue accent */
          font-size: 1.2rem;
        }
        
        .stats {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
        }
        
        .stat {
          font-size: 0.9rem;
          background-color: rgba(137, 180, 250, 0.1); /* Light blue bg */
          padding: 3px 10px;
          border-radius: 12px;
        }
        
        .battle-result {
          flex: 1;
          margin-left: 1.5rem;
          display: flex;
          flex-direction: column;
          background-color: rgba(203, 166, 247, 0.1); /* Light purple bg */
          padding: 1.2rem;
          border-radius: 12px;
          border-left: 3px solid #cba6f7; /* Purple border */
        }
        
        .winner-section {
          text-align: center;
          margin-bottom: 1rem;
        }
        
        
        .winner-name {
          font-size: 1.3rem;
          font-weight: bold;
          color: #f9e2af; /* Yellow gold */
          margin: 0;
        }

        .winner-name span {
          font-family: 'Segoe UI Emoji', sans-serif;
          font-size: 2rem;
        }
        
        .summary {
          font-size: 0.9rem;
          line-height: 1.4;
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 5px;
        }
        
        .summary p {
          margin: 0.5rem 0;
          color: #cdd6f4; /* Light text */
          text-align: justify;
        }
        
        .watermark {
          position: absolute;
          bottom: 10px;
          right: 10px;
          opacity: 0.9;
          color:rgb(255, 255, 255); /* Muted text */
        }
        
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-top: 1rem;
        }
        
        button, .download-button {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .generate-button {
          background-color: #a6e3a1; /* Green */
          color: #1e1e2e;
        }
        
        .generate-button:hover {
          background-color: #94e2cd;
        }
        
        .generate-button:disabled {
          background-color: #6c7086;
          cursor: not-allowed;
        }
        
        .share-button.twitter {
          background-color: #89b4fa; /* Blue */
          color: #1e1e2e;
        }
        
        .share-button.general {
          background-color: #cba6f7; /* Purple */
          color: #1e1e2e;
        }
        
        .download-button {
          background-color: #f9e2af; /* Yellow */
          color: #1e1e2e;
        }
        
        button:hover, .download-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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