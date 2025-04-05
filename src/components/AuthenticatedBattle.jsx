import React, { useState, useEffect } from 'react';
import { getDatabase, ref, update, get } from 'firebase/database';
import { useGitHubAuth } from './GitHubAuth';
import BattleCode from './BattleCode';
import BattleResults from './BattleResults';
import { fetchUserData } from '../services/githubService';
import { analyzeProfiles } from '../services/geminiService';
import '../styles/AuthenticatedBattle.css';
import loadingImg from '../assets/sprites/loader.gif';

const AuthenticatedBattle = () => {
  const { user, githubUsername, loading, login } = useGitHubAuth();
  const [battleState, setBattleState] = useState('idle'); // idle, setup, loading, results
  const [battleData, setBattleData] = useState(null);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  
  // Handle battle initiation
  const handleBattleStart = async (battleInfo) => {
    try {
      setBattleState('loading');
      setBattleData(battleInfo);
      
      // Fetch GitHub data for both users
      const user1Data = await fetchUserData(battleInfo.player1.username);
      const user2Data = await fetchUserData(battleInfo.player2.username);
      
      // Analyze profiles using Gemini
      const analysis = await analyzeProfiles(user1Data, user2Data);
      
      // Store the battle result in the database
      await storeBattleResult(battleInfo, analysis);
      
      // Prepare result data for display
      setResultData({
        user1: user1Data,
        user2: user2Data,
        analysis
      });
      
      setBattleState('results');
    } catch (error) {
      console.error("Error in battle:", error);
      setError(`Battle failed: ${error.message}`);
      setBattleState('idle');
    }
  };
  
  // Store battle result in Firebase
  const storeBattleResult = async (battleInfo, analysis) => {
    const db = getDatabase();
    const battleId = battleInfo.battleId || `battle_${Date.now()}`;
    
    // Update battle history for both players
    const player1Ref = ref(db, `users/${battleInfo.player1.uid}/battles`);
    const player2Ref = ref(db, `users/${battleInfo.player2.uid}/battles`);
    
    // Get current battle stats
    const p1Snapshot = await get(player1Ref);
    const p2Snapshot = await get(player2Ref);
    
    const p1Stats = p1Snapshot.val() || { wins: 0, losses: 0, total: 0 };
    const p2Stats = p2Snapshot.val() || { wins: 0, losses: 0, total: 0 };
    
    // Update stats based on winner
    const isPlayer1Winner = analysis.winner === battleInfo.player1.username;
    
    await update(player1Ref, {
      wins: p1Stats.wins + (isPlayer1Winner ? 1 : 0),
      losses: p1Stats.losses + (isPlayer1Winner ? 0 : 1),
      total: p1Stats.total + 1
    });
    
    await update(player2Ref, {
      wins: p2Stats.wins + (isPlayer1Winner ? 0 : 1),
      losses: p2Stats.losses + (isPlayer1Winner ? 1 : 0),
      total: p2Stats.total + 1
    });
    
    // Store battle record
    const battleRef = ref(db, `battles/history/${battleId}`);
    await update(battleRef, {
      player1: battleInfo.player1,
      player2: battleInfo.player2,
      winner: analysis.winner,
      summary: analysis.summary,
      timestamp: new Date().toISOString()
    });
  };
  
  // Reset battle state
  const resetBattle = () => {
    setBattleState('idle');
    setBattleData(null);
    setResultData(null);
    setError(null);
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return (
      <div className="auth-container">
        <h2>GitHub Profile Battle</h2>
        <p>Sign in with GitHub to battle other developers</p>
        <button className="github-auth-button" onClick={login}>
          Login with GitHub
        </button>
      </div>
    );
  }
  
  return (
    <div className="authenticated-battle">
      {battleState === 'idle' && (
        <div className="battle-setup">
          <h2 className='retero-title'>Ready to Battle, {githubUsername}?</h2>
          <p className='retro-desc'>Create a battle code to challenge another developer or join an existing battle</p>
          <BattleCode onBattleStart={handleBattleStart} />
        </div>
      )}
      
      {battleState === 'loading' && (
        <div className="battle-loading">
          <h2>Analyzing GitHub Profiles</h2>
          <div className="loading-animation">
            <div className="spinner"></div>
          </div>
          <img src={loadingImg} alt="Loading" className="loading-image" />
          <p>Comparing repositories, languages, and contributions...</p>
        </div>
      )}
      
      {battleState === 'results' && resultData && (
        <BattleResults 
          battleData={resultData} 
          resetBattle={resetBattle} 
        />
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AuthenticatedBattle;