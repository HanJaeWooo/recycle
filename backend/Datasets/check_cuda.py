#!/usr/bin/env python3
"""Quick script to verify CUDA is working"""
import torch

print("=" * 50)
print("CUDA VERIFICATION")
print("=" * 50)
print(f"PyTorch Version: {torch.__version__}")
print(f"CUDA Available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA Version: {torch.version.cuda}")
    print(f"GPU Count: {torch.cuda.device_count()}")
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    print("\n✅ GPU is ready for training!")
else:
    print("\n❌ GPU not available - training will use CPU")
print("=" * 50)
