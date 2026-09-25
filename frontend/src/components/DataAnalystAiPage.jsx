import React from 'react';
import {
  BarChart3,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DataAnalystAiPage({ onBackToBoss, onNavigateToPage, analysisData }) {
  const stores = analysisData?.stores || {};
  const storeIds = Object.keys(stores);

  if (!analysisData || storeIds.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
        <BarChart3 size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>No Analysis Data</h3>
        <p style={{ color: '#64748b' }}>Upload a file in the Boss AI page to view the Data Analyst AI report.</p>
        <button
          onClick={onBackToBoss}
          style={{ marginTop: '20px', padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to Boss AI
        </button>
      </div>
    );
  }

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {storeIds.map((storeId) => {
          const storeData = stores[storeId].store;
          const analystData = stores[storeId].analyst;

          return (
            <div key={storeId} className="dashboard-section-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                {storeData.store_name} ({storeData.store_id})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {storeData.products.map((product) => {
                  const productAnalyst = analystData[product.product_id];
                  if (!productAnalyst) return null;

                  return (
                    <div key={product.product_id} style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}>
                      <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '10px', borderRadius: '8px' }}>
                        <TrendingUp size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                            {product.name}
                          </h4>
                          <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            Confidence: {Math.round(productAnalyst.confidence * 100)}%
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                          {productAnalyst.summary}
                        </p>
                        <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', display: 'flex', gap: '16px' }}>
                          <span><strong>Sources:</strong> {productAnalyst.data_sources?.join(', ')}</span>
                          <span><strong>Hash:</strong> {productAnalyst.audit_trail?.data_hash.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
            Data Analyst AI Report Status:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Data facts validated and sent to Boss AI and Pricing AI.
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
