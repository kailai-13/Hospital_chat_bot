# Use official lightweight Python image with version 3.11
FROM python:3.11-slim

# Set environment variable to prevent buffering issues with Python output
ENV PYTHONUNBUFFERED=1

# Install system dependencies required for some packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    swig \
    poppler-utils \
    tesseract-ocr \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy requirements file into container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project files
COPY . .

# Expose the port your app uses, e.g., 8501 for Streamlit
EXPOSE 8501

# Command to run your app (adjust for your main script or server)
CMD ["streamlit", "run", "your_main_script.py", "--server.port=8501", "--server.address=0.0.0.0"]
