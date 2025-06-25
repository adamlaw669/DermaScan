import React, { useState } from 'react';
import { getHomeRemedies, getSkincareProducts, getDermatologists } from '../../services/geminiService';
import './ScannerPage.css';

const InfoCard = ({ title, data, error, isLoading }) => {
    if (isLoading) return <div className="loader">Finding {title}...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!data) return null;

    return (
        <div className="info-card">
            <h3 className="info-title">{title}</h3>
            <ul className="info-list">
                {data.map((item, index) => (
                    <li key={index} className="info-list-item">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <span className="item-name">{item.name}</span>
                            {item.location && <span className="item-location">{item.location}</span>}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const ScannerPage = ({ navigateTo }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null); // 'remedies', 'products', 'dermatologists'
  const [infoData, setInfoData] = useState({});
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setActiveInfo(null);
      setInfoData({});
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      alert('Please upload an image first');
      return;
    }
    setLoading(true);
    setResult(null);
    setActiveInfo(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://derma-scan-backend.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to fetch prediction');
      const data = await response.json();
      if (data.label && typeof data.confidence === 'number') {
        setResult(data);
      } else {
        alert('Unexpected response from server.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGetInfo = async (infoType) => {
    if (!result?.label) return;

    setActiveInfo(infoType);
    setInfoLoading(true);
    setInfoError(null);
    setInfoData({});
    
    let response;
    switch(infoType) {
        case 'remedies':
            response = await getHomeRemedies(result.label);
            setInfoData(response.remedies);
            break;
        case 'products':
            response = await getSkincareProducts(result.label);
            setInfoData(response.products);
            break;
        case 'dermatologists':
            response = await getDermatologists(result.label);
            setInfoData(response.dermatologists);
            break;
        default:
            response = {error: "Invalid information type"};
    }

    if (response.error) {
        setInfoError(response.error);
    }

    setInfoLoading(false);
  };


  return (
    <div className="scanner-page-container">
      <h1 className="scanner-title stunning-title">DermaScan</h1>
      <p className="scanner-description">Upload images of your skin to check for potential signs of skin cancer.</p>

      <div className="upload-section">
        <input type="file" id="skin-image-upload" accept="image/*" className="image-upload-input" onChange={handleFileChange} />
        <label htmlFor="skin-image-upload" className="upload-button cta-button">
          {selectedFile ? 'Change Image' : 'Upload Image'}
        </label>
      </div>

      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Uploaded preview" />
        </div>
      )}

      {selectedFile && !result && (
        <button className="analyze-button cta-button" onClick={handleAnalyzeClick} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      )}

      {result && (
        <div className="results-section">
          <h3>Prediction: {result.label}</h3>
          <p className="confidence-rate">Confidence: {result.confidence.toFixed(2)}%</p>
          <p className="disclaimer">Note: This is an AI-generated assessment and not a substitute for professional medical advice.</p>
        </div>
      )}
      
      {result && (
        <div className="post-analysis-actions">
            <button className="action-button" onClick={() => navigateTo('ai-doctor', { condition: result.label })}>Ask AI Doctor</button>
            <button className="action-button" onClick={() => handleGetInfo('remedies')}>Get Home Remedies</button>
            <button className="action-button" onClick={() => handleGetInfo('products')}>Get Skincare Products</button>
            <button className="action-button" onClick={() => handleGetInfo('dermatologists')}>Contact Dermatologists</button>
        </div>
      )}
      
      <div className="info-display-section">
        {activeInfo === 'remedies' && <InfoCard title="Home Remedies" data={infoData} error={infoError} isLoading={infoLoading} />}
        {activeInfo === 'products' && <InfoCard title="Skincare Products" data={infoData} error={infoError} isLoading={infoLoading} />}
        {activeInfo === 'dermatologists' && <InfoCard title="Dermatologists" data={infoData} error={infoError} isLoading={infoLoading} />}
      </div>
    </div>
  );
};

export default ScannerPage;
