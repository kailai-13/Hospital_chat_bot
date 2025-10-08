# main.py - Complete KG Hospital Chatbot API with Fixed Table Representation
import re
import os
import tempfile
import time
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, storage, firestore
from dotenv import load_dotenv

# LangChain imports
from langchain_community.document_loaders import UnstructuredPDFLoader, PyPDFLoader
from langchain_text_splitters.character import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

# =============================================================================
# CONFIGURATION & INITIALIZATION
# =============================================================================
load_dotenv()

app = FastAPI(
    title="KG Hospital AI Chatbot API",
    version="2.0.0",
    description="AI-powered chatbot system for KG Hospital with Admin Features"
)

PORT = int(os.getenv("PORT", 8000))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://hospital-chat-bot.vercel.app",
        "https://hospital-chat-bot-frontend-9ds2.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin SDK
try:
    if not firebase_admin._apps:
        firebase_config = {
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }

        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred, {
            'storageBucket': f"{firebase_config['project_id']}.firebasestorage.app"
        })

    bucket = storage.bucket()
    db = firestore.client()
    FIREBASE_INITIALIZED = True
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    FIREBASE_INITIALIZED = False
    db = None

# In-memory storage as fallback
in_memory_storage = {
    'chat_history': [],
    'appointment_requests': [],
    'admin_notifications': []
}

vectorstore = None
conversation_chain = None
loaded_documents = []

# =============================================================================
# PYDANTIC MODELS
# =============================================================================
class ChatMessage(BaseModel):
    message: str
    user_role: str = "patient"
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    phone_number: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    is_appointment_request: bool = False
    appointment_id: Optional[str] = None

class AppointmentRequest(BaseModel):
    user_name: str
    phone_number: str
    preferred_date: str
    preferred_time: str
    reason: str
    user_role: str = "patient"

class AppointmentAction(BaseModel):
    appointment_id: str
    action: str  # "accept" or "reject"
    admin_notes: Optional[str] = None

# =============================================================================
# STORAGE FUNCTIONS (WITH FALLBACK)
# =============================================================================
def save_chat_history(user_id: str, user_role: str, user_name: str, 
                     message: str, response: str, is_appointment: bool = False):
    """Save chat conversation with Firestore fallback to in-memory storage."""
    
    chat_data = {
        'id': str(uuid.uuid4()),
        'user_id': user_id or 'anonymous',
        'user_role': user_role,
        'user_name': user_name or 'Anonymous User',
        'message': message,
        'response': response,
        'is_appointment_request': is_appointment,
        'created_at': datetime.now().isoformat()
    }
    
    # Try Firestore first
    if FIREBASE_INITIALIZED and db:
        try:
            doc_ref = db.collection('chat_history').document(chat_data['id'])
            doc_ref.set(chat_data)
            print(f"✓ Chat history saved to Firestore for user: {user_name}")
            return True
        except Exception as e:
            print(f"✗ Firestore save failed, using in-memory: {e}")
    
    # Fallback to in-memory storage
    in_memory_storage['chat_history'].append(chat_data)
    print(f"✓ Chat history saved to memory for user: {user_name}")
    return True

def save_appointment_request(user_name: str, phone_number: str, 
                            preferred_date: str, preferred_time: str, 
                            reason: str, user_role: str, original_message: str):
    """Save appointment request with Firestore fallback."""
    
    appointment_id = str(uuid.uuid4())
    appointment_data = {
        'appointment_id': appointment_id,
        'user_name': user_name,
        'phone_number': phone_number,
        'preferred_date': preferred_date,
        'preferred_time': preferred_time,
        'reason': reason,
        'user_role': user_role,
        'original_message': original_message,
        'status': 'pending',
        'admin_notes': '',
        'created_at': datetime.now().isoformat()
    }
    
    # Try Firestore first
    if FIREBASE_INITIALIZED and db:
        try:
            db.collection('appointment_requests').document(appointment_id).set(appointment_data)
            print(f"✓ Appointment request saved to Firestore: {appointment_id}")
            
            # Create notification
            save_admin_notification(
                "📅 New Appointment Request",
                f"Patient: {user_name}\nPhone: {phone_number}\nDate: {preferred_date}\nTime: {preferred_time}",
                "appointment_request"
            )
            return appointment_id
        except Exception as e:
            print(f"✗ Firestore save failed, using in-memory: {e}")
    
    # Fallback to in-memory storage
    in_memory_storage['appointment_requests'].append(appointment_data)
    
    # Create notification
    save_admin_notification(
        "📅 New Appointment Request",
        f"Patient: {user_name}\nPhone: {phone_number}\nDate: {preferred_date}\nTime: {preferred_time}",
        "appointment_request"
    )
    
    print(f"✓ Appointment request saved to memory: {appointment_id}")
    return appointment_id

