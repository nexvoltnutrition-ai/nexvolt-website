import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Activity, X, Image as ImageIcon, LayoutList, Package, Upload, Filter, TrendingUp, Users } from "lucide-react";
import { SPORTS as MOCK_SPORTS, SportData } from "../../data/sports";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

type TabType = 'details' | 'media' | 'mapping' | 'athletics';

const SPORT_ANALYTICS = [
  { title: "Top Selling Sport", value: "HYROX", icon: TrendingUp, color: "text-emerald-500", detail: "2,450 Orders" },
  { title: "Highest Engagement", value: "CrossFit", icon: Users, color: "text-blue-500", detail: "15.2k Active Users" },
  { title: "Trending Stack", value: "Endurance", icon: Activity, color: "text-purple-500", detail: "+42% this week" },
  { title: "Recovery Trend", value: "Cricket", icon: Package, color: "text-amber-500", detail: "High BCAAs demand" },
];

export function AdminSports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sports, setSports] = useState<SportData[]>(MOCK_SPORTS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [filterType, setFilterType] = useState("All");
  const [sportToDelete, setSportToDelete] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const { data: dbSports } = await supabase.from('sports').select('*');
      if (dbSports) {
        // Merge Supabase sports with mock to have subTabs logic
        const merged = dbSports.map(dbSport => {
           const mock = MOCK_SPORTS.find(m => m.name.toLowerCase() === (dbSport.name || '').toLowerCase()) || {};
           return { ...mock, ...dbSport };
        });
        
        // Let's also fetch mappings to display product counts correctly
        const { data: mappings } = await supabase.from('sport_product_mapping').select('*');
        if (mappings) {
          merged.forEach(s => {
             if (s.name.toLowerCase() === 'athletics') {
               if (s.subTabs) {
                 s.subTabs.forEach(st => {
                   st.mappedProducts = mappings.filter(m => m.sport_id === st.id).map(m => m.product_id);
                 });
               }
             } else {
               s.mappedProducts = mappings.filter(m => m.sport_id === s.id).map(m => m.product_id);
             }
          });
        }
        
        setSports(merged);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stackName: "",
    stackDescription: "",
    scienceTitle: "",
    scienceText: "",
    image: "",
    bannerImage: "",
    mappedProducts: "",
    // Athletics specific
    sprinterProducts: "",
    jumperProducts: "",
    throwerProducts: "",
  });

  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || 
                          (filterType === "With Stacks" && sport.stackName) ||
                          (filterType === "No Stacks" && !sport.stackName) ||
                          (filterType === "Has Sub-disciplines" && sport.subTabs);
    return matchesSearch && matchesFilter;
  });

  const handleOpenDrawer = (sport: SportData | null = null) => {
    setActiveTab('details');
    if (sport) {
      setEditingSport(sport);
      setFormData({
        name: sport.name,
        description: sport.description || "",
        stackName: sport.stackName || "",
        stackDescription: sport.stackDescription || "",
        scienceTitle: sport.scienceTitle || "",
        scienceText: sport.scienceText || "",
        image: sport.image || "",
        bannerImage: sport.image || "",
        mappedProducts: sport.mappedProducts ? sport.mappedProducts?.join(", ") : "",
        sprinterProducts: sport.subTabs?.find(s => s.id === 'sprinter')?.mappedProducts?.join(", ") || "",
        jumperProducts: sport.subTabs?.find(s => s.id === 'jumper')?.mappedProducts?.join(", ") || "",
        throwerProducts: sport.subTabs?.find(s => s.id === 'thrower')?.mappedProducts?.join(", ") || "",
      });
    } else {
      setEditingSport(null);
      setFormData({
        name: "", description: "", stackName: "", stackDescription: "", scienceTitle: "", scienceText: "", image: "", bannerImage: "", mappedProducts: "", sprinterProducts: "", jumperProducts: "", throwerProducts: ""
      });
    }
    setIsDrawerOpen(true);
  };

  const saveMappings = async (sportId: string, mappingsMap: Record<string, number[]>) => {
    try {
      // Clear mappings for this sport (and its sub tabs)
      const mappingIds = Object.keys(mappingsMap);
      await Promise.all(mappingIds.map(id => supabase.from('sport_product_mapping').delete().eq('sport_id', id)));

      // Insert new ones
      const insertData: any[] = [];
      Object.entries(mappingsMap).forEach(([sId, productIds]) => {
        productIds.forEach(pid => {
          insertData.push({ sport_id: sId, product_id: pid });
        });
      });
      if (insertData.length > 0) {
        await supabase.from('sport_product_mapping').insert(insertData);
      }
    } catch (error) {
      console.error('Error saving mapping:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sportDataToSave: any = {
      name: formData.name,
      slug: slug,
      description: formData.description,
      image: formData.image || "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800",
    };

    try {
      let dbSportId = editingSport?.id;

      if (editingSport) {
        // Update sport
        const { error } = await supabase.from('sports').update(sportDataToSave).eq('id', dbSportId);
        if (error) throw error;
      } else {
        // Insert new sport
        const { data, error } = await supabase.from('sports').insert([sportDataToSave]).select();
        if (error) throw error;
        if (data && data.length > 0) {
          dbSportId = data[0].id;
        }
      }
      
      // Update mappings
      if (dbSportId) {
        if (formData.name.toLowerCase() === 'athletics') {
          const mappings = {
            'sprinter': formData.sprinterProducts?.split(",").map(Number).filter(Boolean),
            'jumper': formData.jumperProducts?.split(",").map(Number).filter(Boolean),
            'thrower': formData.throwerProducts?.split(",").map(Number).filter(Boolean),
          };
          await saveMappings(dbSportId, mappings);
        } else {
          const mappings = {
            [dbSportId]: formData.mappedProducts?.split(",").map(Number).filter(Boolean)
          };
          await saveMappings(dbSportId, mappings);
        }
      }
      
      fetchSports();
      setIsDrawerOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save sport');
    }
  };

  const confirmDelete = async () => {
    if (!sportToDelete) return;
    try {
      await supabase.from('sports').delete().eq('id', sportToDelete.id);
      await supabase.from('sport_product_mapping').delete().eq('sport_id', sportToDelete.id);
      setSports(sports.filter(s => s.id !== sportToDelete.id));
      fetchSports();
      showToast("Sport deleted successfully", "success");
      setSportToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete sport', 'error');
    }
  };

  const tabs: { id: TabType, label: string, icon: React.ElementType }[] = [
    { id: 'details', label: 'Sport Details', icon: LayoutList },
    { id: 'media', label: 'Media & URLs', icon: ImageIcon },
    { id: 'mapping', label: 'Product Mapping', icon: Package },
    ...(formData.name.toLowerCase() === 'athletics' ? [{ id: 'athletics', label: 'Athletics Roles', icon: Activity } as any] : [])
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Sports Ecosystems & Analytics</h1>
          <p className="text-[15px] text-[#666666] mt-1">Manage sports hubs, assign performance stacks, and track engagement.</p>
        </div>
        <button onClick={() => handleOpenDrawer()} className="flex items-center px-4 py-2.5 bg-[#111111] hover:bg-black text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap">
          <Plus className="w-5 h-5 mr-2" />
          Add Sport
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SPORT_ANALYTICS.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#eaeaea] shadow-sm flex items-center justify-between hover:border-[#cccccc] transition-colors">
            <div>
               <p className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.title}</p>
               <p className={`text-[20px] font-bold ${stat.color} mb-1`}>{stat.value}</p>
               <p className="text-[12px] text-gray-400 font-medium">{stat.detail}</p>
            </div>
            <div className={`p-3 bg-gray-50 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

       <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search sports hubs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-[#111111]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] text-[#666666] focus:outline-none w-full sm:w-auto"
          >
             <option value="All">All Sports Overview</option>
             <option value="Top Performing">Top Performing Sports</option>
             <option value="With Stacks">Has Assigned Stacks</option>
             <option value="No Stacks">Missing Stacks</option>
             <option value="Has Sub-disciplines">Multi-Discipline</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Sport Profile</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Stack Assignment</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Mapped Items</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {filteredSports.map((sport) => (
                <tr key={sport.id} className="hover:bg-[#f8f9fa] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-[#f8f8f8] rounded-md overflow-hidden border border-[#eaeaea]">
                        <img className="h-full w-full object-cover flex-shrink-0" src={sport.image} alt={sport.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-[14px] font-medium text-[#111111] leading-tight mb-1">{sport.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[14px] text-[#555555]">{sport.stackName || "No Stack Assigned"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-[#555555]">
                       {sport.mappedProducts ? sport.mappedProducts.length : (sport.subTabs ? sport.subTabs.reduce((acc, tab) => acc + tab.mappedProducts.length, 0) : 0)} Products
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => handleOpenDrawer(sport)} className="p-1.5 text-[#666666] hover:text-[#0066cc] bg-white hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setSportToDelete(sport)} className="p-1.5 text-[#666666] hover:text-rose-600 bg-white hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-[#eaeaea]">
              <div className="px-6 py-4 border-b border-[#eaeaea] flex items-center justify-between bg-white relative z-10">
                <div><h2 className="text-xl font-bold text-[#111111]">{editingSport ? 'Edit Sport' : 'Add New Sport'}</h2></div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111] p-2 rounded-md"><X className="w-5 h-5" /></button>
              </div>

               <div className="flex border-b border-[#eaeaea] px-6 overflow-x-auto no-scrollbar bg-[#f8f9fa]">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-[13px] font-medium ${activeTab === tab.id ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}>
                    <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                <form id="sport-form" onSubmit={handleSave} className="space-y-6">
                  {/* DETAILS TAB */}
                  {activeTab === 'details' && (
                    <div className="space-y-5">
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Sport Name (Type "Athletics" to enable roles)</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" required /></div>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Sport Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                      <div className="pt-4 border-t border-[#eaeaea]"><h3 className="text-[14px] font-bold text-[#111111] mb-3">Target Performance Stack</h3>
                        <div className="space-y-4">
                          <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Stack Name</label><input type="text" value={formData.stackName} onChange={(e) => setFormData({...formData, stackName: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                          <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Stack Use Case</label><textarea value={formData.stackDescription} onChange={(e) => setFormData({...formData, stackDescription: e.target.value})} rows={2} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MEDIA TAB */}
                  {activeTab === 'media' && (
                    <div className="space-y-5">
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Sport Hero Image (URL)</label><input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] mb-3" /></div>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Banner Image (URL)</label><input type="text" value={formData.bannerImage} onChange={(e) => setFormData({...formData, bannerImage: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] mb-3" /></div>
                    </div>
                  )}

                  {/* MAPPING TAB */}
                  {activeTab === 'mapping' && formData.name.toLowerCase() !== 'athletics' && (
                     <div className="space-y-5">
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Mapped Product IDs (comma-separated)</label><input type="text" value={formData.mappedProducts} onChange={(e) => setFormData({...formData, mappedProducts: e.target.value})} placeholder="e.g. 1, 3, 5" className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                    </div>
                  )}

                   {/* ATHLETICS TAB */}
                  {activeTab === 'athletics' && formData.name.toLowerCase() === 'athletics' && (
                     <div className="space-y-5">
                       <p className="text-[13px] text-[#888888] mb-4">Define product stacks for specific athletic disciplines.</p>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Sprinter Products (IDs)</label><input type="text" value={formData.sprinterProducts} onChange={(e) => setFormData({...formData, sprinterProducts: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Jumper Products (IDs)</label><input type="text" value={formData.jumperProducts} onChange={(e) => setFormData({...formData, jumperProducts: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Thrower Products (IDs)</label><input type="text" value={formData.throwerProducts} onChange={(e) => setFormData({...formData, throwerProducts: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                    </div>
                  )}

                </form>
              </div>

              <div className="px-6 py-4 border-t border-[#eaeaea] flex justify-end space-x-3 bg-white">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-[#eaeaea] text-[#111111] text-[14px] font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" form="sport-form" className="px-6 py-2 bg-[#111111] text-white text-[14px] font-semibold rounded-lg hover:bg-black transition-colors">{editingSport ? 'Save Sport' : 'Create Sport'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {sportToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSportToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">Delete Sport</h3>
                <p className="text-[14px] text-[#666666]">
                  Are you sure you want to delete this sport? This action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-[#eaeaea]">
                <button
                  type="button"
                  onClick={() => setSportToDelete(null)}
                  className="px-4 py-2 text-[14px] font-medium text-[#111111] bg-white border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 text-[14px] font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Delete Sport
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 ${
              toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
            <span className="text-[14px] font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
