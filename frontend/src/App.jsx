// App.js - Complete React Frontend with Backend Integration

import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userRole, setUserRole] = useState('patient');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [systemStatus, setSystemStatus] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyAuth(token);
    } else {
      setShowLogin(true);
      setConnectionStatus('disconnected');
    }
    // Test backend connection
    testBackendConnection();
  }, []);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (response.ok) {
        setConnectionStatus('connected');
        const data = await response.json();
        console.log('✅ Backend connected:', data.message);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setConnectionStatus('error');
    }
  };

  // API Functions with error handling
  const api = {
    login: async (credentials) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Login failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    verifyAuth: async (token) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Token verification failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Auth verification error:', error);
        throw error;
      }
    },

    sendMessage: async (message, userRole, token) => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            message: message, 
            user_role: userRole 
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to send message');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Send message error:', error);
        throw error;
      }
    },

    uploadDocument: async (file, token) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/admin/upload-document`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Upload failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },

    getDocuments: async (token) => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/documents`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch documents');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Get documents error:', error);
        throw error;
      }
    },

    reloadDocuments: async (token) => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/reload-documents`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to reload documents');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Reload documents error:', error);
        throw error;
      }
    },

    getSystemStatus: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/system/status`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch system status');
        }
        
        return await response.json();
      } catch (error) {
        console.error('System status error:', error);
        throw error;
      }
    }
  };

  const verifyAuth = async (token) => {
    try {
      setLoading(true);
      const userData = await api.verifyAuth(token);
      setUser(userData);
      setUserRole(userData.role);
      setIsAuthenticated(true);
      setShowLogin(false);
      setConnectionStatus('authenticated');
      
      // Welcome message after login
      setMessages([{
        type: 'bot',
        content: `Welcome ${userData.username}! You are logged in as ${userData.role}. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Load admin data if admin
      if (userData.role === 'admin') {
        await loadDocuments(token);
        await loadSystemStatus();
      }
      
      setAuthError('');
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
      setShowLogin(true);
      setConnectionStatus('disconnected');
      setAuthError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    
    try {
      const response = await api.login(loginCredentials);
      
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        await verifyAuth(response.access_token);
        
        // Clear login form
        setLoginCredentials({ username: '', password: '' });
      } else {
        setAuthError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
    setShowLogin(true);
    setShowAdminPanel(false);
    setDocuments([]);
    setSystemStatus({});
    setConnectionStatus('disconnected');
    setMessages([{
      type: 'bot',
      content: 'You have been logged out. Please login to continue using KG Hospital AI Assistant.',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isAuthenticated || isTyping) return;

    const token = localStorage.getItem('access_token');
    
    // Add user message
    const userMsg = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    
    try {
      const response = await api.sendMessage(currentInput, userRole, token);
      
      const botMsg = {
        type: 'bot',
        content: response.response || 'I received your message but couldn\'t generate a proper response.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
      
      if (error.message.includes('401')) {
        errorMessage = 'Your session has expired. Please login again.';
        handleLogout();
      } else if (error.message.includes('403')) {
        errorMessage = 'You don\'t have permission to perform this action.';
      }
      
      const errorMsg = {
        type: 'bot',
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const loadDocuments = async (token) => {
    try {
      const response = await api.getDocuments(token);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to load system status:', error);
      setSystemStatus({ error: 'Failed to load status' });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || uploading) return;
    
    setUploading(true);
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await api.uploadDocument(uploadFile, token);
      
      // Show success message
      const successMsg = {
        type: 'bot',
        content: `✅ Document "${uploadFile.name}" uploaded successfully! ${response.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, successMsg]);
      
      // Reset file input
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload documents and status
      await loadDocuments(token);
      await loadSystemStatus();
      
    } catch (error) {
      console.error('Upload error:', error);
      
      const errorMsg = {
        type: 'bot',
        content: `❌ Failed to upload "${uploadFile.name}": ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setUploading(false);
    }
  };

  const handleReloadDocuments = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    
    try {
      const response = await api.reloadDocuments(token);
      
      const successMsg = {
        type: 'bot',
        content: `🔄 Documents reloaded successfully! ${response.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, successMsg]);
      
      await loadDocuments(token);
      await loadSystemStatus();
      
    } catch (error) {
      console.error('Reload error:', error);
      
      const errorMsg = {
        type: 'bot',
        content: `❌ Failed to reload documents: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = {
    patient: [
      'Find a Doctor',
      'Book Appointment', 
      'Emergency Contact',
      'Treatment Information',
      'Hospital Departments',
      'Visiting Hours',
      'Medical Services'
    ],
    visitor: [
      'Visiting Hours',
      'Hospital Location',
      'Parking Information',
      'Amenities',
      'Directions',
      'Emergency Contact',
      'Hospital Facilities'
    ],
    staff: [
      'Patient Inquiry',
      'Department Info',
      'Emergency Protocols',
      'Transfer to Human',
      'Hospital Policies',
      'Staff Directory'
    ],
    admin: [
      'System Status',
      'Upload Documents',
      'Reload System',
      'Analytics Dashboard',
      'Document Management',
      'User Reports'
    ]
  };

  const handleQuickAction = (action) => {
    if (action === 'Upload Documents' && user?.role === 'admin') {
      setShowAdminPanel(true);
      return;
    }
    if (action === 'System Status' && user?.role === 'admin') {
      loadSystemStatus();
      return;
    }
    if (action === 'Reload System' && user?.role === 'admin') {
      handleReloadDocuments();
      return;
    }
    setInputMessage(action);
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className={`connection-status ${connectionStatus}`}>
      <span className="status-dot"></span>
      {connectionStatus === 'connecting' && 'Connecting...'}
      {connectionStatus === 'connected' && 'Connected'}
      {connectionStatus === 'authenticated' && `Connected as ${user?.role}`}
      {connectionStatus === 'error' && 'Connection Error'}
      {connectionStatus === 'disconnected' && 'Disconnected'}
    </div>
  );

  // Login Screen
  if (showLogin) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="hospital-logo">
            <div className="logo-icon">KG</div>
            <div className="logo-text">
              <h2>Hospital AI Assistant</h2>
              <p>Please login to continue</p>
            </div>
          </div>
          
          <ConnectionStatus />
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={loginCredentials.username}
                onChange={(e) => setLoginCredentials(prev => ({
                  ...prev, username: e.target.value
                }))}
                className="login-input"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={loginCredentials.password}
                onChange={(e) => setLoginCredentials(prev => ({
                  ...prev, password: e.target.value
                }))}
                className="login-input"
                required
                disabled={loading}
              />
            </div>
            
            {authError && <div className="auth-error">{authError}</div>}
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading || connectionStatus === 'error'}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Staff:</strong> staff1 / staff123</p>
            <p><strong>Patient:</strong> patient1 / patient123</p>
            <p><strong>Visitor:</strong> visitor1 / visitor123</p>
          </div>
          
          {connectionStatus === 'error' && (
            <div className="connection-error">
              ❌ Cannot connect to server. Please ensure the backend is running on port 8000.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Chat Interface
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
          <div className="header-controls">
            <ConnectionStatus />
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            {user?.role === 'admin' && (
              <button 
                className={`admin-panel-btn ${showAdminPanel ? 'active' : ''}`}
                onClick={() => setShowAdminPanel(!showAdminPanel)}
              >
                📊 Admin
              </button>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {user?.role === 'admin' && showAdminPanel && (
        <div className="admin-panel">
          <div className="admin-header">
            <h4>📊 Admin Dashboard</h4>
            <button 
              className="close-admin-btn"
              onClick={() => setShowAdminPanel(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="admin-content">
            {/* System Status */}
            <div className="status-section">
              <h5>🔧 System Status</h5>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Firebase:</span>
                  <span className={`status-value ${systemStatus.firebase_initialized ? 'success' : 'error'}`}>
                    {systemStatus.firebase_initialized ? '✅ Connected' : '❌ Disconnected'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Documents:</span>
                  <span className={`status-value ${systemStatus.documents_loaded > 0 ? 'success' : 'warning'}`}>
                    📄 {systemStatus.documents_loaded || 0} loaded
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Vector Store:</span>
                  <span className={`status-value ${systemStatus.vectorstore_ready ? 'success' : 'error'}`}>
                    {systemStatus.vectorstore_ready ? '✅ Ready' : '❌ Not Ready'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">AI Chain:</span>
                  <span className={`status-value ${systemStatus.conversation_chain_ready ? 'success' : 'error'}`}>
                    {systemStatus.conversation_chain_ready ? '✅ Ready' : '❌ Not Ready'}
                  </span>
                </div>
              </div>
              <button 
                className="refresh-status-btn"
                onClick={loadSystemStatus}
                disabled={loading}
              >
                🔄 {loading ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
            
            {/* Upload Section */}
            <div className="upload-section">
              <h5>📤 Upload Document</h5>
              <div className="upload-controls">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="file-input"
                  disabled={uploading}
                />
                <button 
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="upload-btn"
                >
                  {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
                </button>
              </div>
              <p className="upload-hint">Only PDF files are supported. Max size: 10MB</p>
            </div>
            
            {/* Documents Section */}
            <div className="documents-section">
              <div className="documents-header">
                <h5>📋 Documents ({documents.length})</h5>
                <button 
                  className="reload-docs-btn"
                  onClick={handleReloadDocuments}
                  disabled={loading}
                >
                  🔄 {loading ? 'Reloading...' : 'Reload All'}
                </button>
              </div>
              <div className="documents-list">
                {documents.length === 0 ? (
                  <div className="no-documents">
                    📭 No documents found. Upload some PDFs to get started!
                  </div>
                ) : (
                  documents.map((doc, index) => (
                    <div key={index} className="document-item">
                      <span className="doc-name" title={doc.name}>{doc.name}</span>
                      <span className="doc-size">{(doc.size / 1024 / 1024).toFixed(1)}MB</span>
                      <span className="doc-status">✅ {doc.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {message.timestamp}
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
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>Quick Actions for {userRole.charAt(0).toUpperCase() + userRole.slice(1)}s:</h4>
        <div className="action-buttons">
          {quickActions[userRole]?.map((action, index) => (
            <button 
              key={index} 
              className="action-btn"
              onClick={() => handleQuickAction(action)}
              disabled={!isAuthenticated}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="message-input"
            disabled={!isAuthenticated || isTyping}
            rows={1}
          />
          <button 
            onClick={handleSendMessage} 
            className="send-button"
            disabled={!isAuthenticated || !inputMessage.trim() || isTyping}
          >
            {isTyping ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="input-features">
          <button className="feature-btn" disabled={!isAuthenticated}>🎤 Voice</button>
          <button className="feature-btn" disabled={!isAuthenticated}>📎 Attach</button>
          <button className="feature-btn emergency" disabled={!isAuthenticated}>🚨 Emergency</button>
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
