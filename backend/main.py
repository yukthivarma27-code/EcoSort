import base64
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.database import init_db, get_db, ScanHistory
from backend.gemini_service import analyze_image_multimodal
from backend.model import run_mobilenet_classification, load_ecosort_model, CLASS_NAMES, CLASS_METADATA, CONFIDENCE_THRESHOLD

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ecosort.api")

app = FastAPI(
    title="EcoSort AI Backend",
    description="FastAPI Backend for Waste Classification with MobileNetV2 and SQLite History",
    version="2.4.0"
)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing SQLite database 'ecosort.db'...")
    init_db()
    logger.info("Database initialized successfully.")
    load_ecosort_model()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request & Response Schemas
class ClassifyRequest(BaseModel):
    imageBase64: Optional[str] = Field(None, description="Base64 encoded image string")
    textPrompt: Optional[str] = Field(None, description="Optional text context or description")
    sampleName: Optional[str] = Field(None, description="Optional preset sample name")

class HistoryItem(BaseModel):
    id: int
    predicted_category: str
    confidence: float
    image_analysis: Optional[str] = None
    guidance: str
    created_at: str

class StatsResponse(BaseModel):
    total_scans: int
    category_counts: Dict[str, int]
    most_detected_category: Optional[str]
    category_breakdown: List[Dict[str, Any]]

@app.get("/api/health")
def health_check():
    """Service health check endpoint."""
    return {
        "status": "ok",
        "service": "EcoSort AI Waste Intelligence Backend",
        "version": "2.4.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/classify")
