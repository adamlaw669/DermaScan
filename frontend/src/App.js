import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import MainPage from './components/MainPage/MainPage';
import AboutPage from './components/AboutPage/AboutPage';
import ScannerPage from './components/DermaScan/ScannerPage';
import AIDoctorPage from './components/AIDoctorPage/AIDoctorPage';
import HistoryPage from './components/HistoryPage/HistoryPage';

function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [diagnosedCondition, setDiagnosedCondition] = useState(null);

  const navigateTo = (page, data) => {
    if (page === 'dermascan-ai') {
      if (data?.condition) {
        setDiagnosedCondition(data.condition);
      } else {
        setDiagnosedCondition(null);
      }
    }
    
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
      switch (currentPage) {
          case 'main':
              return <MainPage navigateTo={navigateTo} />;
          case 'about':
              return <AboutPage />;
          case 'scanner':
              return <ScannerPage navigateTo={navigateTo} />;
          case 'dermascan-ai':
              return <AIDoctorPage diagnosedCondition={diagnosedCondition || "your condition"} />;
          case 'history':
              return <HistoryPage />;
          default:
              return <MainPage navigateTo={navigateTo} />;
      }
  }

  return (
    <div className="App">
      <Header navigateTo={navigateTo} />
      <main className="content">
        {renderPage()}
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 DermaScan AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
