#!/usr/bin/env python3
"""
Model validation script to check accuracy of the current YOLO model
"""

from ultralytics import YOLO
import os

def validate_current_model():
    """Validate the current model and print detailed metrics"""
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "best.pt")
    
    print(f"🔍 Loading model from: {model_path}")
    
    if not os.path.exists(model_path):
        print(f"❌ Model file not found at {model_path}")
        return
    
    try:
        # Load the model
        model = YOLO(model_path)
        print("✅ Model loaded successfully")
        
        # Print model info
        print(f"\n📊 Model Information:")
        print(f"Classes: {model.names}")
        print(f"Number of classes: {len(model.names)}")
        
        # Try to validate if we have validation data
        data_yaml_paths = [
            os.path.join(script_dir, "Datasets", "data.yaml"),
            os.path.join(script_dir, "Datasets", "colab_data.yaml"),
        ]
        
        validation_data = None
        for data_path in data_yaml_paths:
            if os.path.exists(data_path):
                validation_data = data_path
                break
        
        if validation_data:
            print(f"\n🧪 Running validation with data: {validation_data}")
            try:
                results = model.val(data=validation_data)
                
                print(f"\n📈 Validation Results:")
                print(f"mAP50: {results.box.map50:.4f}")
                print(f"mAP50-95: {results.box.map:.4f}")
                
                print(f"\n📋 Class-wise Metrics:")
                for cls_id, cls_name in model.names.items():
                    if cls_id < len(results.box.ap):
                        print(f"  {cls_name}:")
                        print(f"    Precision: {results.box.p[cls_id]:.4f}")
                        print(f"    Recall: {results.box.r[cls_id]:.4f}")
                        print(f"    mAP50: {results.box.ap[cls_id]:.4f}")
                
            except Exception as val_error:
                print(f"⚠️ Validation failed: {val_error}")
                print("This is normal if validation data is not properly configured")
        else:
            print("⚠️ No validation data found, skipping accuracy metrics")
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")

if __name__ == "__main__":
    validate_current_model()