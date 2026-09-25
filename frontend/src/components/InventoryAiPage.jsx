import React from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function InventoryAiPage({ onBackToBoss, onNavigateToPage, analysisData }) {
  const stores = analysisData?.stores || {};
  const storeIds = Object.keys(stores);

  if (analysisData?.run_id === 'ingest_only') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
        <Boxes size={48} color="#d97706" style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>Knowledge Document Ingested</h3>
        <p style={{ color: '#64748b' }}>This document was processed by Boss AI for general knowledge.</p>
        <p style={{ color: '#64748b' }}>To view Inventory AI recommendations, please upload a <b>Retail Data</b> file with store products and inventory.</p>
        <button
          onClick={onBackToBoss}
          style={{ marginTop: '20px', padding: '8px 16px', background: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to Boss AI
        </button>
      </div>
    );
  }

  if (!analysisData || storeIds.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
        <Boxes size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#334155' }}>No Analysis Data</h3>
        <p style={{ color: '#64748b' }}>Upload a file in the Boss AI page to view the Inventory AI report.</p>
        <button 
          onClick={onBackToBoss}
          style={{ marginTop: '20px', padding: '8px 16px', background: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to Boss AI
        </button>
      </div>
    );
  }
  const [selectedStore, setSelectedStore] = React.useState('all');

  // Compute summary stats
  let stockoutRisks = 0;
  let overstockRisks = 0;
  let safeSkus = 0;
  let validationFlags = 0;

  storeIds.forEach(id => {
    const s = stores[id];
    Object.values(s.inventory || {}).forEach(inv => {
      if (inv.flag && inv.risk === 'stockout') stockoutRisks++;
      else if (inv.flag && inv.risk === 'overstock') overstockRisks++;
      else safeSkus++;
    });
    Object.values(s.spoilage || {}).forEach(sp => { if (sp.flag) validationFlags++; });
    Object.values(s.basket || {}).forEach(bk => { if (bk.flag) validationFlags++; });
    Object.values(s.game_theory || {}).forEach(gt => { if (gt.flag) validationFlags++; });
  });

  const displayedStores = selectedStore === 'all' ? storeIds : [selectedStore];

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
            AI Specialist 03 + Validation Agents
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
              Inventory & Validation AI Dashboard
            </h1>
            <p style={{ fontSize: '12.5px', color: '#fef3c7', margin: '2px 0 0 0' }}>
              Autonomous stock coverage audit, Spoilage detection, Basket cannibalization alerts, and Game Theory retaliation checks.
            </p>
          </div>
        </div>
      </div>

      {/* Top Inventory Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Stockout Risks</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{stockoutRisks} SKUs</div>
          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px', fontWeight: 600 }}>Depletion before lead time</div>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Overstock / Spoilage</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{overstockRisks} SKUs</div>
          <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px' }}>Excess holding / Markdown needed</div>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Safe Stock Levels</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{safeSkus} SKUs</div>
          <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>Within safety buffer</div>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Validation Warnings</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>{validationFlags} Flags</div>
          <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '2px' }}>Spoilage, Basket & Game Theory</div>
        </div>
      </div>

      {/* Store Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        <button
          type="button"
          onClick={() => setSelectedStore('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: selectedStore === 'all' ? 700 : 500,
            background: selectedStore === 'all' ? 'white' : 'transparent',
            color: selectedStore === 'all' ? '#b45309' : '#64748b',
            boxShadow: selectedStore === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer'
          }}
        >
          All Stores ({storeIds.length})
        </button>
        {storeIds.map(id => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedStore(id)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: selectedStore === id ? 700 : 500,
              background: selectedStore === id ? 'white' : 'transparent',
              color: selectedStore === id ? '#b45309' : '#64748b',
              boxShadow: selectedStore === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer'
            }}
          >
            {stores[id].store?.store_name || id}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {displayedStores.map((storeId) => {
          const storeData = stores[storeId].store;
          const inventoryData = stores[storeId].inventory || {};
          const spoilageData = stores[storeId].spoilage || {};
          const basketData = stores[storeId].basket || {};
          const gameTheoryData = stores[storeId].game_theory || {};
          const negotiations = stores[storeId].negotiation_history || [];

          return (
            <div key={storeId} className="dashboard-section-card" style={{ background: 'white', padding: '22px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  {storeData.store_name} ({storeData.store_id})
                </h3>
                {negotiations.length > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#ede9fe', color: '#6d28d9', padding: '3px 10px', borderRadius: '12px' }}>
                    👑 {negotiations.length} Boss AI Interventions
                  </span>
                )}
              </div>

              {/* Boss AI Enforced Caps Notice */}
              {negotiations.length > 0 && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', marginBottom: '4px' }}>
                    👑 BOSS AI ITERATIVE NEGOTIATION ACTIONS ENFORCED:
                  </div>
                  {negotiations.map((n, i) => (
                    <div key={i} style={{ fontSize: '12.5px', color: '#4c1d95', marginLeft: '12px' }}>
                      • <strong>SKU {n.sku}:</strong> {n.reason}
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {storeData.products.map((product) => {
                  const productInventory = inventoryData[product.product_id];
                  if (!productInventory) return null;

                  const isFlagged = productInventory.flag;
                  const riskType = productInventory.risk; // stockout, overstock, none
                  
                  const bgColor = isFlagged ? (riskType === 'stockout' ? '#fef2f2' : '#fffbeb') : '#ecfdf5';
                  const borderColor = isFlagged ? (riskType === 'stockout' ? '#fecaca' : '#fde68a') : '#a7f3d0';
                  const textColor = isFlagged ? (riskType === 'stockout' ? '#b91c1c' : '#b45309') : '#047857';
                  const Icon = isFlagged ? AlertTriangle : CheckCircle;

                  const sp = spoilageData[product.product_id];
                  const bk = basketData[product.product_id];
                  const gt = gameTheoryData[product.product_id];

                  return (
                    <div key={product.product_id} style={{ 
                      background: bgColor, 
                      border: `1px solid ${borderColor}`, 
                      borderRadius: '8px', 
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: 'white', color: textColor, padding: '8px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                              {product.name}
                            </h4>
                            <div style={{ fontSize: '13px', color: textColor, fontWeight: 700, textTransform: 'uppercase' }}>
                              {isFlagged ? `${riskType} RISK` : 'SAFE: NO RISK'}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Days until Issue</div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>{productInventory.days_until_issue > 365 ? '365+' : productInventory.days_until_issue} Days</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontSize: '12.5px', color: '#334155' }}>
                          <span style={{ color: '#64748b' }}>Current Inventory:</span> <strong style={{ color: '#0f172a' }}>{productInventory.current_inventory} pkts</strong>
                        </div>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontSize: '12.5px', color: '#334155' }}>
                          <span style={{ color: '#64748b' }}>Weekly Demand:</span> <strong style={{ color: '#0f172a' }}>{productInventory.demanded_volume} pkts</strong>
                        </div>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontSize: '12.5px', color: '#334155' }}>
                          <span style={{ color: '#64748b' }}>Safety Buffer Lead Time:</span> <strong style={{ color: '#0f172a' }}>{productInventory.lead_time} days</strong>
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontSize: '13px', color: '#334155' }}>
                        <strong>Inventory AI Recommendation:</strong> {productInventory.recommendation}
                      </div>

                      {/* Validation Agents Badges & Flags */}
                      {(sp?.flag || bk?.flag || gt?.flag) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                            Validation Agents Cross-Check:
                          </div>
                          {sp?.flag && (
                            <div style={{ fontSize: '12px', color: '#b91c1c' }}>
                              ☣️ <strong>Spoilage AI:</strong> Spoilage risk detected. {sp.recommendation}
                            </div>
                          )}
                          {bk?.flag && (
                            <div style={{ fontSize: '12px', color: '#b45309' }}>
                              🛒 <strong>Basket AI:</strong> Cannibalization risk. {bk.recommendation}
                            </div>
                          )}
                          {gt?.flag && (
                            <div style={{ fontSize: '12px', color: '#6d28d9' }}>
                              ⚔️ <strong>Game Theory AI:</strong> Competitor reaction risk. {gt.recommendation}
                            </div>
                          )}
                        </div>
                      )}
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
            Inventory AI Report Status:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            Stock flags and recommendations generated and sent to Boss AI.
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
