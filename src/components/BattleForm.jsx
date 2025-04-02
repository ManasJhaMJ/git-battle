// BattleForm.jsx
import { useState } from 'react';
import { fetchUserData } from '../services/githubService';
import { analyzeProfiles } from '../services/geminiService';

import player1 from '../assets/sprites/player1.gif';
import player2 from '../assets/sprites/player2.gif';

const BattleForm = ({ setBattleData, setLoading, loaderRef }) => {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username1 || !username2) {
      setError('Both usernames are required');
      return;
    }
    
    if (username1 === username2) {
      setError('Please enter different usernames');
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Scroll to loader after a small delay to ensure it's rendered
    setTimeout(() => {
      if (loaderRef && loaderRef.current) {
        loaderRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 10);
    
    try {
      // Fetch data from GitHub API
      const [user1Data, user2Data] = await Promise.all([
        fetchUserData(username1),
        fetchUserData(username2)
      ]);
      
      // Analyze with Gemini
      const analysis = await analyzeProfiles(user1Data, user2Data);
      
      // Set the battle results
      setBattleData({
        user1: user1Data,
        user2: user2Data,
        analysis: analysis
      });
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="battle-form">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="form-group">
            <img src={player1} />
            <label>First Warrior</label>
            <input
              type="text"
              placeholder="GitHub Username"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
            />
          </div>
          
          <div className="versus">VS</div>
          
          <div className="form-group">
            <img src={player2} />
            <label>Second Warrior</label>
            <input
              type="text"
              placeholder="GitHub Username"
              value={username2}
              onChange={(e) => setUsername2(e.target.value)}
            />
          </div>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" className="battle-button">
          <span>⚔️ BATTLE! ⚔️</span>
        </button>
      </form>
    </div>
  );
};

export default BattleForm;