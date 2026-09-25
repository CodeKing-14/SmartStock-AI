"""
Boss AI (Executive Summarizer)
==============================
Synthesizes all other AI agent outputs into a final JSON output.
"""

if __name__ == "__main__":
    import json
    import sys
    from pathlib import Path
    
    # Import the pipeline to get the full simulated outputs
    base_dir = Path(__file__).resolve().parent.parent
    if str(base_dir) not in sys.path:
        sys.path.insert(0, str(base_dir))
        
    from pipeline import run_pipeline
    
    with open(base_dir / "data" / "retail_data.json", "r") as f:
        data = json.load(f)
        
    # Run the full pipeline in the background to get the objects
    pipeline_result = run_pipeline(data)
    
    # Grab the specific results for Store 1 (S1)
    s1_results = pipeline_result["stores"]["S1"]
    
    # Output JSON directly for Boss AI
    out = {
        "store": s1_results["store"]["store_name"],
        "negotiation_history": s1_results["negotiation_history"],
        "final_pricing": s1_results["pricing"],
        "final_report_markdown": s1_results["boss_md"]
    }
    print(json.dumps(out, indent=2))
