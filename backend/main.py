"""
SmartStock AI — FastAPI Backend
================================
Endpoints:
  POST /api/analyze          Upload retail_data JSON → run full pipeline → return results
  POST /api/analyze/upload   Upload retail_data as a .json file
  GET  /api/results          List all saved analysis results
  GET  /api/results/{run_id} Get a specific result by run_id
  GET  /api/results/{run_id}/download  Download the markdown report
  GET  /api/sample-data      Get sample retail_data.json for the frontend to pre-fill
  GET  /api/health           Health check
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse

# Ensure model dir is importable
MODEL_DIR = Path(__file__).resolve().parent / "model"
if str(MODEL_DIR) not in sys.path:
    sys.path.insert(0, str(MODEL_DIR))

# Load .env from model dir if present
try:
    from dotenv import load_dotenv
    load_dotenv(MODEL_DIR / ".env")
except ImportError:
    pass

from pipeline import run_pipeline, RESULTS_DIR, DATA_DIR

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="SmartStock AI",
    description="Multi-Agent AI System for Demand-Aware Pricing, Inventory Coordination, and Retail Decision Support",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "SmartStock AI Backend",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "analyze_json": "POST /api/analyze",
            "analyze_upload": "POST /api/analyze/upload",
            "results_list": "GET /api/results",
            "result_detail": "GET /api/results/{run_id}",
            "result_download": "GET /api/results/{run_id}/download",
            "sample_data": "GET /api/sample-data",
            "health": "GET /api/health",
        },
    }


@app.get("/api/health")
def health():
    has_api_key = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "openai_configured": has_api_key,
        "mode": "llm" if has_api_key else "offline",
    }


@app.get("/api/sample-data")
def sample_data():
    """Return the sample retail_data.json so the frontend can pre-populate the form."""
    sample_path = DATA_DIR / "retail_data.json"
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail="Sample data file not found")
    with open(sample_path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/sample-data/pricing-config")
def sample_pricing_config():
    """Return the sample pricing_config.json."""
    path = DATA_DIR / "pricing_config.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Pricing config file not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/sample-data/logistics")
def sample_logistics_data():
    """Return the sample logistics_data.json."""
    path = DATA_DIR / "logistics_data.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Logistics data file not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


from pydantic import BaseModel
from typing import Optional


class AnalyzeRequest(BaseModel):
    retail_data: dict
    pricing_config: Optional[dict] = None
    logistics_data: Optional[dict] = None
    use_llm: bool = False


@app.post("/api/analyze")
def analyze_json(req: AnalyzeRequest):
    """
    Run the full SmartStock AI pipeline on the provided retail data.

    Send the retail_data JSON directly in the request body.
    Optionally include pricing_config and logistics_data;
    if not provided, the backend uses built-in defaults.
    """
    retail_data = req.retail_data
    pricing_config = req.pricing_config
    logistics_data = req.logistics_data
    use_llm = req.use_llm

    # Validate the data has required structure
    if "stores" not in retail_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid retail_data: must contain a 'stores' array"
        )
    if not isinstance(retail_data["stores"], list) or len(retail_data["stores"]) == 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid retail_data: 'stores' must be a non-empty array"
        )

    # Validate each store has products
    for i, store in enumerate(retail_data["stores"]):
        if "products" not in store or not isinstance(store["products"], list):
            raise HTTPException(
                status_code=400,
                detail=f"Store at index {i} must have a 'products' array"
            )
        required_store_fields = ["store_id", "store_name"]
        for field in required_store_fields:
            if field not in store:
                raise HTTPException(
                    status_code=400,
                    detail=f"Store at index {i} is missing required field: '{field}'"
                )
        required_product_fields = [
            "product_id", "name", "our_price", "sales_last_week",
            "sales_this_week", "stock_level", "competitor_price"
        ]
        for j, product in enumerate(store["products"]):
            for field in required_product_fields:
                if field not in product:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Product at index {j} in store '{store.get('store_id', i)}' "
                            f"is missing required field: '{field}'"
                        )
                    )

    try:
        result = run_pipeline(
            retail_data=retail_data,
            pricing_config=pricing_config,
            logistics_data=logistics_data,
            use_llm=use_llm,
        )
        return {
            "success": True,
            "run_id": result["run_id"],
            "timestamp": result["timestamp"],
            "meta": result["meta"],
            "stores": result["stores"],
            "logistics_global": result["logistics_global"],
            "report_markdown": result["report_md"],
            "files": result["files"],
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed: {type(exc).__name__}: {str(exc)}"
        )


@app.post("/api/analyze/upload")
async def analyze_upload(
    retail_data_file: UploadFile = File(..., description="Upload retail_data.json"),
    pricing_config_file: UploadFile = File(None, description="Optional: upload pricing_config.json"),
    logistics_data_file: UploadFile = File(None, description="Optional: upload logistics_data.json"),
):
    """
    Upload retail data as a .json file and run the full pipeline.

    Only retail_data_file is required. The others use built-in defaults if not provided.
    """
    # Parse retail data file
    try:
        content = await retail_data_file.read()
        retail_data = json.loads(content.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in retail_data_file")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error reading retail_data_file: {str(exc)}")

    # Parse optional pricing config
    pricing_config = None
    if pricing_config_file is not None:
        try:
            content = await pricing_config_file.read()
            pricing_config = json.loads(content.decode("utf-8"))
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in pricing_config_file")

    # Parse optional logistics data
    logistics_data = None
    if logistics_data_file is not None:
        try:
            content = await logistics_data_file.read()
            logistics_data = json.loads(content.decode("utf-8"))
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in logistics_data_file")

    # Run pipeline
    try:
        result = run_pipeline(
            retail_data=retail_data,
            pricing_config=pricing_config,
            logistics_data=logistics_data,
            use_llm=False,  # file upload mode defaults to offline
        )
        return {
            "success": True,
            "run_id": result["run_id"],
            "timestamp": result["timestamp"],
            "meta": result["meta"],
            "stores": result["stores"],
            "logistics_global": result["logistics_global"],
            "report_markdown": result["report_md"],
            "files": result["files"],
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed: {type(exc).__name__}: {str(exc)}"
        )


@app.get("/api/results")
def list_results():
    """List all saved analysis results in the results folder."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for md_file in sorted(RESULTS_DIR.glob("analysis_*.md"), reverse=True):
        run_id = md_file.stem.replace("analysis_", "")
        json_file = RESULTS_DIR / f"analysis_{run_id}.json"
        meta = {}
        if json_file.exists():
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    meta = data.get("meta", {})
            except Exception:
                pass
        results.append({
            "run_id": run_id,
            "markdown_file": md_file.name,
            "json_file": json_file.name if json_file.exists() else None,
            "created": datetime.fromtimestamp(md_file.stat().st_mtime).isoformat(),
            "meta": meta,
        })
    return {"results": results, "total": len(results)}


