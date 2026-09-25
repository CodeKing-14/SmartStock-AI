import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

export default function DataAnalystAiPage({ onBackToBoss, onNavigateToPage }) {
  const dailyData = [
    { day: 'Mon', warehouseB: 12, warehouseA: 4 },
    { day: 'Tue', warehouseB: 18, warehouseA: 5 },
    { day: 'Wed', warehouseB: 24, warehouseA: 4 },
    { day: 'Thu', warehouseB: 35, warehouseA: 6 },
    { day: 'Fri (Today)', warehouseB: 48, warehouseA: 5 },
    { day: 'Sat (Proj)', warehouseB: 62, warehouseA: 4 },
    { day: 'Sun (Proj)', warehouseB: 70, warehouseA: 5 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Breadcrumb & Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: '0 6px 20px -3px rgba(37, 99, 235, 0.25)'
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
            background: '#dbeafe',
            color: '#1e40af',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            AI Specialist 01
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
            <BarChart3 size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'white' }}>
              Data Analyst AI
            </h1>
            <p style={{ fontSize: '12.5px', color: '#bfdbfe', margin: '2px 0 0 0' }}>
              Autonomous detection of customer demand spikes, sales acceleration, and footfall metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Key Finding Box */}
      <div style={{
        background: '#eff6ff',
        border: '1.5px solid #bfdbfe',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '8px', marginTop: '2px' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#1d4ed8' }}>
              PRIMARY DATA FINDING
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a8a', marginTop: '2px' }}>
              Warehouse B Territory Demand Surged +160%
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', maxWidth: '750px' }}>
              A major city festival and downtown electronics expo have triggered an unprecedented demand spike for UltraBass Headphones. Warehouse B has only <strong>20 packets</strong> remaining and will stock out within 48 hours without replenishment from Warehouse A.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '160px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Warehouse B Runway</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
            1.8 Days
          </div>
          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Imminent Stockout</div>
        </div>
      </div>

      {/* Side-by-side Warehouse Data Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Warehouse A Card */}
        <div className="dashboard-section-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
              SUPPLY SOURCE
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Steady Demand</span>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Warehouse A (Central Hub)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Stock on Hand:</span>
              <strong style={{ color: '#2563eb' }}>500 Packets (Abundant)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily Sales Pace:</span>
              <strong>5 Packets / day</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Inventory Buffer:</span>
              <strong>60+ Days of Safe Stock</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px' }}>
              <span style={{ color: '#047857', fontWeight: 600 }}>Packets Ready to Shift:</span>
              <strong style={{ color: '#047857' }}>150 Packets immediately</strong>
            </div>
          </div>
        </div>

        {/* Warehouse B Card */}
        <div className="dashboard-section-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#c2410c', background: '#fff7ed', padding: '3px 8px', borderRadius: '6px' }}>
              DEMAND DESTINATION
            </span>
            <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 700 }}>+160% Spike</span>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Warehouse B (City Center)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px' }}>
              <span style={{ color: '#991b1b', fontWeight: 600 }}>Current Stock on Hand:</span>
              <strong style={{ color: '#dc2626' }}>20 Packets (Emergency)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily Sales Pace:</span>
              <strong style={{ color: '#ea580c' }}>48 Packets / day (Accelerating)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Weekend Projected Demand:</span>
              <strong>150 Packets</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px' }}>
              <span style={{ color: '#991b1b', fontWeight: 600 }}>Lost Revenue if not shifted:</span>
              <strong style={{ color: '#991b1b' }}>-$18,000 Loss</strong>
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
            Data Analyst AI Report to Boss AI:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            “Confirming demand spike. Recommend shifting 150 packets from Warehouse A to Warehouse B.”
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToPage('pricing-ai')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--blue-600)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span>Next: Check Pricing AI</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
