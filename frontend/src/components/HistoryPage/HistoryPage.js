import React, { useState, useEffect } from 'react';
import { getAllHistory } from '../../services/historyService';
import './HistoryPage.css';

const HistoryPage = () => {
  const [history, setHistory] = useState({ scans: [], chats: {} });

  useEffect(() => {
    setHistory(getAllHistory());
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="history-page-container">
      <h1 className="stunning-title history-title">Your History</h1>

      <div className="history-section">
        <h2 className="history-subtitle">Past Scan Reports</h2>
        {history.scans.length > 0 ? (
          <div className="scans-grid">
            {history.scans.map(scan => (
              <div key={scan.id} className="scan-card">
                <img src={scan.image} alt={`Scan from ${formatDate(scan.date)}`} className="scan-image" />
                <div className="scan-details">
                  <p><strong>Diagnosis:</strong> {scan.diagnosis}</p>
                  <p><strong>Confidence:</strong> {scan.confidence.toFixed(2)}%</p>
                  <p className="scan-date">{formatDate(scan.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no saved scan reports.</p>
        )}
      </div>

      <div className="history-section">
        <h2 className="history-subtitle">Past Chat Logs</h2>
        {Object.keys(history.chats).length > 0 ? (
          <div className="chats-container">
            {Object.entries(history.chats).map(([condition, chatData]) => (
              <div key={condition} className="chat-log-card">
                <h3>Chat about: {condition}</h3>
                <div className="chat-log-messages">
                    {chatData.log.map((msg, index) => (
                        <div key={index} className={`log-message ${msg.role}`}>
                           <p>{msg.text}</p>
                        </div>
                    ))}
                </div>
                <p className="chat-date">Last updated: {formatDate(chatData.lastUpdated)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no saved chat conversations.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
