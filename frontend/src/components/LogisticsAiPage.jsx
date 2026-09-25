import React from 'react';
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function LogisticsAiPage({ onBackToBoss, onNavigateToPage, analysisData }) {
  const logisticsData = analysisData?.logistics_global || analysisData?.logistics;
  const transfers = logisticsData?.transfers || [];

  if (!analysisData || !logisticsData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
        <Truck size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>No Analysis Data</h3>
        <p style={{ color: '#64748b' }}>Upload a file in the Boss AI page to view the Logistics AI report.</p>
        <button
          onClick={onBackToBoss}
          style={{ marginTop: '20px', padding: '8px 16px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to Boss AI
        </button>
      </div>
    );
  }

  // Get store/product names for better display
  const getStoreName = (storeId) => analysisData.stores[storeId]?.store.store_name || storeId;
  const getProductName = (sku) => {
    for (const storeId in analysisData.stores) {
      const p = analysisData.stores[storeId].store.products.find(p => p.product_id === sku);
      if (p) return p.name;
    }
    return sku;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: '0 6px 20px -3px rgba(124, 58, 237, 0.25)'
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
            background: '#ede9fe',
            color: '#6d28d9',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            textTransform: 'uppercase'
          }}>
            AI Specialist 04
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
            <Truck size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'white' }}>
              Logistics AI
            </h1>
            <p style={{ fontSize: '12.5px', color: '#ddd6fe', margin: '2px 0 0 0' }}>
              Autonomous vehicle routing, transit time prediction, freight cost computation, and driver assignment.
            </p>
          </div>
        </div>
      </div>

      {transfers.length === 0 ? (
        <div style={{ background: 'white', padding: '30px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Network is Balanced</h3>
          <p style={{ color: '#64748b', margin: 0 }}>No profitable inventory transfers required at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Network Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: '#f5f3ff', padding: '16px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: '12px', color: '#6d28d9', fontWeight: 600 }}>Total Transfers Planned</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#4c1d95', margin: '4px 0' }}>{transfers.length}</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>Total Logistics Cost</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#991b1b', margin: '4px 0' }}>₹{logisticsData.total_cost}</div>
            </div>
            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600 }}>Total Network ROI</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', margin: '4px 0' }}>₹{logisticsData.total_roi}</div>
            </div>
          </div>

          {/* Transfers List */}
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '10px 0 0 0' }}>Recommended Transfers</h3>

          {transfers.map((transfer, idx) => (
            <div key={idx} className="dashboard-section-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#ede9fe', color: '#6d28d9', padding: '10px', borderRadius: '8px' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                      {getProductName(transfer.sku)}
                    </h4>
                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500, marginTop: '2px' }}>
                      Shift {transfer.qty} units
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Distance</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#475569' }}>{transfer.distance_km} km</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>From</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{getStoreName(transfer.from_store)}</div>
                </div>
                <div style={{ padding: '0 20px', color: '#cbd5e1' }}>
                  <ArrowRight size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>To</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{getStoreName(transfer.to_store)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Transfer Cost</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#dc2626' }}>₹{transfer.transfer_cost}</div>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Profit Saved</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#059669' }}>₹{transfer.profit_saved}</div>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>ROI</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={16} /> {transfer.roi_percent}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission to Boss AI */}
      <div style={{
        background: '#f8fafc',
        border: '1.5px solid #cbd5e1',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Logistics AI Report Status:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Routes computed and cost analyses sent to Boss AI.
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToBoss}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span>Return to Boss AI to Dispatch</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
