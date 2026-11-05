import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  RotateCcw,
  Truck,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { aiService } from '../services/aiService';

export const AIChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your Myntra Pro AI Fashion Concierge. How can I assist you with your wardrobe, order tracking, or styling today?',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Track Order', query: 'How do I track my active order?' },
    { label: 'Returns & Exchange', query: 'What is the return and refund policy?' },
    { label: 'Delivery & Shipping', query: 'How much are the delivery charges?' },
    { label: 'Promo Coupons', query: 'Are there any discount coupon codes available?' },
  ];

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await aiService.chatSupport(text, history);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply || 'I am here to help you find the best fashion styles.',
          source: res.aiSource,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Our AI Concierge is momentarily busy. You can also reach our 24x7 support team at support@myntrapro.com or 1800-419-3500.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        height: 560,
        maxHeight: 'calc(100vh - 48px)',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        border: '1px solid rgba(255, 63, 108, 0.2)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #282c3f 0%, #ff3f6c 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              AI Fashion Concierge
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Online • Instant Smart Assistance</div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}
          aria-label="Close AI Chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          backgroundColor: '#f9f9fb',
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 14px',
                borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                backgroundColor: m.role === 'user' ? 'var(--primary)' : '#ffffff',
                color: m.role === 'user' ? '#ffffff' : 'var(--dark)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                boxShadow: m.role === 'user' ? '0 2px 8px rgba(255, 63, 108, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.05)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.text}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4, padding: '0 4px' }}>
              {m.time}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: '0.82rem' }}>
            <Sparkles size={14} className="animate-spin" color="var(--primary)" />
            <span>AI Concierge is curating your response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--border)',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: 20,
              border: '1px solid rgba(255, 63, 108, 0.3)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px',
          borderTop: '1px solid var(--border)',
          backgroundColor: '#ffffff',
        }}
      >
        <input
          type="text"
          placeholder="Ask AI: 'Track order', 'Find blue shirts'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 24,
            border: '1px solid var(--border)',
            fontSize: '0.88rem',
            backgroundColor: '#f5f5f6',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: input.trim() && !loading ? 'var(--primary)' : '#e0e0e0',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.15s ease',
            flexShrink: 0,
          }}
          aria-label="Send Message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