@app.post("/api/predict")
def classify_waste_image(
    payload: ClassifyRequest, 
    db: Session = Depends(get_db)
):
    """
    Multimodal Waste Intelligence Endpoint:
    1. Sends uploaded image to Gemini for broad visual understanding & waste/non-waste determination.
    2. If Non-Waste: Returns image analysis describing visible entity, no fake waste class, no waste guidance.
    3. If Waste: Runs trained MobileNetV2 classifier.
       - If confidence < 0.70: Returns uncertainty notification and requests clearer image.
       - If confidence >= 0.70: Returns MobileNetV2 category, confidence, Gemini image analysis,
         tailored segregation guidance, and persists valid scan to SQLite database.
    """
    try:
        image_bytes = b""
        if payload.imageBase64:
            b64_str = payload.imageBase64
            if ";base64," in b64_str:
                b64_str = b64_str.split(";base64,")[1]
            try:
                image_bytes = base64.b64decode(b64_str)
            except Exception as e:
                logger.error(f"Base64 decode error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Invalid image payload. Please provide a valid base64 image."
                )

        if not image_bytes and not payload.textPrompt and not payload.sampleName:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Please upload or capture an image of an item to classify."
            )

        context_text = f"{payload.textPrompt or ''} {payload.sampleName or ''}".strip()
        
        # Step 1: Multimodal Gemini Analysis
        gemini_result = analyze_image_multimodal(image_bytes, context_text)
        is_waste = gemini_result.get("is_waste", False)
        visible_obj = gemini_result.get("visible_object", "Observed subject")
        analysis_text = gemini_result.get("image_analysis", "")
        gemini_guidance = gemini_result.get("guidance")
        is_clear = gemini_result.get("is_clear", True)

        # Step 2: Handle NON-WASTE Images (e.g. Person, Car, Landscape, Building, Screenshot)
        if not is_waste:
            logger.info(f"Image analyzed as NON-WASTE: {visible_obj}")
            return {
                "success": True,
                "is_waste": False,
                "category": None,
                "confidence": None,
                "image_analysis": analysis_text or f"The image appears to show {visible_obj}. It does not contain a recognizable waste item.",
                "guidance": None,
                "itemName": visible_obj,
                "primaryBin": None,
                "binColor": "#64748b",
                "isValidWaste": False,
                "isIdentifiable": is_clear,
                "recyclabilityScore": 0,
                "contaminationRisk": "Low",
                "composition": [
                    {"material": visible_obj, "percentage": 100}
                ],
                "segregationSteps": [
                    "This subject is not a household, commercial, or discarded waste item.",
                    "No municipal waste segregation or bin deposition is required."
                ],
                "impact": {
                    "co2SavedKg": 0.0,
                    "energySavedKwh": 0.0,
                    "waterSavedLiters": 0.0,
                    "decompositionYears": 0.0
                },
                "upcyclingIdeas": [],
                "localDisposalNotice": "Not suitable for municipal waste, recycling, or organics containers.",
                "aiNotes": analysis_text
            }

        # Step 3: Handle WASTE Images - Run MobileNetV2 Classifier
        mb_result = run_mobilenet_classification(image_bytes)
        predicted_category = mb_result["predicted_class"]
        confidence = float(mb_result["confidence"])
        meta = mb_result.get("meta", CLASS_METADATA.get(predicted_category, CLASS_METADATA["trash"]))

        # Check for Low-Confidence / Unclear Waste Item (< 0.70)
        if confidence < CONFIDENCE_THRESHOLD:
            logger.info(f"Waste image has low MobileNetV2 confidence ({confidence:.4f})")
            return {
                "success": True,
                "is_waste": True,
                "category": None,
                "confidence": round(confidence, 2),
                "image_analysis": analysis_text or "The image appears to contain a waste item, but the material is unclear.",
                "guidance": "Please upload a clearer image so EcoSort can identify the waste category more reliably.",
                "itemName": f"Uncertain Material ({visible_obj})",
                "primaryBin": "Special / Unclear Stream",
                "binColor": "#64748b",
                "isValidWaste": True,
                "isIdentifiable": False,
                "recyclabilityScore": 0,
                "contaminationRisk": "High",
                "composition": [
                    {"material": "Unidentified Material Composition", "percentage": 100}
                ],
                "segregationSteps": [
                    "Please upload a clearer, well-lit photo of the item on a plain background.",
                    "Inspect packaging labels or resin identification codes before sorting."
                ],
                "impact": {
                    "co2SavedKg": 0.0,
                    "energySavedKwh": 0.0,
                    "waterSavedLiters": 0.0,
                    "decompositionYears": 0.0
                },
                "upcyclingIdeas": [],
                "localDisposalNotice": "Classification confidence is below 70%. Please verify material specifications before disposal.",
                "aiNotes": analysis_text or "Low-confidence MobileNetV2 classification."
            }

        # Step 4: Valid Supported Waste Classification (Confidence >= 0.70)
        final_guidance = gemini_guidance if gemini_guidance else meta["guidance"]
        final_analysis = analysis_text if analysis_text else f"Identified as {meta['display_name']}."

        # Persist valid waste scan to SQLite
        try:
            scan_record = ScanHistory(
                predicted_category=predicted_category,
                confidence=round(confidence * 100.0, 1),
                image_analysis=final_analysis,
                guidance=final_guidance,
                created_at=datetime.utcnow()
            )
            db.add(scan_record)
            db.commit()
            db.refresh(scan_record)
            db_id = scan_record.id
            created_at_str = scan_record.created_at.isoformat()
        except Exception as db_err:
            db.rollback()
            logger.error(f"Database error while saving scan history: {db_err}")
            db_id = 0
            created_at_str = datetime.utcnow().isoformat()

        return {
            "success": True,
            "is_waste": True,
            "category": predicted_category,
            "confidence": round(confidence, 4),
            "confidence_pct": round(confidence * 100.0, 1),
            "image_analysis": final_analysis,
            "guidance": final_guidance,
            "id": f"scan-{db_id}" if db_id > 0 else f"scan-{int(datetime.utcnow().timestamp() * 1000)}",
            "db_id": db_id,
            "timestamp": created_at_str,
            "isValidWaste": True,
            "isIdentifiable": True,
            "itemName": meta["display_name"],
            "primaryBin": meta["primary_bin"],
            "binColor": meta["bin_color"],
            "recyclabilityScore": meta["recyclability_score"],
            "contaminationRisk": "Low" if confidence >= 0.85 else "Medium",
            "composition": [
                {"material": f"Identified {meta['display_name']} Material", "percentage": 100}
            ],
            "segregationSteps": [
                final_guidance,
                f"Place sorted item directly into the {meta['primary_bin']}.",
                "Prevent cross-contamination by keeping material dry and clean."
            ],
            "impact": {
                "co2SavedKg": meta["co2_saved"],
                "energySavedKwh": meta["energy_saved"],
                "waterSavedLiters": meta["water_saved"],
                "decompositionYears": meta["decomposition_years"]
            },
            "upcyclingIdeas": [
                f"Repurpose or sort {meta['display_name']} according to clean municipal standards.",
                "Promote circular material reuse and prevent landfill diversion."
            ],
            "localDisposalNotice": final_guidance,
            "aiNotes": final_analysis
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error in classify_waste_image")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification processing failed: {str(e)}"
        )


