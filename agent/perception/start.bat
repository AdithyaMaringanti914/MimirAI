@echo off
echo Starting Python OCR Perception Service...
cd %~dp0
uvicorn main:app --host 127.0.0.1 --port 8000
