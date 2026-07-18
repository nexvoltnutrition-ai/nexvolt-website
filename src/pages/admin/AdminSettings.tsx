import React, { useState, useEffect } from "react";
import { Store, Globe, CreditCard, Truck, Link as LinkIcon, Save, Image as ImageIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('brand');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState({
    store_name: "NEXVOLT SPORTS",
    support_email: "support@nexvolt.com",
    primary_logo: "",
    meta_title_format: "NEXVOLT | %page_title%",
    meta_description: "Premium sports nutrition engineered for athletes.",
    social_instagram: "https://www.instagram.com/nexvolt",
    social_tiktok: "https://www.tiktok.com/@nexvoltsports",
    social_youtube: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
      if (error) {
        if (error.code !== 'PGRST205' && error.code !== 'PGRST116') {
          console.error("Error fetching settings:", error);
        }
      } else if (data) {
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existingSettings, error: checkError } = await supabase.from('store_settings').select('id').limit(1).single();
      
      let error;
      if (existingSettings?.id) {
        ({ error } = await supabase.from('store_settings').update(formData).eq('id', existingSettings.id));
      } else {
        ({ error } = await supabase.from('store_settings').insert([{ ...formData, id: 1 }]));
      }

      if (error) {
        if (error.code === 'PGRST205') {
          // Table missing
          showToast("Settings table does not exist in the database.", "error");
        } else {
          throw error;
        }
      } else {
        showToast("Settings saved successfully!", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Store Settings</h1>
        <p className="text-[15px] text-[#666666] mt-1">Configure global platform preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
         {/* Settings Navigation */}
         <div className="w-full md:w-64 border-r border-[#eaeaea] bg-gray-50 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'brand', label: 'Brand & Logo', icon: Store },
              { id: 'payment', label: 'Payments', icon: CreditCard },
              { id: 'shipping', label: 'Shipping Zones', icon: Truck },
              { id: 'seo', label: 'Site SEO', icon: Globe },
              { id: 'social', label: 'Social Links', icon: LinkIcon },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-3 rounded-lg text-[14px] font-medium transition-colors flex items-center whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-[#111111] text-white' : 'text-[#666666] hover:bg-white hover:text-[#111111]'
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
         </div>

         {/* Settings Content */}
         <div className="flex-1 p-6 md:p-8">
            <div className="max-w-2xl">
               {loading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
                  </div>
               ) : (
               <>
                 {activeTab === 'brand' && (
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Brand Identity</h2>
                         <p className="text-[13px] text-gray-500 mb-6">Update your store's fundamental details and logos.</p>
                      </div>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-[13px] font-bold text-[#111111] mb-2">Store Name</label>
                            <input type="text" value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-[#111111] mb-2">Support Email</label>
                            <input type="email" value={formData.support_email} onChange={e => setFormData({...formData, support_email: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                         </div>
                         <div className="pt-2">
                            <label className="block text-[13px] font-bold text-[#111111] mb-2">Primary Logo URL</label>
                            <input type="text" value={formData.primary_logo} onChange={e => setFormData({...formData, primary_logo: e.target.value})} placeholder="https://..." className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px] mb-2" />
                            <div className="border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50">
                               {formData.primary_logo ? (
                                  <img src={formData.primary_logo} alt="Logo" className="max-h-16 object-contain" />
                               ) : (
                                  <>
                                     <ImageIcon className="w-8 h-8 text-gray-400 mb-2"/>
                                     <span className="text-[13px] font-medium text-gray-600">Provide URL above</span>
                                  </>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'payment' && (
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Payment Gateways</h2>
                         <p className="text-[13px] text-gray-500 mb-6">Manage how you accept money.</p>
                      </div>
                      <div className="space-y-4">
                         <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                            <div>
                               <h3 className="font-bold text-[14px]">Stripe Integration</h3>
                               <p className="text-[13px] text-emerald-600">Connected</p>
                            </div>
                            <button className="px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">Manage</button>
                         </div>
                         <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between opacity-60">
                            <div>
                               <h3 className="font-bold text-[14px]">PayPal</h3>
                               <p className="text-[13px] text-gray-500">Not connected</p>
                            </div>
                            <button className="px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">Connect</button>
                         </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'shipping' && (
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Shipping & Fulfillment</h2>
                         <p className="text-[13px] text-gray-500 mb-6">Set up zones and rates.</p>
                      </div>
                      <div className="space-y-4">
                         <div className="p-4 border border-gray-200 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                               <h3 className="font-bold text-[14px]">Domestic (US)</h3>
                               <button className="text-blue-600 text-sm font-medium">Edit</button>
                            </div>
                            <p className="text-[13px] text-gray-600">Standard: ₹99 (Free over ₹1,999)</p>
                            <p className="text-[13px] text-gray-600">Express: ₹299</p>
                         </div>
                         <button className="px-4 py-2 border border-gray-200 text-[#111111] text-[14px] font-medium rounded-lg hover:bg-gray-50">Add Shipping Zone</button>
                      </div>
                   </div>
                 )}

                 {activeTab === 'seo' && (
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Global SEO</h2>
                         <p className="text-[13px] text-gray-500 mb-6">Default meta tags for your storefront.</p>
                      </div>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-[13px] font-bold text-[#111111] mb-2">Meta Title Format</label>
                            <input type="text" value={formData.meta_title_format} onChange={e => setFormData({...formData, meta_title_format: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px] font-mono" />
                         </div>
                         <div>
                            <label className="block text-[13px] font-bold text-[#111111] mb-2">Default Meta Description</label>
                            <textarea rows={3} value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                         </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'social' && (
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Social Accounts</h2>
                         <p className="text-[13px] text-gray-500 mb-6">Used in website footers and emails.</p>
                      </div>
                      <div className="space-y-4">
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Instagram URL</label>
                             <input type="text" value={formData.social_instagram} onChange={e => setFormData({...formData, social_instagram: e.target.value})} placeholder="https://" className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">TikTok URL</label>
                             <input type="text" value={formData.social_tiktok} onChange={e => setFormData({...formData, social_tiktok: e.target.value})} placeholder="https://" className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">YouTube URL</label>
                             <input type="text" value={formData.social_youtube} onChange={e => setFormData({...formData, social_youtube: e.target.value})} placeholder="https://" className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                      </div>
                   </div>
                 )}

                 <div className="mt-8 pt-6 border-t border-gray-200">
                    <button disabled={saving} onClick={handleSave} className="flex items-center px-6 py-2.5 bg-[#111111] text-white text-[14px] font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50">
                       {saving ? (
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                          <Save className="w-4 h-4 mr-2" />
                       )}
                       Save Active Changes
                    </button>
                 </div>
               </>
               )}
            </div>
         </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 ${
          toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-rose-500 text-white'
        }`}>
          <span className="text-[14px] font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
