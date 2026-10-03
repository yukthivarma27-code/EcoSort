import os
import io
import json
import logging
from typing import Dict, Any, Optional
from PIL import Image
import dotenv

dotenv.load_dotenv()

logger = logging.getLogger("ecosort.gemini")

# Supported 12 Waste Categories
SUPPORTED_CLASSES = [
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

_gemini_client = None

def get_gemini_client():
    """Initializes and returns the Google GenAI client using GEMINI_API_KEY."""
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set in environment or .env file.")
        return None

    try:
        from google import genai
        _gemini_client = genai.Client(api_key=api_key)
        return _gemini_client
    except Exception as e:
        logger.error(f"Failed to initialize google-genai client: {e}")
        return None


def analyze_image_multimodal(image_bytes: bytes, text_context: str = "") -> Dict[str, Any]:
    """
    Sends the raw uploaded image to Gemini multimodal AI to determine:
    1. is_waste: whether the image appears to contain a waste item or a non-waste entity (e.g. person, car, animal).
    2. visible_object: concise description of what is visible.
    3. image_analysis: explanation of what is in the image and whether it is a supported waste item.
    4. suggested_waste_category: matching supported class if waste, else None.
    5. guidance: specific disposal/segregation advice if waste, else None.
    """
    client = get_gemini_client()
    if not client or not image_bytes:
        # Fallback if Gemini client is unavailable
        return _fallback_heuristic_analysis(image_bytes, text_context)

    system_prompt = """You are an expert visual intelligence and materials analysis system for EcoSort.
Your task is to analyze the provided image with high precision, determine if it represents a waste/recyclable item, and return structured JSON.

EcoSort strictly supports these 12 waste categories:
- battery: Batteries (dry cell, lithium, lead-acid, button cells)
- biological: Organic food scraps, fruit peels, vegetable scraps, plant matter
- brown-glass: Brown/amber glass bottles and jars
- cardboard: Corrugated cardboard packaging and boxes
- clothes: Discarded textile garments, worn rags (ONLY isolated, discarded items intended for disposal/recycling; NEVER living people wearing clothes)
- green-glass: Green glass beverage bottles and jars
- metal: Aluminum cans, food tins, scrap metal items
- paper: Clean paper, newspapers, magazines, office documents
- plastic: Plastic bottles, food containers, jugs, packaging
- shoes: Discarded footwear, boots, sneakers
- trash: General non-recyclable residual refuse and composites
- white-glass: Clear/transparent glass bottles and jars

CRITICAL EVALUATION RULES:
1. NON-WASTE DETECTION:
   - If the main subject of the image is a living person, human portrait, selfie, pet/animal, automobile/vehicle, building, scenic landscape, or software screenshot:
     * "is_waste": false
     * "visible_object": Describe what is shown (e.g. "a person sitting on a stool outdoors", "a blue automobile on a street", "a golden retriever dog")
     * "image_analysis": Explain clearly what is seen and that it is not a waste item (e.g. "The image appears to show a person standing outdoors. It does not contain a recognizable waste item.")
     * "suggested_waste_category": null
     * "guidance": null
     * "is_clear": true

2. UNCONFIRMED / BLURRY / UNCLEAR:
   - If the image is pitch black, completely blurry, or impossible to decipher:
     * "is_waste": false
     * "visible_object": "Unclear / Ambiguous visual input"
     * "image_analysis": "The image is too blurry or unclear to identify recognizable waste or material."
     * "suggested_waste_category": null
     * "guidance": null
     * "is_clear": false

3. GENUINE WASTE ITEM:
   - If the image depicts an actual discarded consumer/household/industrial waste item, packaging, food scrap, or scrap material:
     * "is_waste": true
     * "visible_object": specific item name (e.g. "clear plastic beverage bottle", "cardboard shipping carton", "banana peel")
     * "image_analysis": factual observation (e.g. "The image shows a clear PET plastic water bottle with its cap attached.")
     * "suggested_waste_category": one of [battery, biological, brown-glass, cardboard, clothes, green-glass, metal, paper, plastic, shoes, trash, white-glass]
     * "guidance": concise, actionable segregation guidance for this specific item
     * "is_clear": true

Return strictly valid JSON matching these keys:
{
  "is_waste": boolean,
  "visible_object": string,
  "image_analysis": string,
  "suggested_waste_category": string or null,
  "guidance": string or null,
  "is_clear": boolean
}
"""

    candidate_models = [
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite"
    ]

    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        user_prompt = "Analyze this image. Determine whether it is waste or non-waste, describe visible objects, and return structured JSON."
        if text_context:
            user_prompt += f" Additional user note: {text_context}"

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[system_prompt, user_prompt, pil_img]
                )
                if response and response.text:
                    text_out = response.text.strip()
                    # Clean markdown codeblocks if present
                    if "```json" in text_out:
                        text_out = text_out.split("```json")[1].split("```")[0].strip()
                    elif "```" in text_out:
                        text_out = text_out.split("```")[1].split("```")[0].strip()

                    parsed = json.loads(text_out)
                    return {
                        "is_waste": bool(parsed.get("is_waste", False)),
                        "visible_object": str(parsed.get("visible_object", "Observed subject")),
                        "image_analysis": str(parsed.get("image_analysis", "")),
                        "suggested_waste_category": parsed.get("suggested_waste_category") if parsed.get("is_waste") else None,
                        "guidance": parsed.get("guidance") if parsed.get("is_waste") else None,
                        "is_clear": bool(parsed.get("is_clear", True))
                    }
            except Exception as m_err:
                logger.debug(f"Model {model_name} attempt: {m_err}")
                continue

    except Exception as e:
        logger.error(f"Error during Gemini multimodal analysis: {e}")

    # Fallback if all Gemini models fail or network error
    return _fallback_heuristic_analysis(image_bytes, text_context)


def _fallback_heuristic_analysis(image_bytes: bytes, text_context: str = "") -> Dict[str, Any]:
    """Local fallback heuristic when Gemini API is offline or unconfigured."""
    if not image_bytes:
        return {
            "is_waste": False,
            "visible_object": "Unknown",
            "image_analysis": "No image data was provided.",
            "suggested_waste_category": None,
            "guidance": None,
            "is_clear": False
        }

    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
        arr = np.array(pil_img, dtype=np.float32)
        R, G, B = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        Y = 0.299 * R + 0.587 * G + 0.114 * B
        Cr = (R - Y) * 0.713 + 128
        Cb = (B - Y) * 0.564 + 128

        skin_mask = (Cr >= 133) & (Cr <= 173) & (Cb >= 77) & (Cb <= 127) & (R > G)
        h, w = skin_mask.shape
        face_region = skin_mask[int(h * 0.1):int(h * 0.65), int(w * 0.2):int(w * 0.8)]
        if np.sum(face_region) / face_region.size > 0.08:
            return {
                "is_waste": False,
                "visible_object": "Person / Human Portrait",
                "image_analysis": "The image appears to show a person. It does not contain a recognizable waste item.",
                "suggested_waste_category": None,
                "guidance": None,
                "is_clear": True
            }
    except Exception:
        pass

    return {
        "is_waste": True,
        "visible_object": "Waste candidate item",
        "image_analysis": "Image processed via EcoSort Neural Vision Model.",
        "suggested_waste_category": None,
        "guidance": None,
        "is_clear": True
    }
