import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page-container">
      <div className="about-hero">
        <h1 className="about-title stunning-title">About DermaScan <span className="highlight">AI</span></h1>
        <p className="about-subtitle">Pioneering the future of dermatological insights through intelligent technology.</p>
      </div>

      <section className="about-content-section mission-vision">
        <div className="content-block">
          <h2 className="section-subheader">Our Mission</h2>
          <p>
            To empower individuals and healthcare professionals with accessible, accurate, and
            AI-driven skin health analysis, fostering early detection and proactive skin care for a healthier tomorrow.
            We believe that technology can bridge gaps in dermatological access and provide valuable preliminary insights.
          </p>
        </div>
        <div className="content-block">
          <h2 className="section-subheader">Our Vision</h2>
          <p>
            To be the leading global platform for AI-powered dermatological screening, recognized for
            our commitment to innovation, user privacy, and the continuous advancement of skin health awareness and management.
            We envision a world where skin concerns are identified sooner and managed more effectively.
          </p>
        </div>
      </section>

      <section className="about-content-section team-section">
        <h2 className="section-subheader">The Technology</h2>
         <p className="technology-intro">
            DermaScan AI is built upon cutting-edge artificial intelligence and machine learning models.
            Our system is trained on a diverse and extensive dataset of dermatological images,
            allowing it to identify patterns and characteristics associated with various skin conditions.
            We prioritize accuracy, ethical AI practices, and continuous model improvement based on the latest research.
            <br/><br/>
            <strong>Note:</strong> DermaScan AI is intended for informational purposes and preliminary assessment. It is not a substitute for professional medical diagnosis or treatment by a qualified dermatologist.
        </p>
        <div className="tech-highlights">
            <div className="tech-highlight-item">
                <span className="tech-icon">🧠</span> Deep Learning Models
            </div>
            <div className="tech-highlight-item">
                <span className="tech-icon">🖼️</span> Advanced Image Processing
            </div>
            <div className="tech-highlight-item">
                <span className="tech-icon">🔒</span> Secure Data Handling
            </div>
             <div className="tech-highlight-item">
                <span className="tech-icon">📈</span> Continuous Improvement
            </div>
        </div>
      </section>

      <section className="about-content-section contact-cta">
        <h2 className="section-subheader">Get In Touch</h2>
        <p>
          We are passionate about skin health and technology. If you have questions, partnership inquiries, or feedback,
          we'd love to hear from you.
        </p>
        <button className="cta-button about-cta">Contact Us</button>
      </section>
    </div>
  );
};

export default AboutPage;
