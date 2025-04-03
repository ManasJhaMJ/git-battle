import { Analytics } from "@vercel/analytics/react";
import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import BattleForm from './components/BattleForm';
import BattleResults from './components/BattleResults';
import Footer from './components/Footer';
import './styles/App.css';
import './styles/BattleTheme.css';
import loader from './assets/sprites/loader.gif'
import BattleBg from "./components/battleBg";

function App() {
  const [battleData, setBattleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);
  
  useEffect(() => {
    if (battleData) {
      window.scrollTo(0, 0);
    }
  }, [battleData]);
  
  return (
    <div className="app">
      <BattleBg />
      <Header />
      {!battleData && <BattleForm 
        setBattleData={setBattleData} 
        setLoading={setLoading} 
        loaderRef={loaderRef}
      />}
      {loading && <div className="loading-container"><div className="loading" id='loader' ref={loaderRef}>
         <img src={loader} alt="" />
          <p>Loading...</p>
        </div></div>}
      {battleData && <BattleResults battleData={battleData} resetBattle={() => setBattleData(null)} />}
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;