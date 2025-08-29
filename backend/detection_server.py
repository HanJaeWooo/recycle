from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import io
from PIL import Image
import uvicorn
from ultralytics import YOLO
import numpy as np

app = FastAPI(title="Recycling Detection API")

# Enable CORS for your React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained YOLO model
try:
    model = YOLO("best.pt")  # Path to your trained model in backend folder
    print("✅ YOLO model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    model = None

class DetectRequest(BaseModel):
    image: str  # base64 encoded image

class BBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Detection(BaseModel):
    label: str
    confidence: float
    bbox: Optional[BBox] = None

class DetectResponse(BaseModel):
    detections: List[Detection]

@app.get("/")
async def root():
    return {"message": "Recycling Detection API", "status": "running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "classes": model.names if model else None
    }

@app.post("/v1/detect", response_model=DetectResponse)
async def detect_materials(request: DetectRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Run YOLO inference with higher confidence threshold
        results = model.predict(image, verbose=False, conf=0.5)[0]  # Increased from 0.25 to 0.5
        
        detections: List[Detection] = []
        
        if results.boxes is not None and len(results.boxes) > 0:
            h, w = image.height, image.width
            
            for box in results.boxes:
                # Get class info
                cls_id = int(box.cls.item())
                label = model.names[cls_id]
                confidence = float(box.conf.item())
                
                # Debug: Print detection info
                print(f"🔍 Detected: {label} (class {cls_id}) with confidence: {confidence:.3f}")
                
                # Convert bounding box to normalized coordinates
                x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())
                x = x1 / w
                y = y1 / h
                width = (x2 - x1) / w
                height = (y2 - y1) / h
                
                detections.append(Detection(
                    label=label,
                    confidence=confidence,
                    bbox=BBox(x=x, y=y, width=width, height=height)
                ))
        else:
            print("🔍 No detections found")
        
        # Sort by confidence (highest first)
        detections.sort(key=lambda d: d.confidence, reverse=True)
        
        # Debug: Print final results
        print(f"🎯 Final detections: {[f'{d.label} ({d.confidence:.3f})' for d in detections]}")
        
        return DetectResponse(detections=detections)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "detection_server:app",
        host="0.0.0.0",  # Listen on all interfaces
        port=8000,
        reload=True
    )