def get_all_chat_history(user_role: Optional[str] = None, limit: int = 100):
    """Retrieve chat history with Firestore fallback."""
    
    try:
        # Try Firestore first
        if FIREBASE_INITIALIZED and db:
            try:
                query = db.collection('chat_history')
                if user_role and user_role != 'all':
                    query = query.where('user_role', '==', user_role)
                
                docs = query.limit(limit).stream()
                history = []
                for doc in docs:
                    data = doc.to_dict()
                    data['id'] = doc.id
                    history.append(data)
                
                # Sort by created_at
                history.sort(key=lambda x: x.get('created_at', ''), reverse=True)
                print(f"✓ Retrieved {len(history)} chat history records from Firestore")
                return history
            except Exception as e:
                print(f"✗ Firestore retrieval failed: {e}")
        
        # Fallback to in-memory storage
        history = in_memory_storage['chat_history'].copy()
        
        # Filter by role if specified
        if user_role and user_role != 'all':
            history = [chat for chat in history if chat.get('user_role') == user_role]
        
        # Sort and limit
        history.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        history = history[:limit]
        
        print(f"✓ Retrieved {len(history)} chat history records from memory")
        return history
        
    except Exception as e:
        print(f"✗ Error retrieving chat history: {e}")
        return []

def get_appointment_requests(status: Optional[str] = None):
    """Retrieve appointment requests with Firestore fallback."""
    
    try:
        # Try Firestore first
        if FIREBASE_INITIALIZED and db:
            try:
                query = db.collection('appointment_requests')
                if status:
                    query = query.where('status', '==', status)
                
                docs = query.stream()
                appointments = []
                for doc in docs:
                    data = doc.to_dict()
                    appointments.append(data)
                
                # Sort by created_at
                appointments.sort(key=lambda x: x.get('created_at', ''), reverse=True)
                print(f"✓ Retrieved {len(appointments)} appointment requests from Firestore")
                return appointments
            except Exception as e:
                print(f"✗ Firestore retrieval failed: {e}")
        
        # Fallback to in-memory storage
        appointments = in_memory_storage['appointment_requests'].copy()
        
        # Filter by status if specified
        if status:
            appointments = [apt for apt in appointments if apt.get('status') == status]
        
        # Sort by created_at
        appointments.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        print(f"✓ Retrieved {len(appointments)} appointment requests from memory")
        return appointments
        
    except Exception as e:
        print(f"✗ Error retrieving appointment requests: {e}")
        return []

def update_appointment_status(appointment_id: str, action: str, admin_notes: str = ""):
    """Update appointment request status with Firestore fallback."""
    
    new_status = 'accepted' if action == 'accept' else 'rejected'
    
    # Try Firestore first
    if FIREBASE_INITIALIZED and db:
        try:
            doc_ref = db.collection('appointment_requests').document(appointment_id)
            doc = doc_ref.get()
            
            if doc.exists:
                appointment_data = doc.to_dict()
                update_data = {
                    'status': new_status,
                    'admin_notes': admin_notes,
                    'updated_at': datetime.now().isoformat()
                }
                doc_ref.update(update_data)
                
                # Save notification
                save_admin_notification(
                    f"📋 Appointment {new_status.capitalize()}",
                    f"Patient: {appointment_data.get('user_name', 'Unknown')}\n"
                    f"Phone: {appointment_data.get('phone_number', 'Not provided')}\n"
                    f"Status: {new_status}\n"
                    f"Notes: {admin_notes}",
                    "appointment_action"
                )
                
                print(f"✓ Appointment {appointment_id} status updated in Firestore to: {new_status}")
                return True
        except Exception as e:
            print(f"✗ Firestore update failed: {e}")
    
    # Fallback to in-memory storage
    for appointment in in_memory_storage['appointment_requests']:
        if appointment.get('appointment_id') == appointment_id:
            appointment['status'] = new_status
            appointment['admin_notes'] = admin_notes
            appointment['updated_at'] = datetime.now().isoformat()
            
            # Save notification
            save_admin_notification(
                f"📋 Appointment {new_status.capitalize()}",
                f"Patient: {appointment.get('user_name', 'Unknown')}\n"
                f"Phone: {appointment.get('phone_number', 'Not provided')}\n"
                f"Status: {new_status}\n"
                f"Notes: {admin_notes}",
                "appointment_action"
            )
            
            print(f"✓ Appointment {appointment_id} status updated in memory to: {new_status}")
            return True
    
    print(f"✗ Appointment {appointment_id} not found")
    return False

