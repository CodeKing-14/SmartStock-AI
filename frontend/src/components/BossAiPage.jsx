import React, { useState } from 'react';
import { 
  Crown, 
  ArrowRight, 
  Truck, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  Layers,
  ArrowUpRight,
  ChevronRight,
  Zap,
  Play
} from 'lucide-react';

export default function BossAiPage({ onNavigateToPage, onTriggerToast }) {
  const [dispatched, setDispatched] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);

  const handleDispatch = () => {
    if (dispatched) return;
    setIsSimulating(true);
    setTransferProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setTransferProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
        setDispatched(true);
        if (onTriggerToast) {
          onTriggerToast('Boss AI Dispatched: 150 packets assigned to Van #4 from Warehouse A to Warehouse B!');
        }
      }
    }, 200);
  };

  const aiTeam = [
    {
      id: 'data-ai',
      name: '1. Data Analyst AI',
      role: 'Demand & Trend Detection',
      badge: 'Demand Spike +160%',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      summary: 'Warehouse B city territory demand surged +160%. Stock will run dry in 48 hours without replenishment.',
      keyMetric: '+160% Demand Spike',
      pageId: 'data-ai'
    },
    {
      id: 'pricing-ai',
      name: '2. Pricing AI',
      role: 'Margin & Price Optimizer',
      badge: 'Price Locked $120',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      summary: 'Optimal price: $120/packet with 45% profit margin ($54 profit/pkt). Competitors are sold out.',
      keyMetric: '$120 / Pkt ($54 Margin)',
      pageId: 'pricing-ai'
    },
    {
      id: 'inventory-ai',
      name: '3. Inventory AI',
      role: 'Stock Level & Buffer Auditor',
      badge: 'Imbalance Audited',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      summary: 'Warehouse A holds 500 packets (excess buffer). Warehouse B has only 20 packets left.',
      keyMetric: 'A: 500 pkts vs B: 20 pkts',
      pageId: 'inventory-ai'
    },
    {
      id: 'logistics-ai',
      name: '4. Logistics AI',
      role: 'Route & Carrier Dispatcher',
      badge: 'Van #4 Ready',
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      summary: 'Express Van #4 ready at Bay 2. 45 miles route takes 2 hours. Total freight cost is only $75.',
      keyMetric: '45 Miles • $75 Cost • 2h ETA',
      pageId: 'logistics-ai'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Boss AI Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '26px 30px',
        boxShadow: '0 8px 24px -4px rgba(67, 56, 202, 0.3)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
              <Crown size={15} color="#fbbf24" />
              <span>THE BOSS AI • EXECUTIVE COMMAND CENTER</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Final Coordinated Decision
            </h1>
            <p style={{ fontSize: '13.5px', color: '#c7d2fe', maxWidth: '680px', lineHeight: 1.5, margin: 0 }}>
              The Boss AI reviews reports from all 4 specialized AIs and produces one clear operational decision: Shift 150 packets from Warehouse A to Warehouse B.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '11px', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>Decision Status</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <CheckCircle2 size={17} />
              <span>APPROVED BY BOSS AI</span>
            </div>
            <div style={{ fontSize: '11px', color: '#e0e7ff', marginTop: '2px' }}>4 of 4 AIs Voting YES</div>
          </div>
        </div>
      </div>

      {/* THE CENTRAL SIMPLE DATA HERO CARD */}
      <div style={{
        background: 'white',
        border: '2px solid #818cf8',
        borderRadius: 'var(--radius-xl)',
        padding: '26px',
        boxShadow: '0 6px 20px -3px rgba(99, 102, 241, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#e0e7ff',
              color: '#3730a3',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              letterSpacing: '0.05em'
            }}>
              SIMPLE OPERATIONAL DATA
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Product: <strong style={{ color: 'var(--text-primary)' }}>UltraBass Headphones (Box of 50 units)</strong>
            </span>
          </div>

          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--emerald-700)', background: 'var(--emerald-50)', border: '1px solid var(--emerald-100)', padding: '3px 10px', borderRadius: '12px' }}>
            Expected Net Gain: +$17,925
          </span>
        </div>

        {/* Visual Movement: Warehouse A -> Shift 150 Packets -> Warehouse B */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr 1fr',
          gap: '20px',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 20px',
          margin: '8px 0 18px 0'
        }}>
          {/* Origin: Warehouse A */}
          <div style={{
            background: 'white',
            border: '2px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              ORIGIN (EXCESS STOCK)
            </div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              Warehouse A (Central Hub)
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-heading)', margin: '6px 0 4px 0' }}>
              500 <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>packets</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#1e40af', background: '#eff6ff', padding: '3px 8px', borderRadius: '8px', display: 'inline-block' }}>
              Excess Buffer (60 days supply on hand)
            </div>
          </div>

          {/* Transfer Center Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              padding: '9px 20px',
              borderRadius: '24px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Truck size={18} />
              <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.02em' }}>
                SHIFT 150 PACKETS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '3px', background: 'linear-gradient(90deg, #c7d2fe, #6366f1)', borderRadius: '2px' }}></div>
              <ArrowRight size={22} color="#4f46e5" />
              <div style={{ flex: 1, height: '3px', background: 'linear-gradient(90deg, #6366f1, #3b82f6)', borderRadius: '2px' }}></div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Van #4 • 45 Miles • Freight: <strong style={{ color: 'var(--text-primary)' }}>$75.00</strong> • ETA: <strong style={{ color: '#4f46e5' }}>2 Hours</strong>
            </div>

            {isSimulating && (
              <div style={{ width: '80%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ width: `${transferProgress}%`, height: '100%', background: '#4f46e5', transition: 'width 0.2s ease' }}></div>
              </div>
            )}
          </div>

          {/* Destination: Warehouse B */}
          <div style={{
            background: 'white',
            border: '2px solid #fed7aa',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
              DESTINATION (LOW STOCK)
            </div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              Warehouse B (City Center)
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#ea580c', fontFamily: 'var(--font-heading)', margin: '6px 0 4px 0' }}>
              20 <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>packets</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#9a3412', background: '#fff7ed', padding: '3px 8px', borderRadius: '8px', display: 'inline-block', fontWeight: 600 }}>
              ⚠️ Stockout in 2 days! Urgent demand
            </div>
          </div>
        </div>

        {/* Action Button & Dispatch Control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dispatched ? '#10b981' : '#f59e0b' }}></div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {dispatched ? 'Status: 150 packets Dispatched via Van #4 (Manifest #DISP-150B)' : 'Status: Ready for Boss AI execution'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDispatch}
            style={{
              background: dispatched ? '#059669' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {dispatched ? (
              <>
                <CheckCircle2 size={18} />
                <span>150 Packets Dispatched!</span>
              </>
            ) : isSimulating ? (
              <>
                <span>Routing Van #4 ({transferProgress}%)...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="white" />
                <span>Authorize & Shift 150 Packets Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 AI REPORTS SECTION (CLICK TO OPEN DETAILED PAGE) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Reports From The 4 Specialized AIs
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Click any AI card to view its dedicated in-depth analysis page.
            </p>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--blue-700)', fontWeight: 600 }}>
            Unanimous Quorum (100% Agreement)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {aiTeam.map((ai) => (
            <div
              key={ai.id}
              onClick={() => onNavigateToPage(ai.pageId)}
              style={{
                background: 'white',
                border: `1.5px solid ${ai.border}`,
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: ai.bg,
                    color: ai.color,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {ai.badge}
                  </span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {ai.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {ai.role}
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {ai.summary}
                </p>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Key Finding:
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: ai.color, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {ai.keyMetric}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--blue-600)', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Comparison: Do Nothing vs Boss AI Decision */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h4 style={{ fontSize: '15.5px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
          Outcome Comparison: Old Strategy vs The Boss AI Decision
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c' }}>Old Strategy (Do Nothing)</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', margin: '4px 0' }}>-$18,000 Loss</div>
            <div style={{ fontSize: '11.5px', color: '#7f1d1d' }}>
              Warehouse B runs out of stock in 2 days. 150 customer orders lost to competitors.
            </div>
          </div>

          <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6d28d9' }}>Freight Cost (Van #4)</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>-$75 Freight</div>
            <div style={{ fontSize: '11.5px', color: '#5b21b6' }}>
              Express Van #4 fuel + driver cost for 45 miles (Warehouse A $\rightarrow$ Warehouse B).
            </div>
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>The Boss AI Outcome</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', margin: '4px 0' }}>+$17,925 Net Gain</div>
            <div style={{ fontSize: '11.5px', color: '#064e3b' }}>
              Zero stockouts. 150 packets sold at full $120. A frees up warehouse space.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