@app.get("/api/results/{run_id}")
def get_result(run_id: str):
    """Get a specific analysis result by run_id."""
    json_file = RESULTS_DIR / f"analysis_{run_id}.json"
    md_file = RESULTS_DIR / f"analysis_{run_id}.md"

    if not json_file.exists() and not md_file.exists():
        raise HTTPException(status_code=404, detail=f"No result found for run_id: {run_id}")

    result = {}
    if json_file.exists():
        with open(json_file, "r", encoding="utf-8") as f:
            result = json.load(f)

    if md_file.exists():
        result["report_markdown"] = md_file.read_text(encoding="utf-8")

    return result


@app.get("/api/results/{run_id}/download")
def download_result(run_id: str, format: str = "md"):
    """Download the analysis result as a markdown or JSON file."""
    if format == "md":
        file_path = RESULTS_DIR / f"analysis_{run_id}.md"
        media_type = "text/markdown"
    elif format == "json":
        file_path = RESULTS_DIR / f"analysis_{run_id}.json"
        media_type = "application/json"
    elif format == "txt":
        # Convert markdown to plain text
        md_path = RESULTS_DIR / f"analysis_{run_id}.md"
        if not md_path.exists():
            raise HTTPException(status_code=404, detail=f"No result found for run_id: {run_id}")
        content = md_path.read_text(encoding="utf-8")
        # Strip markdown formatting for plain text
        plain = content.replace("# ", "").replace("## ", "").replace("### ", "")
        plain = plain.replace("**", "").replace("*", "").replace("---", "=" * 50)
        return PlainTextResponse(content=plain, media_type="text/plain", headers={
            "Content-Disposition": f"attachment; filename=analysis_{run_id}.txt"
        })
    else:
        raise HTTPException(status_code=400, detail="Format must be 'md', 'json', or 'txt'")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"No result found for run_id: {run_id}")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=file_path.name,
    )


# ---------------------------------------------------------------------------
# Run with: uvicorn main:app --reload --port 8000
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)