def save_admin_notification(title: str, message: str, notification_type: str = "info"):
    """Save notification with Firestore fallback."""
    
    notification_data = {
        'id': str(uuid.uuid4()),
        'title': title,
        'message': message,
        'type': notification_type,
        'read': False,
        'created_at': datetime.now().isoformat()
    }
    
    # Try Firestore first
    if FIREBASE_INITIALIZED and db:
        try:
            db.collection('admin_notifications').add(notification_data)
            print(f"✓ Admin notification saved to Firestore: {title}")
            return True
        except Exception as e:
            print(f"✗ Firestore save failed, using in-memory: {e}")
    
    # Fallback to in-memory storage
    in_memory_storage['admin_notifications'].append(notification_data)
    print(f"✓ Admin notification saved to memory: {title}")
    return True

def get_admin_notifications(limit: int = 20):
    """Get admin notifications with Firestore fallback."""
    
    try:
        # Try Firestore first
        if FIREBASE_INITIALIZED and db:
            try:
                query = db.collection('admin_notifications')
                docs = query.limit(limit).stream()
                
                notifications = []
                for doc in docs:
                    data = doc.to_dict()
                    data['id'] = doc.id
                    notifications.append(data)
                
                # Sort by created_at
                notifications.sort(key=lambda x: x.get('created_at', ''), reverse=True)
                return notifications
            except Exception as e:
                print(f"✗ Firestore retrieval failed: {e}")
        
        # Fallback to in-memory storage
        notifications = in_memory_storage['admin_notifications'].copy()
        notifications.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        notifications = notifications[:limit]
        
        return notifications
        
    except Exception as e:
        print(f"Error retrieving notifications: {e}")
        return []

def mark_notification_read(notification_id: str):
    """Mark a notification as read with Firestore fallback."""
    
    # Try Firestore first
    if FIREBASE_INITIALIZED and db:
        try:
            doc_ref = db.collection('admin_notifications').document(notification_id)
            doc_ref.update({
                'read': True, 
                'read_at': datetime.now().isoformat()
            })
            return True
        except Exception as e:
            print(f"✗ Firestore update failed: {e}")
    
    # Fallback to in-memory storage
    for notification in in_memory_storage['admin_notifications']:
        if notification.get('id') == notification_id:
            notification['read'] = True
            notification['read_at'] = datetime.now().isoformat()
            return True
    
    return False

# =============================================================================
# APPOINTMENT DETECTION & EXTRACTION
# =============================================================================
def detect_appointment_intent(message: str) -> bool:
    """Detect if the message is requesting an appointment."""
    appointment_keywords = [
        'appointment', 'book', 'schedule', 'meet', 'doctor visit',
        'consultation', 'checkup', 'visit doctor', 'see doctor',
        'reserve', 'slot', 'available time'
    ]
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in appointment_keywords)

