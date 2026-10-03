import os
import io
import logging
from typing import Dict, Any, Tuple, Optional
from PIL import Image
import numpy as np

logger = logging.getLogger("ecosort.model")

# 12-Class Taxonomy in the exact required order
CLASS_NAMES = [
    "battery",
    "biological",
    "brown-glass",
    "cardboard",
    "clothes",
    "green-glass",
    "metal",
    "paper",
    "plastic",
    "shoes",
    "trash",
    "white-glass"
]

# Waste segregation guidance and municipal details for each class
CLASS_METADATA = {
    "battery": {
        "display_name": "Battery (E-Waste / Hazardous)",
        "category": "Hazardous & Special",
        "primary_bin": "Red Bin (E-Waste / Hazardous)",
        "bin_color": "#dc2626",
        "guidance": "Do not dispose of batteries in general household waste or curbside recycling. Tape positive and negative terminals with electrical tape and drop off at certified municipal battery collection bins or electronics retail depots.",
        "recyclability_score": 70,
        "co2_saved": 0.85,
        "energy_saved": 1.40,
        "water_saved": 6.0,
        "decomposition_years": 100
    },
    "biological": {
        "display_name": "Biological / Organic Waste",
        "category": "Compostable & Organic",
        "primary_bin": "Green Bin (Compost/Organics)",
        "bin_color": "#16a34a",
        "guidance": "Remove any non-biodegradable fruit stickers, packaging, or plastic ties. Deposit directly into your green organics bin or backyard compost pile for circular nutrient recovery.",
        "recyclability_score": 98,
        "co2_saved": 0.25,
        "energy_saved": 0.15,
        "water_saved": 2.0,
        "decomposition_years": 0.2
    },
    "brown-glass": {
        "display_name": "Brown Glass Bottle / Jar",
        "category": "Glass & Glassware",
        "primary_bin": "Blue Bin (Recycling)",
        "bin_color": "#2563eb",
        "guidance": "Empty and rinse container lightly to remove drink or food residue. Remove metal crown caps or plastic lids. Deposit in the designated glass recycling stream.",
        "recyclability_score": 92,
        "co2_saved": 0.30,
        "energy_saved": 0.60,
        "water_saved": 1.2,
        "decomposition_years": 1000
    },
    "cardboard": {
        "display_name": "Corrugated Cardboard Box",
        "category": "Paper & Cardboard",
        "primary_bin": "Yellow Bin (Paper/Cardboard)",
        "bin_color": "#eab308",
        "guidance": "Flatten boxes completely to maximize collection container space. Ensure the material is clean, dry, and free of food grease or packing styrofoam before recycling.",
        "recyclability_score": 95,
        "co2_saved": 0.40,
        "energy_saved": 0.90,
        "water_saved": 5.0,
        "decomposition_years": 1.5
    },
    "clothes": {
        "display_name": "Textiles & Garments",
        "category": "Textiles & Apparel",
        "primary_bin": "Gray Bin (General / Donation)",
        "bin_color": "#8b5cf6",
        "guidance": "If wearable, clean and donate to charity or local community clothing banks. If stained or worn out, take to dedicated municipal textile recycling drop-off containers.",
        "recyclability_score": 80,
        "co2_saved": 1.20,
        "energy_saved": 2.50,
        "water_saved": 15.0,
        "decomposition_years": 40
    },
    "green-glass": {
        "display_name": "Green Glass Bottle / Jar",
        "category": "Glass & Glassware",
        "primary_bin": "Blue Bin (Recycling)",
        "bin_color": "#2563eb",
        "guidance": "Rinse thoroughly to remove beverage residue. Remove corks, caps, or metal wire and place bottle in the glass recycling bin.",
        "recyclability_score": 92,
        "co2_saved": 0.30,
        "energy_saved": 0.60,
        "water_saved": 1.2,
        "decomposition_years": 1000
    },
    "metal": {
        "display_name": "Metal & Aluminum Can / Scrap",
        "category": "Metal & Aluminum",
        "primary_bin": "Blue Bin (Recycling)",
        "bin_color": "#2563eb",
        "guidance": "Rinse cans clean of food grease or liquid residue. Crush aluminum beverage cans to conserve recycling volume and place in the blue recycling container.",
        "recyclability_score": 96,
        "co2_saved": 0.65,
        "energy_saved": 1.20,
        "water_saved": 4.0,
        "decomposition_years": 200
    },
    "paper": {
        "display_name": "Clean Paper & Paperboard",
        "category": "Paper & Cardboard",
        "primary_bin": "Yellow Bin (Paper/Cardboard)",
        "bin_color": "#eab308",
        "guidance": "Ensure paper is dry and clean of oil or food stains. Remove any plastic wrap or metallic spiral binders before placing in the yellow paper recycling bin.",
        "recyclability_score": 95,
        "co2_saved": 0.35,
        "energy_saved": 0.80,
        "water_saved": 4.5,
        "decomposition_years": 1.0
    },
    "plastic": {
        "display_name": "Recyclable Plastic Container",
        "category": "Recyclable Plastics",
        "primary_bin": "Blue Bin (Recycling)",
        "bin_color": "#2563eb",
        "guidance": "Empty remaining liquids, rinse container, and flatten to save space. Check the resin code (PET #1, HDPE #2, PP #5) and deposit into your blue recycling container.",
        "recyclability_score": 88,
        "co2_saved": 0.35,
        "energy_saved": 0.85,
        "water_saved": 3.5,
        "decomposition_years": 450
    },
    "shoes": {
        "display_name": "Footwear & Rubber Shoes",
        "category": "Footwear & Apparel",
        "primary_bin": "Gray Bin (General / Special Depot)",
        "bin_color": "#4b5563",
        "guidance": "If in usable condition, tie pairs together and donate to footwear reuse initiatives. If heavily damaged, place in specialized rubber recycling drop-offs or residual bin.",
        "recyclability_score": 60,
        "co2_saved": 0.50,
        "energy_saved": 1.10,
        "water_saved": 5.0,
        "decomposition_years": 80
    },
    "trash": {
        "display_name": "Non-Recyclable Residual Refuse",
        "category": "Non-Recyclable Landfill",
        "primary_bin": "Gray Bin (General Landfill)",
        "bin_color": "#64748b",
        "guidance": "Non-recyclable composite or contaminated residual waste. Bag securely and deposit in your municipal general landfill waste bin.",
        "recyclability_score": 10,
        "co2_saved": 0.05,
        "energy_saved": 0.05,
        "water_saved": 0.1,
        "decomposition_years": 50
    },
    "white-glass": {
        "display_name": "Clear / White Glass Jar or Bottle",
        "category": "Glass & Glassware",
        "primary_bin": "Blue Bin (Recycling)",
        "bin_color": "#2563eb",
        "guidance": "Rinse clean of all contents. Remove lids and deposit into clear glass collection or curbside recycling container.",
        "recyclability_score": 92,
        "co2_saved": 0.30,
        "energy_saved": 0.60,
        "water_saved": 1.2,
        "decomposition_years": 1000
    }
}

