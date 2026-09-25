import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BossAiPage from './components/BossAiPage';
import DataAnalystAiPage from './components/DataAnalystAiPage';
import PricingAiPage from './components/PricingAiPage';
import InventoryAiPage from './components/InventoryAiPage';
import LogisticsAiPage from './components/LogisticsAiPage';
import { 
  Crown, 
  BarChart3, 
  Tag, 
  Boxes, 
  Truck, 
  CheckCircle2 
} from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState('boss-ai');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const navTabs = [
    { id: 'boss-ai', label: 'The Boss AI (Final Verdict)', icon: Crown, color: '#4f46e5' },
    { id: 'data-ai', label: '1. Data Analyst AI', icon: BarChart3, color: '#2563eb' },
    { id: 'pricing-ai', label: '2. Pricing AI', icon: Tag, color: '#059669' },
    { id: 'inventory-ai', label: '3. Inventory AI', icon: Boxes, color: '#d97706' },
    { id: 'logistics-ai', label: '4. Logistics AI', icon: Truck, color: '#7c3aed' },
  ];

  return (
    <div className="app-container">
      {/* Left Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Header */}
        <Header 
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Dashboard Content Container */}
        <div className="dashboard-content">
          {/* Page Switcher Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            padding: '6px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xs)',
            overflowX: 'auto'
          }}>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePage(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? (tab.id === 'boss-ai' ? '#312e81' : tab.color) : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional Rendering of 5 AI Pages */}
          {activePage === 'boss-ai' && (
            <BossAiPage 
              onNavigateToPage={(pageId) => setActivePage(pageId)}
              onTriggerToast={showToast}
            />
          )}

          {activePage === 'data-ai' && (
            <DataAnalystAiPage 
              onBackToBoss={() => setActivePage('boss-ai')}
              onNavigateToPage={(pageId) => setActivePage(pageId)}
            />
          )}

          {activePage === 'pricing-ai' && (
            <PricingAiPage 
              onBackToBoss={() => setActivePage('boss-ai')}
              onNavigateToPage={(pageId) => setActivePage(pageId)}
            />
          )}

          {activePage === 'inventory-ai' && (
            <InventoryAiPage 
              onBackToBoss={() => setActivePage('boss-ai')}
              onNavigateToPage={(pageId) => setActivePage(pageId)}
            />
          )}

          {activePage === 'logistics-ai' && (
            <LogisticsAiPage 
              onBackToBoss={() => setActivePage('boss-ai')}
            />
          )}
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-floating">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
