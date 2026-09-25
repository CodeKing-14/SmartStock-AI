import React from 'react';
import { 
  Crown, 
  BarChart3, 
  Tag, 
  Boxes, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const pages = [
    {
      id: 'boss-ai',
      label: 'The Boss AI',
      sub: 'Final Coordinated Result',
      icon: Crown,
      badge: 'Boss',
      badgeClass: 'live',
      color: '#4f46e5'
    },
    {
      id: 'data-ai',
      label: '1. Data Analyst AI',
      sub: 'Demand Spike (+160%)',
      icon: BarChart3,
      badge: '+160%',
      badgeClass: 'count',
      color: '#2563eb'
    },
    {
      id: 'pricing-ai',
      label: '2. Pricing AI',
      sub: 'Margin & $120 Price Lock',
      icon: Tag,
      badge: '$120 Lock',
      badgeClass: 'count',
      color: '#059669'
    },
    {
      id: 'inventory-ai',
      label: '3. Inventory AI',
      sub: 'Warehouse Stock Balance',
      icon: Boxes,
      badge: 'A:500 vs B:20',
      badgeClass: 'count',
      color: '#d97706'
    },
    {
      id: 'logistics-ai',
      label: '4. Logistics AI',
      sub: 'Van #4 Fleet & Route',
      icon: Truck,
      badge: '$75 Cost',
      badgeClass: 'count',
      color: '#7c3aed'
    },
  ];

  return (
    <aside className="app-sidebar" style={{ width: '265px', minWidth: '265px' }}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <Sparkles size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">
              SmartStock <span className="ai-tag">AI</span>
            </span>
            <span className="brand-subtitle-mini">Multi-Agent Retail Engine</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-container">
        <div className="nav-section-label">AI Control & Reports</div>

        {pages.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '2px 0'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? item.color : '#f1f5f9',
                color: isActive ? 'white' : 'var(--text-secondary)',
                flexShrink: 0
              }}>
                <Icon size={16} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: isActive ? 700 : 600 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  {item.sub}
                </span>
              </div>

              {item.badge && (
                <span className={`nav-badge ${item.badgeClass || ''}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Live Simple Mission Box */}
        <div style={{
          marginTop: 'auto',
          background: '#f8fafc',
          border: '1px solid #e0e7ff',
          borderRadius: 'var(--radius-md)',
          padding: '12px'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#4f46e5', letterSpacing: '0.04em', marginBottom: '4px' }}>
            SIMPLE OPERATIONAL DATA:
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Shift 150 Packets
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Warehouse A → Warehouse B
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
            fontSize: '11px',
            color: 'var(--emerald-700)',
            fontWeight: 600
          }}>
            <CheckCircle2 size={12} />
            <span>Net Profit: +$17,925</span>
          </div>
        </div>
      </div>

      {/* Sidebar Footer with Neural Engine Status */}
      <div className="sidebar-footer">
        <div className="ai-engine-card">
          <div className="engine-header">
            <span className="engine-title" style={{ color: '#4338ca' }}>
              <Crown size={14} color="#d97706" />
              The Boss AI System
            </span>
            <span className="engine-status-dot"></span>
          </div>
          <p className="engine-desc">
            4 AIs collaborating autonomously. Unanimous consensus.
          </p>
        </div>
      </div>
    </aside>
  );
}
