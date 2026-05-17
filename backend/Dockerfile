# Use official lightweight Python runtime
FROM python:3.10-slim

# Set working directory
WORKDIR /code

# Install system dependencies required for PyMuPDF, spaCy, and general ML
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY ./requirements.txt /code/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Download spaCy English model during build time so it doesn't download on first request
RUN python -m spacy download en_core_web_sm

# Pre-download Sentence-BERT model during build time to speed up first request
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Set non-root user for security (Hugging Face Spaces strict requirement)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set working directory to user home
WORKDIR $HOME/app

# Copy the rest of the application code
COPY --chown=user . $HOME/app

# Expose port 7860 (Hugging Face Spaces default port)
ENV PORT=7860
EXPOSE 7860

# Run FastAPI application using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
