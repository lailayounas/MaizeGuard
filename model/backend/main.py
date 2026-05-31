from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
import os

app = FastAPI(title="Maize Guard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join("model", "Maizeplant_disease_model.h5")

model = load_model(MODEL_PATH)

# IMPORTANT:
# This order must match your model training class order.
# Check your notebook for class_indices to confirm.
CLASS_NAMES = [
    "Blight",
    "Common Rust",
    "Grey Leaf Spot",
    "Healthy"
]

def preprocess_image(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize((224, 224))
    image_array = np.array(image).astype("float32") / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Maize Guard AI backend is running"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return {
            "error": "Please upload a valid image file"
        }

    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    processed_image = preprocess_image(image)

    predictions = model.predict(processed_image)

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]) * 100)

    return {
        "prediction": CLASS_NAMES[predicted_index],
        "confidence": round(confidence, 2),
        "class_index": predicted_index
    }