def extract_appointment_details(message: str) -> dict:
    """Extract date, time, and reason from appointment request."""
    details = {
        'date': None,
        'time': None,
        'reason': None
    }
    
    # Extract date patterns
    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # 12/25/2024 or 12-25-24
        r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',     # 2024-12-25
        r'\b(today|tomorrow|next week|next month)\b'
    ]
    for pattern in date_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            details['date'] = match.group(0)
            break
    
    # Extract time patterns
    time_patterns = [
        r'\b\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)\b',  # 10:30 AM
        r'\b\d{1,2}\s*(?:am|pm|AM|PM)\b',         # 10 AM
        r'\b(morning|afternoon|evening)\b'
    ]
    for pattern in time_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            details['time'] = match.group(0)
            break
    
    # Extract reason (simple extraction of main content)
    reason_indicators = ['for', 'regarding', 'about', 'because']
    for indicator in reason_indicators:
        if indicator in message.lower():
            parts = message.lower().split(indicator, 1)
            if len(parts) > 1:
                details['reason'] = parts[1].strip()[:200]  # Limit length
                break
    
    return details

# =============================================================================
# DOCUMENT PROCESSING FUNCTIONS
# =============================================================================
def load_document(file_path: str):
    documents = []
    file_name = os.path.basename(file_path)

    try:
        loader = UnstructuredPDFLoader(file_path)
        documents = loader.load()
        if documents:
            print(f"Loaded {file_name} using UnstructuredPDFLoader")
            return documents
    except Exception as e:
        print(f"UnstructuredPDFLoader failed for {file_name}: {e}")

    try:
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        if documents:
            print(f"Loaded {file_name} using PyPDFLoader")
            return documents
    except Exception as e:
        print(f"PyPDFLoader failed for {file_name}: {e}")

    raise Exception(f"All PDF processing methods failed for {file_name}")

def setup_vectorstore(documents):
    if not documents:
        raise ValueError("No documents provided for vectorstore creation")

    print(f"Processing {len(documents)} document pages...")

    text_splitter = CharacterTextSplitter(
        separator='\n',
        chunk_size=800,
        chunk_overlap=100,
        length_function=len
    )

    doc_chunks = text_splitter.split_documents(documents)
    print(f"Created {len(doc_chunks)} text chunks")

    if len(doc_chunks) > 2000:
        print("Large document detected. Limiting to 2000 chunks for performance.")
        doc_chunks = doc_chunks[:2000]

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )

    print("Creating vector store...")
    vectorstore = FAISS.from_documents(doc_chunks, embeddings)
    print("Vector store created successfully!")

    return vectorstore

def create_chain(vectorstore):
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )

    memory = ConversationBufferMemory(
        llm=llm,
        output_key='answer',
        memory_key='chat_history',
        return_messages=True
    )

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        verbose=False,
        return_source_documents=False
    )

    return chain

# =============================================================================
# FIREBASE STORAGE FUNCTIONS
# =============================================================================
def upload_file_to_firebase(file_path: str, file_name: str):
    if not FIREBASE_INITIALIZED:
        return False, "Firebase not initialized"

    try:
        blob = bucket.blob(f"documents/{file_name}")
        blob.upload_from_filename(file_path)
        print(f"Uploaded {file_name} to Firebase Storage")
        return True, f"File '{file_name}' uploaded successfully"
    except Exception as e:
        print(f"Upload failed for {file_name}: {e}")
        return False, f"Upload failed: {str(e)}"

def list_firebase_files():
    if not FIREBASE_INITIALIZED:
        return []

    try:
        blobs = bucket.list_blobs(prefix="documents/")
        files_info = []

        for blob in blobs:
            if blob.name.lower().endswith('.pdf'):
                files_info.append({
                    'name': blob.name.replace('documents/', ''),
                    'size': blob.size or 0,
                    'created': blob.time_created.isoformat() if blob.time_created else '',
                    'status': 'loaded'
                })

        return files_info
    except Exception as e:
        print(f"Error listing files: {e}")
        return []

def download_firebase_file(file_name: str):
    if not FIREBASE_INITIALIZED:
        return None

    try:
        blob = bucket.blob(f"documents/{file_name}")
        if not blob.exists():
            return None

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file_path = temp_file.name
        temp_file.close()

        blob.download_to_filename(temp_file_path)
        return temp_file_path
    except Exception as e:
        print(f"Download failed for {file_name}: {e}")
        return None