# Global singleton model reference - loaded once on server startup
_loaded_model = None
_model_loaded_attempted = False

# Possible model file locations
MODEL_PATHS = [
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "ecosort_best_model.keras"),
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ecosort_best_model.keras"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "ecosort_best_model.keras")
]


# Configurable Confidence Threshold for Waste Validation
# If the maximum softmax probability of MobileNetV2 is below this threshold,
# the image is rejected as not confidently identifiable as one of the 12 supported waste categories.
CONFIDENCE_THRESHOLD = 0.70  # Configurable threshold: default 0.70 (70%)

REJECTION_MESSAGE = (
    "Please upload a clear image of waste. EcoSort supports battery, biological, "
    "cardboard, clothes, glass, metal, paper, plastic, shoes, and trash items."
)


def load_ecosort_model():
    """
    Loads the trained MobileNetV2 model (ecosort_best_model.keras) once on application startup.
    Reuses existing loaded instance across all subsequent inference requests.
    """
    global _loaded_model, _model_loaded_attempted
    if _loaded_model is not None:
        return _loaded_model

    _model_loaded_attempted = True
    
    # Locate model file
    model_file_path = None
    for p in MODEL_PATHS:
        if os.path.exists(p):
            model_file_path = p
            break

    if not model_file_path:
        logger.warning("ecosort_best_model.keras not found at expected paths. Model will load once available.")
        return None

    try:
        import keras
        logger.info(f"Loading MobileNetV2 model once from: {model_file_path}")
        _loaded_model = keras.models.load_model(model_file_path)
        logger.info(f"ecosort_best_model.keras successfully loaded. Input shape: {_loaded_model.input_shape}, Output classes: {len(CLASS_NAMES)}")
        return _loaded_model
    except Exception as e:
        logger.warning(f"Notice during model loading ({e}). Checking fallback backend...")
        try:
            import tensorflow as tf
            _loaded_model = tf.keras.models.load_model(model_file_path)
            logger.info("ecosort_best_model.keras successfully loaded via tensorflow.keras.")
            return _loaded_model
        except Exception as tf_err:
            logger.error(f"Failed to load ecosort_best_model.keras: {tf_err}")
            return None


