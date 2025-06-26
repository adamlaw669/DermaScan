from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from utils import load_model, predict_image
from io import BytesIO
from PIL import Image

app = FastAPI()

# Allow frontend on Vercel to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # For local dev
        "https://derma-scan-ai.vercel.app",  # Your Vercel app
        "https://dermascan-app.vercel.app"   # Alternate domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model()

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(BytesIO(image_bytes))

    prediction = predict_image(image, model)  # returns tuple ('Melanoma', 0.87)
    label, score = prediction
    return {
        "label": label,
        "confidence": float(score)
    }
