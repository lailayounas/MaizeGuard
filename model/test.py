import tensorflow as tf
import numpy as np
from PIL import Image

# Load the TFLite model
tflite_model_path = 'maizeplant_disease_model.tflite'  # Replace with your TFLite model path
interpreter = tf.lite.Interpreter(model_path=tflite_model_path)
interpreter.allocate_tensors()

# Get input and output tensor details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("Input details:", input_details)
print("Output details:", output_details)

# Get the input shape and ensure it's a tuple of integers
input_shape = tuple(map(int, input_details[0]['shape'][1:3]))  # (height, width)
print(f"Model expects input size: {input_shape}")

# Preprocess a sample image for prediction
def preprocess_image(image_path, target_size):
    """
    Preprocess an image for TFLite model inference.
    Args:
        image_path (str): Path to the input image.
        target_size (tuple): Target size for resizing the image (height, width).
    Returns:
        np.ndarray: Preprocessed image tensor.
    """
    img = Image.open(image_path).convert("RGB")  # Convert to RGB if needed
    img = img.resize(target_size)  # Resize to match the model's input size
    img_array = np.array(img).astype('float32') / 255.0  # Normalize to [0, 1]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

# Example image path
# image_path = 'blight/00a55069-3fa3-405b-8d87-4d3408a6ed98___RS_NLB 3645.JPG'
# image_path = 'CommonRust/Corn_Common_Rust (73).JPG'
image_path = 'Healthy/0a1a49a8-3a95-415a-b115-4d6d136b980b___R.S_HL 8216 copy_flipLR.jpg'
# image_path = 'download.jpg'

processed_image = preprocess_image(image_path, target_size=input_shape)

# Perform inference
interpreter.set_tensor(input_details[0]['index'], processed_image)
interpreter.invoke()

# Get predictions
output_data = interpreter.get_tensor(output_details[0]['index'])
predicted_class = np.argmax(output_data)  # Get the index of the highest confidence score
confidence = np.max(output_data)  # Get the highest confidence score

# Display results
print(f"Predicted Class: {predicted_class}")
print(f"Confidence: {confidence * 100:.2f}%")
