import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('wins'); // 'wins', 'winRate', 'battles'
  
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    
    // Listen for changes in user data
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setLeaderboardData([]);
        setLoading(false);
        return;
      }
      
      // Convert object to array and calculate win rate
      const userArray = Object.entries(data).map(([uid, userData]) => {
        const battles = userData.battles || { wins: 0, losses: 0, total: 0 };
        const winRate = battles.total > 0 
          ? ((battles.wins / battles.total) * 100).toFixed(1) 
          : '0.0';
        
        return {
          uid,
          username: userData.githubUsername,
          wins: battles.wins || 0,
          losses: battles.losses || 0,
          total: battles.total || 0,
          winRate: parseFloat(winRate)
        };
      });
      
      // Sort based on filter
      let sortedUsers;
      if (filter === 'wins') {
        sortedUsers = userArray.sort((a, b) => b.wins - a.wins);
      } else if (filter === 'winRate') {
        sortedUsers = userArray.sort((a, b) => {
          // First by win rate, then by total battles as tiebreaker
          if (b.winRate !== a.winRate) {
            return b.winRate - a.winRate;
          }
          return b.total - a.total;
        });
      } else {
        sortedUsers = userArray.sort((a, b) => b.total - a.total);
      }
      
      // Only show users with at least one battle
      const activeUsers = sortedUsers.filter(user => user.total > 0);
      
      setLeaderboardData(activeUsers);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [filter]);
  
  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }
  
  return (
    <div className="leaderboard-container">
      <h2>GitHub Battle Leaderboard</h2>
      
      <div className="filter-options">
        <button 
          className={filter === 'wins' ? 'active' : ''}
          onClick={() => setFilter('wins')}
        >
          Most Wins
        </button>
        <button 
          className={filter === 'winRate' ? 'active' : ''}
          onClick={() => setFilter('winRate')}
        >
          Best Win Rate
        </button>
        <button 
          className={filter === 'battles' ? 'active' : ''}
          onClick={() => setFilter('battles')}
        >
          Most Battles
        </button>
      </div>
      
      {leaderboardData.length === 0 ? (
        <div className="no-data">No battles recorded yet</div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Total Battles</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user, index) => (
              <tr key={user.uid} className={index < 3 ? `rank-${index + 1}` : ''}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.wins}</td>
                <td>{user.losses}</td>
                <td>{user.total}</td>
                <td>{user.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;