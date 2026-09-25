import React, { useState } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  MessageSquare,
  Send,
  Download,
  User,
  Upload,
  FileText,
  X,
  Tag,
  BarChart3,
  Boxes,
  Truck,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function BossAiPage({ onTriggerToast, setAnalysisData, analysisData, onNavigateToPage }) {


  const handleDownloadPDF = async () => {
    const element = document.getElementById('boss-ai-report');
    if (!element) return;
    
    if (onTriggerToast) onTriggerToast('Generating PDF...');
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Boss-AI-Analysis.pdf');
      if (onTriggerToast) onTriggerToast('PDF Downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');
      const fileUrl = isImage ? URL.createObjectURL(file) : null;
      setAttachedFile({
        name: file.name,
        isImage,
        url: fileUrl,
        rawFile: file
      });
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !attachedFile) return;

    const newMessages = [...chatMessages, { 
      sender: 'user', 
      text: chatInput,
      attachment: attachedFile
    }];
    setChatMessages(newMessages);
    
    const fileToSend = attachedFile ? attachedFile.rawFile : null;
    const currentInput = chatInput;
    
    setChatInput('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (fileToSend) {
      // Add a loading message
      setChatMessages(prev => [...prev, { sender: 'boss', text: '⚡ Running data through all AI agents (Data Analyst, Pricing, Inventory, Spoilage, Basket, Game Theory, Logistics) and sending outputs to RAG...' }]);

      try {
        const formData = new FormData();
        // The backend expects 'retail_data_file' as the form field name
        formData.append('retail_data_file', fileToSend);
        
        const response = await fetch('http://localhost:8000/api/analyze/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          if (setAnalysisData) setAnalysisData(data);
          const verdictText = data.rag_result || data.report_markdown;
          setChatMessages(prev => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { 
              sender: 'boss', 
              text: `🎯 RAG & Boss AI Analysis Complete (Run ID: ${data.run_id})\n\n${verdictText}` 
            };
            return msgs;
          });
          if (onTriggerToast) onTriggerToast('Data processed by all AIs and synthesized by RAG!');
        } else {
          setChatMessages(prev => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { sender: 'boss', text: `Backend Error: ${data.detail || 'Unknown error'}` };
            return msgs;
          });
        }
      } catch (error) {
        setChatMessages(prev => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { sender: 'boss', text: `Connection Error: Could not reach the backend at http://localhost:8000. Is it running? (${error.message})` };
            return msgs;
        });
      }
    } else {
      // If user typed, send to chat (which also processes direct retail data through all AIs + RAG)
      setChatMessages(prev => [...prev, { sender: 'boss', text: 'Thinking and analyzing across all AI agents...' }]);
      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: currentInput }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.is_analysis && data.analysis_data && setAnalysisData) {
            setAnalysisData(data.analysis_data);
            if (onTriggerToast) onTriggerToast('Retail data processed by all AIs and synthesized by RAG!');
          }
          setChatMessages(prev => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { sender: 'boss', text: data.answer };
            return msgs;
          });
        } else {
          const errorData = await response.json();
          setChatMessages(prev => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { sender: 'boss', text: `Error: ${errorData.detail || 'Could not get response'}` };
            return msgs;
          });
        }
      } catch (error) {
        setChatMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { sender: 'boss', text: `Connection Error: ${error.message}` };
          return msgs;
        });
      }
    }
  };




  return (
    <div id="boss-ai-report" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '4px' }}>
      
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
              Final Coordinated Decision — {analysisData?.meta?.chain_name || 'Retail Network'}
            </h1>
            <p style={{ fontSize: '13.5px', color: '#c7d2fe', maxWidth: '680px', lineHeight: 1.5, margin: 0 }}>
              {analysisData?.run_id 
                ? `Run ID: ${analysisData.run_id} • Synthesizing verified findings from Data Analyst AI, Pricing AI, Inventory AI, Spoilage AI, Basket AI, Game Theory AI, and Logistics AI.`
                : 'The Boss AI reviews reports from all specialized AIs, arbitrates cross-agent conflicts, and produces one coordinated operational decision.'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <button
              onClick={handleDownloadPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>
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
              <div style={{ fontSize: '11px', color: '#e0e7ff', marginTop: '2px' }}>All AI Agents Synchronized</div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Overview KPI Strip */}
      {analysisData?.stores && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <div 
            onClick={() => onNavigateToPage && onNavigateToPage('data-ai')}
            style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>1. Data Analyst AI</span>
              <BarChart3 size={16} color="#2563eb" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>
              {Object.keys(analysisData.stores).length} Stores Audited
            </div>
            <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span>View Data Analyst Report</span>
              <ArrowRight size={12} />
            </div>
          </div>

          <div 
            onClick={() => onNavigateToPage && onNavigateToPage('pricing-ai')}
            style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>2. Pricing AI</span>
              <Tag size={16} color="#059669" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              Elasticity Optimized
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span>View Pricing Actions</span>
              <ArrowRight size={12} />
            </div>
          </div>

          <div 
            onClick={() => onNavigateToPage && onNavigateToPage('inventory-ai')}
            style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>3. Inventory AI</span>
              <Boxes size={16} color="#d97706" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
              Audited & Protected
            </div>
            <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span>View Stock & Risks</span>
              <ArrowRight size={12} />
            </div>
          </div>

          <div 
            onClick={() => onNavigateToPage && onNavigateToPage('logistics-ai')}
            style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>4. Logistics AI</span>
              <Truck size={16} color="#7c3aed" />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
              {(analysisData.logistics_global?.transfers || analysisData.logistics?.transfers || []).length} Transfers
            </div>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span>View Routes & ROI</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      )}

      {/* Coordinated Decision Matrix by Store */}
      {analysisData?.stores && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              🏢 Coordinated Store Decisions (Approved by Boss AI)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Click any agent button to inspect specific models
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {Object.keys(analysisData.stores).map((storeId) => {
              const s = analysisData.stores[storeId];
              const storeInfo = s.store || {};
              const pricing = s.pricing || {};
              const inventory = s.inventory || {};
              const negotiations = s.negotiation_history || [];

              // Count actions
              let priceChanges = 0;
              let stockFlags = 0;
              Object.values(pricing).forEach(p => { if (p.action !== 'hold') priceChanges++; });
              Object.values(inventory).forEach(inv => { if (inv.flag) stockFlags++; });

              return (
                <div key={storeId} style={{
                  background: 'white',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                        {storeInfo.store_name} ({storeInfo.store_id})
                      </h4>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {storeInfo.products?.length || 0} Products Managed
                      </div>
                    </div>
                    {storeInfo.festival_in_3_days && (
                      <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        🎉 Festival In 3 Days
                      </span>
                    )}
                  </div>

                  {negotiations.length > 0 && (
                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#5b21b6' }}>Boss AI Intervention:</div>
                      {negotiations.map((n, i) => (
                        <div key={i} style={{ fontSize: '11.5px', color: '#4c1d95', marginTop: '2px' }}>
                          • {n.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Pricing Decisions</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                        {priceChanges} Adjusted • {Object.keys(pricing).length - priceChanges} Held
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Risk Alerts</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: stockFlags > 0 ? '#dc2626' : '#059669', marginTop: '2px' }}>
                        {stockFlags > 0 ? `⚠️ ${stockFlags} Flagged` : '✅ All Stock Safe'}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Jump Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onNavigateToPage && onNavigateToPage('data-ai')}
                      style={{ flex: 1, padding: '6px', fontSize: '11.5px', fontWeight: 600, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Analyst
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToPage && onNavigateToPage('pricing-ai')}
                      style={{ flex: 1, padding: '6px', fontSize: '11.5px', fontWeight: 600, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Pricing
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToPage && onNavigateToPage('inventory-ai')}
                      style={{ flex: 1, padding: '6px', fontSize: '11.5px', fontWeight: 600, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToPage && onNavigateToPage('logistics-ai')}
                      style={{ flex: 1, padding: '6px', fontSize: '11.5px', fontWeight: 600, background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Logistics
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}




      {/* BOSS AI CHAT INTERFACE */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        marginTop: '8px'
      }}>
        <div style={{
          background: '#1e1b4b',
          color: 'white',
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '50%' }}>
            <MessageSquare size={20} color="white" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>Chat with Boss AI</h4>
            <div style={{ fontSize: '12px', color: '#a5b4fc', marginTop: '2px' }}>Ask questions about the decision or data from the 4 agents</div>
          </div>
        </div>


        <div style={{
          padding: '20px',
          height: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: '#f8fafc'
        }}>
          {chatMessages.length === 0 && (
            <div style={{
              background: 'white',
              border: '2px dashed #cbd5e1',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              margin: 'auto'
            }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '50%', marginBottom: '10px' }}>
                <Upload size={22} color="#4f46e5" />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Upload JSON, CSV, or Business Data File
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                The user data will be dispatched across all AI agents and synthesized into RAG for an executive verdict.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Choose File (.json, .csv)
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept=".json,.csv,.txt,image/*,.pdf,.xlsx,.doc,.docx"
              />
            </div>
          )}
          {chatMessages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                background: msg.sender === 'user' ? '#e2e8f0' : '#4f46e5',
                color: msg.sender === 'user' ? '#334155' : 'white',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {msg.sender === 'user' ? <User size={16} /> : <Crown size={16} />}
              </div>
              <div style={{
                background: msg.sender === 'user' ? 'white' : '#eff6ff',
                border: `1px solid ${msg.sender === 'user' ? '#e2e8f0' : '#bfdbfe'}`,
                padding: '14px 18px',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'boss' ? '4px' : '16px',
                maxWidth: '82%',
                fontSize: '13.5px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                color: 'var(--text-primary)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {msg.attachment && (
                  <div style={{ marginBottom: msg.text ? '8px' : '0', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {msg.attachment.isImage ? (
                       <img src={msg.attachment.url} alt="attached" style={{ maxWidth: '100%', borderRadius: '4px', maxHeight: '150px', objectFit: 'contain' }} />
                    ) : (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                         <FileText size={14} />
                         {msg.attachment.name}
                       </div>
                    )}
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form 
          onSubmit={handleSendMessage}
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            background: 'white',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          {attachedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', width: 'fit-content' }}>
               <FileText size={14} color="#64748b" />
               <span style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>{attachedFile.name}</span>
               <button type="button" onClick={removeAttachment} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                 <X size={14} color="#ef4444" />
               </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach JSON, CSV, or document"
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                padding: '0 12px',
                height: '43px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
            >
              <Upload size={18} />
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Boss AI or paste store data JSON/CSV..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '0 20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
                height: '43px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4338ca'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4f46e5'}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
