@echo off
echo Simple Package Installation for YOLO Detection Server
echo =====================================================

cd backend

echo.
echo Step 1: Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Step 2: Installing packages one by one (this avoids build issues)...

echo Installing FastAPI...
pip install fastapi --no-cache-dir

echo Installing Uvicorn...
pip install uvicorn --no-cache-dir

echo Installing Pillow (image processing)...
pip install pillow --no-cache-dir

echo Installing Python Multipart...
pip install python-multipart --no-cache-dir

echo Installing Ultralytics (YOLO)...
pip install ultralytics --no-cache-dir --no-build-isolation

echo.
echo Step 3: Testing imports...
python -c "import fastapi; print('✅ FastAPI installed successfully')"
python -c "import uvicorn; print('✅ Uvicorn installed successfully')"
python -c "import PIL; print('✅ Pillow installed successfully')"
python -c "from ultralytics import YOLO; print('✅ Ultralytics installed successfully')"

echo.
echo Step 4: Starting detection server...
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
python detection_server.py

pause