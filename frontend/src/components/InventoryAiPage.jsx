import React from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export default function InventoryAiPage({ onBackToBoss, onNavigateToPage }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{
        background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: '0 6px 20px -3px rgba(217, 119, 6, 0.25)'
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
            background: '#fef3c7',
            color: '#92400e',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            AI Specialist 03
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
            <Boxes size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'white' }}>
              Inventory AI
            </h1>
            <p style={{ fontSize: '12.5px', color: '#fef3c7', margin: '2px 0 0 0' }}>
              Autonomous warehouse stock balance audit, shelf capacity monitoring, and safety buffer calculation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Inventory Finding Callout */}
      <div style={{
        background: '#fffbeb',
        border: '1.5px solid #fde68a',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ background: '#f59e0b', color: 'white', padding: '8px', borderRadius: '8px', marginTop: '2px' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#b45309' }}>
              WAREHOUSE STOCK AUDIT
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', marginTop: '2px' }}>
              Warehouse A has 500 Packets (Surplus) vs Warehouse B has 20 Packets (Shortage)
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', maxWidth: '750px' }}>
              Shifting <strong>150 packets from Warehouse A to Warehouse B</strong> leaves Warehouse A with 350 packets (over 45 days of safety stock), while replenishing Warehouse B to 170 packets to easily meet weekend demand.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '170px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optimal Rebalance</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', fontFamily: 'var(--font-heading)' }}>
            150 Packets
          </div>
          <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 600 }}>Shift Recommended</div>
        </div>
      </div>

      {/* Before vs After Comparison */}
      <div className="dashboard-section-card">
        <h3 style={{ fontSize: '15.5px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Warehouse Capacity Before vs After Shifting 150 Packets
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Warehouse A Card */}
          <div style={{ border: '2px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: '18px', background: '#f8faff' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              ORIGIN WAREHOUSE
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 10px 0' }}>
              Warehouse A (Central Hub)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 600 }}>CURRENT STOCK</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1d4ed8' }}>500 pkts</div>
                <div style={{ fontSize: '10.5px', color: '#1e40af' }}>95% Shelf Capacity</div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '10px', color: '#047857', fontWeight: 600 }}>AFTER -150 SHIFT</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>350 pkts</div>
                <div style={{ fontSize: '10.5px', color: '#047857' }}>✅ Safe 45-day buffer</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shelf Capacity</span>
                <span style={{ fontWeight: 700 }}>95% → 65% Optimal</span>
              </div>
              <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: '#3b82f6' }}></div>
              </div>
            </div>
          </div>

          {/* Warehouse B Card */}
          <div style={{ border: '2px solid #fed7aa', borderRadius: 'var(--radius-lg)', padding: '18px', background: '#fffaf5' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
              DESTINATION WAREHOUSE
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 10px 0' }}>
              Warehouse B (City Center)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
              <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: 600 }}>CURRENT STOCK</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626' }}>20 pkts</div>
                <div style={{ fontSize: '10.5px', color: '#b91c1c' }}>⚠️ Stockout in 2 days</div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '10px', color: '#047857', fontWeight: 600 }}>AFTER +150 SHIFT</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>170 pkts</div>
                <div style={{ fontSize: '10.5px', color: '#047857' }}>✅ Healthy 75% Capacity</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shelf Capacity</span>
                <span style={{ fontWeight: 700 }}>15% → 75% Healthy</span>
              </div>
              <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)' }}></div>
              </div>
            </div>
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
            Inventory AI Report to Boss AI:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            “Warehouse A has 150 surplus packets available. Warehouse B is ready to receive.”
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToPage('logistics-ai')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#b45309',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span>Next: Check Logistics AI</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
