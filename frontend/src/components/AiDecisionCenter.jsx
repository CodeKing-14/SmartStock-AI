import React, { useState } from 'react';
import { 
  Cpu, 
  Tag, 
  Boxes, 
  ArrowLeftRight, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

export default function AiDecisionCenter({ onOpenDecisionModal }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const agents = [
    {
      id: 'pricing',
      name: 'Pricing AI',
      role: 'Elasticity & Margin Optimization',
      step: 'STEP 01',
      icon: Tag,
      color: '#10b981',
      bgLight: '#ecfdf5',
      borderColor: '#a7f3d0',
      badgeClass: 'pricing-agent',
      message: 'Store A demand velocity surged +28%. Competitor nearby is sold out. Recommendation: Hold price at $89.99 with 5% bundled accessory incentive. Protects maximum margin without dampening run-rate.',
      metricLabel: 'Elasticity & Margin',
      metricVal: 'e: -1.15 • 42.8% Margin',
      confidence: '99.1% Confidence',
      timestamp: '10:41:02 AM'
    },
    {
      id: 'inventory',
      name: 'Inventory AI',
      role: 'Runway & Stockout Prevention',
      step: 'STEP 02',
      icon: Boxes,
      color: '#3b82f6',
      bgLight: '#eff6ff',
      borderColor: '#bfdbfe',
      badgeClass: 'inventory-agent',
      message: 'Store A stock down to 18 units (runway: 2.8 days). Stockout threshold breached. Central supplier replenishment turnaround is 6 days — too late to prevent stockout.',
      metricLabel: 'Depletion Risk',
      metricVal: '2.8 Days Runway (96% Risk)',
      confidence: '99.6% Confidence',
      timestamp: '10:41:09 AM'
    },
    {
      id: 'rebalancing',
      name: 'Rebalancing AI',
      role: 'Multi-Store Logistics & Route',
      step: 'STEP 03',
      icon: ArrowLeftRight,
      color: '#8b5cf6',
      bgLight: '#f5f3ff',
      borderColor: '#ddd6fe',
      badgeClass: 'rebalancing-agent',
      message: 'Store B holds 240 units (+42 days buffer, daily velocity 1.1 units). Inter-store transfer of 60 units Store B → Store A costs $42 freight via Regional Van #4 with delivery in 14 hours.',
      metricLabel: 'Transfer Logistics',
      metricVal: '60 Units • $42 Freight (14h)',
      confidence: '98.9% Confidence',
      timestamp: '10:41:18 AM'
    },
    {
      id: 'decision',
      name: 'Decision AI',
      role: 'Multi-Agent Consensus Orchestrator',
      step: 'FINAL CONSENSUS',
      icon: BrainCircuit,
      color: '#6366f1',
      bgLight: '#eef2ff',
      borderColor: '#c7d2fe',
      badgeClass: 'decision-agent',
      message: 'Consensus Finalized. Rebalance 60 units Store B → Store A, maintain $89.99 price point. Preserves $5,400 in gross revenue, avoids 4 days of stockout, net profit upside +$2,140.',
      metricLabel: 'Synthesis Output',
      metricVal: '+$5,400 Protected • 0 Days OOS',
      confidence: '99.8% Consensus',
      timestamp: '10:41:24 AM'
    }
  ];

  return (
    <section id="ai-decision-center" className="decision-center-card" aria-label="AI Decision Center">
      {/* Header of Section */}
      <div className="section-card-header">
        <div className="section-card-title-group">
          <div className="brand-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
            <BrainCircuit size={18} />
          </div>
          <div>
            <h2 className="section-title">AI Decision Center</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-time multi-agent communication and coordinated decision synthesis
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sku-context-pill">
            <span style={{ color: 'var(--text-muted)' }}>Target SKU:</span>
            <span>#SKU-8821 (SonicPro ANC Earbuds)</span>
          </div>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onOpenDecisionModal}
            style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
          >
            <Info size={14} />
            <span>Explain Logic</span>
          </button>
        </div>
      </div>

      {/* Sequence of 4 AI Agents */}
      <div className="agents-sequence-grid">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return (
            <div 
              key={agent.id} 
              className={`agent-card ${agent.badgeClass}`}
            >
              <div className="agent-step-badge">{agent.step}</div>

              {/* Agent Title & Avatar */}
              <div className="agent-card-header">
                <div 
                  className="agent-avatar-icon" 
                  style={{ background: agent.bgLight, color: agent.color }}
                >
                  <Icon size={19} />
                </div>
                <div className="agent-meta-info">
                  <span className="agent-name">
                    {agent.name}
                    {agent.id === 'decision' && <Sparkles size={13} color="#6366f1" />}
                  </span>
                  <span className="agent-role-tag">{agent.role}</span>
                </div>
              </div>

              {/* Agent Message Content */}
              <div className="agent-message-body">
                <p>{agent.message}</p>
              </div>

              {/* Agent Analysis Metric & Timestamp */}
              <div className="agent-card-footer">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 600 }}>
                    {agent.metricLabel}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {agent.metricVal}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                  <span className="agent-confidence-pill" style={{ color: agent.color }}>
                    {agent.confidence}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>
                    {agent.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Action Approved */}
      <div className="action-approved-banner">
        <div className="action-approved-left">
          <div className="action-approved-icon-circle">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="action-approved-title">
              <span>Action Approved</span>
              <span style={{ fontSize: '11px', fontWeight: 600, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px' }}>
                Auto-Dispatched
              </span>
            </div>
            <div className="action-approved-subtitle">
              Coordinated Decision: Transfer 60 units SKU-8821 from Store B → Store A & Lock Price at $89.99.
            </div>
          </div>
        </div>

        <div className="action-approved-right">
          <div style={{ textAlign: 'right', marginRight: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Logistics Manifest</div>
            <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>PO #TR-8821-EXP</div>
          </div>
          <span className="action-status-badge">
            STATUS: IN TRANSIT (ETA 14H)
          </span>
        </div>
      </div>
    </section>
  );
}
