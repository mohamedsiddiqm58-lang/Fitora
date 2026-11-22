import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Sparkles,
  Send,
  X,
  Volume2,
  VolumeX,
  AlertOctagon,
  RefreshCw,
  User,
  ShieldCheck,
  Bot
} from 'lucide-react';

export default function AICompanionModal({ isOpen, onClose }) {
  const { user, category, seniorMode, tier } = useAuth();
  const { showToast } = useNotification();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const res = await api.get('/ai/conversations');
      if (res.success && res.conversation) {
        setConversationId(res.conversation.id);
        setMessages(res.conversation.messages || []);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setInput('');
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      senderRole: 'user',
      messageContent: text
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post('/ai/message', {
        message: text,
        conversationId
      });

      if (res.success && res.aiMessage) {
        setMessages((prev) => [...prev, res.aiMessage]);
        if (res.isEmergencyWarning) {
          showToast('Medical safety alert detected. Please seek immediate assistance if unwell.', 'error', 7000);
        }
      }
    } catch (err) {
      showToast(err.message || 'AI message processing error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech reader is not supported on this browser.', 'info');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = seniorMode ? 0.85 : 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!isOpen) return null;

  const quickPrompts = {
    ATHLETE: [
      'Summarize my progress & recovery',
      'What should my pre-workout meal be?',
      'How to optimize sprint acceleration?',
      'Check my water intake today'
    ],
    SENIOR: [
      'Read my daily health progress',
      'Gentle knee exercises for joint comfort',
      'Healthy light dinner suggestion',
      'Check my water intake today'
    ],
    GYM_FREAK: [
      'Hypertrophy rep ranges for chest growth',
      'How much protein do I need today?',
      'Summarize my habit streak',
      'Check my water intake today'
    ],
    NORMAL: [
      'Summarize my daily progress',
      'Suggest a 20-min beginner workout',
      'Wholesome low-calorie snack ideas',
      'Check my water intake today'
    ]
  };

  const chips = quickPrompts[category] || quickPrompts.NORMAL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[90vh] max-h-[700px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-gradient-to-r from-[#176B4D] to-[#2FA878] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg brand-font">Fitora AI Companion</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {tier}
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Contextual Health & Habit Coaching</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (messages.length > 0) {
                  const lastAssistant = [...messages].reverse().find(m => m.senderRole === 'assistant');
                  if (lastAssistant) speakText(lastAssistant.messageContent);
                }
              }}
              className="p-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10"
              title="Voice Read Out"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5 text-amber-300" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Medical disclaimer strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-500 text-center">
          Companion guidance only. For acute conditions or medication changes, always consult your physician.
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8FAF9]">
          {messages.map((msg, idx) => {
            const isUser = msg.senderRole === 'user';
            const isEmergency = msg.messageContent?.includes('IMPORTANT HEALTH WARNING') || msg.messageContent?.includes('🚨');

            return (
              <div
                key={msg.id || idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#2FA878] text-white rounded-tr-none'
                      : isEmergency
                      ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-tl-none font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.messageContent}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs italic">
              <Bot className="w-5 h-5 text-emerald-600 animate-spin" />
              <span>Analyzing your health context & preparing response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              category === 'SENIOR'
                ? 'Ask your health companion in gentle words...'
                : 'Ask about workouts, meals, recovery, hydration...'
            }
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-[#2FA878] hover:bg-[#176B4D] disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