@app.post("/api/predict/upload")
async def predict_waste_file(
    file: UploadFile = File(..., description="Uploaded image file (JPEG/PNG)"),
    db: Session = Depends(get_db)
):
    """
    Direct image file upload endpoint with Gemini multimodal validation
    and MobileNetV2 classification.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Empty image file uploaded."
            )

        gemini_result = analyze_image_multimodal(image_bytes, file.filename or "")
        is_waste = gemini_result.get("is_waste", False)
        visible_obj = gemini_result.get("visible_object", "Observed subject")
        analysis_text = gemini_result.get("image_analysis", "")
        gemini_guidance = gemini_result.get("guidance")

        if not is_waste:
            return {
                "success": True,
                "is_waste": False,
                "category": None,
                "confidence": None,
                "image_analysis": analysis_text or f"The image appears to show {visible_obj}. It does not contain a recognizable waste item.",
                "guidance": None
            }

        mb_result = run_mobilenet_classification(image_bytes)
        predicted_category = mb_result["predicted_class"]
        confidence = float(mb_result["confidence"])
        meta = mb_result.get("meta", CLASS_METADATA.get(predicted_category, CLASS_METADATA["trash"]))

        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "success": True,
                "is_waste": True,
                "category": None,
                "confidence": round(confidence, 2),
                "image_analysis": analysis_text or "The image appears to contain a waste item, but the material is unclear.",
                "guidance": "Please upload a clearer image so EcoSort can identify the waste category more reliably."
            }

        final_guidance = gemini_guidance if gemini_guidance else meta["guidance"]
        final_analysis = analysis_text if analysis_text else f"Identified as {meta['display_name']}."

        try:
            scan_record = ScanHistory(
                predicted_category=predicted_category,
                confidence=round(confidence * 100.0, 1),
                image_analysis=final_analysis,
                guidance=final_guidance,
                created_at=datetime.utcnow()
            )
            db.add(scan_record)
            db.commit()
            db.refresh(scan_record)
            db_id = scan_record.id
            created_at_str = scan_record.created_at.isoformat()
        except Exception as db_err:
            db.rollback()
            logger.error(f"Database error while saving upload scan history: {db_err}")
            db_id = 0
            created_at_str = datetime.utcnow().isoformat()

        return {
            "success": True,
            "is_waste": True,
            "category": predicted_category,
            "confidence": round(confidence, 4),
            "image_analysis": final_analysis,
            "guidance": final_guidance,
            "id": f"scan-{db_id}" if db_id > 0 else f"scan-{int(datetime.utcnow().timestamp() * 1000)}",
            "db_id": db_id,
            "timestamp": created_at_str,
            "itemName": meta["display_name"],
            "primaryBin": meta["primary_bin"],
            "binColor": meta["bin_color"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing uploaded image file")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload processing failed: {str(e)}"
        )


@app.get("/api/history", response_model=List[HistoryItem])
def get_scan_history(
    limit: int = Query(50, ge=1, le=500, description="Max number of recent records to return"),
    db: Session = Depends(get_db)
):
    """
    Returns recent scan records in descending order of creation time from SQLite database.
    """
    try:
        records = (
            db.query(ScanHistory)
            .order_by(desc(ScanHistory.created_at))
            .limit(limit)
            .all()
        )
        return [record.to_dict() for record in records]
    except Exception as e:
        logger.error(f"Error fetching history from database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve scan history from database."
        )


@app.get("/api/stats", response_model=StatsResponse)
def get_scan_stats(db: Session = Depends(get_db)):
    """
    Returns total number of scans, count of scans by waste category,
    and the most frequently detected category.
    """
    try:
        # 1. Total Scans Count
        total_scans = db.query(func.count(ScanHistory.id)).scalar() or 0
        
        # 2. Count of Scans by Waste Category
        category_rows = (
            db.query(
                ScanHistory.predicted_category,
                func.count(ScanHistory.id).label("count")
            )
            .group_by(ScanHistory.predicted_category)
            .order_by(desc("count"))
            .all()
        )
        
        category_counts: Dict[str, int] = {}
        category_breakdown: List[Dict[str, Any]] = []
        
        color_map = {
            "Organic/Compostable": "#16a34a",
            "Recyclable Plastic": "#2563eb",
            "Paper/Cardboard": "#eab308",
            "Glass": "#0891b2",
            "Metal": "#2563eb",
            "E-waste": "#dc2626",
            "Hazardous": "#dc2626",
            "General/Residual": "#64748b"
        }
        
        for cat, cnt in category_rows:
            category_counts[cat] = cnt
            category_breakdown.append({
                "category": cat,
                "count": cnt,
                "percentage": round((cnt / total_scans * 100), 1) if total_scans > 0 else 0,
                "color": color_map.get(cat, "#64748b")
            })
            
        # 3. Most Frequently Detected Category
        most_detected_category = category_rows[0][0] if category_rows else None
        
        return {
            "total_scans": total_scans,
            "category_counts": category_counts,
            "most_detected_category": most_detected_category,
            "category_breakdown": category_breakdown
        }
    except Exception as e:
        logger.error(f"Error fetching stats from database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute scan statistics."
        )
