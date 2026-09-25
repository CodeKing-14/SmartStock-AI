import json
import os
from typing import List, Optional

from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

try:
    from langchain.chains.combine_documents import create_stuff_documents_chain
    from langchain.chains import create_retrieval_chain
except ImportError:
    from langchain_classic.chains.combine_documents import create_stuff_documents_chain
    from langchain_classic.chains import create_retrieval_chain


class OllamaRAGAgent:
    def __init__(self, llm_model="llama3.2", embed_model="mxbai-embed-large"):
        print(f"Initializing RAG Agent with LLM: '{llm_model}' and Embeddings: '{embed_model}'...")
        
        # 1. Initialize Local LLM via Ollama
        self.llm = OllamaLLM(model=llm_model)
        
        # 2. Initialize Local Embeddings via Ollama
        self.embeddings = OllamaEmbeddings(model=embed_model)
        
        # 3. Create an empty Vector Store (FAISS)
        dummy_doc = [Document(
            page_content="SmartStock AI System Initialized with multi-agent architecture.", 
            metadata={"source": "system"}
        )]
        self.vector_store = FAISS.from_documents(dummy_doc, self.embeddings)
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 6})
        
        # 4. Define the Executive RAG Prompt Template
        system_prompt = (
            "You are Boss AI, the supreme executive decision maker and retail coordinator for SmartStock AI.\n"
            "You synthesize data and analytical reports from all 7 specialized AI agents:\n"
            "1. Data Analyst AI (sales trends, factual demand shifts, festival impacts)\n"
            "2. Pricing AI (dynamic price adjustments, margin preservation, volume forecasts)\n"
            "3. Inventory AI (stockout risks, overstock alerts, days-to-stockout)\n"
            "4. Spoilage AI (perishability risks, fire-sale price floors)\n"
            "5. Basket AI (cross-selling, cannibalization analysis)\n"
            "6. Game Theory AI (competitor retaliation, price war prevention)\n"
            "7. Logistics AI (multi-store inventory transfers, transportation cost, net ROI)\n\n"
            "Context from All AI Agents:\n"
            "{context}\n\n"
            "Instructions:\n"
            "- Ground all your answers and decisions strictly on the retrieved context from all AIs.\n"
            "- Clearly present: Executive Verdict, Recommended Pricing Actions, Critical Inventory/Spoilage Risks, and Specific Logistics Transfers (from store, to store, units, ROI).\n"
            "- Be concise, direct, authoritative, and professional.\n"
            "- Use clean markdown formatting with bullet points and bold key numbers."
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        # 5. Build the Retrieval Chain
        self.question_answer_chain = create_stuff_documents_chain(self.llm, self.prompt)
        self.rag_chain = create_retrieval_chain(self.retriever, self.question_answer_chain)
        print("RAG Agent ready!")

    def ingest_documents(self, documents: List[Document]):
        """Add new documents to the vector store"""
        if not documents:
            return
        print(f"Ingesting {len(documents)} documents into RAG vector store...")
        self.vector_store.add_documents(documents)
        print("Ingestion complete.")

    def ingest_pipeline_results(self, result: dict) -> List[Document]:
        """
        Converts the full multi-agent pipeline outputs into structured RAG documents
        covering every AI agent's findings and recommendations.
        """
        run_id = result.get("run_id", "unknown")
        meta = result.get("meta", {})
        stores = result.get("stores", {})
        logistics = result.get("logistics_global", {})
        report_md = result.get("report_md") or result.get("report_markdown", "")
        
        docs: List[Document] = []

        # 1. Boss AI Executive Report
        if report_md:
            docs.append(Document(
                page_content=f"=== BOSS AI EXECUTIVE SYNTHESIS REPORT (Run {run_id}) ===\nChain: {meta.get('chain_name', 'Retail Chain')}\n{report_md}",
                metadata={"source": "boss_ai_executive_report", "run_id": run_id, "type": "synthesis"}
            ))

        # 2. Detailed Per-Store AI Findings
        for store_id, store_data in stores.items():
            store_info = store_data.get("store", {})
            store_name = store_info.get("store_name", store_id)
            products = store_info.get("products", [])
            analyst = store_data.get("analyst", {})
            pricing = store_data.get("pricing", {})
            inventory = store_data.get("inventory", {})
            spoilage = store_data.get("spoilage", {})
            basket = store_data.get("basket", {})
            game_theory = store_data.get("game_theory", {})
            negotiations = store_data.get("negotiation_history", [])

            # Data Analyst AI Document
            analyst_lines = [f"=== DATA ANALYST AI FINDINGS — Store: {store_name} ({store_id}) ==="]
            for p in products:
                sku = p["product_id"]
                p_name = p["name"]
                if sku in analyst:
                    analyst_lines.append(
                        f"Product: {p_name} ({sku}) | Summary: {analyst[sku].get('summary')} | "
                        f"Trend: {analyst[sku].get('trend')} ({analyst[sku].get('pct_change')}%) | "
                        f"Confidence: {analyst[sku].get('confidence')}"
                    )
            docs.append(Document(
                page_content="\n".join(analyst_lines),
                metadata={"source": "data_analyst_ai", "store_id": store_id, "run_id": run_id}
            ))

            # Pricing AI Document
            pricing_lines = [f"=== PRICING AI RECOMMENDATIONS — Store: {store_name} ({store_id}) ==="]
            for p in products:
                sku = p["product_id"]
                p_name = p["name"]
                if sku in pricing:
                    pr = pricing[sku]
                    pricing_lines.append(
                        f"Product: {p_name} ({sku}) | Action: {pr.get('action', '').upper()} | "
                        f"Current Price: ₹{pr.get('current_price')} | Proposed Price: ₹{pr.get('new_price')} | "
                        f"Adjustment: {pr.get('percentage')}% | Expected Vol: {pr.get('expected_volume')} | "
                        f"Reasoning: {pr.get('reasoning')}"
                    )
            docs.append(Document(
                page_content="\n".join(pricing_lines),
                metadata={"source": "pricing_ai", "store_id": store_id, "run_id": run_id}
            ))

            # Inventory AI Document
            inv_lines = [f"=== INVENTORY AI RISK ASSESSMENT — Store: {store_name} ({store_id}) ==="]
            for p in products:
                sku = p["product_id"]
                p_name = p["name"]
                if sku in inventory:
                    inv = inventory[sku]
                    inv_lines.append(
                        f"Product: {p_name} ({sku}) | Current Stock: {inv.get('current_inventory')} | "
                        f"Daily Demand: {inv.get('daily_demand')} | Coverage Days: {inv.get('coverage_days')} | "
                        f"Risk Flag: {inv.get('flag')} | Risk Type: {inv.get('risk')} | "
                        f"Days Until Issue: {inv.get('days_until_issue')} | Recommendation: {inv.get('recommendation')}"
                    )
            docs.append(Document(
                page_content="\n".join(inv_lines),
                metadata={"source": "inventory_ai", "store_id": store_id, "run_id": run_id}
            ))

            # Validation Agents (Spoilage, Basket, Game Theory) Document
            val_lines = [f"=== VALIDATION AGENTS (SPOILAGE, BASKET, GAME THEORY) — Store: {store_name} ({store_id}) ==="]
            for p in products:
                sku = p["product_id"]
                p_name = p["name"]
                sp = spoilage.get(sku, {})
                bk = basket.get(sku, {})
                gt = game_theory.get(sku, {})
                val_lines.append(
                    f"Product: {p_name} ({sku}):\n"
                    f"  - Spoilage AI: Flag={sp.get('flag')} | Rec={sp.get('recommendation', 'None')}\n"
                    f"  - Basket AI: Flag={bk.get('flag')} | Rec={bk.get('recommendation', 'None')}\n"
                    f"  - Game Theory AI: Flag={gt.get('flag')} | Rec={gt.get('recommendation', 'None')}"
                )
            if negotiations:
                val_lines.append("Negotiation Resolutions Enforced by Boss AI:")
                for n in negotiations:
                    val_lines.append(f"  - SKU {n.get('sku')}: {n.get('reason')}")
            docs.append(Document(
                page_content="\n".join(val_lines),
                metadata={"source": "validation_agents", "store_id": store_id, "run_id": run_id}
            ))

        # 3. Logistics AI Global Transfers Document
        logistics_lines = [f"=== LOGISTICS AI MULTI-STORE TRANSFERS (Run {run_id}) ==="]
        transfers = logistics.get("transfers", [])
        if transfers:
            logistics_lines.append(f"Total Transfers: {len(transfers)} | Total Cost: ₹{logistics.get('total_cost', 0)} | Total ROI / Profit Saved: ₹{logistics.get('total_roi', 0)}")
            for t in transfers:
                p_name = t.get("name") or t.get("sku")
                logistics_lines.append(
                    f"Transfer: Move {t.get('qty')} units of {t.get('sku')} ({p_name}) "
                    f"from Store {t.get('from_store')} to Store {t.get('to_store')}. "
                    f"Distance: {t.get('distance_km')} km | ETA: {t.get('eta')} | "
                    f"Transfer Cost: ₹{t.get('transfer_cost')} | Value Saved: ₹{t.get('avoided_loss_value')} | ROI: {t.get('roi_percent')}%"
                )
        else:
            logistics_lines.append("No inter-store transfers required. All inventory balanced.")
        docs.append(Document(
            page_content="\n".join(logistics_lines),
            metadata={"source": "logistics_ai", "run_id": run_id}
        ))

        # Ingest all docs into vector store
        self.ingest_documents(docs)
        return docs

    def synthesize_analysis_verdict(self, result: dict, user_query: Optional[str] = None) -> str:
        """
        Uses RAG to generate the final synthesized executive verdict answering the user given data.
        """
        prompt_query = user_query or (
            "Summarize the final operational recommendation and executive verdict from all AI agents. "
            "Detail the critical pricing adjustments, stockout/overstock risks, and recommended store transfers."
        )
        try:
            return self.ask(prompt_query)
        except Exception as e:
            print(f"RAG verdict generation error: {e}")
            # Graceful fallback to the Boss AI synthesized markdown
            return result.get("report_md") or result.get("report_markdown", "Analysis completed.")

    def ask(self, query: str) -> str:
        """Ask a question to the RAG agent"""
        response = self.rag_chain.invoke({"input": query})
        return response["answer"]


if __name__ == "__main__":
    # Test initialization to prove it connects to the local Ollama instance
    agent = OllamaRAGAgent()
    print("\n[SUCCESS] AI Agent built and connected to Ollama!")
