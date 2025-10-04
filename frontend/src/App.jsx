import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8000';

// Nothing OS Style Icon Components
const Icons = {
  Hospital: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M12 8v8M8 12h8"/>
    </svg>
  ),
  
  HospitalLarge: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M12 7v10M7 12h10"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),

  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="12" rx="2"/>
      <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
      <path d="M12 11v6M9 14l3-3 3 3"/>
    </svg>
  ),

  Document: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),

  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),

  Error: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="12" cy="12" r="10"/>
      <path d="M15 9l-6 6M9 9l6 6"/>
    </svg>
  ),

  Reload: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M1 4v6h6M23 20v-6h-6"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  ),

  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
    </svg>
  ),

  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),

  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),

  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),

  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>
    </svg>
  ),

  StatusDot: ({ status }) => (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: status === 'success' ? '#10b981' : 
                  status === 'error' ? '#ef4444' : 
                  status === 'warning' ? '#f59e0b' : '#6b7280',
      position: 'relative'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: `2px solid ${status === 'success' ? '#10b981' : 
                              status === 'error' ? '#ef4444' : 
                              status === 'warning' ? '#f59e0b' : '#6b7280'}`,
        position: 'absolute',
        top: '-4px',
        left: '-4px',
        opacity: 0.3
      }}/>
    </div>
  ),

  FileUpload: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="4"/>
      <path d="M12 8v8M8 12h8"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
      <circle cx="16" cy="8" r="1" fill="currentColor"/>
      <circle cx="8" cy="16" r="1" fill="currentColor"/>
      <circle cx="16" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),

  Remove: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),

  Analysis: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18"/>
      <path d="M7 12l4-4 4 4 4-4"/>
    </svg>
  ),

  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <path d="M16 17l5-5-5-5M21 12H9"/>
    </svg>
  )
};

