import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GitHubAuth, { useGitHubAuth } from './components/GitHubAuth';
import AuthenticatedBattle from './components/AuthenticatedBattle';
import Leaderboard from './components/Leaderboard';

// Simple Navbar component with auth status
const Navbar = () => {
  const { user, githubUsername, login, logout } = useGitHubAuth();
  
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">GitHub Battle</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/battle">Battle</Link>
        <Link to="/leaderboard">Leaderboard</Link>
      </div>
      <div className="auth-section">
        {user ? (
          <div className="user-info">
            <span className="username">{githubUsername}</span>
            <button className="logout-button" onClick={logout}>Logout</button>
          </div>
        ) : (
          <button className="login-button" onClick={login}>
            Login with GitHub
          </button>
        )}
      </div>
    </nav>
  );
};

// Home page component
const Home = () => {
  const { user } = useGitHubAuth();
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>GitHub Profile Battle</h1>
        <p>Challenge other developers and see whose GitHub profile reigns supreme!</p>
        
        {user ? (
          <Link to="/battle" className="cta-button">
            Start Battle
          </Link>
        ) : (
          <div className="login-prompt">
            <p>Login with GitHub to start battling</p>
          </div>
        )}
      </div>
      
      <div className="features-section">
        <div className="feature">
          <h3>AI Analysis</h3>
          <p>Advanced AI analyzes your GitHub profile comparing repos, languages, and contribution history</p>
        </div>
        <div className="feature">
          <h3>Real-time Battles</h3>
          <p>Challenge friends with a simple 5-digit code and battle in real-time</p>
        </div>
        <div className="feature">
          <h3>Global Leaderboard</h3>
          <p>Track your wins and see how you rank against other developers</p>
        </div>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <GitHubAuth>
        <div className="app-container">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/battle" element={<AuthenticatedBattle />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </main>
          
          <footer className="footer">
            <p>© {new Date().getFullYear()} GitHub Battle. All rights reserved.</p>
          </footer>
        </div>
      </GitHubAuth>
    </Router>
  );
};

export default App;