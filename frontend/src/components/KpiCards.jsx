import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Boxes, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';

// Tiny SVG Sparkline component
function Sparkline({ data, strokeColor, fillColor, id }) {
  const width = 160;
  const height = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Build points
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 4 - ((val - min) / range) * (height - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  const lastPoint = points[points.length - 1].split(',');

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Fill Area */}
      <path d={areaD} fill={`url(#grad-${id})`} />
      {/* Line */}
      <path 
        d={pathD} 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Current point highlight */}
      <circle 
        cx={lastPoint[0]} 
        cy={lastPoint[1]} 
        r="3.5" 
        fill="white" 
        stroke={strokeColor} 
        strokeWidth="2" 
      />
    </svg>
  );
}

export default function KpiCards() {
  const cards = [
    {
      id: 'revenue',
      title: 'Revenue',
      value: '$1,248,500',
      subtext: '30-Day Gross Volume',
      trend: '+14.2%',
      trendLabel: 'vs last mo',
      trendType: 'positive',
      icon: DollarSign,
      iconBg: 'var(--emerald-50)',
      iconColor: 'var(--emerald-600)',
      sparklineColor: '#10b981',
      sparklineFill: '#10b981',
      data: [18, 22, 25, 23, 29, 34, 38, 42, 45, 50, 48, 56]
    },
    {
      id: 'profit',
      title: 'Profit',
      value: '$412,800',
      subtext: '33.1% Net Operating Margin',
      trend: '+8.6%',
      trendLabel: 'projected',
      trendType: 'positive',
      icon: TrendingUp,
      iconBg: 'var(--purple-50)',
      iconColor: 'var(--purple-600)',
      sparklineColor: '#8b5cf6',
      sparklineFill: '#8b5cf6',
      data: [12, 14, 15, 17, 16, 21, 24, 26, 29, 31, 33, 37]
    },
    {
      id: 'inventory',
      title: 'Inventory',
      value: '48,250',
      subtext: 'Units ($892K Value in 3 Stores)',
      trend: '94.6%',
      trendLabel: 'optimal buffer',
      trendType: 'neutral',
      icon: Boxes,
      iconBg: 'var(--blue-50)',
      iconColor: 'var(--blue-600)',
      sparklineColor: '#3b82f6',
      sparklineFill: '#3b82f6',
      data: [42, 45, 44, 46, 48, 47, 49, 48, 50, 49, 48, 48]
    },
    {
      id: 'risks',
      title: 'Risks',
      value: '3 Critical',
      subtext: '2 Stockout • 1 Overstock',
      trend: '-64%',
      trendLabel: 'risk reduction',
      trendType: 'positive',
      icon: AlertTriangle,
      iconBg: 'var(--amber-50)',
      iconColor: 'var(--amber-600)',
      sparklineColor: '#f59e0b',
      sparklineFill: '#f59e0b',
      data: [14, 12, 11, 9, 8, 7, 6, 6, 5, 4, 3, 3]
    },
  ];

  return (
    <section className="kpi-grid" aria-label="Key Performance Indicators">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className="kpi-card">
            {/* Top row: title, icon, and trend badge */}
            <div className="kpi-top-row">
              <div className="kpi-label-wrapper">
                <div className="kpi-icon-pill" style={{ background: card.iconBg, color: card.iconColor }}>
                  <Icon size={17} />
                </div>
                <span className="kpi-title">{card.title}</span>
              </div>

              <div className={`kpi-badge ${card.trendType}`}>
                {card.trendType === 'positive' && <ArrowUpRight size={13} />}
                {card.trendType === 'neutral' && <ShieldCheck size={13} />}
                <span>{card.trend}</span>
                <span style={{ fontSize: '10px', opacity: 0.85 }}>{card.trendLabel}</span>
              </div>
            </div>

            {/* Middle row: large primary metric and subtext */}
            <div className="kpi-main-metric">
              <div>
                <div className="kpi-value">{card.value}</div>
                <div className="kpi-subtext">{card.subtext}</div>
              </div>
            </div>

            {/* Bottom row: tiny clean line chart */}
            <div className="kpi-sparkline-container">
              <Sparkline 
                id={card.id} 
                data={card.data} 
                strokeColor={card.sparklineColor} 
                fillColor={card.sparklineFill} 
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
