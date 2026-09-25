import React, { useState } from 'react';
import { 
  Sparkles, 
  Bell, 
  ChevronDown, 
  Truck, 
  CheckCircle2, 
  Crown
} from 'lucide-react';

export default function Header({ 
  activePage, 
  setActivePage 
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="top-header">
      {/* Page Title & Status (Removed duplicate SmartStock AI and AI subtitles) */}
      <div className="header-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Dashboard Overview
          </h2>
          <span style={{ fontSize: '11px', fontWeight: 700, background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '12px' }}>
            Live Sync
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Autonomous Multi-Store Inventory Balancing Hub
        </div>
      </div>

      {/* Center: THE SIMPLE UNIFIED DATA BADGE */}
      <div style={{
        background: '#f8fafc',
        border: '1.5px solid #c7d2fe',
        borderRadius: '24px',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4338ca', fontWeight: 700, fontSize: '12px' }}>
          <Truck size={15} />
          <span>CURRENT MISSION:</span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Shift 150 Packets: Warehouse A → Warehouse B
        </span>
        <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
          +$17,925 Net Gain
        </span>
      </div>

      {/* Right Controls: AI Active, Notification & Profile */}
      <div className="header-right">
        {/* Boss AI Active Status Pill */}
        <div className="ai-status-pill" title="The Boss AI is continuously synthesizing the 4 AIs">
          <span className="status-dot-pulse"></span>
          <span>THE BOSS AI ACTIVE</span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            type="button" 
            className="header-action-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="AI Activity Feed"
          >
            <Bell size={18} />
            <span className="btn-badge-dot"></span>
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: 'white',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              width: '320px',
              zIndex: 40,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>AI Stream Updates</span>
                <span style={{ fontSize: '11px', background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>4 Approved</span>
              </div>
              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', fontSize: '11.5px' }}>
                  <strong>Logistics AI:</strong> Express Van #4 staged at Bay 2. Ready to roll.
                </div>
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', fontSize: '11.5px' }}>
                  <strong>Inventory AI:</strong> Warehouse A confirmed 150 surplus packets.
                </div>
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', fontSize: '11.5px' }}>
                  <strong>Pricing AI:</strong> $120.00 price lock validated.
                </div>
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f8fafc', fontSize: '11.5px' }}>
                  <strong>Data Analyst AI:</strong> Demand spike at +160% confirmed.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="user-profile-btn">
          <div className="user-avatar-circle">
            SS
          </div>
          <div className="user-info">
            <span className="user-name">Retail Ops</span>
            <span className="user-role">Autonomous</span>
          </div>
        </div>
      </div>
    </header>
  );
}
