import React from 'react';
import { 
  Database, 
  Bot, 
  GitMerge, 
  Scale, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function VisualStoryBanner() {
  const steps = [
    {
      num: '01',
      title: 'DATA',
      sub: 'POS, WMS & Competitors',
      icon: Database,
      status: 'active'
    },
    {
      num: '02',
      title: 'AI AGENTS',
      sub: '4 Specialized Models',
      icon: Bot,
      status: 'active'
    },
    {
      num: '03',
      title: 'COLLABORATION',
      sub: 'Autonomous Consensus',
      icon: GitMerge,
      status: 'active'
    },
    {
      num: '04',
      title: 'DECISION',
      sub: 'Optimized Trade-Offs',
      icon: Scale,
      status: 'active'
    },
    {
      num: '05',
      title: 'ACTION',
      sub: 'Auto-Dispatched Transfer',
      icon: CheckCircle2,
      status: 'highlight'
    },
    {
      num: '06',
      title: 'RESULT',
      sub: '+$94.8K Profit Lift',
      icon: TrendingUp,
      status: 'highlight'
    }
  ];

  return (
    <div className="story-banner">
      <div className="story-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="story-badge">
            <Sparkles size={12} />
            <span>Core Workflow Architecture</span>
          </div>
          <span className="story-motto">
            “A team of AI agents working together to make smarter pricing, replenishment, and inventory-balancing decisions.”
          </span>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Cycle: Autonomous Continuous Loop
        </div>
      </div>

      <div className="story-flow-steps">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.title}>
              <div className={`flow-step-item ${step.status}`}>
                <span className="flow-step-num">{step.num}</span>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: step.status === 'highlight' ? 'var(--emerald-100)' : 'var(--blue-50)',
                  color: step.status === 'highlight' ? 'var(--emerald-700)' : 'var(--blue-600)'
                }}>
                  <Icon size={14} />
                </div>
                <div style={{ display: 'flex', flexDirections: 'column', textAlign: 'left' }}>
                  <span className="flow-step-name">{step.title}</span>
                  <span className="flow-step-sub" style={{ fontSize: '10.5px' }}>{step.sub}</span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="flow-separator-arrow">
                  <ArrowRight size={14} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