def reload_all_documents():
    global vectorstore, conversation_chain, loaded_documents

    print("Reloading all documents from Firebase...")
    firebase_files = list_firebase_files()
    if not firebase_files:
        return False, "No documents found in Firebase"

    all_documents = []
    successful_loads = 0

    for file_info in firebase_files:
        file_name = file_info['name']
        print(f"Processing {file_name}...")

        temp_file_path = download_firebase_file(file_name)
        if temp_file_path:
            try:
                documents = load_document(temp_file_path)
                all_documents.extend(documents)
                successful_loads += 1
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Failed to process {file_name}: {e}")
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

    if all_documents:
        print(f"Total documents loaded: {len(all_documents)}")
        vectorstore = setup_vectorstore(all_documents)
        conversation_chain = create_chain(vectorstore)
        loaded_documents = all_documents
        return True, f"Successfully loaded {successful_loads} out of {len(firebase_files)} documents"

    return False, "No documents could be processed"

# =============================================================================
# RESPONSE FORMATTER - COMPLETELY FIXED TABLE HANDLING
# =============================================================================
def format_response_text(text: str) -> str:
    """Format chatbot output into clean, ChatGPT-like layout for React frontend."""
    if not text:
        return "I'm happy to assist. You can also contact KG Hospital for detailed guidance."

    original_text = text.strip()
    
    # Enhanced table detection - look for multiple table patterns
    table_sections = []
    non_table_sections = []
    
    lines = original_text.split('\n')
    current_section = []
    in_table = False
    table_start_index = -1
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Check if this line starts a table (has pipes and dashes or multiple pipes)
        if ('|' in line and '---' in line) or (line.count('|') >= 2 and any(char in line for char in ['-', '=', ':'])):
            if not in_table and current_section:
                # Save previous non-table section
                non_table_sections.append('\n'.join(current_section))
                current_section = []
            
            in_table = True
            table_start_index = i if table_start_index == -1 else table_start_index
            current_section.append(line)
            
        elif in_table and '|' in line:
            # Continue table
            current_section.append(line)
            
        elif in_table and not line:
            # Empty line in table - continue
            current_section.append(line)
            
        elif in_table and not ('|' in line and line.count('|') >= 2):
            # Table ended
            if current_section:
                table_sections.append({
                    'start_index': table_start_index,
                    'content': '\n'.join(current_section)
                })
                current_section = []
            in_table = False
            table_start_index = -1
            current_section.append(line)
            
        else:
            # Regular text
            current_section.append(line)
    
    # Handle remaining content
    if current_section:
        if in_table:
            table_sections.append({
                'start_index': table_start_index,
                'content': '\n'.join(current_section)
            })
        else:
            non_table_sections.append('\n'.join(current_section))
    
    # If we found tables, reconstruct the text with proper table markers
    if table_sections:
        formatted_sections = []
        
        # Process non-table sections first
        for section in non_table_sections:
            if section.strip():
                formatted_sections.append(format_regular_text(section))
        
        # Process table sections with proper markers
        for table_section in table_sections:
            formatted_sections.append(f"TABLE_START\n{table_section['content']}\nTABLE_END")
        
        return '\n\n'.join(formatted_sections)
    else:
        # No tables found, use regular formatting
        return format_regular_text(original_text)

