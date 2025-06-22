import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import MainPage from './components/MainPage/MainPage';
import AboutPage from './components/AboutPage/AboutPage';
import ScannerPage from './components/DermaScan/ScannerPage';

function App() {
  const [currentPage, setCurrentPage] = useState('main');

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="App">
      <Header navigateTo={navigateTo} />
      <main className="content">
        {currentPage === 'main' && <MainPage navigateTo={navigateTo} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'scanner' && <ScannerPage />}
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 DermaScan AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