const App = () => {
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
  const uploadIntervalRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messageCount >= 3) {
      setShowQuickActions(false);
    }
  }, [messageCount]);

  const api = {
    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }
      return await response.json();
    },

    verifyAuth: async (token) => {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Token verification failed');
      return await response.json();
    },

    sendMessage: async (message, userRole, token) => {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message, user_role: userRole })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }
      return await response.json();
    },

    uploadDocument: async (file, token) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/admin/upload-document`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }
      return await response.json();
    },

    getDocuments: async (token) => {
      const response = await fetch(`${API_BASE_URL}/admin/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    },

    reloadDocuments: async (token) => {
      const response = await fetch(`${API_BASE_URL}/admin/reload-documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to reload documents');
      return await response.json();
    },

    getSystemStatus: async () => {
      const response = await fetch(`${API_BASE_URL}/system/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      return await response.json();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      verifyAuth(token);
    } else {
      setConnectionStatus('disconnected');
    }
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
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
      }
    } catch (error) {
      setAuthError(error.message || 'Login failed. Please check your credentials.');
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
      content: 'You have been logged out.',
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
    
    try {
      const response = await api.sendMessage(currentInput, userRole, token);
      const botMsg = {
        type: 'bot',
        content: response.response || 'No response generated.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      if (error.message.includes('401')) {
        errorMessage = 'Session expired. Please login again.';
        handleLogout();
      }
      setMessages(prev => [...prev, {
        type: 'bot',
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const loadDocuments = async (token) => {
    try {
      const response = await api.getDocuments(token);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to load system status:', error);
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

  const handleFileUpload = async () => {
    if (!uploadFile || uploading) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
    }
    
    uploadIntervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          if (uploadIntervalRef.current) {
            clearInterval(uploadIntervalRef.current);
          }
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await api.uploadDocument(uploadFile, token);
      
      setUploadProgress(100);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Check />
            Document "{uploadFile.name}" uploaded successfully!
          </span>
        ),
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      await loadDocuments(token);
      await loadSystemStatus();
      
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Error />
            Upload failed: {error.message}
          </span>
        ),
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleReloadDocuments = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    
    try {
      await api.reloadDocuments(token);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Reload />
            Documents reloaded successfully!
          </span>
        ),
        timestamp: new Date().toLocaleTimeString()
      }]);
      await loadDocuments(token);
      await loadSystemStatus();
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Error />
            Reload failed: {error.message}
          </span>
        ),
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Updated quickActions without Analytics Dashboard
  const quickActions = {
    patient: ['Find a Doctor', 'Book Appointment', 'Emergency Contact', 'Treatment Information'],
    visitor: ['Visiting Hours', 'Hospital Location', 'Parking Information', 'Amenities'],
    staff: ['Patient Inquiry', 'Department Info', 'Emergency Protocols', 'Hospital Policies'],
    admin: ['System Status', 'Upload Documents', 'Reload System'] // Removed 'Analytics Dashboard'
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (showLogin) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.hospitalLogo}>
            <div style={styles.logoIcon}>
              <Icons.HospitalLarge />
            </div>
            <div style={styles.logoText}>
              <h2 style={styles.logoTitle}>Hospital AI Assistant</h2>
              <p style={styles.logoSubtitle}>Please login to continue</p>
            </div>
          </div>
          
          <div style={{...styles.connectionStatus, ...styles[connectionStatus]}}>
            <Icons.StatusDot status={
              connectionStatus === 'connected' || connectionStatus === 'authenticated' ? 'success' :
              connectionStatus === 'error' ? 'error' : 'warning'
            } />
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'error' && 'Connection Error'}
            {connectionStatus === 'disconnected' && 'Disconnected'}
            {connectionStatus === 'authenticated' && 'Authenticated'}
          </div>
          
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="text"
              placeholder="Username"
              value={loginCredentials.username}
              onChange={(e) => setLoginCredentials(prev => ({...prev, username: e.target.value}))}
              style={styles.loginInput}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              placeholder="Password"
              value={loginCredentials.password}
              onChange={(e) => setLoginCredentials(prev => ({...prev, password: e.target.value}))}
              style={styles.loginInput}
              required
              disabled={loading}
            />
            
            {authError && <div style={styles.authError}>{authError}</div>}
            
            <button 
              type="submit" 
              style={{...styles.loginButton, ...(loading ? styles.loginButtonDisabled : {})}}
              disabled={loading || connectionStatus === 'error'}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div style={styles.demoCredentials}>
            <h4>Demo Credentials:</h4>
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Staff:</strong> staff1 / staff123</p>
            <p><strong>Patient:</strong> patient1 / patient123</p>
          </div>
          
          {connectionStatus === 'error' && (
            <div style={styles.connectionError}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Error />
                Cannot connect to server. Please ensure backend is running.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.chatbotContainer}>
        <div style={styles.chatbotHeader}>
          <div style={styles.headerContent}>
            <div style={styles.hospitalLogo}>
              <div style={styles.logoIconSmall}>
                <Icons.Hospital />
              </div>
              <div style={styles.logoText}>
                <h3 style={styles.headerTitle}>Hospital AI Assistant</h3>
                <p style={styles.headerSubtitle}>24/7 Healthcare Support</p>
              </div>
            </div>
            <div style={styles.headerControls}>
              <div style={styles.userInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.User />
                  <span style={styles.userName}>{user?.username}</span>
                </div>
                <span style={styles.userRole}>{user?.role}</span>
              </div>
              {user?.role === 'admin' && (
                <button 
                  style={styles.adminPanelBtn}
                  onClick={() => {
                    setShowAdminModal(true);
                    loadDocuments(localStorage.getItem('access_token'));
                    loadSystemStatus();
                  }}
                >
                  <Icons.Dashboard />
                  <span>Dashboard</span>
                </button>
              )}
              <button style={styles.logoutBtn} onClick={handleLogout}>
                <Icons.Logout />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div style={styles.chatMessages}>
          {messages.map((message, index) => (
            <div key={index} style={{...styles.message, ...(message.type === 'user' ? styles.messageUser : styles.messageBot)}}>
              <div style={styles.messageContent}>{message.content}</div>
              <div style={styles.messageTime}>{message.timestamp}</div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{...styles.message, ...styles.messageBot}}>
              <div style={styles.messageContent}>
                <div style={styles.typingIndicator}>
                  <span style={styles.typingDot}></span>
                  <span style={{...styles.typingDot, animationDelay: '0.2s'}}></span>
                  <span style={{...styles.typingDot, animationDelay: '0.4s'}}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {showQuickActions && (
          <div style={styles.quickActions}>
            <div style={styles.quickActionsHeader}>
              <h4 style={styles.quickActionsTitle}>Quick Actions:</h4>
              <span style={styles.messageCounter}>Messages: {messageCount}/3</span>
            </div>
            <div style={styles.actionButtons}>
              {quickActions[userRole]?.map((action, index) => (
                <button 
                  key={index} 
                  style={styles.actionBtn}
                  onClick={() => handleQuickAction(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.chatInput}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            style={styles.messageInput}
            disabled={!isAuthenticated || isTyping}
            rows={1}
          />
          <button 
            onClick={handleSendMessage} 
            style={{...styles.sendButton, ...(!inputMessage.trim() || isTyping ? styles.sendButtonDisabled : {})}}
            disabled={!isAuthenticated || !inputMessage.trim() || isTyping}
          >
            {isTyping ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={styles.loadingSpinner}></div>
                Sending...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Send />
                Send
              </div>
            )}
          </button>
        </div>
      </div>

      {showAdminModal && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) setShowAdminModal(false);
        }}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icons.Settings />
                <h2 style={styles.modalTitle}>Admin Dashboard</h2>
              </div>
              <button 
                style={styles.modalClose}
                onClick={() => setShowAdminModal(false)}
              >
                <Icons.Close />
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.adminCard}>
                <h3 style={styles.cardTitle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icons.Analysis />
                    System Status
                  </div>
                </h3>
                <div style={styles.statusGrid}>
                  <div style={styles.statusItem}>
                    <span>Firebase:</span>
                    <span style={systemStatus.firebase_initialized ? styles.statusSuccess : styles.statusError}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {systemStatus.firebase_initialized ? <Icons.Check /> : <Icons.Error />}
                        {systemStatus.firebase_initialized ? 'Connected' : 'Disconnected'}
                      </div>
                    </span>
                  </div>
                  <div style={styles.statusItem}>
                    <span>Documents:</span>
                    <span style={styles.statusSuccess}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.Document />
                        {systemStatus.documents_loaded || 0} loaded
                      </div>
                    </span>
                  </div>
                  <div style={styles.statusItem}>
                    <span>Vector Store:</span>
                    <span style={systemStatus.vectorstore_ready ? styles.statusSuccess : styles.statusError}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {systemStatus.vectorstore_ready ? <Icons.Check /> : <Icons.Error />}
                        {systemStatus.vectorstore_ready ? 'Ready' : 'Not Ready'}
                      </div>
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.adminCard}>
                <h3 style={styles.cardTitle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icons.Upload />
                    Upload Document
                  </div>
                </h3>
                <div 
                  style={{...styles.uploadArea, ...(dragOver ? styles.uploadAreaDragOver : {})}}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0 && files[0].type === 'application/pdf') {
                      setUploadFile(files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icons.FileUpload />
                  <p style={styles.uploadText}>Drag & Drop PDF or Click to Browse</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={styles.fileInput}
                />

                {uploadFile && (
                  <div style={styles.selectedFile}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icons.Document />
                      <span>{uploadFile.name} ({formatFileSize(uploadFile.size)})</span>
                    </div>
                    <button onClick={removeSelectedFile} style={styles.removeFileBtn}>
                      <Icons.Remove />
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  style={{...styles.uploadBtn, ...(!uploadFile || uploading ? styles.uploadBtnDisabled : {})}}
                >
                  {uploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={styles.loadingSpinner}></div>
                      Uploading {uploadProgress}%
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icons.Upload />
                      Upload PDF
                    </div>
                  )}
                </button>

                {uploading && (
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${uploadProgress}%`}}></div>
                  </div>
                )}
              </div>

              <div style={styles.adminCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icons.Document />
                      Documents ({documents.length})
                    </div>
                  </h3>
                  <button onClick={handleReloadDocuments} style={styles.reloadBtn}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icons.Reload />
                      Reload
                    </div>
                  </button>
                </div>
                <div style={styles.documentsList}>
                  {documents.length === 0 ? (
                    <p style={styles.noDocuments}>No documents uploaded yet</p>
                  ) : (
                    documents.map((doc, index) => (
                      <div key={index} style={styles.documentItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icons.Document />
                          <span>{doc.name}</span>
                        </div>
                        <span style={styles.docSize}>{formatFileSize(doc.size)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  loginCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  hospitalLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px'
  },
  logoIcon: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  logoIconSmall: {
    width: '45px',
    height: '45px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    flexShrink: 0
  },
  logoText: {
    flex: 1
  },
  logoTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#2d3748'
  },
  logoSubtitle: {
    margin: '5px 0 0 0',
    color: '#718096',
    fontSize: '14px'
  },
  connectionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '20px',
    fontWeight: '500'
  },
  connecting: {
    background: '#fef3c7',
    color: '#92400e'
  },
  connected: {
    background: '#d1fae5',
    color: '#065f46'
  },
  authenticated: {
    background: '#dbeafe',
    color: '#1e40af'
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  disconnected: {
    background: '#f3f4f6',
    color: '#4b5563'
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  loginInput: {
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.3s',
    outline: 'none',
    fontFamily: 'inherit'
  },
  authError: {
    padding: '12px 16px',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '10px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  loginButton: {
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  loginButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  demoCredentials: {
    marginTop: '25px',
    padding: '20px',
    background: '#f7fafc',
    borderRadius: '12px',
    fontSize: '14px'
  },
  connectionError: {
    marginTop: '15px',
    padding: '12px 16px',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '10px',
    fontSize: '14px'
  },
  chatbotContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#f7fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  chatbotHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px'
  },
  headerSubtitle: {
    margin: '5px 0 0 0',
    fontSize: '13px',
    opacity: 0.9
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  userRole: {
    fontSize: '12px',
    opacity: 0.8,
    textTransform: 'capitalize'
  },
  adminPanelBtn: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoutBtn: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    color: '#764ba2',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  message: {
    maxWidth: '70%',
    padding: '14px 18px',
    borderRadius: '16px',
    animation: 'fadeIn 0.3s ease-in',
    wordWrap: 'break-word'
  },
  messageUser: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  messageBot: {
    alignSelf: 'flex-start',
    background: 'white',
    color: '#2d3748',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #f0f0f0'
  },
  messageContent: {
    fontSize: '15px',
    lineHeight: '1.5',
    marginBottom: '6px'
  },
  messageTime: {
    fontSize: '11px',
    opacity: 0.7
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  },
  typingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#667eea',
    animation: 'bounce 1.4s infinite ease-in-out'
  },
  quickActions: {
    padding: '20px',
    background: 'white',
    borderTop: '1px solid #e2e8f0',
    animation: 'slideUp 0.4s ease-out'
  },
  quickActionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  quickActionsTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#2d3748',
    fontWeight: '600'
  },
  messageCounter: {
    fontSize: '13px',
    color: '#718096',
    padding: '6px 12px',
    background: '#f7fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  actionBtn: {
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
  },
  chatInput: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    background: 'white',
    borderTop: '1px solid #e2e8f0'
  },
  messageInput: {
    flex: 1,
    padding: '14px 18px',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '15px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    maxHeight: '120px',
    transition: 'border-color 0.3s'
  },
  sendButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100px'
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  loadingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-in'
  },
  modalContainer: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease-out'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px',
    borderBottom: '1px solid #e2e8f0'
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#2d3748',
    fontWeight: '600'
  },
  modalClose: {
    width: '44px',
    height: '44px',
    border: 'none',
    background: '#f7fafc',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#4b5563',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  adminCard: {
    background: '#f7fafc',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e2e8f0'
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    color: '#2d3748',
    fontWeight: '600'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'white',
    borderRadius: '12px',
    fontSize: '14px',
    border: '1px solid #e2e8f0'
  },
  statusSuccess: {
    color: '#059669',
    fontWeight: '600'
  },
  statusError: {
    color: '#dc2626',
    fontWeight: '600'
  },
  uploadArea: {
    border: '2px dashed #cbd5e0',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'white'
  },
  uploadAreaDragOver: {
    borderColor: '#667eea',
    background: '#eef2ff'
  },
  uploadText: {
    margin: '16px 0 0 0',
    color: '#718096',
    fontSize: '15px',
    fontWeight: '500'
  },
  fileInput: {
    display: 'none'
  },
  selectedFile: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'white',
    borderRadius: '12px',
    marginTop: '16px',
    border: '1px solid #e2e8f0'
  },
  removeFileBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s'
  },
  uploadBtn: {
    width: '100%',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    marginTop: '16px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  uploadBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    marginTop: '16px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease-in-out'
  },
  reloadBtn: {
    padding: '10px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s'
  },
  documentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  noDocuments: {
    textAlign: 'center',
    color: '#718096',
    padding: '32px',
    fontSize: '15px'
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  docSize: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '500'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Hover effects */
  .login-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .admin-panel-btn:hover {
    background: rgba(255,255,255,0.3);
  }
  
  .logout-btn:hover {
    background: rgba(255,255,255,1);
  }
  
  .modal-close:hover {
    background: #e2e8f0;
  }
  
  .remove-file-btn:hover {
    background: #fecaca;
  }
  
  .reload-btn:hover {
    background: #5a67d8;
  }
  
  @media (max-width: 768px) {
    .chat-messages { padding: 15px !important; }
    .message { max-width: 85% !important; }
    .quick-actions { padding: 15px !important; }
    .action-buttons { gap: 8px !important; }
    .action-btn { padding: 10px 14px !important; font-size: 13px !important; }
    .modal-container { margin: 10px !important; }
    .modal-content { padding: 20px !important; }
    .admin-card { padding: 20px !important; }
    .status-grid { grid-template-columns: 1fr !important; }
  }
  
  @media (max-width: 480px) {
    .header-content { flex-direction: column !important; align-items: flex-start !important; }
    .header-controls { width: 100% !important; justify-content: space-between !important; }
    .user-info { align-items: flex-start !important; }
    .message { max-width: 90% !important; font-size: 14px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default App;
