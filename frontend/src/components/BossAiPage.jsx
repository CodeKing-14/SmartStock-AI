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
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function BossAiPage({ onTriggerToast }) {


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
        url: fileUrl
      });
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !attachedFile) return;

    const newMessages = [...chatMessages, { 
      sender: 'user', 
      text: chatInput,
      attachment: attachedFile
    }];
    setChatMessages(newMessages);
    setChatInput('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      let reply = "Based on the combined data from Data, Pricing, Inventory, and Logistics AIs, the consensus is clear: shifting the inventory is the optimal move.";
      const lowerInput = chatInput.toLowerCase();
      
      if (lowerInput.includes('why') || lowerInput.includes('reason')) {
        reply = "Warehouse B has a +160% demand spike and will run out in 2 days. Warehouse A has 500 packets (excess). Moving 150 packets ensures we meet demand and capture a $120/packet margin.";
      } else if (lowerInput.includes('cost') || lowerInput.includes('freight') || lowerInput.includes('logistics')) {
        reply = "The Logistics AI confirmed Van #4 is available. It costs $75 and takes 2 hours. This is negligible compared to the $18,000 potential loss if we do nothing.";
      } else if (lowerInput.includes('pricing') || lowerInput.includes('margin') || lowerInput.includes('profit')) {
        reply = "Pricing AI confirmed a locked price of $120 per packet. Since competitors are sold out, we maintain a 45% profit margin ($54 profit per packet).";
      } else if (lowerInput.includes('inventory') || lowerInput.includes('stock')) {
        reply = "Inventory AI audited our levels: Warehouse A has 500 units (60 days supply), while B has only 20 units. Shifting 150 units balances our network without risking A's fulfillment.";
      } else if (lowerInput.includes('data') || lowerInput.includes('demand') || lowerInput.includes('trend')) {
        reply = "Data Analyst AI detected a +160% demand spike in Warehouse B's territory due to a local trend. We must act now to capture this demand before competitors restock.";
      } else if (lowerInput.includes('pdf')) {
        reply = "You can download this entire analysis as a PDF using the 'Download PDF' button at the top of the page!";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        reply = "Hello! I'm here to explain the final decision. What would you like to know about the strategy?";
      }

      if (attachedFile) {
        reply += ` (I've also received your attached file: ${attachedFile.name}. My visual analysis confirms the previous assessments.)`;
      }

      setChatMessages(prev => [...prev, { sender: 'boss', text: reply }]);
    }, 1000);
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
              Final Coordinated Decision
            </h1>
            <p style={{ fontSize: '13.5px', color: '#c7d2fe', maxWidth: '680px', lineHeight: 1.5, margin: 0 }}>
              The Boss AI reviews reports from all 4 specialized AIs and produces one clear operational decision: Shift 150 packets from Warehouse A to Warehouse B.
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
              <div style={{ fontSize: '11px', color: '#e0e7ff', marginTop: '2px' }}>4 of 4 AIs Voting YES</div>
            </div>
          </div>
        </div>
      </div>




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
                Upload CSV, Excel, PDF, or other business data files
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Let Boss AI analyze the uploaded file along with the results from the 4 AI agents.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept="image/*,.pdf,.csv,.xlsx,.doc,.docx"
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
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'boss' ? '4px' : '16px',
                maxWidth: '75%',
                fontSize: '14px',
                lineHeight: 1.5,
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Boss AI about costs, margins, inventory..."
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
