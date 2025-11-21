from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import io
from PIL import Image
import uvicorn
from ultralytics import YOLO
from ultralytics.nn.tasks import DetectionModel
from ultralytics.nn.modules import conv as yolo_conv
from ultralytics.nn.modules import block as yolo_block
from torch.nn import Conv2d, BatchNorm2d
from torch.nn.modules.container import Sequential
import torch
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
import os
os.environ.setdefault("TORCH_LOAD_WEIGHTS_ONLY", "0")
torch.serialization.add_safe_globals([
    DetectionModel,
    Sequential,
    yolo_conv.Conv,
    yolo_block.C2f,
    Conv2d,
    BatchNorm2d
])
try:
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Try to load the custom trained model first
    model_path = os.path.join(script_dir, "Datasets", "runs", "detect", "manual_recycling_model", "weights", "best.pt")
    print(f"🔍 Looking for trained model at: {model_path}")
    
    # Fallback to old model path if custom model doesn't exist
    if not os.path.exists(model_path):
        model_path = os.path.join(script_dir, "best.pt")
        print(f"⚠️ Custom model not found, using fallback model at: {model_path}")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    model = YOLO(
        model_path,
        task="detect"
    )
    print("✅ YOLO model loaded successfully")
    print(f"📊 Model classes: {list(model.names.values())}")
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
    print("🚀 [BACKEND DEBUG] Detection request received")
    
    if not model:
        print("❌ [BACKEND DEBUG] Model not loaded!")
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        print("🔍 [BACKEND DEBUG] Decoding base64 image...")
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        print(f"🔍 [BACKEND DEBUG] Image decoded: {image.width}x{image.height} pixels")
        
        # Image preprocessing for better accuracy
        original_size = (image.width, image.height)
        
        # Resize image if it's too large (helps with processing speed and accuracy)
        max_size = 1280
        if max(image.width, image.height) > max_size:
            ratio = max_size / max(image.width, image.height)
            new_width = int(image.width * ratio)
            new_height = int(image.height * ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"🔍 [BACKEND DEBUG] Image resized to: {image.width}x{image.height} pixels")
        
        # Run YOLO inference with higher confidence threshold for better accuracy
        print("🔍 [BACKEND DEBUG] Running YOLO inference with conf=0.50, iou=0.45...")
        results = model.predict(
            image,
            verbose=False,
            conf=0.50,      # Higher confidence threshold to reduce false positives
            iou=0.45,       # IoU threshold for Non-Maximum Suppression
            imgsz=640,      # Standard image size for YOLO
            max_det=10,     # Maximum detections per image
            augment=True,   # Test Time Augmentation for better accuracy
            agnostic_nms=False  # Class-specific NMS
        )[0]
        
        detections: List[Detection] = []
        
        if results.boxes is not None and len(results.boxes) > 0:
            h, w = image.height, image.width
            print(f"🔍 [BACKEND DEBUG] Found {len(results.boxes)} detections")
            
            for box in results.boxes:
                # Get class info
                cls_id = int(box.cls.item())
                label = model.names[cls_id]
                confidence = float(box.conf.item())
                
                # Debug: Print detection info
                print(f"🔍 [BACKEND DEBUG] Detected: {label} (class {cls_id}) with confidence: {confidence:.3f}")
                
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
            print("🔍 [BACKEND DEBUG] No detections found above confidence threshold (0.50)")
            print("🔍 [BACKEND DEBUG] This usually means:")
            print("🔍 [BACKEND DEBUG] - The image doesn't contain recyclable materials")
            print("🔍 [BACKEND DEBUG] - The objects are too small or unclear")
            print("🔍 [BACKEND DEBUG] - The image quality is poor")
        
        # Sort by confidence (highest first)
        detections.sort(key=lambda d: d.confidence, reverse=True)
        
        # Debug: Print final results
        print(f"🎯 [BACKEND DEBUG] Final detections: {[f'{d.label} ({d.confidence:.3f})' for d in detections]}")
        print(f"🎯 [BACKEND DEBUG] Returning {len(detections)} detections to client")
        
        # If no high-confidence detections, provide helpful feedback
        if not detections:
            print("🚨 [BACKEND DEBUG] No recyclable materials detected with sufficient confidence")
            print("🚨 [BACKEND DEBUG] Try taking a clearer photo of recyclable items like:")
            print("🚨 [BACKEND DEBUG] - Cardboard boxes")
            print("🚨 [BACKEND DEBUG] - Plastic bottles")
            print("🚨 [BACKEND DEBUG] - Metal cans")
            print("🚨 [BACKEND DEBUG] - Newspapers")
            print("🚨 [BACKEND DEBUG] - Wood items")
        
        return DetectResponse(detections=detections)
        
    except Exception as e:
        print(f"❌ [BACKEND DEBUG] Detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "detection_server:app",
        host="0.0.0.0",  # Listen on all interfaces
        port=8000,
        reload=True
    )
