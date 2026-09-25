import React from 'react';
import { 
  X, 
  BrainCircuit, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';

export default function DecisionExplainModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className="brand-icon-box" style={{ width: '30px', height: '30px', borderRadius: '6px' }}>
              <BrainCircuit size={17} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Why This Decision?
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Explainable Multi-Agent Optimization Logic • SKU-8821
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {/* Executive Summary */}
          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--purple-700)', marginBottom: '4px' }}>
              Synthesis Summary
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Store A is experiencing an anomalous demand surge due to local competitor stockouts. Standard warehouse replenishment requires 6 days, which would result in 4 complete stockout days. Meanwhile, Store B holds an idle 42-day supply with negligible velocity.
            </p>
          </div>

          {/* Mathematical Trade-off Breakdown */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Financial ROI Trade-off Model
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'var(--emerald-50)', border: '1px solid var(--emerald-100)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--emerald-800)', fontWeight: 600 }}>Protected Sales</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--emerald-700)', fontFamily: 'var(--font-mono)' }}>+$5,400</div>
                <div style={{ fontSize: '10.5px', color: 'var(--emerald-800)' }}>60 units @ $89.99</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Logistics Freight</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>-$42.00</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Regional Van Route #4</div>
              </div>

              <div style={{ background: 'var(--purple-50)', border: '1px solid var(--purple-100)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--purple-800)', fontWeight: 600 }}>Net Financial Lift</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--purple-700)', fontFamily: 'var(--font-mono)' }}>+$5,358</div>
                <div style={{ fontSize: '10.5px', color: 'var(--purple-800)' }}>ROI: 12,757%</div>
              </div>
            </div>
          </div>

          {/* Agent Voting & Confidence Matrix */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Autonomous Agent Contribution Weights
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Inventory AI (Runout Protection)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue-600)' }}>Weight 35%</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: '#3b82f6' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Pricing AI (Margin Preservation)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-600)' }}>Weight 30%</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '30%', height: '100%', background: '#10b981' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Rebalancing AI (Route Optimization)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--purple-600)' }}>Weight 25%</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', background: '#8b5cf6' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Consensus Orchestrator (Multi-objective)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#6366f1' }}>Weight 10%</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '10%', height: '100%', background: '#6366f1' }} />
              </div>
            </div>
          </div>

          {/* Action Approval Note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>
              All 4 agents achieved unanimous quorum (99.8% confidence threshold exceeded).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
