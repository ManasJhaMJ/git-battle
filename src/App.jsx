// App.jsx
import { useState } from 'react';
import Header from './components/Header';
import BattleForm from './components/BattleForm';
import BattleResults from './components/BattleResults';
import './styles/App.css';
import './styles/BattleTheme.css';

function App() {
  const [battleData, setBattleData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="app">
      <Header />
      {!battleData && <BattleForm setBattleData={setBattleData} setLoading={setLoading} />}
      {loading && <div className="loading-container"><div className="loading-spinner"></div></div>}
      {battleData && <BattleResults battleData={battleData} resetBattle={() => setBattleData(null)} />}
    </div>
  );
}

export default App;