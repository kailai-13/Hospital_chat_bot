// App.js - Fixed UI Bugs and Responsiveness Issues

import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = 'https://hospital-chat-bot-backend.onrender.com';

const App = () => {
  // State management (same as before)
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userRole, setUserRole] = useState('patient');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [systemStatus, setSystemStatus] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);
  const adminModalRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    const textarea = document.querySelector('.message-input');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (chatContainerRef.current) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // All API functions and other functions remain the same...
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

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyAuth(token);
    } else {
      setShowLogin(true);
      setConnectionStatus('disconnected');
    }
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

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminModalRef.current && !adminModalRef.current.contains(event.target)) {
        if (event.target.classList.contains('admin-modal-overlay')) {
          setShowAdminModal(false);
        }
      }
    };

    if (showAdminModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showAdminModal]);

  // Hide quick actions after 3 messages
  useEffect(() => {
    if (messageCount >= 3) {
      setShowQuickActions(false);
    }
  }, [messageCount]);

  const verifyAuth = async (token) => {
    try {
      setLoading(true);
      const userData = await api.verifyAuth(token);
      setUser(userData);
      setUserRole(userData.role);
      setIsAuthenticated(true);
      setShowLogin(false);
      setConnectionStatus('authenticated');
      
      setMessageCount(0);
      setShowQuickActions(true);
      
      setMessages([{
        type: 'bot',
        content: `Welcome ${userData.username}! You are logged in as ${userData.role}. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
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
    setShowAdminModal(false);
    setDocuments([]);
    setSystemStatus({});
    setConnectionStatus('disconnected');
    setMessageCount(0);
    setShowQuickActions(true);
    setMessages([{
      type: 'bot',
      content: 'You have been logged out. Please login to continue using KG Hospital AI Assistant.',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isAuthenticated || isTyping) return;

    const token = localStorage.getItem('access_token');
    
    const userMsg = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    
    setMessageCount(prev => prev + 1);
    
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    
    // Reset textarea height
    setTimeout(() => autoResizeTextarea(), 0);
    
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

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    autoResizeTextarea();
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

  // File handling functions (same as before)...
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setUploadFile(file);
      } else {
        alert('Please select a PDF file only.');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setUploadFile(file);
      } else {
        alert('Please select a PDF file only.');
        e.target.value = '';
      }
    }
  };

  const removeSelectedFile = () => {
    setUploadFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleFileUpload = async () => {
    if (!uploadFile || uploading) return;
    
    setUploading(true);
    const progressInterval = simulateUploadProgress();
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await api.uploadDocument(uploadFile, token);
      
      const successMsg = {
        type: 'bot',
        content: `✅ Document "${uploadFile.name}" uploaded successfully! The AI model has been updated with this new information. ${response.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, successMsg]);
      
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReloadDocuments = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    
    try {
      const response = await api.reloadDocuments(token);
      
      const successMsg = {
        type: 'bot',
        content: `🔄 Documents reloaded successfully! The AI model has been refreshed with all available documents. ${response.message}`,
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
      setShowAdminModal(true);
      return;
    }
    if (action === 'System Status' && user?.role === 'admin') {
      loadSystemStatus();
      setShowAdminModal(true);
      return;
    }
    if (action === 'Reload System' && user?.role === 'admin') {
      handleReloadDocuments();
      return;
    }
    setInputMessage(action);
    setMessageCount(prev => prev + 1);
  };

  const openAdminDashboard = () => {
    setShowAdminModal(true);
    if (user?.role === 'admin') {
      loadDocuments(localStorage.getItem('access_token'));
      loadSystemStatus();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // Enhanced Upload Area Component (same as before)
  const UploadArea = () => (
    <div className="upload-section">
      <h5>📤 Upload Document</h5>
      
      <div 
        ref={uploadAreaRef}
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="upload-icon">📁</span>
        <div className="upload-text">
          <h6>Drag & Drop PDF Files</h6>
          <p>or click to browse files</p>
          <button type="button" className="browse-button">
            Browse Files
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="file-input"
        disabled={uploading}
      />

      {uploadFile && (
        <div className="selected-file">
          <div className="file-info">
            <div className="file-name">📄 {uploadFile.name}</div>
            <div className="file-size">{formatFileSize(uploadFile.size)}</div>
          </div>
          <button 
            onClick={removeSelectedFile}
            className="remove-file"
            disabled={uploading}
          >
            ✕
          </button>
        </div>
      )}

      <div className="upload-controls">
        <button 
          onClick={handleFileUpload}
          disabled={!uploadFile || uploading}
          className="upload-btn"
        >
          {uploading ? (
            <>
              <span className="loading-spinner"></span>
              Uploading...
            </>
          ) : (
            '📤 Upload PDF'
          )}
        </button>
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Uploading... {uploadProgress}%
          </div>
        </div>
      )}

      <p className="upload-hint">
        Only PDF files are supported. Maximum size: 10MB
      </p>
    </div>
  );

  // Admin Dashboard Modal Component (same as before but with fixed visibility)
  const AdminDashboardModal = () => {
    if (!showAdminModal) return null;

    return (
      <div className="admin-modal-overlay">
        <div className="admin-modal-container" ref={adminModalRef}>
          <div className="admin-modal-header">
            <div className="admin-modal-title">
              <span className="admin-icon">🏥</span>
              <div>
                <h2>KG Hospital Admin Dashboard</h2>
                <p>System Management & Document Control</p>
              </div>
            </div>
            <button 
              className="admin-modal-close"
              onClick={() => setShowAdminModal(false)}
              aria-label="Close Admin Dashboard"
            >
              ✕
            </button>
          </div>
          
          <div className="admin-modal-content">
            <div className="admin-dashboard-grid">
              {/* System Status Card */}
              <div className="admin-card system-status-card">
                <div className="admin-card-header">
                  <h3>🔧 System Status</h3>
                  <button 
                    className="refresh-btn"
                    onClick={loadSystemStatus}
                    disabled={loading}
                  >
                    🔄
                  </button>
                </div>
                <div className="status-metrics">
                  <div className="status-metric">
                    <div className="metric-icon">🔥</div>
                    <div className="metric-info">
                      <span className="metric-label">Firebase</span>
                      <span className={`metric-value ${systemStatus.firebase_initialized ? 'success' : 'error'}`}>
                        {systemStatus.firebase_initialized ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="status-metric">
                    <div className="metric-icon">📄</div>
                    <div className="metric-info">
                      <span className="metric-label">Documents</span>
                      <span className={`metric-value ${systemStatus.documents_loaded > 0 ? 'success' : 'warning'}`}>
                        {systemStatus.documents_loaded || 0} loaded
                      </span>
                    </div>
                  </div>
                  
                  <div className="status-metric">
                    <div className="metric-icon">🗂️</div>
                    <div className="metric-info">
                      <span className="metric-label">Vector Store</span>
                      <span className={`metric-value ${systemStatus.vectorstore_ready ? 'success' : 'error'}`}>
                        {systemStatus.vectorstore_ready ? 'Ready' : 'Not Ready'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="status-metric">
                    <div className="metric-icon">🤖</div>
                    <div className="metric-info">
                      <span className="metric-label">AI Chain</span>
                      <span className={`metric-value ${systemStatus.conversation_chain_ready ? 'success' : 'error'}`}>
                        {systemStatus.conversation_chain_ready ? 'Ready' : 'Not Ready'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Card */}
              <div className="admin-card upload-card">
                <div className="admin-card-header">
                  <h3>📤 Document Upload</h3>
                </div>
                <UploadArea />
              </div>

              {/* Documents Card */}
              <div className="admin-card documents-card">
                <div className="admin-card-header">
                  <h3>📋 Document Library ({documents.length})</h3>
                  <button 
                    className="reload-btn"
                    onClick={handleReloadDocuments}
                    disabled={loading}
                  >
                    {loading ? '⏳' : '🔄'} Reload
                  </button>
                </div>
                <div className="documents-grid">
                  {documents.length === 0 ? (
                    <div className="no-documents-placeholder">
                      <div className="placeholder-icon">📭</div>
                      <h4>No documents found</h4>
                      <p>Upload PDF files to train the AI model</p>
                    </div>
                  ) : (
                    documents.map((doc, index) => (
                      <div key={index} className="document-card">
                        <div className="doc-icon">📄</div>
                        <div className="doc-details">
                          <div className="doc-name">{doc.name}</div>
                          <div className="doc-meta">
                            <span className="doc-size">{formatFileSize(doc.size)}</span>
                            <span className="doc-status">✅ {doc.status}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="admin-card actions-card">
                <div className="admin-card-header">
                  <h3>⚡ Quick Actions</h3>
                </div>
                <div className="admin-actions-grid">
                  <button 
                    className="admin-action-btn system-btn"
                    onClick={loadSystemStatus}
                  >
                    <span className="action-icon">📊</span>
                    <span>System Status</span>
                  </button>
                  
                  <button 
                    className="admin-action-btn upload-btn-action"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="action-icon">📤</span>
                    <span>Upload File</span>
                  </button>
                  
                  <button 
                    className="admin-action-btn reload-btn-action"
                    onClick={handleReloadDocuments}
                    disabled={loading}
                  >
                    <span className="action-icon">🔄</span>
                    <span>Reload Docs</span>
                  </button>
                  
                  <button 
                    className="admin-action-btn analytics-btn"
                    onClick={() => console.log('Analytics clicked')}
                  >
                    <span className="action-icon">📈</span>
                    <span>Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="admin-modal-footer">
            <div className="footer-info">
              <span>KG Hospital Admin Dashboard v1.0</span>
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
            <div className="footer-actions">
              <button 
                className="footer-btn secondary"
                onClick={() => setShowAdminModal(false)}
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Login Screen (same as before)
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
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
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

  // Main Chat Interface with all fixes
  return (
    <>
      <div className="chatbot-container" ref={chatContainerRef}>
        {/* Fixed Header */}
        <div className="chatbot-header fixed-header">
          <div className="header-content responsive">
            <div className="hospital-logo">
              <div className="logo-icon">KG</div>
              <div className="logo-text">
                <h3>Hospital AI Assistant</h3>
                <p className="white-subtitle">24/7 Healthcare Support</p>
              </div>
            </div>
            <div className="header-controls responsive">
              <ConnectionStatus />
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <button 
                  className="admin-panel-btn visible"
                  onClick={openAdminDashboard}
                >
                  📊 {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </button>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Enlarged Chat Messages with proper spacing */}
        <div className="chat-messages enlarged fixed-spacing">
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

        {/* Conditional Quick Actions */}
        {showQuickActions && (
          <div className="quick-actions fade-in">
            <div className="quick-actions-header">
              <h4>Quick Actions for {userRole.charAt(0).toUpperCase() + userRole.slice(1)}s:</h4>
              <div className="message-counter">
                Messages: {messageCount}/3
              </div>
            </div>
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
        )}

        {/* Fixed Input Area */}
        <div className="chat-input simplified fixed-bottom">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="message-input auto-resize"
              disabled={!isAuthenticated || isTyping}
              rows={1}
            />
            <button 
              onClick={handleSendMessage} 
              className="send-button"
              disabled={!isAuthenticated || !inputMessage.trim() || isTyping}
            >
              {isTyping ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
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

      {/* Separate Admin Dashboard Modal */}
      <AdminDashboardModal />
    </>
  );
};

export default App;
