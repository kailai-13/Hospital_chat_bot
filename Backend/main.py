# main.py - Enhanced Version with Excel Support and Response Formatting

import os
import tempfile
import time
import re
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, storage
from dotenv import load_dotenv
import pandas as pd

# LangChain imports
from langchain_community.document_loaders import UnstructuredPDFLoader, PyPDFLoader
from langchain_text_splitters.character import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_core.documents import Document

# =============================================================================
# CONFIGURATION & INITIALIZATION
# =============================================================================
load_dotenv()

app = FastAPI(
    title="KG Hospital AI Chatbot API", 
    version="2.0.0",
    description="AI-powered chatbot with Excel support and enhanced formatting"
)

# Get port from environment variable
PORT = int(os.getenv("PORT", 8000))

# CORS middleware
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
    FIREBASE_INITIALIZED = True
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Firebase initialization failed: {e}")
    FIREBASE_INITIALIZED = False

# Global variables for chatbot
vectorstore = None
conversation_chain = None
loaded_documents = []
loaded_files = set()

# =============================================================================
# PYDANTIC MODELS
# =============================================================================
class ChatMessage(BaseModel):
    message: str
    user_role: str = "patient"

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    formatted: bool = True

class FileInfo(BaseModel):
    name: str
    size: int
    created: str
    type: str
    status: str

# =============================================================================
# RESPONSE FORMATTING FUNCTIONS
# =============================================================================
def format_response(response_text: str) -> str:
    """Format the chatbot response for better readability."""
    if not isinstance(response_text, str):
        return ""
    
    formatted_text = response_text.strip()
    
    # Check if response should be formatted as list
    list_keywords = [
        'list', 'details', 'items', 'points', 'steps', 'procedures', 'symptoms', 
        'requirements', 'features', 'benefits', 'types', 'categories', 'options',
        'medications', 'treatments', 'instructions', 'guidelines', 'rules',
        'departments', 'services', 'facilities', 'equipment'
    ]
    should_format_as_list = any(keyword in response_text.lower() for keyword in list_keywords)
    
    # Apply formatting
    if re.search(r'\d+\.', formatted_text) or should_format_as_list:
        formatted_text = format_numbered_list(formatted_text)
    elif '•' in formatted_text or should_format_as_list:
        formatted_text = format_bullet_points(formatted_text)
    elif should_format_as_list and ',' in formatted_text:
        formatted_text = format_comma_separated_to_bullets(formatted_text)
    
    formatted_text = add_section_headers(formatted_text)
    formatted_text = clean_formatting(formatted_text)
    
    return formatted_text

def format_numbered_list(text: str) -> str:
    """Format numbered lists for better readability."""
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if re.match(r'^\d+\.', line):
            formatted_lines.append(f"\n**{line}**\n")
        elif line and not re.match(r'^\d+\.', line) and formatted_lines and formatted_lines[-1].startswith('\n**'):
            formatted_lines.append(f"   {line}\n")
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def format_bullet_points(text: str) -> str:
    """Format bullet points for better readability."""
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if line.startswith(('•', '-', '*')):
            content = re.sub(r'^[•\-\*]\s*', '', line)
            formatted_lines.append(f"• **{content}**")
        else:
            formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def format_comma_separated_to_bullets(text: str) -> str:
    """Convert comma-separated items to bullet points."""
    sentences = text.split('.')
    formatted_sentences = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and sentence.count(',') >= 2:
            items = [item.strip() for item in sentence.split(',')]
            if len(items) >= 3:
                bullet_list = '\n'.join([f"• {item}" for item in items if item])
                formatted_sentences.append(f"\n{bullet_list}\n")
            else:
                formatted_sentences.append(sentence + '.')
        else:
            if sentence:
                formatted_sentences.append(sentence + '.')
    
    return ''.join(formatted_sentences)