def get_model():
    """Returns the pre-loaded singleton model or loads it if not already loaded."""
    global _loaded_model
    if _loaded_model is None:
        return load_ecosort_model()
    return _loaded_model


def preprocess_image(image_bytes: bytes, model=None) -> np.ndarray:
    """
    Converts uploaded image to RGB, resizes to 224x224.
    If the loaded model does not contain a built-in Rescaling layer,
    applies MobileNetV2 normalization: image / 127.5 - 1.0.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)

    # Check if the model already contains an internal Rescaling layer
    has_rescaling = False
    if model is not None and hasattr(model, 'layers'):
        for layer in model.layers:
            if 'rescaling' in layer.name.lower():
                has_rescaling = True
                break

    if not has_rescaling:
        # Scale to [-1, 1] if not handled internally
        img_array = (img_array / 127.5) - 1.0

    return img_array


def detect_non_waste_subject(image_bytes: bytes) -> Tuple[bool, str]:
    """
    Checks if an uploaded image is a non-waste entity (e.g., human portrait,
    selfie, living person, or UI screenshot) to prevent false classification
    by the 12-class closed-set MobileNetV2 classifier.
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
        arr = np.array(pil_img, dtype=np.float32)

        R = arr[:, :, 0]
        G = arr[:, :, 1]
        B = arr[:, :, 2]

        # 1. Human Skin Chromaticity in YCrCb color space
        Y = 0.299 * R + 0.587 * G + 0.114 * B
        Cr = (R - Y) * 0.713 + 128
        Cb = (B - Y) * 0.564 + 128

        skin_mask = (
            (Cr >= 133) & (Cr <= 173) & 
            (Cb >= 77) & (Cb <= 127) & 
            (R > G) & (G > B) & 
            ((R - G) > 12)
        )

        h, w = skin_mask.shape
        # Upper-center region where face, head, or neck appears in portraits
        face_region = skin_mask[int(h * 0.08):int(h * 0.65), int(w * 0.15):int(w * 0.85)]
        face_skin_ratio = np.sum(face_region) / face_region.size
        overall_skin_ratio = np.sum(skin_mask) / skin_mask.size

        # If significant facial or overall skin is detected, it is a person/portrait
        if face_skin_ratio > 0.06 or overall_skin_ratio > 0.05:
            return True, "Human portrait / living person detected"

        # 2. UI / Screenshot border check (e.g. solid black letterbox bars surrounding a photo or document)
        left_bar = np.mean(arr[:, :20, :])
        right_bar = np.mean(arr[:, -20:, :])
        top_bar = np.mean(arr[:20, :, :])
        bottom_bar = np.mean(arr[-20:, :, :])
        if (left_bar < 5 and right_bar < 5) or (top_bar < 5 and bottom_bar < 5):
            # Letterboxed screenshot / UI capture
            center_region = arr[30:-30, 30:-30, :]
            # Check center region for skin or document
            c_R = center_region[:, :, 0]
            c_G = center_region[:, :, 1]
            c_B = center_region[:, :, 2]
            c_Y = 0.299 * c_R + 0.587 * c_G + 0.114 * c_B
            c_Cr = (c_R - c_Y) * 0.713 + 128
            c_Cb = (c_B - c_Y) * 0.564 + 128
            c_skin = (c_Cr >= 133) & (c_Cr <= 173) & (c_Cb >= 77) & (c_Cb <= 127) & (c_R > c_G)
            if np.sum(c_skin) / c_skin.size > 0.04:
                return True, "Screenshot containing human portrait / person"

        return False, "Image passes non-waste visual check"
    except Exception as e:
        logger.warning(f"Non-waste detection error: {e}")
        return False, "Error during check"


