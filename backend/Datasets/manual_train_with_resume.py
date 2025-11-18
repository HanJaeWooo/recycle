#!/usr/bin/env python3
"""
Manual Training Script with Resume Capability
This script trains your manually combined dataset with resume functionality
"""

import os
import yaml
from pathlib import Path
from ultralytics import YOLO
import torch

def create_training_config():
    """Create the data.yaml configuration for training"""
    print("🔧 Creating training configuration...")
    
    # Create data.yaml for the manually combined dataset
    data_config = {
        'path': str(Path.cwd().absolute()),
        'train': 'combined_train',
        'val': 'combined_val',
        'test': 'combined_test',
        'nc': 14,
        'names': {
            0: 'Woods',
            1: 'Metal cans',
            2: 'Plastic bottle', 
            3: 'Cardboard',
            4: 'Corduroy',             
            5: 'Denim',
            6: 'Cotton',
            7: 'Hangers',
            8: 'Utensils',
            9: 'Metal Bars',
            10:'Bottle cups',
            11:'Cups',
            12:'Chiffon',
            13:'Coppers',

            
                
            

            
            
        }
    }
    
    with open('data_manual.yaml', 'w') as f:
        yaml.dump(data_config, f, default_flow_style=False)
    
    print("✅ Created data_manual.yaml")
    return 'data_manual.yaml'