def add_section_headers(text: str) -> str:
    """Add section headers for common medical/hospital topics."""
    header_patterns = [
        (r'\b(symptoms?)\b:', r'## Symptoms:'),
        (r'\b(treatment|treatments?)\b:', r'## Treatment:'),
        (r'\b(procedure|procedures?)\b:', r'## Procedures:'),
        (r'\b(department|departments?)\b:', r'## Departments:'),
        (r'\b(medication|medications?)\b:', r'## Medications:'),
        (r'\b(instruction|instructions?)\b:', r'## Instructions:'),
        (r'\b(requirement|requirements?)\b:', r'## Requirements:'),
        (r'\b(benefit|benefits?)\b:', r'## Benefits:'),
        (r'\b(side effect|side effects?)\b:', r'## Side Effects:'),
        (r'\b(precaution|precautions?)\b:', r'## Precautions:'),
    ]
    
    formatted_text = text
    for pattern, replacement in header_patterns:
        formatted_text = re.sub(pattern, replacement, formatted_text, flags=re.IGNORECASE)
    
    return formatted_text

def clean_formatting(text: str) -> str:
    """Clean up excessive whitespace and formatting."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'(##[^\n]+)\n([^\n])', r'\1\n\n\2', text)
    text = re.sub(r'([^\n])\n(• )', r'\1\n\n\2', text)
    text = re.sub(r'(• [^\n]+)\n(• )', r'\1\n\2', text)
    return text.strip()

def format_chat_response(response: str) -> str:
    """Add context-specific prefixes to responses."""
    formatted = format_response(response)
    resp_lower = response.lower() if isinstance(response, str) else ""
    
    if any(word in resp_lower for word in ['emergency', 'urgent', 'immediate']):
        formatted = f"⚠️ **Important:** {formatted}"
    elif any(word in resp_lower for word in ['appointment', 'schedule', 'booking']):
        formatted = f"📅 **Scheduling Information:**\n\n{formatted}"
    elif any(word in resp_lower for word in ['medication', 'prescription', 'drug']):
        formatted = f"💊 **Medication Information:**\n\n{formatted}"
    elif any(word in resp_lower for word in ['procedure', 'surgery', 'operation']):
        formatted = f"🏥 **Procedure Information:**\n\n{formatted}"
    
    return formatted

# =============================================================================
# DOCUMENT PROCESSING FUNCTIONS
# =============================================================================
def load_document(file_path: str) -> List[Document]:
    """Load PDF with multiple fallback methods."""
    documents = []
    file_name = os.path.basename(file_path)
    
    # Try UnstructuredPDFLoader
    try:
        loader = UnstructuredPDFLoader(file_path)
        documents = loader.load()
        if documents:
            print(f"✅ Loaded {file_name} using UnstructuredPDFLoader")
            return documents
    except Exception as e:
        print(f"⚠️ UnstructuredPDFLoader failed for {file_name}: {e}")
    
    # Try PyPDFLoader
    try:
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        if documents:
            print(f"✅ Loaded {file_name} using PyPDFLoader")
            return documents
    except Exception as e:
        print(f"⚠️ PyPDFLoader failed for {file_name}: {e}")
    
    # Try PyMuPDF
    try:
        import fitz
        doc = fitz.open(file_path)
        documents = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text.strip():
                documents.append(Document(
                    page_content=text,
                    metadata={"source": file_name, "page": page_num + 1}
                ))
        doc.close()
        if documents:
            print(f"✅ Loaded {file_name} using PyMuPDF")
            return documents
    except Exception as e:
        print(f"⚠️ PyMuPDF failed for {file_name}: {e}")
    
    # Try PyPDF2
    try:
        import PyPDF2
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            documents = []
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                if text and text.strip():
                    documents.append(Document(
                        page_content=text,
                        metadata={"source": file_name, "page": page_num + 1}
                    ))
        if documents:
            print(f"✅ Loaded {file_name} using PyPDF2")
            return documents
    except Exception as e:
        print(f"⚠️ PyPDF2 failed for {file_name}: {e}")
    
    raise Exception(f"❌ All PDF processing methods failed for {file_name}")

def load_excel_document(file_path: str) -> List[Document]:
    """Load and process Excel document, converting sheets to Document objects."""
    documents = []
    file_name = os.path.basename(file_path)
    
    try:
        # Try openpyxl engine first (for .xlsx)
        excel_data = pd.read_excel(file_path, sheet_name=None, engine='openpyxl')
        
        for sheet_name, df in excel_data.items():
            if df.empty:
                continue
            
            # Create text representation of the sheet
            text_content = f"Sheet: {sheet_name}\n\n"
            text_content += "Columns: " + ", ".join(df.columns.astype(str)) + "\n\n"
            
            # Add rows
            for _, row in df.iterrows():
                row_text = []
                for col, value in row.items():
                    if pd.notna(value):
                        row_text.append(f"{col}: {value}")
                if row_text:
                    text_content += " | ".join(row_text) + "\n"
            
            if text_content.strip():
                documents.append(Document(
                    page_content=text_content,
                    metadata={
                        "source": file_name,
                        "sheet": sheet_name,
                        "rows": len(df),
                        "columns": len(df.columns),
                        "type": "excel"
                    }
                ))
        
        print(f"✅ Loaded Excel file {file_name} with {len(documents)} sheets")
        return documents
        
    except Exception as e1:
        # Try xlrd engine for older .xls files
        try:
            excel_data = pd.read_excel(file_path, sheet_name=None, engine='xlrd')
            
            for sheet_name, df in excel_data.items():
                if df.empty:
                    continue
                
                text_content = f"Sheet: {sheet_name}\n\n"
                text_content += "Columns: " + ", ".join(df.columns.astype(str)) + "\n\n"
                
                for _, row in df.iterrows():
                    row_text = []
                    for col, value in row.items():
                        if pd.notna(value):
                            row_text.append(f"{col}: {value}")
                    if row_text:
                        text_content += " | ".join(row_text) + "\n"
                
                if text_content.strip():
                    documents.append(Document(
                        page_content=text_content,
                        metadata={
                            "source": file_name,
                            "sheet": sheet_name,
                            "rows": len(df),
                            "columns": len(df.columns),
                            "type": "excel"
                        }
                    ))
            
            print(f"✅ Loaded Excel file {file_name} with {len(documents)} sheets (xlrd)")
            return documents
            
        except Exception as e2:
            raise Exception(f"❌ Failed to process Excel file {file_name}. Errors: {e1}, {e2}")

def setup_vectorstore(documents: List[Document]):
    """Create FAISS vectorstore with optimized settings."""
    if not documents:
        raise ValueError("No documents provided for vectorstore creation")
    
    print(f"📄 Processing {len(documents)} document pages...")
    
    text_splitter = CharacterTextSplitter(
        separator='\n',
        chunk_size=800,
        chunk_overlap=100,
        length_function=len
    )
    
    doc_chunks = text_splitter.split_documents(documents)
    print(f"📝 Created {len(doc_chunks)} text chunks")
    
    if len(doc_chunks) > 2000:
        print(f"⚡ Large document detected. Limiting to 2000 chunks for performance.")
        doc_chunks = doc_chunks[:2000]
    
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    print("🔄 Creating vector store...")
    vectorstore = FAISS.from_documents(doc_chunks, embeddings)
    print("✅ Vector store created successfully!")
    
    return vectorstore

def create_chain(vectorstore):
    """Create conversational retrieval chain with enhanced prompting."""
    system_prompt = """
    You are KG Hospital's assistant chatbot. Always be helpful and positive:

    1. NEVER say "I don't know" or give negative responses
    2. Keep responses short, friendly, and helpful
    3. When you don't have specific information, guide users positively:
       - "Great question! Please contact our reception for specific details"
       - "Our team can help you with that! Visit our information desk or call us"
    4. Use bullet points for lists, but keep them concise
    5. For medical questions, always recommend consulting our healthcare professionals
    6. Be warm and encouraging in tone

    CRITICAL: If information isn't in your database, respond like:
    "I'd love to help you connect with the right person! Please call our main reception and they'll direct you to the appropriate doctor or department."

    Keep all responses short, positive, and actionable.
    """
    
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
# FIREBASE FUNCTIONS
# =============================================================================
def upload_file_to_firebase(file_path: str, file_name: str):
    """Upload file to Firebase Storage."""
    if not FIREBASE_INITIALIZED:
        return False, "Firebase not initialized"
    
    try:
        blob = bucket.blob(f"documents/{file_name}")
        blob.upload_from_filename(file_path)
        print(f"✅ Uploaded {file_name} to Firebase Storage")
        return True, f"File '{file_name}' uploaded successfully"
    except Exception as e:
        print(f"❌ Upload failed for {file_name}: {e}")
        return False, f"Upload failed: {str(e)}"

def list_firebase_files():
    """List all PDF and Excel files in Firebase Storage."""
    if not FIREBASE_INITIALIZED:
        return []
    
    try:
        blobs = bucket.list_blobs(prefix="documents/")
        files_info = []
        
        for blob in blobs:
            file_name = blob.name.replace('documents/', '')
            if file_name.lower().endswith(('.pdf', '.xlsx', '.xls')):
                file_type = 'excel' if file_name.lower().endswith(('.xlsx', '.xls')) else 'pdf'
                status = 'loaded' if file_name in loaded_files else 'new'
                
                files_info.append({
                    'name': file_name,
                    'size': blob.size or 0,
                    'created': blob.time_created.isoformat() if blob.time_created else '',
                    'type': file_type,
                    'status': status
                })
        
        return files_info
    except Exception as e:
        print(f"❌ Error listing files: {e}")
        return []

def download_firebase_file(file_name: str):
    """Download file from Firebase Storage."""
    if not FIREBASE_INITIALIZED:
        return None
    
    try:
        blob = bucket.blob(f"documents/{file_name}")
        if not blob.exists():
            return None
        
        file_extension = os.path.splitext(file_name)[1]
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_extension)
        temp_file_path = temp_file.name
        temp_file.close()
        
        blob.download_to_filename(temp_file_path)
        return temp_file_path
    except Exception as e:
        print(f"❌ Download failed for {file_name}: {e}")
        return None

def reload_all_documents():
    """Reload all documents from Firebase and update vectorstore."""
    global vectorstore, conversation_chain, loaded_documents, loaded_files
    
    print("🔄 Reloading all documents from Firebase...")
    firebase_files = list_firebase_files()
    if not firebase_files:
        return False, "No documents found in Firebase"
    
    all_documents = []
    successful_loads = 0
    loaded_files = set()
    
    for file_info in firebase_files:
        file_name = file_info['name']
        file_type = file_info['type']
        print(f"📥 Processing {file_name}...")
        
        temp_file_path = download_firebase_file(file_name)
        if temp_file_path:
            try:
                if file_type == 'excel':
                    documents = load_excel_document(temp_file_path)
                else:
                    documents = load_document(temp_file_path)
                
                # Limit documents per file
                if len(documents) > 500:
                    documents = documents[:500]
                
                all_documents.extend(documents)
                loaded_files.add(file_name)
                successful_loads += 1
                os.remove(temp_file_path)
            except Exception as e:
                print(f"❌ Failed to process {file_name}: {e}")
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
    
    if all_documents:
        print(f"📚 Total documents loaded: {len(all_documents)}")
        vectorstore = setup_vectorstore(all_documents)
        conversation_chain = create_chain(vectorstore)
        loaded_documents = all_documents
        return True, f"Successfully loaded {successful_loads} out of {len(firebase_files)} documents"
    
    return False, "No documents could be processed"

# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint with API status."""
    return {
        "message": "KG Hospital AI Chatbot API", 
        "status": "running",
        "version": "2.0.0",
        "firebase_initialized": FIREBASE_INITIALIZED,
        "documents_loaded": len(loaded_documents),
        "files_loaded": len(loaded_files),
        "features": ["Excel support", "Enhanced formatting", "Multi-format PDFs"]
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """Chat endpoint with enhanced formatting and role-based responses."""
    global conversation_chain
    
    try:
        print(f"💬 Chat request ({message.user_role}): {message.message}")
        
        if conversation_chain:
            # Enhanced question with formatting instructions
            enhanced_question = f"""
            Please provide a well-structured, user-friendly response to: {message.message}
            
            Guidelines:
            - If listing items, use bullet points or numbered lists
            - Break information into clear sections with headers
            - Make the response easy to read and understand
            - For medical information, be clear but recommend consulting healthcare professionals
            """
            
            response = conversation_chain.invoke({'question': enhanced_question})
            answer = format_chat_response(response.get('answer', 'I could not find relevant information.'))
        else:
            llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
            
            system_prompts = {
                "patient": """You are KG Hospital's helpful assistant for patients. 
                Rules:
                - Be positive, warm, and brief
                - NEVER say "I don't know"
                - Always offer a helpful solution
                - Guide users to contact the hospital for specific information
                - Keep response under 50 words when possible
                Provide information about appointments, treatments, and services.""",
                
                "visitor": """You are KG Hospital's helpful assistant for visitors.
                Rules:
                - Be welcoming and brief
                - NEVER say "I don't know"
                - Always offer a helpful solution
                - Guide visitors to information desk or reception
                Provide information about visiting hours, directions, and facilities.""",
                
                "staff": """You are KG Hospital's helpful assistant for staff.
                Rules:
                - Be efficient and professional
                - NEVER say "I don't know"
                - Always offer a helpful solution
                - Guide to appropriate department or protocol
                Provide information about procedures, protocols, and patient inquiries.""",
                
                "admin": """You are KG Hospital's helpful assistant for administrators.
                Rules:
                - Be comprehensive but concise
                - NEVER say "I don't know"
                - Always offer a helpful solution
                - Provide actionable information
                Provide information about operations, management, and system status."""
            }
            
            system_prompt = system_prompts.get(message.user_role, system_prompts["patient"])
            full_prompt = f"{system_prompt}\n\nUser Question: {message.message}\n\nResponse:"
            
            response = llm.invoke(full_prompt)
            answer = format_chat_response(response.content)
        
        return ChatResponse(
            response=answer,
            timestamp=datetime.now().isoformat(),
            formatted=True
        )
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating response: {str(e)}"
        )

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Document upload endpoint (supports PDF and Excel)."""
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in ['.pdf', '.xlsx', '.xls']:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and Excel files (.pdf, .xlsx, .xls) are allowed"
        )
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_extension)
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
                return {
                    "message": f"Document uploaded and processed successfully: {message}",
                    "reload_status": reload_message,
                    "filename": file.filename,
                    "type": "excel" if file_extension in ['.xlsx', '.xls'] else "pdf"
                }
            else:
                return {
                    "message": f"Document uploaded but processing failed: {reload_message}",
                    "filename": file.filename
                }
        else:
            os.remove(temp_file_path)
            raise HTTPException(
                status_code=500,
                detail=message
            )
            
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

@app.get("/documents")
async def list_documents():
    """Endpoint to list all documents with detailed metadata."""
    documents = list_firebase_files()
    
    pdf_count = len([f for f in documents if f['type'] == 'pdf'])
    excel_count = len([f for f in documents if f['type'] == 'excel'])
    loaded_count = len([f for f in documents if f['status'] == 'loaded'])
    new_count = len([f for f in documents if f['status'] == 'new'])
    
    return {
        "documents": documents, 
        "count": len(documents),
        "pdf_count": pdf_count,
        "excel_count": excel_count,
        "loaded_count": loaded_count,
        "new_count": new_count,
        "firebase_status": FIREBASE_INITIALIZED
    }

@app.post("/reload-documents")
async def reload_documents_endpoint():
    """Endpoint to reload all documents."""
    success, message = reload_all_documents()
    if success:
        return {
            "message": message, 
            "status": "success",
            "documents_loaded": len(loaded_documents),
            "files_loaded": len(loaded_files)
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=message
        )

@app.get("/system/status")
async def system_status():
    """System status endpoint with detailed information."""
    return {
        "firebase_initialized": FIREBASE_INITIALIZED,
        "documents_loaded": len(loaded_documents),
        "files_loaded": len(loaded_files),
        "vectorstore_ready": vectorstore is not None,
        "conversation_chain_ready": conversation_chain is not None,
        "groq_api_configured": bool(os.getenv("GROQ_API_KEY")),
        "supported_formats": ["PDF", "Excel (.xlsx, .xls)"],
        "features": {
            "response_formatting": True,
            "excel_support": True,
            "multi_pdf_loaders": True,
            "incremental_loading": True
        },
        "timestamp": datetime.now().isoformat()
    }

# =============================================================================
# STARTUP EVENT
# =============================================================================
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup."""
    print("🚀 Starting KG Hospital Chatbot API v2.0...")
    print(f"🔧 Firebase Status: {'✅ Connected' if FIREBASE_INITIALIZED else '❌ Not Connected'}")
    
    if FIREBASE_INITIALIZED:
        print("📚 Loading initial documents...")
        success, message = reload_all_documents()
        if success:
            print(f"✅ {message}")
            print(f"📊 Loaded {len(loaded_files)} files with {len(loaded_documents)} document pages")
        else:
            print(f"⚠️ {message}")
    
    print("🎉 KG Hospital Chatbot API v2.0 is ready!")

# =============================================================================
# MAIN
# =============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=PORT,
        log_level="info"
    )