def run_mobilenet_classification(image_bytes: bytes) -> Dict[str, Any]:
    """
    Executes MobileNetV2 inference with ecosort_best_model.keras on 224x224 RGB image.
    Returns predicted class from 12 classes, softmax confidence (0.0 to 1.0),
    and distribution dictionary across all 12 classes.
    """
    model = get_model()
    if model is None or not image_bytes:
        return {
            "predicted_class": "trash",
            "confidence": 0.0,
            "all_probabilities": {}
        }

    try:
        input_tensor = preprocess_image(image_bytes, model=model)
        raw_preds = model.predict(input_tensor, verbose=0)
        probs = raw_preds[0]

        top_idx = int(np.argmax(probs))
        max_prob = float(probs[top_idx])
        predicted_class = CLASS_NAMES[top_idx] if top_idx < len(CLASS_NAMES) else "trash"

        all_probabilities = {
            CLASS_NAMES[i]: round(float(probs[i]), 4)
            for i in range(len(CLASS_NAMES))
        }

        return {
            "predicted_class": predicted_class,
            "confidence": round(max_prob, 4),
            "all_probabilities": all_probabilities,
            "meta": CLASS_METADATA.get(predicted_class, CLASS_METADATA["trash"])
        }
    except Exception as e:
        logger.error(f"MobileNetV2 classification error: {e}")
        return {
            "predicted_class": "trash",
            "confidence": 0.0,
            "all_probabilities": {}
        }


def predict_waste_image(image_bytes: bytes, text_context: str = "") -> Dict[str, Any]:
    """
    Legacy helper wrapping MobileNetV2 classification.
    """
    mb = run_mobilenet_classification(image_bytes)
    predicted_class = mb["predicted_class"]
    confidence = mb["confidence"]
    meta = CLASS_METADATA.get(predicted_class, CLASS_METADATA["trash"])

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "success": False,
            "is_waste": False,
            "message": REJECTION_MESSAGE,
            "confidence": confidence,
            "category": None,
            "guidance": None,
            "raw_class": predicted_class,
            "all_probabilities": mb.get("all_probabilities", {})
        }

    return {
        "success": True,
        "is_waste": True,
        "raw_class": predicted_class,
        "category": predicted_class,
        "itemName": meta["display_name"],
        "confidence": confidence,
        "confidence_pct": round(confidence * 100.0, 1),
        "primaryBin": meta["primary_bin"],
        "binColor": meta["bin_color"],
        "guidance": meta["guidance"],
        "recyclabilityScore": meta["recyclability_score"],
        "contaminationRisk": "Low" if confidence >= 0.85 else ("Medium" if confidence >= 0.70 else "High"),
        "all_probabilities": mb.get("all_probabilities", {}),
        "impact": {
            "co2SavedKg": meta["co2_saved"],
            "energySavedKwh": meta["energy_saved"],
            "waterSavedLiters": meta["water_saved"],
            "decompositionYears": meta["decomposition_years"]
        },
        "segregationSteps": [
            meta["guidance"],
            f"Place sorted item directly into the {meta['primary_bin']}.",
            "Prevent cross-contamination by keeping material dry and clean."
        ]
    }

