// App.jsx
import { useState, useRef } from 'react';
import Header from './components/Header';
import BattleForm from './components/BattleForm';
import BattleResults from './components/BattleResults';
import Footer from './components/Footer';
import './styles/App.css';
import './styles/BattleTheme.css';
import loader from './assets/sprites/loader.gif'

function App() {
  const [battleData, setBattleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null); // Create a ref for the loader
  
  return (
    <div className="app">
      <Header />
      {!battleData && <BattleForm 
        setBattleData={setBattleData} 
        setLoading={setLoading} 
        loaderRef={loaderRef} // Pass the ref to BattleForm
      />}
      {loading && <div className="loading-container"><div className="loading" id='loader' ref={loaderRef}>
         <img src={loader} alt="" />
          <p>Loading...</p>
        </div></div>}
      {battleData && <BattleResults battleData={battleData} resetBattle={() => setBattleData(null)} />}
      <Footer />
    </div>
  );
}

export default App;