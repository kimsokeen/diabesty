from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import Response
import tensorflow as tf
from tensorflow.keras import backend as K
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
import base64
import cv2


# Custom functions for segmentation model
def dice_loss(y_true, y_pred):
    smooth = 1e-6
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(y_pred)
    intersection = K.sum(y_true_f * y_pred_f)
    return 1 - (2. * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth)

def iou_metric(y_true, y_pred):
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(tf.round(y_pred))
    intersection = K.sum(y_true_f * y_pred_f)
    union = K.sum(y_true_f) + K.sum(y_pred_f) - intersection
    return intersection / (union + 1e-6)

# Load models
model = tf.keras.models.load_model("models/mobilenet_model1.h5")
seg_model = load_model(
    "models/foot_ulcer_model_mobilenet.keras",
    custom_objects={"dice_loss": dice_loss, "iou_metric": iou_metric}
)

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyze_hsv_from_mask(original_img, mask):
    binary_mask = (mask > 0).astype(np.uint8)
    hsv_img = cv2.cvtColor(original_img, cv2.COLOR_RGB2HSV)

    # Mask the wound area
    wound_pixels = hsv_img[binary_mask == 1]

    if wound_pixels.size == 0:
        return {
            "red_area_percent": 0,
            "yellow_area_percent": 0,
            "black_area_percent": 0,
        }

    # Reshape to (N, 1, 3) so cv2.inRange works correctly
    wound_pixels_reshaped = wound_pixels.reshape(-1, 1, 3)

    color_ranges = {
        "red": [(0, 50, 50), (10, 255, 255)],
        "yellow": [(20, 50, 50), (35, 255, 255)],
        "black": [(0, 0, 0), (180, 255, 50)],
    }

    result = {}
    total = wound_pixels_reshaped.shape[0]

    for color, (lower, upper) in color_ranges.items():
        lower_np = np.array(lower, dtype=np.uint8)
        upper_np = np.array(upper, dtype=np.uint8)
        mask_color = cv2.inRange(wound_pixels_reshaped, lower_np, upper_np)
        count = np.count_nonzero(mask_color)
        result[f"{color}_area_percent"] = round((count / total) * 100, 2)
    
    percent = round((count / total) * 100, 2)
    print(f"{color.capitalize()} pixels: {count} ({percent}%) out of {total}")

    return result


@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    contents = await file.read()

    # Classification Preprocessing
    image = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
    image_array = np.array(image) / 255.0
    image_input = np.expand_dims(image_array, axis=0)

    # Classify
    prediction = model.predict(image_input)[0][0]
    predicted_class = "non-diabetic foot" if prediction >= 0.5 else "diabetic foot"

    response_data = {
        "filename": file.filename,
        "prediction": predicted_class,
        "confidence": float(prediction)
    }

    # If diabetic, run segmentation
    if prediction < 0.5:
        seg_input = np.expand_dims(np.array(image.resize((256, 256))) / 255.0, axis=0)
        mask = seg_model.predict(seg_input)[0]

        # Convert to binary mask
        binary_mask = (mask > 0.3).astype(np.uint8)

        # Count pixels
        wound_area = int(np.sum(binary_mask))

        # Convert mask to image
        mask_image = (binary_mask.squeeze() * 255).astype(np.uint8)
        mask_pil = Image.fromarray(mask_image)
        buffered = io.BytesIO()
        mask_pil.save(buffered, format="PNG")
        mask_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        # Resize original image to 256x256 to match the mask
        original_for_hsv = np.array(image.resize((256, 256)))
        hsv_stats = analyze_hsv_from_mask(original_for_hsv, mask_image)

        # Add to response
        response_data["wound_area_pixels"] = wound_area
        response_data["mask_base64"] = mask_base64
        response_data["hsv_stats"] = hsv_stats  # From analyze_hsv_from_mask()


    return JSONResponse(content=response_data)
