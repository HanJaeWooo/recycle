FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (required by ultralytics + pillow)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (build cache optimization)
COPY backend/requirements.txt ./requirements.txt


# Install Python dependencies exactly as pinned (longer timeout + PyTorch CPU index)
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of your application code
COPY backend/ .

# Include trained model weights (Datasets folder)
COPY backend/Datasets ./Datasets

EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
