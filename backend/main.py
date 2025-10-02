from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from pathlib import Path
from datetime import datetime
import uuid
import io

from .model import load_model, preprocess_image, predict as model_predict
from .utils import generate_gradcam_heatmap, save_heatmap
from .gemini import get_explanation_from_gemini, test_gemini_connection


# Paths
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
HEATMAPS_DIR = STATIC_DIR / "heatmaps"
HEATMAPS_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(title="TB X-ray AI Backend", version="1.0.0")


# CORS: adjust as needed; allowing all for simplicity during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: tighten in production (e.g., ["http://localhost:8080"]) 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static files for heatmaps
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# Load model once at startup (placeholder path)
MODEL = load_model()

# Test Gemini connection at startup
print("🔍 Testing Gemini API connection...")
test_gemini_connection()


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if image.content_type is None or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    # Read file bytes
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    try:
        # Preprocess for model
        input_tensor, pil_image = preprocess_image(io.BytesIO(image_bytes))

        # Run prediction (currently dummy until model is added)
        label, confidence = model_predict(MODEL, input_tensor)

        # Generate heatmap (Grad-CAM placeholder) and save
        heatmap = generate_gradcam_heatmap(pil_image, MODEL, input_tensor)
        heatmap_filename = f"heatmap_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.png"
        heatmap_path = HEATMAPS_DIR / heatmap_filename
        save_heatmap(heatmap, heatmap_path, original_image=pil_image, alpha=0.45)

        # Call Gemini to get structured explanations
        explanations = get_explanation_from_gemini(heatmap_path, label, confidence)

        # Build response
        response_payload = {
            "prediction": label,
            "confidence": round(float(confidence), 2),
            "heatmap_url": f"/static/heatmaps/{heatmap_filename}",
            "explanation": explanations.get("explanation_doctor", ""),
            "explanation_doctor": explanations.get("explanation_doctor", ""),
            "explanation_patient": explanations.get("explanation_patient", ""),
        }

        return JSONResponse(content=response_payload)

    except HTTPException:
        raise
    except Exception as exc:
        # In production, log the exception details
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


@app.get("/health")
async def health():
    return {"status": "ok"}


