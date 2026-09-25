import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Sliders, 
  BarChart, 
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function SimulationSection({ onTriggerToast }) {
  const [isRunning, setIsRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simCompleted, setSimCompleted] = useState(false);

  const metrics = [
    {
      name: 'Stockouts',
      current: '8.4%',
      ai: '0.9%',
      delta: '↓ 89% reduction',
      improved: true
    },
    {
      name: 'Wastage',
      current: '4.8%',
      ai: '1.2%',
      delta: '↓ 75% reduction',
      improved: true
    },
    {
      name: 'Total Profit',
      current: '$318,000',
      ai: '$412,800',
      delta: '↑ +$94.8K (+29.8%)',
      improved: true
    },
    {
      name: 'Inventory Utilization',
      current: '68%',
      ai: '94%',
      delta: '↑ +26% efficiency',
      improved: true
    },
  ];

  const handleRunSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setSimProgress(0);
    setSimCompleted(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSimProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsRunning(false);
        setSimCompleted(true);
        if (onTriggerToast) {
          onTriggerToast('90-Day Monte Carlo Retail Simulation Completed: AI Strategy yields +$94,800 net profit advantage.');
        }
      }
    }, 150);
  };

  return (
    <div id="simulation" className="simulation-card" aria-label="90-Day Simulation">
      <div className="section-card-header">
        <div className="section-card-title-group">
          <div className="brand-icon-box" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: '15.5px' }}>90-Day Simulation</h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Monte Carlo Predictive Model (10,000 Stochastic Iterations)
            </span>
          </div>
        </div>
        <span className="section-pill-tag" style={{ color: 'var(--purple-700)', backgroundColor: 'var(--purple-50)' }}>
          High Confidence
        </span>
      </div>

      {/* Comparison Header: Current Strategy VS AI Strategy */}
      <div>
        <div className="simulation-strategy-header">
          <span>Metric</span>
          <span style={{ color: 'var(--text-muted)' }}>Current Strategy</span>
          <span style={{ color: 'var(--emerald-700)' }}>AI Strategy</span>
        </div>

        {/* 4 Comparison Rows: Stockouts, Wastage, Total Profit, Inventory Utilization */}
        <div className="comparison-rows-list">
          {metrics.map((m) => (
            <div key={m.name} className="comparison-row">
              <span className="comp-metric-name">{m.name}</span>
              <span className="comp-current-val">{m.current}</span>
              <span className="comp-ai-val">
                <span>{m.ai}</span>
                <span className="comp-delta-badge">{m.delta}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Running Progress Indicator if active */}
      {isRunning && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px', fontWeight: 600 }}>
            <span style={{ color: 'var(--emerald-700)' }}>Simulating Q3 Retail Cycles...</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>Day {Math.round((simProgress / 100) * 90)} of 90</span>
          </div>
          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${simProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #059669)',
              transition: 'width 0.15s ease'
            }} />
          </div>
        </div>
      )}

      {/* Prominent Run Simulation Button */}
      <button 
        type="button" 
        className="btn-simulation-run"
        onClick={handleRunSimulation}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <RotateCcw size={16} className="spin-icon" />
            <span>Simulating Day {Math.round((simProgress / 100) * 90)} / 90...</span>
          </>
        ) : simCompleted ? (
          <>
            <CheckCircle2 size={18} />
            <span>Re-Run 90-Day Simulation</span>
          </>
        ) : (
          <>
            <Play size={16} fill="white" />
            <span>▶ Run Simulation</span>
          </>
        )}
      </button>
    </div>
  );
}
