import React from 'react';
import { 
  Store, 
  ArrowRight, 
  Truck, 
  MapPin, 
  Clock, 
  Layers,
  ChevronRight
} from 'lucide-react';

export default function MultiStoreInventory() {
  const stores = [
    {
      id: 'store-a',
      name: 'Store A',
      location: 'Metro Downtown',
      units: '14,200 units',
      utilization: '88% Cap',
      velocity: 'High (142 u/d)',
      runway: '3.2 Days Runway',
      status: 'Needs Inflow',
      statusColor: '#d97706',
      statusBg: '#fffbeb',
      isDestination: true
    },
    {
      id: 'store-b',
      name: 'Store B',
      location: 'Suburban Plaza',
      units: '18,850 units',
      utilization: '94% Cap',
      velocity: 'Low (38 u/d)',
      runway: '42 Days Runway',
      status: 'Excess Buffer',
      statusColor: '#7c3aed',
      statusBg: '#f5f3ff',
      isSource: true
    },
    {
      id: 'store-c',
      name: 'Store C',
      location: 'Westside Harbor',
      units: '15,200 units',
      utilization: '72% Cap',
      velocity: 'Balanced (76 u/d)',
      runway: '16.4 Days Runway',
      status: 'Optimal Balance',
      statusColor: '#059669',
      statusBg: '#ecfdf5',
      isSource: false
    }
  ];

  return (
    <div id="multi-store-balancing" className="dashboard-section-card" aria-label="Multi-Store Balancing">
      <div className="section-card-header">
        <div className="section-card-title-group">
          <div className="brand-icon-box" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
            <Store size={16} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: '15.5px' }}>Multi-Store Inventory</h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Regional Balancing Network • 3 Hubs
            </span>
          </div>
        </div>
        <span className="section-pill-tag" style={{ color: 'var(--blue-700)', backgroundColor: 'var(--blue-50)' }}>
          Active Rebalancing
        </span>
      </div>

      {/* 3 Store Cards */}
      <div className="stores-cards-row">
        {stores.map((st) => (
          <div 
            key={st.id} 
            className={`store-card ${st.isSource ? 'source-store' : ''} ${st.isDestination ? 'destination-store' : ''}`}
          >
            <div className="store-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="store-name-title">{st.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({st.location})</span>
              </div>
              <span 
                className="store-tag-status" 
                style={{ color: st.statusColor, backgroundColor: st.statusBg }}
              >
                {st.status}
              </span>
            </div>

            <div className="store-stats-list">
              <div className="store-stat-row">
                <span className="stat-key">Stock Volume:</span>
                <span className="stat-val">{st.units}</span>
              </div>
              <div className="store-stat-row">
                <span className="stat-key">Daily Velocity:</span>
                <span className="stat-val">{st.velocity}</span>
              </div>
              <div className="store-stat-row">
                <span className="stat-key">Depletion Buffer:</span>
                <span className="stat-val">{st.runway}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Stock Movement between Stores using an Arrow: Store B -> Store A */}
      <div className="transfer-flow-box">
        {/* Source Store B */}
        <div className="transfer-endpoint">
          <div className="transfer-node-icon store-b">
            <span>B</span>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>Store B</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Suburban Plaza</div>
          </div>
        </div>

        {/* Visual Arrow and Transferred Quantity Label */}
        <div className="transfer-arrow-lane">
          <div className="transfer-badge-label">
            <Truck size={13} />
            <span>Store B → Store A : 60 Units Transferred</span>
          </div>
          <div className="transfer-vector-line">
            <div style={{
              position: 'absolute',
              right: '-6px',
              top: '-4px',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ArrowRight size={14} />
            </div>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Clock size={11} />
            <span>Transit Time: 14 hrs • Logistics Cost: $42 • SKU-8821</span>
          </div>
        </div>

        {/* Destination Store A */}
        <div className="transfer-endpoint">
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>Store A</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'right' }}>Metro Downtown</div>
          </div>
          <div className="transfer-node-icon store-a">
            <span>A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
