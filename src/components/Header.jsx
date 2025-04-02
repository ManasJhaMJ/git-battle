// Header.jsx
const Header = () => {
    return (
      <header className="header">
        <nav>
          <button className="active">Home</button>
          <button>About</button>
          <button>How It Works</button>
          <button>Services</button>
        </nav>
        
        <h1>GitHub Battle Arena</h1>
        <p>Enter two GitHub usernames and let the battle begin!</p>
      </header>
    );
  };
  
  export default Header;