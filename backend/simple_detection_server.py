"""
Simple Detection Server - Minimal version for troubleshooting
This version has better error handling and fallbacks
"""

import sys
import os

def check_dependencies():
    """Check if all required packages are available"""
    missing_packages = []
    
    try:
        import fastapi
        print("✅ FastAPI found")
    except ImportError:
        missing_packages.append("fastapi")
        print("❌ FastAPI missing")
    
    try:
        import uvicorn
        print("✅ Uvicorn found")
    except ImportError:
        missing_packages.append("uvicorn")
        print("❌ Uvicorn missing")
    
    try:
        from PIL import Image
        print("✅ Pillow found")
    except ImportError:
        missing_packages.append("pillow")
        print("❌ Pillow missing")
    
    try:
        from ultralytics import YOLO
        print("✅ Ultralytics found")
    except ImportError:
        missing_packages.append("ultralytics")
        print("❌ Ultralytics missing")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Please run: pip install " + " ".join(missing_packages))
        return False
    
    print("\n✅ All packages found!")
    return True

def check_model_file():
    """Check if the YOLO model file exists"""
    # Try custom trained model first
    model_path = os.path.join("Datasets", "runs", "detect", "manual_recycling_model", "weights", "best.pt")
    if os.path.exists(model_path):
        print(f"✅ Custom trained model file found: {model_path}")
        return model_path
    
    # Fallback to old model path
    model_path = "best.pt"
    if os.path.exists(model_path):
        print(f"✅ Model file found: {model_path}")
        return model_path
    else:
        print(f"❌ Model file not found in either location")
        print("Please ensure your trained YOLO model is placed in:")
        print("  1. backend/Datasets/runs/detect/manual_recycling_model/weights/best.pt (preferred)")
        print("  2. backend/best.pt (fallback)")
        return None

def main():
    print("🔍 YOLO Detection Server - Dependency Check")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        input("Press Enter to exit...")
        sys.exit(1)
    
    # Check model file
    model_path = check_model_file()
    if not model_path:
        input("Press Enter to exit...")
        sys.exit(1)
    
    print("\n🚀 Starting server...")
    
    # Import after dependency check
    try:
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
    except ImportError as e:
        print(f"❌ Import error: {e}")
        input("Press Enter to exit...")
        sys.exit(1)
    
    # Initialize FastAPI app
    app = FastAPI(title="Recycling Detection API - Simple Version")
    
    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Load YOLO model
    try:
        model = YOLO(model_path)
        print(f"✅ YOLO model loaded successfully from: {model_path}")
        print(f"✅ Model classes: {list(model.names.values())}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        input("Press Enter to exit...")
        sys.exit(1)
    
    # Data models
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
        return {
            "message": "Simple Recycling Detection API", 
            "status": "running",
            "model_classes": list(model.names.values())
        }
    
    @app.get("/health")
    async def health():
        return {
            "status": "healthy",
            "model_loaded": True,
            "classes": model.names
        }
    
    @app.post("/v1/detect", response_model=DetectResponse)
    async def detect_materials(request: DetectRequest):
        print("🚀 [SIMPLE SERVER] Detection request received")
        
        try:
            # Decode base64 image
            print("🔍 [SIMPLE SERVER] Decoding image...")
            image_data = base64.b64decode(request.image)
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            print(f"🔍 [SIMPLE SERVER] Image size: {image.width}x{image.height}")
            
            # Run YOLO inference
            print("🔍 [SIMPLE SERVER] Running YOLO inference...")
            results = model.predict(image, verbose=False, conf=0.3)[0]  # Lower confidence for testing
            
            detections: List[Detection] = []
            
            if results.boxes is not None and len(results.boxes) > 0:
                h, w = image.height, image.width
                print(f"🔍 [SIMPLE SERVER] Found {len(results.boxes)} detections")
                
                for box in results.boxes:
                    cls_id = int(box.cls.item())
                    label = model.names[cls_id]
                    confidence = float(box.conf.item())
                    
                    print(f"🔍 [SIMPLE SERVER] Detection: {label} ({confidence:.3f})")
                    
                    # Convert bounding box
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
                print("🔍 [SIMPLE SERVER] No detections found")
            
            # Sort by confidence
            detections.sort(key=lambda d: d.confidence, reverse=True)
            
            print(f"🎯 [SIMPLE SERVER] Returning {len(detections)} detections")
            return DetectResponse(detections=detections)
            
        except Exception as e:
            print(f"❌ [SIMPLE SERVER] Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")
    
    # Start server
    print("\n🎉 Server starting on http://localhost:8000")
    print("📱 Your React Native app should now be able to connect!")
    print("🛑 Press Ctrl+C to stop the server")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

if __name__ == "__main__":
    main()