def verify_dataset_structure():
    """Verify that the manually combined dataset is properly structured"""
    print("\n🔍 Verifying dataset structure...")
    
    required_dirs = [
        'combined_train/images',
        'combined_train/labels', 
        'combined_val/images',
        'combined_val/labels',
        'combined_test/images',
        'combined_test/labels'
    ]
    
    all_good = True
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            print(f"❌ Missing: {dir_path}")
            all_good = False
        else:
            if 'images' in dir_path:
                count = len([f for f in os.listdir(dir_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            else:
                count = len([f for f in os.listdir(dir_path) if f.endswith('.txt')])
            print(f"✅ {dir_path}: {count} files")
    
    if not all_good:
        print("\n❌ Dataset structure is incomplete!")
        print("Please complete the manual dataset combination first.")
        return False
    
    print("\n✅ Dataset structure looks good!")
    return True

def check_for_existing_training():
    """Check if there's an existing training to resume from"""
    print("\n🔍 Checking for existing training...")
    
    checkpoint_paths = [
        'runs/detect/manual_recycling_model/weights/last.pt',
        'runs/detect/manual_recycling_model2/weights/last.pt',
        'runs/detect/manual_recycling_model3/weights/last.pt',
    ]
    
    for checkpoint_path in checkpoint_paths:
        if os.path.exists(checkpoint_path):
            print(f"✅ Found existing checkpoint: {checkpoint_path}")
            
            # Check results.csv to see last epoch
            results_path = os.path.dirname(os.path.dirname(checkpoint_path)) + '/results.csv'
            if os.path.exists(results_path):
                try:
                    with open(results_path, 'r') as f:
                        lines = f.readlines()
                    if len(lines) > 1:
                        last_line = lines[-1]
                        epoch = last_line.split(',')[0]
                        print(f"   Last completed epoch: {epoch}")
                except:
                    pass
            
            return checkpoint_path
    
    print("ℹ️ No existing training found. Will start fresh.")
    return None

def train_model(data_yaml_path, resume_from=None):
    """Train the model with resume capability"""
    print(f"\n🚀 Starting training...")
    
    try:
        # Check device and CUDA availability
        if torch.cuda.is_available():
            device = 'cuda'
            print(f"💻 Using device: {device}")
            print(f"🎮 GPU: {torch.cuda.get_device_name(0)}")
            print(f"📊 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
        else:
            device = 'cpu'
            print(f"💻 Using device: {device}")
            print("⚠️ WARNING: GPU not available, training will be slower on CPU")
        
        if resume_from and os.path.exists(resume_from):
            print(f"🔄 Resuming training from: {resume_from}")
            model = YOLO(resume_from)

            # Force YOLO to save results locally instead of old D: drive
            results = model.train(
                data=data_yaml_path,
                epochs=100,
                device=device,
                project="./runs/detect",  # ✅ always use local folder
                name="manual_recycling_model_resumed",
                resume=True,
                exist_ok=True,
                verbose=True
    )

        else:
            print("🆕 Starting fresh training...")
            model = YOLO('yolov8n.pt')  # Start with pre-trained weights
            
            # Fresh training with optimized parameters
            results = model.train(
                data=data_yaml_path,
                epochs=100,
                imgsz=640,
                batch=16 if device == 'cuda' else 8,  # Larger batch for GPU
                device=device,  # Use GPU if available
                workers=8 if device == 'cuda' else 4,  # More workers for GPU
                project='./runs/detect',
                name='manual_recycling_model',
                exist_ok=True,
                verbose=True,
                
                # Training parameters optimized for your dataset
                patience=25,           # Early stopping patience
                save=True,
                save_period=10,        # Save checkpoint every 10 epochs
                cache=False,
                
                # Learning rate schedule
                cos_lr=True,
                lr0=0.01,
                lrf=0.01,
                momentum=0.937,
                weight_decay=0.0005,
                warmup_epochs=3,
                warmup_momentum=0.8,
                warmup_bias_lr=0.1,
                
                # Loss weights (balanced for multi-class)
                box=0.05,
                cls=0.5,
                dfl=1.5,
                
                # Data augmentation (moderate)
                hsv_h=0.015,
                hsv_s=0.7,
                hsv_v=0.4,
                degrees=0.0,
                translate=0.1,
                scale=0.5,
                shear=0.0,
                perspective=0.0,
                flipud=0.0,
                fliplr=0.5,
                mosaic=1.0,
                mixup=0.0,
                copy_paste=0.0,
                
                # Advanced settings
                amp=True,
                fraction=1.0,
                profile=False,
                freeze=None,
                close_mosaic=10,
            )
        
        print("✅ Training completed successfully!")
        return results
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def install_trained_model(results):
    """Install the trained model"""
    if not results:
        return False
    
    print("\n📦 Installing trained model...")
    
    try:
        # Find the best model
        best_model_path = Path(results.save_dir) / 'weights' / 'best.pt'
        
        if not best_model_path.exists():
            print("❌ Best model not found!")
            return False
        
        # Backup current model
        backend_dir = Path('..').resolve()
        current_model = backend_dir / 'best.pt'
        
        if current_model.exists():
            backup_path = backend_dir / 'best_manual_backup.pt'
            import shutil
            shutil.copy2(current_model, backup_path)
            print(f"📋 Current model backed up to: {backup_path}")
        
        # Install new model
        import shutil
        shutil.copy2(best_model_path, current_model)
        print(f"✅ New model installed: {current_model}")
        
        # Also create a copy with timestamp
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamped_copy = backend_dir / f'best_manual_{timestamp}.pt'
        shutil.copy2(best_model_path, timestamped_copy)
        print(f"📋 Timestamped copy: {timestamped_copy}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to install model: {e}")
        return False

def main():
    """Main training function"""
    print("🎯 MANUAL DATASET TRAINING WITH RESUME")
    print("=" * 50)
    
    # Step 1: Verify dataset structure
    if not verify_dataset_structure():
        print("\n❌ Please complete the manual dataset combination first!")
        print("Run the manual_dataset_helper.py script to help with this.")
        return
    
    # Step 2: Create training configuration
    data_yaml_path = create_training_config()
    
    # Step 3: Check for existing training
    resume_checkpoint = check_for_existing_training()
    
    # Step 4: Ask user what they want to do
    if resume_checkpoint:
        print(f"\n🤔 Found existing training checkpoint.")
        choice = input("Do you want to (r)esume or start (f)resh? [r/f]: ").lower().strip()
        
        if choice == 'r':
            print("🔄 Will resume from existing checkpoint...")
            use_resume = resume_checkpoint
        else:
            print("🆕 Will start fresh training...")
            use_resume = None
    else:
        print("🆕 Starting fresh training...")
        use_resume = None
    
    # Step 5: Train the model
    print(f"\n⏱️ Training will take 30-90 minutes depending on your hardware...")
    print("💡 You can stop training anytime with Ctrl+C and resume later!")
    
    try:
        results = train_model(data_yaml_path, use_resume)
        
        if results:
            # Step 6: Install the model
            if install_trained_model(results):
                print("\n🎉 SUCCESS! Training completed and model installed!")
                print("=" * 50)
                print("🚀 Next steps:")
                print("1. Restart your detection server")
                print("2. Test the app with various recyclable items")
                print("3. You should now see much better accuracy!")
            else:
                print("\n⚠️ Training completed but model installation failed.")
                print("You can manually copy the model from the runs/detect folder.")
        else:
            print("\n❌ Training failed. Check the error messages above.")
            
    except KeyboardInterrupt:
        print("\n\n⏸️ Training interrupted!")
        print("💡 You can resume later by running this script again.")
        print("The checkpoint will be automatically detected.")

if __name__ == "__main__":
    main()