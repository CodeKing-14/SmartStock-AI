import React from 'react';
import { 
  Tag, 
  DollarSign, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function PricingAiPage({ onBackToBoss, onNavigateToPage }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: '0 6px 20px -3px rgba(5, 150, 105, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={onBackToBoss}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Boss AI (Overview)</span>
          </button>

          <span style={{
            background: '#d1fae5',
            color: '#065f46',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            AI Specialist 02
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tag size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'white' }}>
              Pricing AI
            </h1>
            <p style={{ fontSize: '12.5px', color: '#a7f3d0', margin: '2px 0 0 0' }}>
              Autonomous price elasticity, margin optimization, and competitor price tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Main Pricing Recommendation Callout */}
      <div style={{
        background: '#ecfdf5',
        border: '1.5px solid #a7f3d0',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ background: '#10b981', color: 'white', padding: '8px', borderRadius: '8px', marginTop: '2px' }}>
            <Lock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#047857' }}>
              PRICING STRATEGY AUDIT
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#064e3b', marginTop: '2px' }}>
              Price Locked at $120.00 / Packet — Zero Discount Needed
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', maxWidth: '750px' }}>
              Downtown competitors are completely out of stock. Shifting 150 packets allows us to sell at full retail price without discounting, yielding <strong>$54.00 profit per packet ($8,100 net profit)</strong>.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '170px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revenue on 150 Pkts</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-heading)' }}>
            $18,000.00
          </div>
          <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>45.0% Profit Margin</div>
        </div>
      </div>

      {/* Packet Economics Grid */}
      <div className="dashboard-section-card">
        <h3 style={{ fontSize: '15.5px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
          Packet Economics: UltraBass Headphones (150 Packets Shift)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Retail Selling Price</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>$120.00</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Full price (No discount needed)</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Unit Wholesale Cost</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-muted)', margin: '4px 0' }}>$66.00</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Factory production cost</div>
          </div>

          <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Profit Per Packet</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', margin: '4px 0' }}>$54.00</div>
            <div style={{ fontSize: '11.5px', color: '#065f46' }}>45% gross operating profit</div>
          </div>

          <div style={{ background: '#f5f3ff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #ddd6fe' }}>
            <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600 }}>150 Packets Total Sales</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>$18,000</div>
            <div style={{ fontSize: '11.5px', color: '#5b21b6' }}>150 pkts × $120.00</div>
          </div>
        </div>
      </div>

      {/* Submission to Boss AI */}
      <div style={{
        background: '#f8fafc',
        border: '1.5px solid #cbd5e1',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Pricing AI Report to Boss AI:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            “Price is locked at $120.00. Moving 150 packets protects $18,000 in gross revenue.”
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToPage('inventory-ai')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--emerald-600)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span>Next: Check Inventory AI</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
