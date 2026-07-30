import io
import base64
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import numpy as np
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EasyOCR reader (loads weights into memory)
# We use 'en' for English. gpu=False by default to avoid CUDA issues on generic machines, 
# but it will use GPU if available.
print("Loading EasyOCR model...")
reader = easyocr.Reader(['en'], gpu=True)
print("EasyOCR model loaded.")

@app.post("/ocr")
async def process_ocr(image: str = Form(...)):
    """
    Accepts base64 encoded image string, returns OCR bounding boxes.
    """
    try:
        # Decode base64
        image_data = base64.b64decode(image)
        img = Image.open(io.BytesIO(image_data)).convert('RGB')
        img_np = np.array(img)
        
        # Run OCR
        # Results format: [[bbox, text, prob], ...]
        # bbox is [[x, y], [x+w, y], [x+w, y+h], [x, y+h]]
        results = reader.readtext(img_np)
        
        text_blocks = []
        for (bbox, text, prob) in results:
            # bbox[0] is top-left, bbox[2] is bottom-right
            x = int(bbox[0][0])
            y = int(bbox[0][1])
            w = int(bbox[2][0] - x)
            h = int(bbox[2][1] - y)
            
            text_blocks.append({
                "text": text,
                "confidence": float(prob),
                "bounds": {
                    "x": x,
                    "y": y,
                    "width": w,
                    "height": h
                }
            })
            
        return JSONResponse(content={"textBlocks": text_blocks, "success": True})
        
    except Exception as e:
        return JSONResponse(content={"error": str(e), "success": False}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
