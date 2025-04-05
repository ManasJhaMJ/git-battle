import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue, remove, get } from 'firebase/database';
import { useGitHubAuth } from './GitHubAuth';

// Function to generate a random 5-digit battle code
const generateBattleCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

const BattleCode = ({ onBattleStart }) => {
  const { user, githubUsername, loading } = useGitHubAuth();
  const [battleCode, setBattleCode] = useState('');
  const [joiningCode, setJoiningCode] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const db = getDatabase();

  // Clean up any active battle codes when component unmounts
  useEffect(() => {
    return () => {
      if (battleCode && user) {
        const battleRef = ref(db, `battles/codes/${battleCode}`);
        remove(battleRef).catch(err => console.error("Error removing battle code:", err));
      }
    };
  }, [battleCode, user, db]);

  // Generate a new battle code and store it in Firebase
  const createNewBattle = async () => {
    if (!user) {
      setError('You must be logged in to create a battle');
      return;
    }

    try {
      const newCode = generateBattleCode();
      const battleRef = ref(db, `battles/codes/${newCode}`);
      
      // Store battle code with creator info
      await set(battleRef, {
        creator: {
          uid: user.uid,
          username: githubUsername
        },
        createdAt: new Date().toISOString(),
        status: 'waiting'
      });
      
      setBattleCode(newCode);
      setWaiting(true);
      
      // Listen for opponent joining
      onValue(battleRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.opponent && data.status === 'ready') {
          // Both players are ready, start the battle
          onBattleStart({
            player1: {
              uid: data.creator.uid,
              username: data.creator.username
            },
            player2: {
              uid: data.opponent.uid,
              username: data.opponent.username
            },
            battleId: newCode
          });
          
          // Clean up the listener
          setTimeout(() => {
            remove(battleRef);
          }, 5000); // Remove after 5 seconds to avoid duplicates
        }
      });
      
    } catch (error) {
      console.error("Error creating battle:", error);
      setError('Failed to create battle');
    }
  };

  // Join an existing battle using a code
  const joinBattle = async () => {
    if (!user) {
      setError('You must be logged in to join a battle');
      return;
    }
  
    if (!joiningCode || joiningCode.length !== 5) {
      setError('Please enter a valid 5-digit battle code');
      return;
    }
  
    try {
      const battleRef = ref(db, `battles/codes/${joiningCode}`);
      
      // Get current battle data
      const snapshot = await get(battleRef);
      const battleData = snapshot.val();
      
      if (!battleData) {
        setError('Battle code not found');
        return;
      }
  
      if (battleData.creator.uid === user.uid) {
        setError('You cannot battle yourself');
        return;
      }
  
      if (battleData.status !== 'waiting') {
        setError('This battle is no longer available');
        return;
      }
  
      // Update battle with opponent info
      await set(battleRef, {
        ...battleData,
        opponent: {
          uid: user.uid,
          username: githubUsername
        },
        status: 'ready'
      });
  
      // 🔥 Add a listener so the joiner can also detect when battle starts
      onValue(battleRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.opponent && data.status === 'ready') {
          onBattleStart({
            player1: {
              uid: data.creator.uid,
              username: data.creator.username
            },
            player2: {
              uid: data.opponent.uid,
              username: data.opponent.username
            },
            battleId: joiningCode
          });
  
          // Optional cleanup
          setTimeout(() => {
            remove(battleRef);
          }, 5000);
        }
      });
  
    } catch (error) {
      console.error("Error joining battle:", error);
      setError('Failed to join battle');
    }
  };
  
  // Cancel a battle you created
  const cancelBattle = async () => {
    if (battleCode) {
      try {
        const battleRef = ref(db, `battles/codes/${battleCode}`);
        await remove(battleRef);
        setBattleCode('');
        setWaiting(false);
      } catch (error) {
        console.error("Error canceling battle:", error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="login-prompt">
        <p>You must be logged in to battle</p>
      </div>
    );
  }

  return (
    <div className="battle-code-container">
      {waiting ? (
        <div className="waiting-container">
          <h3>Waiting for opponent</h3>
          <div className="battle-code-display">
            <p>Send this code to your opponent:</p>
            <div className="code">{battleCode}</div>
          </div>
          <button className="cancel-button" onClick={cancelBattle}>
            Cancel Battle
          </button>
        </div>
      ) : (
        <div className="battle-options">
          <div className="create-battle">
            <h3>Create a Battle</h3>
            <button className="create-button" onClick={createNewBattle}>
              Generate Battle Code
            </button>
          </div>
          
          <div className="join-battle">
            <h3>Join a Battle</h3>
            <div className="code-input">
              <input
                type="text"
                maxLength="5"
                placeholder="Enter 5-digit code"
                value={joiningCode}
                onChange={(e) => setJoiningCode(e.target.value)}
              />
              <button onClick={joinBattle}>Join</button>
            </div>
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default BattleCode;