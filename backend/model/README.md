# Core Data Analyst AI

Agent #1 of the Smart AI debate system. Reads seeded retail data and writes a
factual per-store summary (no solutions).

## Install location
Put this folder at: `D:\Programming\Projects\Smart AI\core-data-analyst-ai`

## Run
1. Double-click `setup_and_run.bat` (creates venv, installs packages, runs offline demo)
2. Open `.env`, paste your `OPENAI_API_KEY`
3. `venv\Scripts\activate` then `python data_analyst_ai.py`

Options: `--offline`, `--store S1`, `--model gpt-4o`

## Files
- `data/retail_data.json`  seeded data: 3 stores x 4 products
- `data_analyst_ai.py`     the analyst agent
- `reports/run_*/`         `report.md` + `summaries.json` (input for the next agents)

Reports are saved after every store. If credit runs out mid-run, remaining
stores automatically fall back to an offline summary.

## Agent #2: Pricing AI
- `pricing_ai.py` - demand-model engine (elasticity + competitor gap + festival uplift + margin/change guardrails) with an optional LLM chat layer
- `data/pricing_config.json` - cost price, elasticity, festival uplift per product, and global guardrails (edit these to tune behaviour)

Run: `python pricing_ai.py` (LLM) | `--offline` | `--store S1` | `--table` (full proposal table)

Output in `reports/pricing_run_*/`: `pricing_messages.json` (Meeting Room feed + "Why?" text + full proposals) and `pricing_report.md`.

Integrate: `from pricing_ai import run_pricing_agent; msgs = run_pricing_agent(offline=True)`
Each message has `agent, store_id, message, why, proposals[], stock_risk` fields so the Inventory AI can read `days_of_cover_at_proposed` and object.
