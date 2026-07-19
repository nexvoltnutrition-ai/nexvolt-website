import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, Send, User, Copy, RotateCcw, X, MessageSquare, Activity, ShoppingBag, Mic, MicOff, ThumbsUp, ThumbsDown, Download, History, Trash2, Edit2, Search } from 'lucide-react';
import Markdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  recommendations?: { id: string; reason: string }[];
  follow_ups?: string[];
  cross_sell?: { id: string; reason: string }[];
  feedback?: 'up' | 'down';
}

const SUGGESTIONS = [
  "Build Muscle",
  "Improve Recovery"
];

export function NEXAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { user } = useAuth();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const [pastConvos, setPastConvos] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
  if (!isOpen || !chatContainerRef.current) return;

  requestAnimationFrame(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  });
}, [messages, isTyping]);

  useEffect(() => {
    if (user && isOpen && isHistoryOpen) {
      fetchHistory();
    }
  }, [user, isOpen, isHistoryOpen]);

  const fetchHistory = async () => {
    if (!user) return;
    const { data } = await supabase.from('nexai_conversations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setPastConvos(data);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };
    recognition.onend = () => setIsListening(false);
    
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleFeedback = async (msgId: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: type } : m));
    if (user) {
      try {
        await supabase.from('nexai_feedback').insert({
          message_id: msgId,
          user_id: user.id,
          is_helpful: type === 'up'
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const exportPDF = () => {
    let html = '<html><head><title>NEXAI Conversation</title><style>body{font-family:sans-serif;padding:20px;} .user{color:blue;} .ai{color:black;}</style></head><body>';
    html += '<h2>NEXAI Conversation Export</h2><hr/>';
    messages.forEach(m => {
      html += `<p class="${m.role}"><strong>${m.role === 'user' ? 'You' : 'NEXAI'}:</strong> ${m.content}</p>`;
    });
    html += '</body></html>';
    
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const executeAction = (action: any) => {
    if (action.type === 'ADD_TO_CART' && action.payload?.productId) {
      const p = products.find((prod: any) => prod.id === action.payload.productId);
      if (p) addToCart(p, action.payload.quantity || 1, false);
    }
    if (action.type === 'NAVIGATE' && action.payload?.path) {
      navigate(action.payload.path);
    }
  };

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: chatHistory, 
          userId: user?.id,
          pageContext: location.pathname
        })
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      
      let aiResponseText = data.response;
      let recs = [];
      let followUps = [];
      let crossSell = [];
      
      try {
        const parsed = JSON.parse(data.response);
        aiResponseText = parsed.response;
        recs = parsed.recommended_products || [];
        followUps = parsed.follow_up_questions || [];
        crossSell = parsed.cross_sell_products || [];
        
        if (parsed.actions) {
           parsed.actions.forEach(executeAction);
        }
      } catch (e) {
        // Fallback
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponseText,
        recommendations: recs,
        follow_ups: followUps,
        cross_sell: crossSell
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
    const lastUserMsgIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIdx === -1) return;
    const actualIdx = messages.length - 1 - lastUserMsgIdx;
    const lastUserMsg = messages[actualIdx];
    setMessages(prev => prev.slice(0, actualIdx));
    sendMessage(lastUserMsg.content);
  };
  
  const deleteHistory = async (id: string) => {
    await supabase.from("nexai_conversations").delete().eq("id", id);
    fetchHistory();
  };
  
  const renameHistory = async (id: string) => {
     const newName = prompt("Enter new name:");
     if (newName) {
        await supabase.from("nexai_conversations").update({ name: newName }).eq("id", id);
        fetchHistory();
     }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[#111111] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
           className="fixed inset-0 bg-white z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="bg-[#111111] p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px] leading-tight uppercase tracking-wide">NEXAI</h3>
                  <p className="text-[11px] text-gray-400 font-medium">Sports Nutrition Assistant</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportPDF}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Export Chat"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {isHistoryOpen ? (
               <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
                 <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><History className="w-4 h-4" /> Conversation History</h4>
                 <div className="relative mb-4">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search history..." 
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg"
                      value={searchHistory}
                      onChange={(e) => setSearchHistory(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    {pastConvos.filter(c => (c.name || c.summary || '').toLowerCase().includes(searchHistory.toLowerCase())).map(c => (
                       <div key={c.id} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center hover:border-gray-300">
                          <div className="flex-1 min-w-0 mr-2 cursor-pointer" onClick={() => { setMessages(c.messages || []); setIsHistoryOpen(false); }}>
                             <p className="text-sm font-bold truncate text-gray-900">{c.name || c.summary || 'Chat Session'}</p>
                             <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                             <button onClick={() => renameHistory(c.id)} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                             <button onClick={() => deleteHistory(c.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                       </div>
                    ))}
                    {pastConvos.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No past conversations.</p>}
                 </div>
               </div>
            ) : (
            <>
            {/* Chat Area */}
            <div  ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar relative"
>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
                  <div className="w-12 h-12 bg-[#111111] text-white rounded-2xl flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">👋 Hi! I'm NEXAI.</h4>
                  <p className="text-[13px] text-gray-500 max-w-[250px]">Your personal sports nutrition assistant. How can I help you today?</p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[12px] font-medium text-gray-700 hover:border-[#111111] hover:text-[#111111] transition-colors shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'ai' ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {msg.role === 'ai' ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      
                      <div className="flex flex-col gap-1 w-full min-w-0">
                        <div className={`p-3 rounded-2xl text-[14px] leading-relaxed ${msg.role === 'user' ? 'bg-[#111111] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm prose prose-sm max-w-none'}`}>
                          {msg.role === 'ai' ? (
                             <div className="markdown-body text-[14px]">
                               
                            <Markdown>{msg.content}</Markdown>

                            {msg.recommendations && msg.recommendations.length > 0 && (
                              <div className="mt-6 space-y-4">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-[#f47c20]" />
                                  Recommended Stack
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                  {msg.recommendations.map((rec: any, idx: number) => {
                                    const product = products.find((p: any) => p.id === rec.id);
                                    if (!product) return null;
                                    return (
                                      <div key={idx} onClick={() => navigate(`/product/${product.id}`)} className="bg-white border border-gray-200 cursor-pointer rounded-xl p-3 shadow-sm flex flex-col hover:border-[#111111] transition-colors">
                                        <div className="flex gap-3">
                                          <div className="w-16 h-16 bg-gray-50 rounded-lg p-2 shrink-0 border border-gray-100">
                                            <img src={product.image1 || product.image || ''} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-bold text-[#111111] text-[14px] line-clamp-1">{product.name}</h5>
                                            <div className="flex items-center gap-2 mt-1">
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
                                  Add Recommended Stack
                                </button>
                              </div>
                            )}
                            
                            {msg.cross_sell && msg.cross_sell.length > 0 && (
                                <div className="mt-4 p-3 bg-[#f8f9fa] rounded-xl border border-[#eaeaea]">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Frequently Paired With</h4>
                                  <div className="space-y-2">
                                     {msg.cross_sell.map((cs: any, idx: number) => {
                                        const p = products.find((prod: any) => prod.id === cs.id);
                                        if (!p) return null;
                                        return (
                                           <div key={idx} onClick={() => navigate(`/product/${p.id}`)} className="flex items-center gap-3 cursor-pointer group/cs">
                                              <img src={p.image1 || p.image || ''} alt={p.name} className="w-10 h-10 rounded border mix-blend-multiply bg-white object-contain p-1" />
                                              <div className="flex-1">
                                                 <p className="text-[13px] font-bold text-gray-900 group-hover/cs:text-blue-600 line-clamp-1">{p.name}</p>
                                                 <p className="text-[11px] text-gray-500 line-clamp-1">{cs.reason}</p>
                                              </div>
                                           </div>
                                        );
                                     })}
                                  </div>
                                </div>
                            )}

                               </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        
                        {msg.role === 'ai' && (
                          <div className="flex flex-col mt-2">
                             {msg.follow_ups && msg.follow_ups.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                   {msg.follow_ups.map((fu, fidx) => (
                                      <button key={fidx} onClick={() => sendMessage(fu)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-[11px] font-medium hover:border-[#111111] hover:text-[#111111] transition-colors shadow-sm">{fu}</button>
                                   ))}
                                </div>
                             )}
                          
                            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity px-1">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleFeedback(msg.id, 'up')}
                                  className={`text-gray-400 hover:text-green-600 flex items-center gap-1 text-[11px] font-medium ${msg.feedback === 'up' ? 'text-green-600' : ''}`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(msg.id, 'down')}
                                  className={`text-gray-400 hover:text-red-600 flex items-center gap-1 text-[11px] font-medium ${msg.feedback === 'down' ? 'text-red-600' : ''}`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => copyToClipboard(msg.id, msg.content)}
                                  className="text-gray-400 hover:text-[#111111] flex items-center gap-1 text-[11px] font-medium"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedId === msg.id ? 'Copied' : 'Copy'}
                                </button>
                                {i === messages.length - 1 && (
                                  <button 
                                    onClick={regenerateResponse}
                                    className="text-gray-400 hover:text-[#111111] flex items-center gap-1 text-[11px] font-medium ml-1"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    Retry
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="max-w-[80%] flex gap-2">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-[#111111] text-white mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-gray-200 rounded-tl-none shadow-sm flex items-center gap-1.5 h-[46px]">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
           <div className="border-t border-gray-200 bg-white p-4 shrink-0">
              <form onSubmit={handleInputSubmit} className="relative flex items-end gap-2">
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-2.5 rounded-xl transition-colors shrink-0 h-[44px] w-[44px] flex items-center justify-center ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask NEXAI..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-[14px] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all resize-none min-h-[48px] max-h-[140px] custom-scrollbar"
                  rows={1}
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-[#f47c20] text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d96a17] transition-colors shadow-sm flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
