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

try:
    from rag_agent import OllamaRAGAgent
    from langchain_core.documents import Document
except ImportError:
    OllamaRAGAgent = None
    Document = None

rag_agent_instance = None

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

@app.on_event("startup")
def startup_event():
    global rag_agent_instance
    if OllamaRAGAgent is None or Document is None:
        print("Warning: RAG Agent dependencies are missing. Boss AI chat will be unavailable.")
        return
    try:
        rag_agent_instance = OllamaRAGAgent()
        
        # Load static rag_data
        rag_data_dir = DATA_DIR / "rag_data"
        documents = []
        if rag_data_dir.exists():
            for json_file in rag_data_dir.glob("*.json"):
                with open(json_file, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                    documents.append(Document(page_content=content, metadata={"source": json_file.name}))
        
        if documents:
            rag_agent_instance.ingest_documents(documents)
            print(f"Ingested {len(documents)} static documents into RAG.")
    except Exception as e:
        print(f"Failed to initialize RAG Agent: {e}")
        rag_agent_instance = None

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





import csv
import io
import re
from pydantic import BaseModel
from typing import Optional


def parse_input_to_retail_data(text: str) -> Optional[dict]:
    """
    Attempts to parse user given text as:
    1. Direct JSON containing 'stores'
    2. Embedded JSON within text (e.g. ```json ... ```)
    3. CSV table formatted retail data
    """
    if not text or not isinstance(text, str):
        return None
    cleaned = text.strip()
    
    # 1. Direct JSON
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict) and "stores" in data and isinstance(data["stores"], list):
            return data
    except Exception:
        pass

    # 2. Extract JSON code block
    json_match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", cleaned)
    if json_match:
        try:
            data = json.loads(json_match.group(1))
            if isinstance(data, dict) and "stores" in data and isinstance(data["stores"], list):
                return data
        except Exception:
            pass

    # 3. CSV parsing
    try:
        reader = csv.DictReader(io.StringIO(cleaned))
        rows = list(reader)
        if rows and len(rows) > 0:
            headers = [h.strip().lower() for h in (reader.fieldnames or [])]
            if any(k in headers for k in ["product", "product_id", "name", "price", "stock", "our_price"]):
                stores_map = {}
                for idx, row in enumerate(rows):
                    clean_row = {str(k).strip().lower(): str(v).strip() for k, v in row.items() if k}
                    store_id = clean_row.get("store_id") or clean_row.get("store") or "S1"
                    store_name = clean_row.get("store_name") or clean_row.get("store") or f"Store {store_id}"
                    
                    if store_id not in stores_map:
                        stores_map[store_id] = {
                            "store_id": store_id,
                            "store_name": store_name,
                            "festival_in_3_days": clean_row.get("festival", "").lower() in ["true", "1", "yes"],
                            "festival_name": clean_row.get("festival_name"),
                            "products": []
                        }
                    
                    pid = clean_row.get("product_id") or clean_row.get("sku") or f"P{idx+1}"
                    name = clean_row.get("name") or clean_row.get("product") or f"Product {pid}"
                    our_price = float(clean_row.get("our_price") or clean_row.get("price") or 100)
                    sales_last = float(clean_row.get("sales_last_week") or clean_row.get("sales_last") or 50)
                    sales_this = float(clean_row.get("sales_this_week") or clean_row.get("sales_this") or 45)
                    stock = float(clean_row.get("stock_level") or clean_row.get("stock") or 100)
                    comp_price = float(clean_row.get("competitor_price") or clean_row.get("competitor") or our_price * 0.95)
                    
                    stores_map[store_id]["products"].append({
                        "product_id": pid,
                        "name": name,
                        "our_price": our_price,
                        "sales_last_week": sales_last,
                        "sales_this_week": sales_this,
                        "stock_level": stock,
                        "competitor_price": comp_price,
                    })
                if stores_map:
                    return {
                        "chain_name": "User Uploaded Network",
                        "currency": "INR",
                        "week_label": "Current vs Previous Week",
                        "stores": list(stores_map.values())
                    }
    except Exception:
        pass

    return None


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
    Sends output to all AIs, ingests all outputs into RAG, and returns RAG verdict.
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
        # 1. Send data to all AIs in pipeline
        result = run_pipeline(
            retail_data=retail_data,
            pricing_config=pricing_config,
            logistics_data=logistics_data,
            use_llm=use_llm,
        )
        
        # 2. Send output of all AIs to RAG and get synthesized verdict
        rag_verdict = result.get("report_md") or result.get("report_markdown", "")
        if rag_agent_instance is not None:
            try:
                rag_agent_instance.ingest_pipeline_results(result)
                rag_verdict = rag_agent_instance.synthesize_analysis_verdict(result)
            except Exception as e:
                print(f"RAG ingestion / synthesis warning: {e}")
                
        return {
            "success": True,
            "run_id": result["run_id"],
            "timestamp": result["timestamp"],
            "meta": result["meta"],
            "stores": result["stores"],
            "logistics_global": result["logistics_global"],
            "report_markdown": result.get("report_md") or result.get("report_markdown", ""),
            "rag_result": rag_verdict,
            "files": result["files"],
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed: {type(exc).__name__}: {str(exc)}"
        )


