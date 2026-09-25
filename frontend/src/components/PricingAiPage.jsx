import React from 'react';
import {
  Tag,
  DollarSign,
  Lock,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function PricingAiPage({ onBackToBoss, onNavigateToPage, analysisData }) {
  const stores = analysisData?.stores || {};
  const storeIds = Object.keys(stores);

  if (!analysisData || storeIds.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
        <Tag size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>No Analysis Data</h3>
        <p style={{ color: '#64748b' }}>Upload a file in the Boss AI page to view the Pricing AI report.</p>
        <button
          onClick={onBackToBoss}
          style={{ marginTop: '20px', padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to Boss AI
        </button>
      </div>
    );
  }

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {storeIds.map((storeId) => {
          const storeData = stores[storeId].store;
          const pricingData = stores[storeId].pricing;

          return (
            <div key={storeId} className="dashboard-section-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                {storeData.store_name} ({storeData.store_id})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {storeData.products.map((product) => {
                  const productPricing = pricingData[product.product_id];
                  if (!productPricing) return null;

                  const isHold = productPricing.action === 'hold';
                  const isIncrease = productPricing.action === 'increase';
                  const colorCode = isHold ? '#059669' : (isIncrease ? '#2563eb' : '#dc2626');
                  const bgColor = isHold ? '#ecfdf5' : (isIncrease ? '#eff6ff' : '#fef2f2');
                  const Icon = isHold ? Lock : (isIncrease ? TrendingUp : TrendingDown);

                  return (
                    <div key={product.product_id} style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: bgColor, color: colorCode, padding: '8px', borderRadius: '8px' }}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                              {product.name}
                            </h4>
                            <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                              {isHold ? `HOLD at ₹${productPricing.new_price}` : `${isIncrease ? 'RAISE' : 'LOWER'} price to ₹${productPricing.new_price} (${productPricing.percentage > 0 ? '+' : ''}${productPricing.percentage}%)`}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Expected Weekly Profit</div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: colorCode }}>₹{productPricing.expected_weekly_profit}</div>
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155' }}>
                        <strong>Reasoning:</strong> {productPricing.reasoning}
                      </div>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                        <span><strong>Expected Volume:</strong> {productPricing.expected_volume} units</span>
                        <span><strong>Confidence:</strong> {Math.round(productPricing.confidence * 100)}%</span>
                        {productPricing.risk && <span><strong>Risk:</strong> {productPricing.risk}</span>}
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
            Pricing AI Report Status:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Prices optimized based on elasticity and sent to Boss AI.
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
