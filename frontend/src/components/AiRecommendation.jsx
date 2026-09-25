import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Check, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function AiRecommendation({ onOpenDecisionModal, onTriggerToast }) {
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    if (applied) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setApplied(true);
      if (onTriggerToast) {
        onTriggerToast('Action Applied Successfully: Store B → Store A transfer dispatched and price lock enacted.');
      }
    }, 600);
  };

  return (
    <div id="ai-recommendations" className="recommendation-highlight-card" aria-label="AI Recommendation">
      {/* Top Header Pill */}
      <div className="recommendation-header-pill">
        <div className="recommendation-tag">
          <Sparkles size={13} />
          <span>Primary AI Recommendation</span>
        </div>
        <span className="rec-confidence">
          Confidence Score: <strong>99.4%</strong>
        </span>
      </div>

      {/* Recommended Action */}
      <div className="rec-action-box">
        <div className="rec-action-label">Recommended Action</div>
        <h4 className="rec-action-title">
          Transfer 60 units SKU-8821 (SonicPro Earbuds) from Store B to Store A & Hold Price at $89.99
        </h4>
      </div>

      {/* Reason and Expected Impact in clean blocks */}
      <div className="rec-details-grid">
        {/* Reason Block */}
        <div className="rec-detail-block">
          <div className="rec-detail-title">Reason</div>
          <p className="rec-detail-text">
            Store A stockout in 3 days vs Store B holding 42 days buffer. Avoids $5,400 lost revenue with minimal transit cost ($42).
          </p>
        </div>

        {/* Expected Impact Block */}
        <div className="rec-detail-block">
          <div className="rec-detail-title">Expected Impact</div>
          <p className="rec-detail-text" style={{ fontWeight: 600, color: 'var(--emerald-700)' }}>
            +$5,400 Protected Revenue • 0% Discount Bleed • 99.2% Fulfillment Rate
          </p>
        </div>
      </div>

      {/* Two Buttons: "Why this decision?" and "Apply Action" */}
      <div className="rec-buttons-row">
        <button 
          type="button" 
          className="btn-secondary"
          onClick={onOpenDecisionModal}
        >
          <HelpCircle size={15} />
          <span>Why this decision?</span>
        </button>

        <button 
          type="button" 
          className="btn-primary"
          onClick={handleApply}
          style={{
            background: applied 
              ? 'linear-gradient(135deg, #059669, #10b981)' 
              : 'linear-gradient(135deg, #2563eb, #7c3aed)'
          }}
        >
          {loading ? (
            <span>Processing...</span>
          ) : applied ? (
            <>
              <CheckCircle2 size={16} />
              <span>Applied to WMS</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Apply Action</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
