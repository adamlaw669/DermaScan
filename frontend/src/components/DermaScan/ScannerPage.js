import React, { useState } from 'react';
import './ScannerPage.css';

const ScannerPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // preview image
      setResult(null); // clear previous result on new upload
    }
  };

  // Handle analyze button click
  const handleAnalyzeClick = async () => {
    if (!selectedFile) {
      alert('Please upload an image first');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://derma-scan-backend.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const data = await response.json();

      // Safety check for keys in response with updated keys
      if (data.label && typeof data.confidence === 'number') {
        setResult(data);
      } else {
        alert('Unexpected response from server.');
        setResult(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get prediction. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scanner-page-container">
      <h1 className="scanner-title stunning-title">DermaScan</h1>
      <p className="scanner-description">Upload images of your skin to check for potential signs of skin cancer.</p>

      <div className="upload-section">
        <input
          type="file"
          id="skin-image-upload"
          accept="image/*"
          className="image-upload-input"
          onChange={handleFileChange}
        />
        <label htmlFor="skin-image-upload" className="upload-button cta-button">
          Upload Image
        </label>
      </div>

      <div className="image-preview">
        {previewUrl && <img src={previewUrl} alt="Uploaded preview" width="300" />}
      </div>

      <button className="analyze-button cta-button" onClick={handleAnalyzeClick} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Image'}
      </button>

      <div className="results-section">
        {result && (
          <div>
            <h3>Prediction: {result.label}</h3>
            <p>Confidence: {result.confidence.toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
