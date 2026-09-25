import React from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Navigation, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

export default function LogisticsAiPage({ onBackToBoss }) {
  const timeline = [
    { time: '08:00 AM', title: 'Bay 2 Staging & Loading', desc: '150 packets loaded onto Express Cargo Van #4 at Warehouse A.' },
    { time: '08:30 AM', title: 'Highway Transit', desc: 'Depart via Interstate 95 Express Corridor (45 miles).' },
    { time: '10:30 AM', title: 'Arrival at Warehouse B', desc: 'Dock at City Receiving Bay 1 for rapid scan & unload.' },
    { time: '11:00 AM', title: 'Shelf Stocked & Active', desc: 'All 150 packets active on POS for customer purchases.' },
  ];

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

      {/* Main Logistics Finding Callout */}
      <div style={{
        background: '#f5f3ff',
        border: '1.5px solid #ddd6fe',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ background: '#8b5cf6', color: 'white', padding: '8px', borderRadius: '8px', marginTop: '2px' }}>
            <Navigation size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#6d28d9' }}>
              DISPATCH READINESS VERIFIED
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#4c1d95', marginTop: '2px' }}>
              Express Van #4 Assigned • 45 Miles Route • Freight: $75.00
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', maxWidth: '750px' }}>
              Route from Warehouse A to Warehouse B takes <strong>2 hours</strong>. Shifting 150 packets costs only $75 in freight while protecting <strong>$18,000 in customer sales</strong> (an ROI of 23,900%).
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '170px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Freight Cost</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-heading)' }}>
            $75.00
          </div>
          <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600 }}>2 Hours ETA</div>
        </div>
      </div>

      {/* Route & Vehicle Specifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Vehicle & Carrier Card */}
        <div className="dashboard-section-card">
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Carrier & Route Specifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned Vehicle:</span>
              <strong>Express Cargo Van #4</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Load Quantity:</span>
              <strong style={{ color: '#6d28d9' }}>150 Packets</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Distance:</span>
              <strong>45.2 Miles via I-95</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Driver:</span>
              <strong style={{ color: '#047857' }}>David M. (Bay 2)</strong>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Card */}
        <div className="dashboard-section-card">
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Freight Cost Breakdown: $75 Total
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Driver Hourly Pay (2h):</span>
              <strong>$40.00</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>EV Fuel / Charging (45 miles):</span>
              <strong>$25.00</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Express Tolls:</span>
              <strong>$10.00</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0',
              marginTop: '4px'
            }}>
              <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>Total Freight Cost:</strong>
              <strong style={{ fontSize: '20px', color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>$75.00</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--emerald-700)', fontWeight: 600, background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', textAlign: 'center', marginTop: '4px' }}>
              Only $0.50 per packet to unlock $120.00 in revenue!
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Schedule Timeline */}
      <div className="dashboard-section-card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
          Delivery Schedule Timeline
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {timeline.map((step) => (
            <div key={step.time} style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>
                {step.time}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                {step.title}
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4, margin: '4px 0 0 0' }}>
                {step.desc}
              </p>
            </div>
          ))}
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
            Logistics AI Report to Boss AI:
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            “Van #4 is ready at Bay 2. Route is clear. Ready to dispatch upon Boss AI command.”
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
