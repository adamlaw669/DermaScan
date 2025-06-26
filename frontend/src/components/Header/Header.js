import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ navigateTo }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (page) => {
    navigateTo(page);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo" onClick={() => handleNavClick('main')}>
          DermaScan <span className="logo-ai">AI</span>
        </div>
        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <button onClick={() => handleNavClick('main')} className="nav-button">Main</button>
          <button onClick={() => handleNavClick('scanner')} className="nav-button">Scanner</button>
          <button onClick={() => handleNavClick('dermascan-ai')} className="nav-button">DermaScan AI</button>
          <button onClick={() => handleNavClick('history')} className="nav-button">History</button>
          <button onClick={() => handleNavClick('about')} className="nav-button">About</button>
        </nav>
        <button className="mobile-menu-icon" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
};

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Header;