@app.post("/api/analyze/upload")
async def analyze_upload(
    retail_data_file: UploadFile = File(..., description="Upload retail_data.json, CSV, or text document for all AIs"),
    pricing_config_file: UploadFile = File(None, description="Optional: upload pricing_config.json"),
    logistics_data_file: UploadFile = File(None, description="Optional: upload logistics_data.json"),
):
    """
    Upload retail data (JSON or CSV) to run through all AIs, send output to RAG, and return the result.
    """
    try:
        content = await retail_data_file.read()
        file_text = content.decode("utf-8", errors="replace")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(exc)}")

    # Try to parse as retail_data JSON or CSV
    retail_data = parse_input_to_retail_data(file_text)

    if not retail_data:
        # Fallback: Ingest as a general document into RAG
        if rag_agent_instance is None:
            raise HTTPException(status_code=503, detail="RAG Agent is not initialized, cannot ingest arbitrary documents.")
        try:
            doc = Document(
                page_content=file_text, 
                metadata={"source": retail_data_file.filename}
            )
            rag_agent_instance.ingest_documents([doc])
            summary = rag_agent_instance.ask(f"Summarize the key information, data points, and operational insights in '{retail_data_file.filename}'.")
            return {
                "success": True,
                "run_id": "ingest_only",
                "report_markdown": summary,
                "rag_result": summary,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to ingest document into RAG: {str(e)}")

    # Parse optional pricing config
    pricing_config = None
    if pricing_config_file is not None:
        try:
            p_content = await pricing_config_file.read()
            pricing_config = json.loads(p_content.decode("utf-8", errors="replace"))
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in pricing_config_file")

    # Parse optional logistics data
    logistics_data = None
    if logistics_data_file is not None:
        try:
            l_content = await logistics_data_file.read()
            logistics_data = json.loads(l_content.decode("utf-8", errors="replace"))
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in logistics_data_file")

    # 1. Run pipeline across all AIs
    try:
        result = run_pipeline(
            retail_data=retail_data,
            pricing_config=pricing_config,
            logistics_data=logistics_data,
            use_llm=False,
        )
        
        # 2. Ingest all AI outputs into RAG and get synthesized verdict
        rag_verdict = result.get("report_md") or result.get("report_markdown", "")
        if rag_agent_instance is not None:
            try:
                rag_agent_instance.ingest_pipeline_results(result)
                rag_verdict = rag_agent_instance.synthesize_analysis_verdict(result)
            except Exception as e:
                print(f"RAG ingestion / synthesis warning: {e}")

        return {
            "success": True,
            "run_id": result["run_id"],
            "timestamp": result["timestamp"],
            "meta": result["meta"],
            "stores": result["stores"],
            "logistics_global": result["logistics_global"],
            "report_markdown": result.get("report_md") or result.get("report_markdown", ""),
            "rag_result": rag_verdict,
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

    if "logistics_global" not in result and "logistics" in result:
        result["logistics_global"] = result["logistics"]

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


class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
def chat_with_boss(req: ChatRequest):
    """
    Chat with the Boss AI (RAG Model).
    If the user provides retail data (JSON or CSV) in the chat prompt,
    it automatically routes the data to all AIs, sends the output to RAG,
    and returns the RAG synthesized result along with full analysis data.
    """
    if rag_agent_instance is None:
        raise HTTPException(status_code=503, detail="RAG Agent is not initialized or not available.")
    
    # 1. Check if the message contains user-given retail data
    parsed_retail = parse_input_to_retail_data(req.message)
    if parsed_retail:
        try:
            # Send user-given data to all AIs
            pipeline_result = run_pipeline(retail_data=parsed_retail)
            
            # Send outputs to RAG
            rag_agent_instance.ingest_pipeline_results(pipeline_result)
            
            # RAG generates the synthesized result
            rag_verdict = rag_agent_instance.synthesize_analysis_verdict(pipeline_result)
            
            return {
                "answer": rag_verdict,
                "is_analysis": True,
                "analysis_data": {
                    "success": True,
                    "run_id": pipeline_result["run_id"],
                    "timestamp": pipeline_result["timestamp"],
                    "meta": pipeline_result["meta"],
                    "stores": pipeline_result["stores"],
                    "logistics_global": pipeline_result["logistics_global"],
                    "report_markdown": pipeline_result.get("report_md") or pipeline_result.get("report_markdown", ""),
                    "rag_result": rag_verdict,
                }
            }
        except Exception as e:
            print(f"Chat data analysis fallback: {e}")
            # If pipeline fails on custom input, proceed to ask RAG directly

    # 2. General query to RAG
    try:
        answer = rag_agent_instance.ask(req.message)
        return {"answer": answer, "is_analysis": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Run with: uvicorn main:app --reload --port 8000
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)