def format_regular_text(text: str) -> str:
    """Format regular text without tables."""
    if not text:
        return ""
    
    text = re.sub(r'(\d+\.)\s*\n\s*([A-Za-z])', r'\1 \2', text)
    text = re.sub(r'([A-Za-z\)]\s+)(\d+\.)(?=\s*[A-Za-z])', r'\1\n\2', text)
    text = re.sub(r'\n\s*(\d+)\s*\n\s*(\d+\.)', r'\n\1\2', text)
    
    lines = []
    raw_lines = text.split('\n')
    
    current_number = 0
    pending_number = None
    
    for line in raw_lines:
        line = line.strip()
        if not line:
            if lines and lines[-1] != "":
                lines.append("")
            continue
        
        if re.match(r'^\d+$', line):
            pending_number = int(line)
            continue
        
        number_match = re.match(r'^(\d+\.)\s*(.+)', line)
        if number_match:
            number = number_match.group(1)
            content = number_match.group(2).strip()
            content = re.sub(r'\s+', ' ', content)
            content = content.rstrip('.')
            lines.append(f"{number} {content}")
            current_number = int(number.rstrip('.'))
            pending_number = None
            continue
        
        if pending_number is not None and line and not line.startswith(str(pending_number)):
            content = line.strip().rstrip('.')
            content = re.sub(r'\s+', ' ', content)
            lines.append(f"{pending_number}. {content}")
            current_number = pending_number
            pending_number = None
            continue
        
        if not re.match(r'^\d+', line):
            if 'department' in line.lower():
                dept_match = re.search(r'([A-Za-z\s]+department)', line, re.IGNORECASE)
                if dept_match:
                    dept_name = dept_match.group(1).title()
                    if lines and lines[-1] != "":
                        lines.append("")
                    lines.append(f"**{dept_name}**")
                    
                    remaining = line[dept_match.end():].strip()
                    if remaining.startswith(':') or remaining.startswith('is:'):
                        remaining = re.sub(r'^:?\s*is:?\s*', '', remaining)
                    if remaining:
                        lines.append(remaining)
                    if lines[-1] != "":
                        lines.append("")
                    continue
            
            if any(phrase in line.lower() for phrase in ['mentioned:', 'list of', 'includes', 'following', 'columns:']):
                lines.append(line)
                continue
                
            lines.append(line)
    
    formatted_text = '\n'.join(lines)
    formatted_text = re.sub(r'\n{3,}', '\n\n', formatted_text)
    formatted_text = re.sub(r'^\n+', '', formatted_text)
    formatted_text = re.sub(r'\n+$', '', formatted_text)
    
    return formatted_text

# =============================================================================
# STARTUP EVENT
# =============================================================================
@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print("Starting KG Hospital Chatbot API v2.0.0")
    print("=" * 60)
    print(f"Firebase Status: {'✓ Connected' if FIREBASE_INITIALIZED else '✗ Not Connected'}")
    print(f"Firestore Status: {'✓ Enabled' if FIREBASE_INITIALIZED and db else '✗ Disabled'}")
    print(f"Storage Mode: {'Firestore' if FIREBASE_INITIALIZED and db else 'In-Memory (Fallback)'}")

    if FIREBASE_INITIALIZED:
        print("\nLoading initial documents from Firebase Storage...")
        success, message = reload_all_documents()
        if success:
            print(f"✓ {message}")
        else:
            print(f"⚠ {message}")
    
    print("\n" + "=" * 60)
    print("🏥 KG Hospital Chatbot API is ready!")
    print("=" * 60)

