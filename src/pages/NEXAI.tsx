import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { Sparkles, Send, User, Copy, RotateCcw, ArrowRight, Activity, ShoppingBag } from 'lucide-react';
import Markdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  recommendations?: { id: string; reason: string }[];
}

const SUGGESTIONS = [
  "Build Muscle",
  "Improve Recovery",
  "Which Protein?",
  "Best Creatine",
  "Athlete Stack",
  "Compare Products"
];

export function NEXAI() {
  const { user } = useAuth();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const chatHistory = [...messages, newUserMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const API_URL =
      import.meta.env.VITE_API_URL || "http://localhost:3000";

      const res = await fetch(`${API_URL}/api/nexai/chat`, {
       method: "POST",
      headers: {
    "Content-Type": "application/json",
      },
      body: JSON.stringify({
    messages: chatHistory,
    userId: user?.id,
     }),
    });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      let aiResponseText = data.response;
      let recs = [];
      try {
        const parsed = JSON.parse(data.response);
        aiResponseText = parsed.response;
        recs = parsed.recommended_products || [];
      } catch (e) {
        // Fallback to raw response if not JSON
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponseText,
        recommendations: recs
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I'm sorry, I encountered an error connecting to my servers. Please try again later."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputSubmit(e as any);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerateResponse = () => {
    if (messages.length === 0) return;
    
    // Find last user message
    const lastUserMsgIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIdx === -1) return;
    
    const actualIdx = messages.length - 1 - lastUserMsgIdx;
    const lastUserMsg = messages[actualIdx];
    
    // Remove everything after the last user message
    setMessages(prev => prev.slice(0, actualIdx));
    sendMessage(lastUserMsg.content);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pt-20">
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-black text-white rounded-2xl mb-4 shadow-lg shadow-black/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-[#111111] uppercase tracking-tight">NEXAI</h1>
          <p className="text-gray-500 mt-2 font-medium">Your personal sports nutrition assistant.</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border border-[#eaeaea] rounded-[32px] shadow-sm flex flex-col overflow-hidden relative">
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6"
              >
                <div className="bg-gray-50 border border-gray-100 p-8 rounded-3xl max-w-md">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                    👋 Hi! I'm NEXAI.
                  </h2>
                  <p className="text-gray-600 mb-4">Your personal sports nutrition assistant.</p>
                  <p className="text-gray-600 mb-2 font-semibold">I can help you with:</p>
                  <ul className="text-left text-gray-600 space-y-2 mb-6">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#f47c20] rounded-full"></div> Product recommendations</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#f47c20] rounded-full"></div> Supplement timing</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#f47c20] rounded-full"></div> Athlete nutrition</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#f47c20] rounded-full"></div> Performance guidance</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#f47c20] rounded-full"></div> Recovery advice</li>
                  </ul>
                  <p className="text-gray-800 font-bold">How can I help you today?</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#111111] hover:text-[#111111] transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'ai' ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className={`p-4 rounded-2xl text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-[#111111] text-white rounded-tr-none' : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none prose prose-sm max-w-none'}`}>
                        {msg.role === 'ai' ? (
                           <div className="markdown-body">
                             
                            <Markdown>{msg.content}</Markdown>
                            {msg.recommendations && msg.recommendations.length > 0 && (
                              <div className="mt-6 space-y-4">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-[#f47c20]" />
                                  Recommended Athlete Stack
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {msg.recommendations.map((rec: any, idx: number) => {
                                    const product = products.find((p: any) => p.id === rec.id);
                                    if (!product) return null;
                                    return (
                                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col hover:border-[#111111] transition-colors">
                                        <div className="flex gap-3">
                                          <div className="w-16 h-16 bg-gray-50 rounded-lg p-2 shrink-0 border border-gray-100">
                                            <img src={product.image1 || product.image || ''} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-bold text-[#111111] text-[14px] line-clamp-1">{product.name}</h5>
                                            <p className="text-[11px] text-gray-500 line-clamp-1 mb-1">{product.short_description}</p>
                                            <div className="flex items-center gap-2">
                                              <span className="font-black text-[#111111] text-[13px]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.sale_price || product.price)}</span>
                                              {product.sale_price && <span className="text-[10px] text-gray-400 line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}</span>}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                          <p className="text-[12px] text-gray-700 italic line-clamp-2">"{rec.reason}"</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <button 
                                  onClick={() => {
                                    msg.recommendations!.forEach((rec: any) => {
                                      const p = products.find((prod: any) => prod.id === rec.id);
                                      if (p) {
                                        addToCart(p, 1, false);
                                      }
                                    });
                                  }}
                                  className="w-full py-2.5 bg-[#111111] text-white font-bold text-sm rounded-xl hover:bg-gray-900 transition-colors shadow-md mt-2 flex items-center justify-center gap-2"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  Add Recommended Stack to Cart
                                </button>
                              </div>
                            )}
  
                           </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      
                      {/* Action buttons for AI messages */}
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                          <button 
                            onClick={() => copyToClipboard(msg.id, msg.content)}
                            className="text-gray-400 hover:text-[#111111] flex items-center gap-1 text-xs font-medium"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedId === msg.id ? 'Copied!' : 'Copy'}
                          </button>
                          {i === messages.length - 1 && (
                            <button 
                              onClick={regenerateResponse}
                              className="text-gray-400 hover:text-[#111111] flex items-center gap-1 text-xs font-medium ml-2"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Regenerate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="max-w-[80%] flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[#111111] text-white mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-none flex items-center gap-1.5 h-[52px]">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#eaeaea] bg-white">
            <form onSubmit={handleInputSubmit} className="relative flex items-end gap-3 max-w-4xl mx-auto">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NEXAI anything..."
                className="flex-1 bg-gray-50 border border-[#eaeaea] rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all resize-none min-h-[52px] max-h-[150px] custom-scrollbar"
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-[#f47c20] text-white p-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d96a17] transition-colors shadow-sm shadow-[#f47c20]/20 flex-shrink-0 h-[52px] w-[52px] flex items-center justify-center"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
            <div className="text-center mt-2">
              <p className="text-[11px] text-gray-400 font-medium">NEXAI can make mistakes. Verify important information.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
