import tensorflow as tf
import numpy as np
from tensorflow.keras.utils import img_to_array
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from PIL import Image

# Load your trained model
def load_model():
    model = tf.keras.models.load_model("model/ham10000_model.h5")
    return model

# Preprocess input image for MobileNetV2 style model input
def preprocess_image(image):
    image = image.convert("RGB")               # Ensure 3 channels
    image = image.resize((128, 128))
    image = img_to_array(image)                # Convert PIL image to numpy array
    image = image.astype('float32') / 255.0    # Normalize to [0, 1]
    image = image.reshape((1, 128, 128, 3))     # Model expects (1, 128, 128, 3)
    return image

# Predict class for the input image
def predict_image(image, model):
    processed = preprocess_image(image)
    prediction = model.predict(processed)[0]  # Get prediction vector
    
    # Correct HAM10000 class names
    class_names = [
        "Melanocytic Nevi",
        "Melanoma",
        "Benign Keratosis",
        "Basal Cell Carcinoma",
        "Actinic Keratoses",
        "Vascular Lesions",
        "Dermatofibroma"
    ]
    
    predicted_class = class_names[np.argmax(prediction)]
    confidence = np.max(prediction) * 100  # Convert to percentage
    
    return predicted_class, confidence
