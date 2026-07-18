import React, { useState, useEffect } from 'react';
import { 
  Zap, Save, RefreshCw, Activity, MessageSquare, Database, Shield, AlertTriangle, 
  Settings, LineChart, Search, Trash2, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Mock data for analytics
const ANALYTICS_DATA = {
  totalConversations: 1245,
  activeUsers: 84,
  avgResponseTime: "1.2s",
  totalRecommendations: 342,
  totalAddCart: 156,
  status: "Online"
};

export function AdminNEXAI() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({
    ai_enabled: true,
    welcome_message: "Hi! I'm NEXAI. Your personal sports nutrition assistant.",
    system_prompt: "You are NEXAI, a professional sports nutrition coach...",
    brand_tone: "Professional, concise, friendly",
    temperature: 0.7,
    max_tokens: 2048,
    gemini_model: "gemini-3.1-pro-preview",
    suggested_questions: ["Build Muscle", "Improve Recovery", "Which Protein?"],
    blocked_words: ["steroids", "sarms"],
    restricted_topics: ["medical diagnosis", "illegal substances"],
    medical_disclaimer: "Consult a healthcare professional for medical advice.",
    safety_toggles: { medical: true, competitors: true }
  });
  
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchConversations();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('nexai_settings')
        .select('*')
        .single();
      
      if (data) {
        setSettings(data);
      }
    } catch (e) {
      console.log('Using default settings (table might not exist yet)');
    }
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('nexai_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) {
        setConversations(data);
      } else {
        // Mock data
        setConversations([
          { id: '1', user_id: 'User-A', summary: 'Looking for protein recommendations', created_at: new Date().toISOString(), messages: [] },
          { id: '2', user_id: 'User-B', summary: 'Asking about creatine loading', created_at: new Date(Date.now() - 86400000).toISOString(), messages: [] }
        ]);
      }
    } catch (e) {
      console.log('Using default conversations');
      setConversations([
        { id: '1', user_id: 'User-A', summary: 'Looking for protein recommendations', created_at: new Date().toISOString(), messages: [] },
        { id: '2', user_id: 'User-B', summary: 'Asking about creatine loading', created_at: new Date(Date.now() - 86400000).toISOString(), messages: [] }
      ]);
    }
  };

  const refreshKnowledgeBase = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/nexai/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Knowledge base refreshed successfully!');
      } else {
        alert('Failed to refresh knowledge base.');
      }
    } catch (e) {
      console.error(e);
      alert('Error refreshing knowledge base.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('nexai_settings').select('id').single();
      if (existing) {
        await supabase.from('nexai_settings').update(settings).eq('id', existing.id);
      } else {
        await supabase.from('nexai_settings').insert([settings]);
      }
      
      // Also save prompt history
      await supabase.from('nexai_prompt_history').insert([{
        prompt_text: settings.system_prompt,
        version: Date.now()
      }]);
      
      alert('Settings saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save. Note: Supabase tables might need to be created first.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#f47c20]" />
            NEXAI Control Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage AI settings, prompts, and view analytics.</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={loading}
          className="bg-[#111111] text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: Activity },
          { id: 'settings', name: 'AI Settings', icon: Settings },
          { id: 'prompt', name: 'Prompt Editor', icon: MessageSquare },
          { id: 'knowledge', name: 'Knowledge Base', icon: Database },
          { id: 'logs', name: 'Conversations', icon: Search },
          { id: 'analytics', name: 'Analytics', icon: LineChart },
          { id: 'safety', name: 'Safety Controls', icon: Shield },
          { id: 'maintenance', name: 'Maintenance', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#111111] text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Conversations</p>
                  <h3 className="text-3xl font-black text-[#111111]">{ANALYTICS_DATA.totalConversations}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[12px] font-medium text-green-600 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded-md">
                +12% this week
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1">Average Satisfaction</p>
                  <h3 className="text-3xl font-black text-[#111111]">92%</h3>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[12px] font-medium text-green-600 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded-md">
                +3% this week
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1">Feedback Score</p>
                  <h3 className="text-3xl font-black text-[#111111]">4.8/5</h3>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[12px] font-medium text-purple-600 flex items-center gap-1 bg-purple-50 w-fit px-2 py-1 rounded-md">
                Based on 430 ratings
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1">Daily Usage</p>
                  <h3 className="text-3xl font-black text-[#111111]">145</h3>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                  <LineChart className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[12px] font-medium text-orange-600 flex items-center gap-1 bg-orange-50 w-fit px-2 py-1 rounded-md">
                Monthly: 4,350
              </div>
            </div>
          </div>
          
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h4 className="font-bold text-gray-900 mb-4">Most Asked Questions</h4>
               <div className="space-y-3">
                 {[
                   { q: "What's the best protein for cutting?", count: 124 },
                   { q: "How much creatine should I take?", count: 98 },
                   { q: "Pre-workout vs. Energy drinks", count: 75 },
                   { q: "Do you have vegan options?", count: 62 },
                   { q: "When to take BCAAs?", count: 41 }
                 ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm font-medium text-gray-800">{item.q}</p>
                      <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-gray-200">{item.count}</span>
                    </div>
                 ))}
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h4 className="font-bold text-gray-900 mb-4">Most Recommended Products</h4>
               <div className="space-y-3">
                 {[
                   { p: "NEXVOLT Whey Isolate", count: 210 },
                   { p: "Creatine Monohydrate", count: 185 },
                   { p: "Pre-Workout Surge", count: 142 },
                   { p: "Hydration Plus", count: 95 },
                   { p: "Recovery BCAAs", count: 78 }
                 ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-sm font-medium text-gray-800">{item.p}</p>
                      <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-gray-200">{item.count} times</span>
                    </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h4 className="font-bold text-gray-900 mb-4">Conversation Trends</h4>
             <div className="h-64 flex items-end gap-2 pt-4">
                {/* Mock bar chart */}
                {[40, 60, 45, 80, 55, 90, 75, 100, 85, 120, 95, 110].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg flex items-end justify-center group relative h-full">
                     <div className="w-full bg-[#111111] rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                     <div className="absolute -top-8 bg-[#111111] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        ${Math.floor(h * 1.5)} queries
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h4 className="font-bold text-gray-900">General Settings</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">Enable AI Assistant</p>
                <p className="text-sm text-gray-500">Toggle the assistant on or off.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.ai_enabled} onChange={(e) => setSettings({...settings, ai_enabled: e.target.checked})} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f47c20]"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gemini Model</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#f47c20] focus:border-[#f47c20]"
                  value={settings.gemini_model}
                  onChange={(e) => setSettings({...settings, gemini_model: e.target.value})}
                >
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Recommended)</option>
                  <option value="gemini-2.5-pro-latest">Gemini 2.5 Pro</option>
                  <option value="gemini-2.5-flash-latest">Gemini 2.5 Flash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature ({settings.temperature})</label>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={settings.temperature}
                  onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                />
                <p className="text-xs text-gray-500 mt-1">Lower is more precise, higher is more creative.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                <input 
                  type="text" 
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({...settings, welcome_message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#f47c20] focus:border-[#f47c20]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Tone</label>
                <input 
                  type="text" 
                  value={settings.brand_tone}
                  onChange={(e) => setSettings({...settings, brand_tone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#f47c20] focus:border-[#f47c20]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Questions (Comma separated)</label>
                <input 
                  type="text" 
                  value={settings.suggested_questions.join(', ')}
                  onChange={(e) => setSettings({...settings, suggested_questions: e.target.value.split(',').map((s: string) => s.trim())})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#f47c20] focus:border-[#f47c20]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">System Prompt Editor</h2>
              <button className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                Restore Previous Version
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">This defines the core behavior and rules for NEXAI.</p>
            <textarea 
              value={settings.system_prompt}
              onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
              className="w-full h-[400px] p-4 border border-gray-300 rounded-lg focus:ring-[#f47c20] focus:border-[#f47c20] font-mono text-sm leading-relaxed"
            ></textarea>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Knowledge Base Sources</h2>
            <div className="space-y-4 max-w-2xl">
              {[
                { name: 'Products Catalog', status: 'Synced', time: '10 mins ago', active: true },
                { name: 'Categories & Sports', status: 'Synced', time: '1 hour ago', active: true },
                { name: 'FAQ Database', status: 'Pending', time: '-', active: false },
                { name: 'Shipping Policies', status: 'Synced', time: '1 day ago', active: true },
                { name: 'Return Policy', status: 'Synced', time: '1 day ago', active: true }
              ].map((src, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Database className={`w-5 h-5 ${src.active ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">{src.name}</p>
                      <p className="text-xs text-gray-500">Last sync: {src.time}</p>
                    </div>
                  </div>
                  <button onClick={refreshKnowledgeBase} disabled={loading} className="text-sm text-blue-600 font-medium hover:underline disabled:opacity-50">Sync Now</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Conversation Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="pb-3 font-medium px-4">Date</th>
                    <th className="pb-3 font-medium px-4">User ID</th>
                    <th className="pb-3 font-medium px-4">Summary</th>
                    <th className="pb-3 font-medium px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {conversations.map((conv) => (
                    <tr key={conv.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{new Date(conv.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-mono text-gray-500 text-xs">{conv.user_id.substring(0,8)}...</td>
                      <td className="py-3 px-4 text-gray-900">{conv.summary}</td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-[#f47c20] hover:bg-orange-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-4">Top Asked Topics</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm"><span className="text-gray-600">Protein Recommendations</span> <span className="font-medium">45%</span></li>
                  <li className="flex justify-between items-center text-sm"><span className="text-gray-600">Weight Loss Advice</span> <span className="font-medium">22%</span></li>
                  <li className="flex justify-between items-center text-sm"><span className="text-gray-600">Creatine Usage</span> <span className="font-medium">18%</span></li>
                  <li className="flex justify-between items-center text-sm"><span className="text-gray-600">Order Tracking</span> <span className="font-medium">15%</span></li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-4">Most Recommended Products</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm"><span className="text-gray-600">100% Whey Gold Standard</span> <span className="font-medium">124 times</span></li>
                  <li className="flex justify-between items-center text-sm"><span className="text-gray-600">Micronized Creatine</span> <span className="font-medium">98 times</span></li>
                  <li className="flex justify-between items-center text-sm"><span className="text-gray-600">BCAA 5000 Powder</span> <span className="font-medium">65 times</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Safety Controls</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">Medical Advice Filter</h3>
                  <p className="text-sm text-gray-500">Automatically deflect medical and diagnosis queries.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.safety_toggles?.medical} onChange={(e) => setSettings({...settings, safety_toggles: {...settings.safety_toggles, medical: e.target.checked}})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f47c20]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">Competitor Brand Filter</h3>
                  <p className="text-sm text-gray-500">Prevent AI from mentioning competitor brands.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.safety_toggles?.competitors} onChange={(e) => setSettings({...settings, safety_toggles: {...settings.safety_toggles, competitors: e.target.checked}})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f47c20]"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blocked Words (Comma separated)</label>
                <input 
                  type="text" 
                  value={settings.blocked_words.join(', ')}
                  onChange={(e) => setSettings({...settings, blocked_words: e.target.value.split(',').map((s: string) => s.trim())})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#f47c20] focus:border-[#f47c20]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Disclaimer Text</label>
                <textarea 
                  value={settings.medical_disclaimer}
                  onChange={(e) => setSettings({...settings, medical_disclaimer: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#f47c20] focus:border-[#f47c20] h-24"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Maintenance Actions</h2>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-900">Clear Chat History</h3>
                <p className="text-sm text-gray-500">Permanently delete all conversation logs.</p>
              </div>
              <button className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                Clear History
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-900">Rebuild Knowledge Base</h3>
                <p className="text-sm text-gray-500">Force sync all data sources and re-index.</p>
              </div>
              <button onClick={refreshKnowledgeBase} disabled={loading} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                {loading ? 'Rebuilding...' : 'Rebuild Index'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-900">Refresh Product Cache</h3>
                <p className="text-sm text-gray-500">Update AI product catalog context.</p>
              </div>
              <button onClick={refreshKnowledgeBase} disabled={loading} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh Cache'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-900">Test Gemini Connection</h3>
                <p className="text-sm text-gray-500">Ping Google Gemini API to verify API keys.</p>
              </div>
              <button className="px-4 py-2 border border-[#f47c20] text-[#f47c20] bg-orange-50 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
                Test Connection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
