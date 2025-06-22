import React from 'react';
import './MainPage.css';

const MainPage = ({ navigateTo }) => {
  return (
    <div className="main-page-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="main-title stunning-title">Welcome to DermaScan <span className="highlight">AI</span></h1>
          <p className="subtitle">Revolutionizing skin health analysis with the power of Artificial Intelligence.</p>
          <button className="cta-button hero-cta" onClick={() => navigateTo('scanner')}>Get Scanned</button>
        </div>
        <div className="hero-image-container">
          <div className="hero-placeholder-image">
            <p>AI Skin Analysis Visual</p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title stunning-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Intelligent Analysis</h3>
            <p>Leverage advanced AI algorithms for precise skin condition detection.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💨</div>
            <h3>Fast & Accurate</h3>
            <p>Get quick and reliable insights into your skin's health status.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure & Private</h3>
            <p>Your data is handled with the utmost confidentiality and security.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2 className="section-title stunning-title">How DermaScan AI Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <h4>1. Upload Image</h4>
            <p>Securely upload a clear image of the skin area.</p>
          </div>
          <div className="step-card">
            <h4>2. AI Processing</h4>
            <p>Our AI analyzes the image against a vast database.</p>
          </div>
          <div className="step-card">
            <h4>3. Get Insights</h4>
            <p>Receive a preliminary report and recommendations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
