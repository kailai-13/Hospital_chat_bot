import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8000';

// Icons Component
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

  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),

  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),

  History: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),

  Bell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),

  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),

  StatusDot: ({ status }) => (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: status === 'success' ? '#28a745' : 
                  status === 'error' ? '#dc3545' : 
                  status === 'warning' ? '#ffc107' : '#6c757d',
      position: 'relative'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: `2px solid ${status === 'success' ? '#28a745' : 
                              status === 'error' ? '#dc3545' : 
                              status === 'warning' ? '#ffc107' : '#6c757d'}`,
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

  Notification: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
};

const FormattedMessage = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return <span>{content}</span>;
  }

  // Handle table format
  if (content.includes('|') && content.includes('---')) {
    const lines = content.split('\n');
    const tableLines = lines.filter(line => line.includes('|'));
    
    if (tableLines.length > 0) {
      return (
        <div style={{ overflowX: 'auto', margin: '10px 0' }}>
          <table style={{ 
            borderCollapse: 'collapse', 
            width: '100%',
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <tbody>
              {tableLines.map((line, index) => {
                const cells = line.split('|').filter(cell => cell.trim() !== '');
                const isHeader = line.includes('---') || index === 0;
                
                return (
                  <tr key={index} style={{ 
                    background: isHeader ? '#f8f9fa' : 'white',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    {cells.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex}
                        style={{ 
                          padding: '12px 16px',
                          border: '1px solid #dee2e6',
                          textAlign: 'left',
                          fontWeight: isHeader ? '600' : '400',
                          color: isHeader ? '#2E4AC7' : '#495057',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}
                      >
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  }

  const lines = content.split('\n');
  
  return (
    <div style={{ lineHeight: '1.6', fontSize: '15px' }}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          return <div key={index} style={{ height: '8px' }} />;
        }
        
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          const headerText = trimmedLine.slice(2, -2);
          return (
            <div key={index} style={{ 
              fontWeight: '600', 
              fontSize: '17px', 
              color: '#1F3A9E', 
              marginTop: index > 0 ? '16px' : '0',
              marginBottom: '12px',
              borderBottom: '2px solid #e8f1ff',
              paddingBottom: '6px'
            }}>
              {headerText}
            </div>
          );
        }
        
        if (trimmedLine.startsWith('• ')) {
          const bulletText = trimmedLine.slice(2);
          return (
            <div key={index} style={{ 
              marginLeft: '20px', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <span style={{ color: '#FF8C00', fontWeight: 'bold', marginTop: '2px', fontSize: '16px', minWidth: '16px' }}>•</span>
              <span style={{ flex: 1, lineHeight: '1.5' }}>{bulletText}</span>
            </div>
          );
        }
        
        if (/^\d+\.\s/.test(trimmedLine)) {
          const match = trimmedLine.match(/^(\d+\.\s*)(.+)/);
          const number = match ? match[1] : '';
          const content = match ? match[2] : trimmedLine;
          
          return (
            <div key={index} style={{ 
              marginLeft: '12px', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '6px 0'
            }}>
              <span style={{ color: '#FF8C00', fontWeight: '700', fontSize: '15px', minWidth: '24px', textAlign: 'right' }}>
                {number.trim()}
              </span>
              <span style={{ flex: 1, lineHeight: '1.6', fontSize: '15px' }}>{content}</span>
            </div>
          );
        }
        
        return (
          <div key={index} style={{ marginBottom: '8px', lineHeight: '1.5' }}>
            {trimmedLine}
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userRole, setUserRole] = useState('patient');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState('appointments');
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
  const [showRoleSelector, setShowRoleSelector] = useState(true);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [historyFilter, setHistoryFilter] = useState('all');
  const [appointmentFilter, setAppointmentFilter] = useState('pending');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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
    sendMessage: async (message, userRole, userId, userName, phoneNumber) => {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          user_role: userRole,
          user_id: userId,
          user_name: userName,
          phone_number: phoneNumber
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }
      return await response.json();
    },

    getChatHistory: async (role = null) => {
      const url = role && role !== 'all' 
        ? `${API_BASE_URL}/admin/chat-history?user_role=${role}`
        : `${API_BASE_URL}/admin/chat-history`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch chat history');
      return await response.json();
    },

    getAppointments: async (status = null) => {
      const url = status 
        ? `${API_BASE_URL}/admin/appointments?status=${status}`
        : `${API_BASE_URL}/admin/appointments`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    },

    handleAppointment: async (appointmentId, action, notes = '') => {
      const response = await fetch(`${API_BASE_URL}/admin/appointments/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          action: action,
          admin_notes: notes
        })
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return await response.json();
    },

    getStatistics: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/statistics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return await response.json();
    },

    getNotifications: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    },

    markNotificationRead: async (notificationId) => {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId })
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return await response.json();
    },

    uploadDocument: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/upload-document`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }
      return await response.json();
    },

    getDocuments: async () => {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    },

    reloadDocuments: async () => {
      const response = await fetch(`${API_BASE_URL}/reload-documents`, {
        method: 'POST'
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
    testBackendConnection();
  }, []);

  useEffect(() => {
    if (userRole === 'admin' && showAdminModal) {
      loadNotifications();
    }
  }, [userRole, showAdminModal]);

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

  const loadNotifications = async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(response.notifications || []);
      const unread = response.notifications.filter(n => !n.read).length;
      setUnreadNotifications(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleRoleSelection = (role) => {
    setUserRole(role);
    if (role === 'patient' || role === 'visitor') {
      setShowUserInfoModal(true);
    } else {
      setUserId(`${role}_${Date.now()}`);
      setUserName(role.charAt(0).toUpperCase() + role.slice(1));
      setShowRoleSelector(false);
      setMessages([{
        type: 'bot',
        content: `Welcome! You are accessing as a ${role}. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const handleUserInfoSubmit = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    if ((userRole === 'patient') && !phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }
    
    setUserId(`${userRole}_${Date.now()}`);
    setShowUserInfoModal(false);
    setShowRoleSelector(false);
    setMessages([{
      type: 'bot',
      content: `Welcome ${userName}! You are accessing as a ${userRole}. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

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
      const response = await api.sendMessage(currentInput, userRole, userId, userName, phoneNumber);
      const botMsg = {
        type: 'bot',
        content: response.response || 'No response generated.',
        timestamp: new Date().toLocaleTimeString(),
        isAppointmentRequest: response.is_appointment_request,
        appointmentId: response.appointment_id
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.getChatHistory(historyFilter === 'all' ? null : historyFilter);
      setChatHistory(response.history || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await api.getAppointments(appointmentFilter);
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await api.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await api.getDocuments();
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

  const handleAppointmentAction = async (appointmentId, action) => {
    const notes = action === 'accept' 
      ? prompt('Add notes (optional):') 
      : prompt('Reason for rejection (optional):');
    
    if (notes === null) return; // User cancelled
    
    try {
      await api.handleAppointment(appointmentId, action, notes || '');
      await loadAppointments();
      await loadStatistics();
      await loadNotifications();
      alert(`Appointment ${action}ed successfully!`);
    } catch (error) {
      alert(`Failed to ${action} appointment: ${error.message}`);
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
    
    try {
      await api.uploadDocument(uploadFile);
      setUploadProgress(100);
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadDocuments();
      await loadSystemStatus();
      alert('Document uploaded successfully!');
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
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
    setLoading(true);
    try {
      await api.reloadDocuments();
      await loadDocuments();
      await loadSystemStatus();
      alert('Documents reloaded successfully!');
    } catch (error) {
      alert(`Reload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = {
    patient: ['Find a Doctor', 'Book Appointment', 'Emergency Contact', 'Treatment Information'],
    visitor: ['Visiting Hours', 'Hospital Location', 'Parking Information', 'Amenities'],
    staff: ['Patient Inquiry', 'Department Info', 'Emergency Protocols', 'Hospital Policies'],
    admin: ['System Status', 'View Appointments', 'View Chat History', 'Notifications']
  };

  const handleQuickAction = (action) => {
    if (action === 'System Status' || action === 'View Appointments' || action === 'View Chat History' || action === 'Notifications') {
      setShowAdminModal(true);
      if (action === 'View Appointments') {
        setAdminTab('appointments');
        loadAppointments();
        loadStatistics();
      } else if (action === 'View Chat History') {
        setAdminTab('history');
        loadChatHistory();
      } else if (action === 'Notifications') {
        setAdminTab('notifications');
        loadNotifications();
      } else {
        setAdminTab('documents');
        loadSystemStatus();
        loadDocuments();
      }
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (showUserInfoModal) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.hospitalLogo}>
            <div style={styles.logoIcon}>
              <Icons.HospitalLarge />
            </div>
            <div style={styles.logoText}>
              <h2 style={styles.logoTitle}>Welcome, {userRole}!</h2>
              <p style={styles.logoSubtitle}>Please provide your information</p>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Your Name *</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full name"
              style={styles.formInput}
            />
          </div>

          {(userRole === 'patient') && (
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                style={styles.formInput}
              />
            </div>
          )}

          <div style={styles.formButtons}>
            <button 
              onClick={() => {
                setShowUserInfoModal(false);
                setShowRoleSelector(true);
              }}
              style={styles.backBtn}
            >
              Back
            </button>
            <button 
              onClick={handleUserInfoSubmit}
              style={styles.continueBtn}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showRoleSelector) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.hospitalLogo}>
            <div style={styles.logoIcon}>
              <Icons.HospitalLarge />
            </div>
            <div style={styles.logoText}>
              <h2 style={styles.logoTitle}>Hospital AI Assistant</h2>
              <p style={styles.logoSubtitle}>Select your role to continue</p>
            </div>
          </div>
          
          <div style={{...styles.connectionStatus, ...styles[connectionStatus]}}>
            <Icons.StatusDot status={
              connectionStatus === 'connected' ? 'success' :
              connectionStatus === 'error' ? 'error' : 'warning'
            } />
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'error' && 'Connection Error'}
          </div>
          
          <div style={styles.roleButtons}>
            <button 
              style={styles.roleButton}
              onClick={() => handleRoleSelection('patient')}
              disabled={connectionStatus === 'error'}
            >
              <div style={styles.roleIcon}>👤</div>
              <div>
                <h3 style={styles.roleTitle}>Patient</h3>
                <p style={styles.roleDesc}>Book appointments, view treatments</p>
              </div>
            </button>

            <button 
              style={styles.roleButton}
              onClick={() => handleRoleSelection('visitor')}
              disabled={connectionStatus === 'error'}
            >
              <div style={styles.roleIcon}>🚶</div>
              <div>
                <h3 style={styles.roleTitle}>Visitor</h3>
                <p style={styles.roleDesc}>Visiting hours, directions</p>
              </div>
            </button>

            <button 
              style={styles.roleButton}
              onClick={() => handleRoleSelection('staff')}
              disabled={connectionStatus === 'error'}
            >
              <div style={styles.roleIcon}>👨‍⚕️</div>
              <div>
                <h3 style={styles.roleTitle}>Staff</h3>
                <p style={styles.roleDesc}>Patient inquiries, protocols</p>
              </div>
            </button>

            <button 
              style={styles.roleButton}
              onClick={() => handleRoleSelection('admin')}
              disabled={connectionStatus === 'error'}
            >
              <div style={styles.roleIcon}>⚙️</div>
              <div>
                <h3 style={styles.roleTitle}>Admin</h3>
                <p style={styles.roleDesc}>Manage documents, appointments, history</p>
              </div>
            </button>
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
                <span style={styles.userName}>{userName}</span>
                <span style={styles.userRole}>{userRole}</span>
              </div>
              {userRole === 'admin' && (
                <button 
                  style={styles.adminPanelBtn}
                  onClick={() => {
                    setShowAdminModal(true);
                    setAdminTab('appointments');
                    loadAppointments();
                    loadStatistics();
                    loadNotifications();
                  }}
                >
                  <Icons.Dashboard />
                  <span>Dashboard</span>
                  {unreadNotifications > 0 && (
                    <span style={styles.notificationBadge}>{unreadNotifications}</span>
                  )}
                </button>
              )}
              <button 
                style={styles.logoutBtn} 
                onClick={() => {
                  setShowRoleSelector(true);
                  setMessages([]);
                  setMessageCount(0);
                  setShowQuickActions(true);
                  setUserName('');
                  setPhoneNumber('');
                  setUserId('');
                }}
              >
                Switch Role
              </button>
            </div>
          </div>
        </div>

        <div style={styles.chatMessages}>
          {messages.map((message, index) => (
            <div key={index} style={{...styles.message, ...(message.type === 'user' ? styles.messageUser : styles.messageBot)}}>
              <div style={styles.messageContent}>
                <FormattedMessage content={message.content} />
                {message.isAppointmentRequest && (
                  <div style={styles.appointmentSuccess}>
                    <Icons.Check />
                    Appointment request submitted successfully!
                  </div>
                )}
              </div>
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
            disabled={isTyping}
            rows={1}
          />
          <button 
            onClick={handleSendMessage} 
            style={{...styles.sendButton, ...(!inputMessage.trim() || isTyping ? styles.sendButtonDisabled : {})}}
            disabled={!inputMessage.trim() || isTyping}
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

            <div style={styles.adminTabs}>
              <button 
                style={{...styles.tabBtn, ...(adminTab === 'appointments' ? styles.tabBtnActive : {})}}
                onClick={() => {
                  setAdminTab('appointments');
                  loadAppointments();
                  loadStatistics();
                }}
              >
                <Icons.Bell />
                Appointments
                {statistics.pending_appointments > 0 && (
                  <span style={styles.badge}>{statistics.pending_appointments}</span>
                )}
              </button>
              <button 
                style={{...styles.tabBtn, ...(adminTab === 'history' ? styles.tabBtnActive : {})}}
                onClick={() => {
                  setAdminTab('history');
                  loadChatHistory();
                }}
              >
                <Icons.History />
                Chat History
              </button>
              <button 
                style={{...styles.tabBtn, ...(adminTab === 'notifications' ? styles.tabBtnActive : {})}}
                onClick={() => {
                  setAdminTab('notifications');
                  loadNotifications();
                }}
              >
                <Icons.Notification />
                Notifications
                {unreadNotifications > 0 && (
                  <span style={styles.badge}>{unreadNotifications}</span>
                )}
              </button>
              <button 
                style={{...styles.tabBtn, ...(adminTab === 'documents' ? styles.tabBtnActive : {})}}
                onClick={() => {
                  setAdminTab('documents');
                  loadDocuments();
                  loadSystemStatus();
                }}
              >
                <Icons.Document />
                Documents
              </button>
            </div>
            
            <div style={styles.modalContent}>
              {adminTab === 'appointments' && (
                <>
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📊</div>
                      <div>
                        <div style={styles.statValue}>{statistics.total_conversations || 0}</div>
                        <div style={styles.statLabel}>Total Chats</div>
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={{...styles.statIcon, background: '#fff3cd'}}>⏳</div>
                      <div>
                        <div style={styles.statValue}>{statistics.pending_appointments || 0}</div>
                        <div style={styles.statLabel}>Pending</div>
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={{...styles.statIcon, background: '#d4edda'}}>✅</div>
                      <div>
                        <div style={styles.statValue}>{statistics.accepted_appointments || 0}</div>
                        <div style={styles.statLabel}>Accepted</div>
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={{...styles.statIcon, background: '#f8d7da'}}>❌</div>
                      <div>
                        <div style={styles.statValue}>{statistics.rejected_appointments || 0}</div>
                        <div style={styles.statLabel}>Rejected</div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.adminCard}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>
                        <Icons.Bell />
                        Appointment Requests
                      </h3>
                      <select 
                        value={appointmentFilter}
                        onChange={(e) => {
                          setAppointmentFilter(e.target.value);
                          setTimeout(() => loadAppointments(), 100);
                        }}
                        style={styles.filterSelect}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div style={styles.appointmentsList}>
                      {appointments.length === 0 ? (
                        <p style={styles.noData}>No {appointmentFilter} appointments</p>
                      ) : (
                        appointments.map((apt, index) => (
                          <div key={index} style={styles.appointmentCard}>
                            <div style={styles.appointmentHeader}>
                              <div>
                                <h4 style={styles.appointmentName}>
                                  <Icons.User />
                                  {apt.user_name}
                                </h4>
                                <span style={{...styles.appointmentBadge, 
                                  background: apt.status === 'pending' ? '#fff3cd' :
                                             apt.status === 'accepted' ? '#d4edda' : '#f8d7da',
                                  color: apt.status === 'pending' ? '#856404' :
                                         apt.status === 'accepted' ? '#155724' : '#721c24'
                                }}>
                                  {apt.status}
                                </span>
                              </div>
                              <span style={styles.appointmentTime}>
                                {formatDate(apt.created_at)}
                              </span>
                            </div>
                            <div style={styles.appointmentDetails}>
                              <div style={styles.appointmentRow}>
                                <Icons.Phone />
                                <span style={styles.phoneNumber}>{apt.phone_number}</span>
                              </div>
                              <div style={styles.appointmentRow}>
                                <Icons.Calendar />
                                <span>{apt.preferred_date} at {apt.preferred_time}</span>
                              </div>
                              <div style={styles.appointmentReason}>
                                <strong>Reason:</strong> {apt.reason}
                              </div>
                              <div style={styles.appointmentMessage}>
                                <strong>Original Message:</strong> {apt.original_message}
                              </div>
                              {apt.admin_notes && (
                                <div style={styles.adminNotes}>
                                  <strong>Admin Notes:</strong> {apt.admin_notes}
                                </div>
                              )}
                            </div>
                            {apt.status === 'pending' && (
                              <div style={styles.appointmentActions}>
                                <button 
                                  style={styles.acceptBtn}
                                  onClick={() => handleAppointmentAction(apt.appointment_id, 'accept')}
                                >
                                  <Icons.Check />
                                  Accept & Call Patient
                                </button>
                                <button 
                                  style={styles.rejectBtn}
                                  onClick={() => handleAppointmentAction(apt.appointment_id, 'reject')}
                                >
                                  <Icons.Error />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {adminTab === 'history' && (
                <div style={styles.adminCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>
                      <Icons.History />
                      Chat History
                    </h3>
                    <select 
                      value={historyFilter}
                      onChange={(e) => {
                        setHistoryFilter(e.target.value);
                        setTimeout(() => loadChatHistory(), 100);
                      }}
                      style={styles.filterSelect}
                    >
                      <option value="all">All Roles</option>
                      <option value="patient">Patients</option>
                      <option value="visitor">Visitors</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                  <div style={styles.historyList}>
                    {chatHistory.length === 0 ? (
                      <p style={styles.noData}>No chat history available</p>
                    ) : (
                      chatHistory.map((chat, index) => (
                        <div key={index} style={styles.historyCard}>
                          <div style={styles.historyHeader}>
                            <div style={styles.historyUserInfo}>
                              <strong style={styles.historyUser}>
                                <Icons.User />
                                {chat.user_name}
                              </strong>
                              <span style={styles.historyRole}>{chat.user_role}</span>
                              {chat.is_appointment_request && (
                                <span style={styles.appointmentTag}>
                                  <Icons.Calendar />
                                  Appointment
                                </span>
                              )}
                            </div>
                            <span style={styles.historyTime}>
                              {formatDate(chat.created_at)}
                            </span>
                          </div>
                          <div style={styles.historyMessage}>
                            <div style={styles.historyQuestion}>
                              <strong>Q:</strong> {chat.message}
                            </div>
                            <div style={styles.historyAnswer}>
                              <strong>A:</strong> {chat.response}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {adminTab === 'notifications' && (
                <div style={styles.adminCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>
                      <Icons.Notification />
                      Notifications ({notifications.length})
                    </h3>
                    <button 
                      onClick={loadNotifications}
                      style={styles.reloadBtn}
                    >
                      <Icons.Reload />
                      Refresh
                    </button>
                  </div>
                  <div style={styles.notificationsList}>
                    {notifications.length === 0 ? (
                      <p style={styles.noData}>No notifications</p>
                    ) : (
                      notifications.map((notification, index) => (
                        <div 
                          key={index} 
                          style={{
                            ...styles.notificationCard,
                            background: notification.read ? '#f8f9fa' : '#e8f1ff'
                          }}
                          onClick={() => !notification.read && handleMarkNotificationRead(notification.id)}
                        >
                          <div style={styles.notificationHeader}>
                            <h4 style={styles.notificationTitle}>{notification.title}</h4>
                            {!notification.read && (
                              <span style={styles.unreadBadge}>New</span>
                            )}
                          </div>
                          <p style={styles.notificationMessage}>{notification.message}</p>
                          <div style={styles.notificationTime}>
                            {formatDate(notification.created_at)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {adminTab === 'documents' && (
                <>
                  <div style={styles.adminCard}>
                    <h3 style={styles.cardTitle}>
                      <Icons.Analysis />
                      System Status
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
                      <Icons.Upload />
                      Upload Document
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
                        <Icons.Document />
                        Documents ({documents.length})
                      </h3>
                      <button onClick={handleReloadDocuments} style={styles.reloadBtn} disabled={loading}>
                        <Icons.Reload />
                        Reload
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
                </>
              )}
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
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
    padding: '20px'
  },
  loginCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '550px',
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
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
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
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
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
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748'
  },
  formInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px'
  },
  backBtn: {
    flex: 1,
    padding: '14px',
    background: '#f7fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    color: '#2d3748',
    transition: 'all 0.3s'
  },
  continueBtn: {
    flex: 2,
    padding: '14px',
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    transition: 'all 0.3s'
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
  error: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  roleButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px'
  },
  roleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 20px',
    background: 'linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%)',
    border: '2px solid #e8f1ff',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'left',
    width: '100%',
    fontFamily: 'inherit'
  },
  roleIcon: {
    fontSize: '32px',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
    borderRadius: '12px',
    flexShrink: 0
  },
  roleTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#2d3748',
    fontWeight: '600'
  },
  roleDesc: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#718096'
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
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
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
    fontSize: '13px',
    opacity: 0.9
  },
  userRole: {
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'capitalize',
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '8px'
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
    gap: '8px',
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#FF8C00',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutBtn: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    color: '#1F3A9E',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    background: 'linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%)'
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
    background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)',
    color: 'white'
  },
  messageBot: {
    alignSelf: 'flex-start',
    background: 'linear-gradient(135deg, #e8f1ff 0%, #f0f8ff 100%)',
    color: '#1F3A9E',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #d1e4ff'
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
  appointmentSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
    padding: '8px 12px',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500'
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
    background: '#2E4AC7',
    animation: 'bounce 1.4s infinite ease-in-out'
  },
  quickActions: {
    padding: '20px',
    background: 'linear-gradient(135deg, #e8f1ff 0%, #f0f8ff 100%)',
    borderTop: '1px solid #d1e4ff',
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
    color: '#1F3A9E',
    fontWeight: '600'
  },
  messageCounter: {
    fontSize: '13px',
    color: '#718096',
    padding: '6px 12px',
    background: 'rgba(255, 140, 0, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 140, 0, 0.2)'
  },
  actionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  actionBtn: {
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(46, 74, 199, 0.3)'
  },
  chatInput: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    background: 'white',
    borderTop: '1px solid #e8f1ff'
  },
  messageInput: {
    flex: 1,
    padding: '14px 18px',
    border: '2px solid #d1e4ff',
    borderRadius: '16px',
    fontSize: '15px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    maxHeight: '120px',
    transition: 'border-color 0.3s',
    background: 'linear-gradient(135deg, #fafcff 0%, #f8fafe 100%)'
  },
  sendButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)',
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
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafe 100%)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '1000px',
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
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #2E4AC7 0%, #1F3A9E 100%)',
    color: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px'
  },
  modalTitle: {
    margin: 0,
    fontSize: '24px',
    color: 'white',
    fontWeight: '600'
  },
  modalClose: {
    width: '44px',
    height: '44px',
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '20px',
    color: 'white',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  adminTabs: {
    display: 'flex',
    gap: '8px',
    padding: '20px 30px 0',
    background: 'linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%)'
  },
  tabBtn: {
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#718096',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative'
  },
  tabBtnActive: {
    color: '#2E4AC7',
    borderBottomColor: '#FF8C00'
  },
  badge: {
    background: '#FF8C00',
    color: 'white',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center'
  },
  modalContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    background: 'linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafe 100%)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #e8f1ff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: '#e8f1ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2E4AC7',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '13px',
    color: '#718096',
    marginTop: '4px'
  },
  adminCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafe 100%)',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e8f1ff'
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    color: '#1F3A9E',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  filterSelect: {
    padding: '8px 16px',
    border: '2px solid #e8f1ff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2E4AC7',
    background: 'white',
    cursor: 'pointer',
    outline: 'none'
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  appointmentCard: {
    background: 'linear-gradient(135deg, #f8fafe 0%, #f0f8ff 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e8f1ff'
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  appointmentName: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    color: '#2d3748',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  appointmentBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  appointmentTime: {
    fontSize: '12px',
    color: '#718096'
  },
  appointmentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px'
  },
  appointmentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#4a5568'
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#2E4AC7'
  },
  appointmentReason: {
    fontSize: '14px',
    color: '#4a5568',
    marginTop: '8px',
    padding: '12px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '8px'
  },
  appointmentMessage: {
    fontSize: '14px',
    color: '#4a5568',
    padding: '12px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '8px'
  },
  adminNotes: {
    fontSize: '14px',
    color: '#2E4AC7',
    padding: '12px',
    background: '#e8f1ff',
    borderRadius: '8px',
    marginTop: '8px'
  },
  appointmentActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  acceptBtn: {
    flex: 1,
    padding: '12px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s'
  },
  rejectBtn: {
    flex: 1,
    padding: '12px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  historyCard: {
    background: 'linear-gradient(135deg, #f8fafe 0%, #f0f8ff 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e8f1ff'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  historyUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  historyUser: {
    fontSize: '15px',
    color: '#2d3748',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  historyRole: {
    padding: '4px 10px',
    background: '#e8f1ff',
    color: '#2E4AC7',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  appointmentTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: '#fff3cd',
    color: '#856404',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600'
  },
  historyTime: {
    fontSize: '12px',
    color: '#718096'
  },
  historyMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  historyQuestion: {
    fontSize: '14px',
    color: '#2d3748',
    padding: '12px',
    background: 'rgba(255,140,0,0.1)',
    borderRadius: '8px',
    borderLeft: '3px solid #FF8C00'
  },
  historyAnswer: {
    fontSize: '14px',
    color: '#2d3748',
    padding: '12px',
    background: 'rgba(46,74,199,0.1)',
    borderRadius: '8px',
    borderLeft: '3px solid #2E4AC7'
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  notificationCard: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e8f1ff',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  notificationTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#2d3748',
    fontWeight: '600'
  },
  unreadBadge: {
    background: '#FF8C00',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600'
  },
  notificationMessage: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#4a5568',
    whiteSpace: 'pre-line'
  },
  notificationTime: {
    fontSize: '12px',
    color: '#718096'
  },
  noData: {
    textAlign: 'center',
    color: '#718096',
    padding: '40px',
    fontSize: '15px'
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
    background: 'linear-gradient(135deg, #f8fafe 0%, #f0f8ff 100%)',
    borderRadius: '12px',
    fontSize: '14px',
    border: '1px solid #e8f1ff'
  },
  statusSuccess: {
    color: '#28a745',
    fontWeight: '600'
  },
  statusError: {
    color: '#dc3545',
    fontWeight: '600'
  },
  uploadArea: {
    border: '2px dashed #d1e4ff',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: 'linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%)'
  },
  uploadAreaDragOver: {
    borderColor: '#2E4AC7',
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
    background: 'linear-gradient(135deg, #e8f1ff 0%, #f0f8ff 100%)',
    borderRadius: '12px',
    marginTop: '16px',
    border: '1px solid #d1e4ff'
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
    background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)',
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
    background: '#e8f1ff',
    borderRadius: '4px',
    marginTop: '16px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF8C00, #FFA500)',
    transition: 'width 0.3s ease-in-out'
  },
  reloadBtn: {
    padding: '10px 16px',
    background: '#28a745',
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
    background: 'linear-gradient(135deg, #f8fafe 0%, #f0f8ff 100%)',
    borderRadius: '12px',
    border: '1px solid #e8f1ff'
  },
  docSize: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '500'
  }
};

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
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
  
  input:focus, textarea:focus, select:focus {
    border-color: #2E4AC7 !important;
  }
`;
document.head.appendChild(styleSheet);

export default App;