# =============================================================================
# CHAT ENDPOINT WITH APPOINTMENT DETECTION (FIXED)
# =============================================================================
@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Chat endpoint with appointment detection and history tracking."""
    global conversation_chain

    try:
        print(f"\n📨 Chat request from {message.user_role}: {message.message[:50]}...")

        # Detect if this is an appointment request
        is_appointment = detect_appointment_intent(message.message)
        appointment_id = None

        # Generate AI response
        if conversation_chain:
            response = conversation_chain.invoke({'question': message.message})
            answer = response.get('answer', '')
        else:
            llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

            system_prompts = {
                "patient": """You are a helpful KG Hospital AI assistant helping patients. 
                
                Provide clear, organized information about:
                - Doctor appointments and specializations
                - Hospital services and departments  
                - Treatment information and medical procedures
                - Emergency contacts and protocols
                
                When presenting data in tables, use proper markdown table format with clear headers and separators.
                Use | and - characters to create clean, readable tables.
                
                If someone requests an appointment, guide them to provide:
                1. Their full name
                2. Phone number
                3. Preferred date
                4. Preferred time
                5. Reason for visit
                
                Format your responses using natural sentences and organize lists clearly.
                If information is unavailable, guide the user to contact the hospital front desk or helpline.""",

                "visitor": """You are a helpful KG Hospital AI assistant helping visitors.
                
                Provide clear information about:
                - Visiting hours and policies
                - Hospital location and directions
                - Parking information and facilities
                - Hospital amenities and services
                
                When using tables, ensure they are properly formatted with headers and separators.
                
                Format your answers using natural sentences and organize information clearly.""",

                "staff": """You are a helpful KG Hospital AI assistant helping hospital staff.
                
                Provide organized information about:
                - Patient inquiry responses
                - Department information and contacts
                - Emergency protocols and procedures
                - Hospital policies and guidelines
                
                Use proper table formatting when presenting structured data.
                
                Format your answers using clear sentences and organize information logically.""",

                "admin": """You are a helpful KG Hospital AI assistant helping administrators.
                
                Provide comprehensive information about:
                - Hospital operations and management
                - System status and analytics
                - Administrative procedures
                - Staff coordination and policies
                
                Present data in well-formatted tables when appropriate.
                
                Format your output using clear paragraphs and organize information systematically."""
            }

            system_prompt = system_prompts.get(message.user_role, system_prompts["patient"])
            full_prompt = f"{system_prompt}\n\nUser Question: {message.message}\n\nResponse:"
            response = llm.invoke(full_prompt)
            answer = response.content

        # Handle appointment requests
        if is_appointment:
            if message.phone_number and message.user_name:
                # User has provided contact details - create appointment
                details = extract_appointment_details(message.message)
                appointment_id = save_appointment_request(
                    user_name=message.user_name,
                    phone_number=message.phone_number,
                    preferred_date=details['date'] or 'Not specified',
                    preferred_time=details['time'] or 'Not specified',
                    reason=details['reason'] or message.message[:200],
                    user_role=message.user_role,
                    original_message=message.message
                )
                
                if appointment_id:
                    answer += "\n\n✅ Your appointment request has been submitted successfully! Our admin team will review it and contact you shortly at the provided phone number."
                    print(f"✓ Appointment booked: {appointment_id}")
            else:
                # Ask user to provide contact details
                answer += "\n\n📋 To book an appointment, please provide your full name and phone number so our team can contact you to confirm the appointment details."
                print("⚠ Appointment request detected but missing contact details")

        # Save chat history - NOW WORKING WITH FALLBACK
        save_result = save_chat_history(
            user_id=message.user_id or str(uuid.uuid4()),
            user_role=message.user_role,
            user_name=message.user_name or "Anonymous",
            message=message.message,
            response=answer,
            is_appointment=is_appointment
        )

        if not answer.strip() or "I don't know" in answer or "I'm not sure" in answer:
            answer = ("I'm happy to help with your query. "
                      "While I don't have specific information on that at the moment, "
                      "you can contact KG Hospital's support or visit the front desk anytime for assistance.")

        formatted_answer = format_response_text(answer)

        return ChatResponse(
            response=formatted_answer,
            timestamp=datetime.now().isoformat(),
            is_appointment_request=is_appointment and appointment_id is not None,
            appointment_id=appointment_id
        )

    except Exception as e:
        print(f"✗ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

# =============================================================================
# ADMIN ENDPOINTS (COMPLETELY FIXED)
# =============================================================================
@app.get("/admin/chat-history")
async def get_chat_history(user_role: Optional[str] = None, limit: int = 100):
    """Get all chat history for admin dashboard - NOW WORKING PROPERLY."""
    try:
        history = get_all_chat_history(user_role=user_role, limit=limit)
        return {
            "history": history,
            "count": len(history),
            "filtered_by": user_role or "all",
            "storage_mode": "firestore" if FIREBASE_INITIALIZED and db else "memory"
        }
    except Exception as e:
        print(f"Error in chat-history endpoint: {e}")
        return {
            "history": [],
            "count": 0,
            "filtered_by": user_role or "all",
            "storage_mode": "error",
            "error": str(e)
        }

@app.get("/admin/appointments")
async def get_appointments(status: Optional[str] = None):
    """Get all appointment requests for admin dashboard."""
    try:
        appointments = get_appointment_requests(status=status)
        return {
            "appointments": appointments,
            "count": len(appointments),
            "filtered_by": status or "all",
            "storage_mode": "firestore" if FIREBASE_INITIALIZED and db else "memory"
        }
    except Exception as e:
        return {
            "appointments": [],
            "count": 0,
            "filtered_by": status or "all",
            "storage_mode": "error",
            "error": str(e)
        }

@app.post("/admin/appointments/action")
async def handle_appointment_action(action: AppointmentAction):
    """Accept or reject an appointment request."""
    try:
        if action.action not in ['accept', 'reject']:
            raise HTTPException(status_code=400, detail="Action must be 'accept' or 'reject'")
        
        success = update_appointment_status(
            appointment_id=action.appointment_id,
            action=action.action,
            admin_notes=action.admin_notes or ""
        )
        
        if success:
            return {
                "message": f"Appointment {action.action}ed successfully",
                "appointment_id": action.appointment_id,
                "status": action.action + "ed"
            }
        else:
            raise HTTPException(status_code=404, detail="Appointment not found")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating appointment: {str(e)}")

@app.get("/admin/notifications")
async def get_admin_notifications(limit: int = 20):
    """Get admin notifications."""
    try:
        notifications = get_admin_notifications(limit=limit)
        return {
            "notifications": notifications,
            "count": len(notifications),
            "storage_mode": "firestore" if FIREBASE_INITIALIZED and db else "memory"
        }
    except Exception as e:
        print(f"Error retrieving notifications: {e}")
        return {"notifications": [], "count": 0, "storage_mode": "error"}

@app.post("/admin/notifications/mark-read")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read."""
    try:
        success = mark_notification_read(notification_id)
        if success:
            return {"success": True, "message": "Notification marked as read"}
        else:
            raise HTTPException(status_code=500, detail="Failed to mark notification as read")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking notification: {str(e)}")

