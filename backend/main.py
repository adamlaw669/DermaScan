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
        "http://localhost:3000",  # React local dev server
        "https://derma-scan-ai.vercel.app"  # replace with your deployed React app URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model()

@app.post("/predict")
async def predict(files: List[UploadFile] = File(...)):
    predictions = []
    for file in files:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes))
        label, score  = predict_image(image, model)
        predictions.append(
            {'label': label,
             'confidence': float(score)
             }
        ) 
    #the logic for the final prediction 
    labels = []
    scores = []
    for prediction in predictions:
        labels.append(prediction['label'])
        scores.append(prediction['confidence']) 
    final_label = max(set(labels), key=labels.count)
    label_scores = [score for label, score in zip(labels, scores) if label == final_label]
    final_score = sum(label_scores) / len(label_scores)
    
    return {
        "label": final_label,
        "confidence": float(final_score)
    }

