import React, { useState } from 'react';
import { getHomeRemedies, getSkincareProducts, getDermatologists } from '../../services/geminiService';
import { addScanToHistory } from '../../services/historyService';
import './ScannerPage.css';

// The InfoCard component is defined here for clarity and co-location.
const InfoCard = ({ title, data, error, isLoading }) => {
    if (isLoading) return <div className="loader">Finding {title}...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!data || data.length === 0) return null;

    const renderListItemContent = (item) => {
        if (title === "Home Remedies") {
            return (
                <>
                    <span className="item-name">{item.name}</span>
                    <p className="item-directions">{item.directions}</p>
                </>
            );
        }
        if (title === "Dermatologists") {
            return (
                <div className="doctor-info">
                    <div className="doctor-details">
                       <span className="item-name">{item.name}</span>
                       <span className="item-location">{item.location}</span>
                    </div>
                    {item.linkedin && (
                        <a href={item.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-link" title="View LinkedIn Profile" onClick={(e) => e.stopPropagation()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                    )}
                </div>
            );
        }
        return <span className="item-name">{item.name}</span>;
    };

    return (
        <div className="info-card">
            <h3 className="info-title">{title}</h3>
            <ul className="info-list">
                {data.map((item, index) => (
                    <li key={index} className="info-list-item">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            {renderListItemContent(item)}
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
  const [activeInfo, setActiveInfo] = useState(null);
  const [infoData, setInfoData] = useState([]);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setActiveInfo(null);
      setInfoData([]);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setActiveInfo(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://derma-scan-backend.onrender.com/predict', {
        method: 'POST', body: formData,
      });
      if (!response.ok) throw new Error('Failed to fetch prediction');
      const data = await response.json();
      if (data.label && typeof data.confidence === 'number') {
        setResult(data);
        await addScanToHistory(data, selectedFile);
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
    setInfoData([]);
    
    let response;
    switch(infoType) {
        case 'remedies':
            response = await getHomeRemedies(result.label);
            setInfoData(response.remedies || []);
            break;
        case 'products':
            response = await getSkincareProducts(result.label);
            setInfoData(response.products || []);
            break;
        case 'dermatologists':
            response = await getDermatologists(result.label);
            setInfoData(response.dermatologists || []);
            break;
        default:
            response = {error: "Invalid information type"};
    }
    if (response.error) setInfoError(response.error);
    setInfoLoading(false);
  };

  return (
    <div className="scanner-page-container">
      <h1 className="scanner-title stunning-title">DermaScan</h1>
      <p className="scanner-description">Upload an image of your skin to check for potential signs of skin cancer.</p>

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
          <p>Confidence: {result.confidence.toFixed(2)}%</p>
          <p className="disclaimer">Note: This is an AI-generated assessment and not a substitute for professional medical advice.</p>
        </div>
      )}
      
      {result && (
        <div className="post-analysis-actions">
            <button className="action-button" onClick={() => navigateTo('dermascan-ai', { condition: result.label })}>DermaScan AI</button>
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