@app.get("/admin/statistics")
async def get_admin_statistics():
    """Get dashboard statistics for admin."""
    try:
        all_chats = get_all_chat_history(limit=1000)
        pending_appointments = get_appointment_requests(status='pending')
        accepted_appointments = get_appointment_requests(status='accepted')
        rejected_appointments = get_appointment_requests(status='rejected')
        
        # Count by user role
        role_counts = {}
        for chat in all_chats:
            role = chat.get('user_role', 'unknown')
            role_counts[role] = role_counts.get(role, 0) + 1
        
        return {
            "total_conversations": len(all_chats),
            "pending_appointments": len(pending_appointments),
            "accepted_appointments": len(accepted_appointments),
            "rejected_appointments": len(rejected_appointments),
            "conversations_by_role": role_counts,
            "timestamp": datetime.now().isoformat(),
            "storage_mode": "firestore" if FIREBASE_INITIALIZED and db else "memory"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")

# =============================================================================
# OTHER ENDPOINTS
# =============================================================================
@app.get("/")
async def root():
    return {
        "message": "KG Hospital AI Chatbot API",
        "status": "running",
        "version": "2.0.0",
        "firebase_initialized": FIREBASE_INITIALIZED,
        "firestore_enabled": FIREBASE_INITIALIZED and db is not None,
        "storage_mode": "firestore" if FIREBASE_INITIALIZED and db else "memory",
        "documents_loaded": len(loaded_documents) > 0,
        "features": ["chat", "appointments", "admin_dashboard", "chat_history", "notifications"]
    }

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_file_path = temp_file.name

    try:
        content = await file.read()
        temp_file.write(content)
        temp_file.close()

        success, message = upload_file_to_firebase(temp_file_path, file.filename)

        if success:
            reload_success, reload_message = reload_all_documents()
            os.remove(temp_file_path)

            if reload_success:
                return {"message": f"Document uploaded and processed successfully: {message}",
                        "reload_status": reload_message, "filename": file.filename}
            else:
                return {"message": f"Document uploaded but processing failed: {reload_message}",
                        "filename": file.filename}
        else:
            os.remove(temp_file_path)
            raise HTTPException(status_code=500, detail=message)

    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/documents")
async def list_documents():
    documents = list_firebase_files()
    return {"documents": documents, "count": len(documents), "firebase_status": FIREBASE_INITIALIZED}

@app.post("/reload-documents")
async def reload_documents_endpoint():
    success, message = reload_all_documents()
    if success:
        return {"message": message, "status": "success", "documents_loaded": len(loaded_documents)}
    else:
        raise HTTPException(status_code=500, detail=message)

@app.get("/system/status")
async def system_status():
    return {
        "firebase_initialized": FIREBASE_INITIALIZED,
        "firestore_enabled": FIREBASE_INITIALIZED and db is not None,
        "storage_mode": "firestore" if FIREBASE_INITIALIZED and db else "memory",
        "documents_loaded": len(loaded_documents),
        "vectorstore_ready": vectorstore is not None,
        "conversation_chain_ready": conversation_chain is not None,
        "groq_api_configured": bool(os.getenv("GROQ_API_KEY")),
        "timestamp": datetime.now().isoformat()
    }

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, log_level="info")