import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Welcome to KG Hospital AI Assistant! How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [userRole, setUserRole] = useState('patient');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Add user message
      setMessages(prev => [...prev, {
        type: 'user',
        content: inputMessage
      }]);
      
      setInputMessage('');
      setIsTyping(true);
      
      // Simulate bot response after 1 second
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Thank you for your question. I am processing your request and will provide you with accurate information about KG Hospital services.'
        }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const quickActions = {
    patient: [
      'Find a Doctor',
      'Book Appointment',
      'Emergency Contact',
      'Treatment Information',
      'Hospital Departments'
    ],
    visitor: [
      'Visiting Hours',
      'Hospital Location',
      'Parking Information',
      'Amenities',
      'Directions'
    ],
    staff: [
      'Patient Inquiry',
      'Department Info',
      'Emergency Protocols',
      'Transfer to Human'
    ],
    admin: [
      'Analytics Dashboard',
      'System Status',
      'Content Updates',
      'User Reports'
    ]
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-content">
          <div className="hospital-logo">
            <div className="logo-icon">KG</div>
            <div className="logo-text">
              <h3>Hospital AI Assistant</h3>
              <p>24/7 Healthcare Support</p>
            </div>
          </div>
          <div className="user-role-selector">
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="role-dropdown"
            >
              <option value="patient">Patient</option>
              <option value="visitor">Visitor</option>
              <option value="staff">Hospital Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot typing">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>Quick Actions for {userRole.charAt(0).toUpperCase() + userRole.slice(1)}s:</h4>
        <div className="action-buttons">
          {quickActions[userRole].map((action, index) => (
            <button 
              key={index} 
              className="action-btn"
              onClick={() => setInputMessage(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input">
        <div className="input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
        <div className="input-features">
          <button className="feature-btn">🎤 Voice</button>
          <button className="feature-btn">📎 Attach</button>
          <button className="feature-btn">🚨 Emergency</button>
        </div>
      </div>

      {/* Footer */}
      <div className="chatbot-footer">
        <p>KG Hospital - Advanced Healthcare Since 1974</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact Us</a>
        </div>
      </div>
    </div>
  );
};

export default App;
