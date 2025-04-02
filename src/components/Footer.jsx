import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: '#ecf0f1',
      padding: '2rem 0',
      marginTop: 'auto',
      width: '100%',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '2rem'
        }}>
          {/* Company info */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Company Name</h3>
            <p style={{ lineHeight: '1.6' }}>Creating amazing digital experiences since 2010. We're dedicated to innovation and excellence.</p>
          </div>
          
          {/* Quick links */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Home', 'About', 'Services', 'Blog', 'Contact'].map(item => (
                <li key={item} style={{ marginBottom: '0.5rem' }}>
                  <a href={`#${item.toLowerCase()}`} style={{
                    color: '#ecf0f1',
                    textDecoration: 'none',
                    transition: 'color 0.3s'
                  }} onMouseOver={(e) => e.target.style.color = '#3498db'} 
                     onMouseOut={(e) => e.target.style.color = '#ecf0f1'}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact info */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Contact Us</h3>
            <p style={{ marginBottom: '0.5rem' }}>123 React Street</p>
            <p style={{ marginBottom: '0.5rem' }}>Web City, JS 10101</p>
            <p style={{ marginBottom: '0.5rem' }}>Email: info@example.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        
        {/* Social media icons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map(social => (
            <a key={social} href={`#${social.toLowerCase()}`} style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#34495e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ecf0f1',
              textDecoration: 'none',
              transition: 'background-color 0.3s'
            }} onMouseOver={(e) => e.target.style.backgroundColor = '#3498db'} 
               onMouseOut={(e) => e.target.style.backgroundColor = '#34495e'}>
              {social[0]}
            </a>
          ))}
        </div>
        
        {/* Copyright */}
        <div style={{ 
          borderTop: '1px solid #34495e', 
          paddingTop: '1rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          <p>&copy; {new Date().getFullYear()} Company Name. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;