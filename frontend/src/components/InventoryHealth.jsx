import React from 'react';
import { 
  Boxes, 
  AlertCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingDown, 
  Clock 
} from 'lucide-react';

export default function InventoryHealth() {
  const categories = [
    { label: 'In Stock', pct: 74, units: '35,705 units', color: '#10b981', bg: '#ecfdf5', dotColor: '#10b981' },
    { label: 'Low Stock', pct: 14, units: '6,755 units', color: '#f59e0b', bg: '#fffbeb', dotColor: '#f59e0b' },
    { label: 'Out of Stock', pct: 3, units: '1,448 units', color: '#ef4444', bg: '#fef2f2', dotColor: '#ef4444' },
    { label: 'Overstock', pct: 9, units: '4,342 units', color: '#8b5cf6', bg: '#f5f3ff', dotColor: '#8b5cf6' },
  ];

  return (
    <div id="inventory-management" className="dashboard-section-card" aria-label="Inventory Health">
      <div className="section-card-header">
        <div className="section-card-title-group">
          <div className="brand-icon-box" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
            <Boxes size={16} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: '15.5px' }}>Inventory Health</h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Total 48,250 Active SKU Units Across Network
            </span>
          </div>
        </div>
        <span className="section-pill-tag" style={{ color: 'var(--emerald-700)', backgroundColor: 'var(--emerald-50)' }}>
          Healthy Buffer (94.6%)
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="health-overview-bar" title="Inventory Condition Breakdown">
        <div 
          className="health-bar-segment" 
          style={{ width: '74%', backgroundColor: '#10b981' }} 
          title="In Stock: 74%" 
        />
        <div 
          className="health-bar-segment" 
          style={{ width: '14%', backgroundColor: '#f59e0b' }} 
          title="Low Stock: 14%" 
        />
        <div 
          className="health-bar-segment" 
          style={{ width: '3%', backgroundColor: '#ef4444' }} 
          title="Out of Stock: 3%" 
        />
        <div 
          className="health-bar-segment" 
          style={{ width: '9%', backgroundColor: '#8b5cf6' }} 
          title="Overstock: 9%" 
        />
      </div>

      {/* 4 Category Metric Boxes */}
      <div className="health-categories-grid">
        {categories.map((cat) => (
          <div key={cat.label} className="health-category-box">
            <div className="cat-header">
              <span className="cat-indicator-dot" style={{ backgroundColor: cat.dotColor }}></span>
              <span>{cat.label}</span>
            </div>
            <div className="cat-pct">{cat.pct}%</div>
            <div className="cat-units">{cat.units}</div>
          </div>
        ))}
      </div>

      {/* 2 Clear Alerts: Stockout Risks and Overstock Risks */}
      <div className="health-alerts-container">
        {/* Stockout Alert */}
        <div className="health-alert-card stockout">
          <div className="alert-icon-box">
            <AlertCircle size={18} color="#dc2626" />
          </div>
          <div className="alert-content-group">
            <div className="alert-title-row">
              <span className="alert-title" style={{ color: '#b91c1c' }}>Stockout Risks (2 High Priority)</span>
              <span className="alert-badge" style={{ color: '#b91c1c', border: '1px solid #fecaca' }}>
                Urgent Action
              </span>
            </div>
            <p className="alert-text" style={{ color: '#7f1d1d' }}>
              <strong>Store A:</strong> SKU-8821 Earbuds (18 units, 2.8d left) • <strong>Store C:</strong> SKU-4102 Type-C Hubs (12 units, 1.9d left)
            </p>
          </div>
        </div>

        {/* Overstock Alert */}
        <div className="health-alert-card overstock">
          <div className="alert-icon-box">
            <AlertTriangle size={18} color="#d97706" />
          </div>
          <div className="alert-content-group">
            <div className="alert-title-row">
              <span className="alert-title" style={{ color: '#b45309' }}>Overstock Risks (1 Slow Moving)</span>
              <span className="alert-badge" style={{ color: '#b45309', border: '1px solid #fde68a' }}>
                Capital Idle
              </span>
            </div>
            <p className="alert-text" style={{ color: '#78350f' }}>
              <strong>Store B:</strong> SKU-3309 Heavy Winter Outerwear (+185 excess units, $18.4K idle capital, velocity: 0.8 u/d)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
