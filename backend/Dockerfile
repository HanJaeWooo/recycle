FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (required by ultralytics + pillow)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (build cache optimization)
COPY requirements.txt .

# Install Python dependencies exactly as pinned
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
