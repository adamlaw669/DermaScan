import React, { useState, useRef, useEffect } from 'react';
import { getHomeRemedies, getSkincareProducts, getDermatologists } from '../../services/geminiService';
import { addScanToHistory } from '../../services/historyService';
import './ScannerPage.css';

// The InfoCard component remains the same as your previous version.
const InfoCard = ({ title, data, error, isLoading }) => {
    if (isLoading) return <div className="loader">Finding {title}...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!data || data.length === 0) return null;

    const renderListItemContent = (item) => {
        if (title === "Home Remedies") return (<><span className="item-name">{item.name}</span><p className="item-directions">{item.directions}</p></>);
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
  const [images, setImages] = useState([]); // Now an array to hold up to 4 images
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null);
  const [infoData, setInfoData] = useState([]);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState(null);
  
  // State and refs for camera modal
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const MAX_IMAGES = 4;

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map(file => ({
        file: file,
        previewUrl: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- CAMERA LOGIC ---
  const openCamera = async () => {
    if (images.length >= MAX_IMAGES) {
        alert(`You can only upload a maximum of ${MAX_IMAGES} images.`);
        return;
    }
    setIsCameraOpen(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure you have given permission.");
        setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      setIsCameraOpen(false);
  };

  const handleCapture = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          
          canvas.toBlob((blob) => {
              const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
              const newImage = { file, previewUrl: URL.createObjectURL(file) };
              setImages(prev => [...prev, newImage].slice(0, MAX_IMAGES));
              closeCamera();
          }, 'image/jpeg');
      }
  };
  
  // --- ANALYSIS LOGIC ---
  const handleAnalyzeClick = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setResult(null);
    setActiveInfo(null);

    const formData = new FormData();
    images.forEach(image => {
        formData.append('files', image.file);
    });

    try {
      const response = await fetch('https://derma-scan-backend.onrender.com/predict', {
        method: 'POST', body: formData,
      });
      if (!response.ok) throw new Error('Failed to fetch prediction');
      const data = await response.json();
      if (data.label && typeof data.confidence === 'number') {
        setResult(data);
        await addScanToHistory(data, images.map(img => img.file));
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
        case 'remedies': response = await getHomeRemedies(result.label); setInfoData(response.remedies || []); break;
        case 'products': response = await getSkincareProducts(result.label); setInfoData(response.products || []); break;
        case 'dermatologists': response = await getDermatologists(result.label); setInfoData(response.dermatologists || []); break;
        default: response = {error: "Invalid information type"};
    }
    if (response.error) setInfoError(response.error);
    setInfoLoading(false);
  };

  return (
    <>
      <div className="scanner-page-container new-ui">
        <div className="scanner-header">
          <h1 className="scanner-title stunning-title">AI Skin Analysis</h1>
          <p className="scanner-description">Upload up to 4 clear images of a skin lesion for a preliminary AI-powered assessment.</p>
        </div>

        <div className="scanner-main-content">
          <div className="scanner-left-panel">
            <h3 className="upload-section-title">Image Upload</h3>
            <div className="upload-grid">
              {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                <div key={index} className="image-slot">
                  {images[index] ? (
                    <div className="image-preview-container">
                      <img src={images[index].previewUrl} alt={`preview ${index + 1}`} className="image-preview-new" />
                      <button onClick={() => removeImage(index)} className="remove-image-btn" title="Remove Image">
                        &times;
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="skin-image-upload" className="upload-slot-prompt">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" y1="5" x2="22" y2="5"/><line x1="19" y1="2" x2="19" y2="8"/><path d="M15 13h-2v4h-2v-4H9v-2h2V9h2v2h2v2z"/></svg>
                        <span>Add Image</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
            <input type="file" id="skin-image-upload" accept="image/*" multiple className="image-upload-input" onChange={handleFileChange} disabled={images.length >= MAX_IMAGES} />

            <div className="upload-buttons-container">
              <button onClick={openCamera} className="camera-button" disabled={images.length >= MAX_IMAGES}>
                Use Camera
              </button>
              {images.length > 0 && !result && (
                <button className="analyze-button cta-button" onClick={handleAnalyzeClick} disabled={loading}>
                  {loading ? 'Analyzing...' : `Analyze ${images.length} Image(s)`}
                </button>
              )}
            </div>
          </div>

          <div className="scanner-right-panel">
            {result ? (
              <>
                <div className="results-section">
                  <h3 className="results-title">Analysis Report</h3>
                  <p className="results-diagnosis">Prediction: <strong>{result.label}</strong></p>
                  <div className="confidence-bar">
                      <div className="confidence-fill" style={{width: `${result.confidence}%`}}>
                          {result.confidence.toFixed(1)}% Confidence
                      </div>
                  </div>
                  <p className="disclaimer">Note: This is an AI-generated assessment and not a substitute for professional medical advice.</p>
                </div>

                <div className="post-analysis-actions">
                    <h4 className="next-steps-title">Next Steps</h4>
                    <div className="action-buttons-grid">
                      <button className="action-button" onClick={() => navigateTo('dermascan-ai', { condition: result.label })}>Ask DermaScan AI</button>
                      <button className="action-button" onClick={() => handleGetInfo('remedies')}>Get Home Remedies</button>
                      <button className="action-button" onClick={() => handleGetInfo('products')}>Get Skincare Products</button>
                      <button className="action-button" onClick={() => handleGetInfo('dermatologists')}>Contact Dermatologists</button>
                    </div>
                </div>
              </>
            ) : (
              <div className="placeholder-right-panel">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
                  <h3>Your Report Will Appear Here</h3>
                  <p>Upload an image and click "Analyze" to see the AI-powered report and recommendations.</p>
              </div>
            )}
            
            <div className="info-display-section">
              {activeInfo === 'remedies' && <InfoCard title="Home Remedies" data={infoData} error={infoError} isLoading={infoLoading} />}
              {activeInfo === 'products' && <InfoCard title="Skincare Products" data={infoData} error={infoError} isLoading={infoLoading} />}
              {activeInfo === 'dermatologists' && <InfoCard title="Dermatologists" data={infoData} error={infoError} isLoading={infoLoading} />}
            </div>
          </div>
        </div>
      </div>

      {isCameraOpen && (
          <div className="camera-modal-overlay">
              <div className="camera-modal-content">
                  <video ref={videoRef} autoPlay playsInline className="camera-video-feed"></video>
                  <canvas ref={canvasRef} style={{display: 'none'}}></canvas>
                  <div className="camera-controls">
                      <button onClick={handleCapture} className="capture-btn">Capture</button>
                      <button onClick={closeCamera} className="close-camera-btn">Close</button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default ScannerPage;
