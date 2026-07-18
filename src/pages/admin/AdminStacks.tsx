import React, { useState } from "react";
import { Plus, Search, Dumbbell, Edit, Trash2, X, Image as ImageIcon, LayoutList, Package, Upload } from "lucide-react";
import { SPORTS, SportData } from "../../data/sports";
import { motion, AnimatePresence } from "motion/react";

type TabType = 'details' | 'media' | 'mapping';

export function AdminStacks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stacks, setStacks] = useState<SportData[]>(SPORTS.filter(s => s.stackName));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStack, setEditingStack] = useState<SportData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  const [formData, setFormData] = useState({
    name: "", // Sport Name
    stackName: "",
    stackDescription: "",
    image: "",
    mappedProducts: "",
    scienceTitle: "",
    scienceText: ""
  });

  const filteredStacks = stacks.filter(stack => 
    stack.stackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stack.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDrawer = (stack: SportData | null = null) => {
    setActiveTab('details');
    if (stack) {
      setEditingStack(stack);
      setFormData({
        name: stack.name,
        stackName: stack.stackName || "",
        stackDescription: stack.stackDescription || "",
        image: stack.image || "",
        mappedProducts: stack.mappedProducts ? stack.mappedProducts.map(p => p.toString()).join(", ") : "",
        scienceTitle: stack.scienceTitle || "",
        scienceText: stack.scienceText || ""
      });
    } else {
      setEditingStack(null);
      setFormData({
        name: "", stackName: "", stackDescription: "", image: "", mappedProducts: "", scienceTitle: "", scienceText: ""
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStack) {
      setStacks(stacks.map(s => s.id === editingStack.id ? {
        ...s,
        name: formData.name,
        stackName: formData.stackName,
        stackDescription: formData.stackDescription,
        image: formData.image || s.image,
        scienceTitle: formData.scienceTitle,
        scienceText: formData.scienceText,
        mappedProducts: formData.mappedProducts?.split(",").map(Number).filter(Boolean)
      } : s));
    } else {
      const newStack: SportData = {
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        image: formData.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
        description: "",
        stackName: formData.stackName,
        stackDescription: formData.stackDescription,
        scienceTitle: formData.scienceTitle,
        scienceText: formData.scienceText,
        relatedCategories: [],
        mappedProducts: formData.mappedProducts?.split(",").map(Number).filter(Boolean)
      };
      setStacks([newStack, ...stacks]);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this athlete stack?")) {
      setStacks(stacks.filter(s => s.id !== id));
    }
  };

  const tabs: { id: TabType, label: string, icon: React.ElementType }[] = [
    { id: 'details', label: 'Stack Details', icon: LayoutList },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'mapping', label: 'Product Mapping', icon: Package },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Athlete Stacks</h1>
          <p className="text-[15px] text-[#666666] mt-1">Manage product stacks for different sports and goals.</p>
        </div>
        <button onClick={() => handleOpenDrawer()} className="flex items-center px-4 py-2.5 bg-[#111111] hover:bg-black text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap">
          <Plus className="w-5 h-5 mr-2" />
          Create Stack
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search stacks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-shadow text-[#111111]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStacks.map((stack) => (
          <div key={stack.id} className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden flex flex-col group hover:border-[#cccccc] transition-colors relative">
             <div className="absolute top-3 right-3 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleOpenDrawer(stack)} className="p-1.5 bg-white text-[#111111] rounded shadow hover:bg-gray-100"><Edit className="w-4 h-4" /></button>
               <button onClick={() => handleDelete(stack.id)} className="p-1.5 bg-white text-rose-600 rounded shadow hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
             </div>
             <div className="h-40 bg-gray-100 relative overflow-hidden">
                <img src={stack.image} alt={stack.stackName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30" />
                <span className="absolute top-3 left-3 bg-white/90 text-[#111111] text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                  {stack.name}
                </span>
             </div>
             <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-[18px] font-bold text-[#111111] leading-tight mb-2">{stack.stackName}</h3>
                <p className="text-[13px] text-[#666666] line-clamp-2 mb-4">{stack.stackDescription}</p>
                <div className="mt-auto pt-4 border-t border-[#eaeaea] flex justify-between items-center">
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-[#555555] rounded-md text-[12px] font-medium">
                    <Package className="w-3.5 h-3.5 mr-1" />
                    {stack.mappedProducts ? stack.mappedProducts.length : (stack.subTabs ? stack.subTabs.reduce((acc, tab) => acc + tab.mappedProducts.length, 0) : 0)} Bundle Items
                  </span>
                </div>
             </div>
          </div>
        ))}
        {filteredStacks.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-[#eaeaea]">
            <Dumbbell className="w-12 h-12 text-[#dddddd] mx-auto mb-4" />
            <h3 className="text-[16px] font-medium text-[#111111] mb-1">No stacks found</h3>
          </div>
        )}
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-[#eaeaea]"
            >
              <div className="px-6 py-4 border-b border-[#eaeaea] flex items-center justify-between col-span-full bg-white relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">
                    {editingStack ? 'Edit Stack' : 'Create New Stack'}
                  </h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111] transition-colors p-2 rounded-md hover:bg-[#f8f9fa]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#eaeaea] px-6 overflow-x-auto no-scrollbar bg-[#f8f9fa]">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-[13px] font-medium ${
                      activeTab === tab.id 
                        ? 'border-[#111111] text-[#111111]' 
                        : 'border-transparent text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                <form id="stack-form" onSubmit={handleSave} className="space-y-6">
                  
                  {/* DETAILS TAB */}
                  {activeTab === 'details' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Stack Name</label>
                        <input 
                          type="text" 
                          value={formData.stackName}
                          onChange={(e) => setFormData({...formData, stackName: e.target.value})}
                          className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-[14px]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Assigned Target Sport</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-[14px]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Short Description</label>
                        <textarea 
                          value={formData.stackDescription}
                          onChange={(e) => setFormData({...formData, stackDescription: e.target.value})}
                          className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-[14px]"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Why this stack works (Science)</label>
                        <textarea 
                          value={formData.scienceText}
                          onChange={(e) => setFormData({...formData, scienceText: e.target.value})}
                          className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-[14px]"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* MEDIA TAB */}
                  {activeTab === 'media' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Cover Image (URL)</label>
                        <input 
                          type="text" 
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-[14px] mb-3"
                        />
                         {formData.image ? (
                          <div className="w-full h-48 rounded-lg border border-[#eaeaea] bg-gray-100 overflow-hidden">
                             <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full border-2 border-dashed border-[#dddddd] rounded-xl p-8 text-center hover:bg-[#f8f9fa] transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-[#888888] mx-auto mb-3" />
                            <p className="text-[14px] font-medium text-[#111111]">Upload Stack Cover</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MAPPING TAB */}
                  {activeTab === 'mapping' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Bundled Products (Comma-separated IDs)</label>
                        <input 
                          type="text" 
                          value={formData.mappedProducts}
                          onChange={(e) => setFormData({...formData, mappedProducts: e.target.value})}
                          placeholder="e.g. 1, 3, 5, 8"
                          className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-[14px]"
                        />
                      </div>
                    </div>
                  )}

                </form>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-[#eaeaea] flex justify-end space-x-3 bg-white">
                <button 
                  type="button" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 border border-[#eaeaea] text-[#111111] text-[14px] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="stack-form"
                  className="px-6 py-2 bg-[#111111] text-white text-[14px] font-semibold rounded-lg hover:bg-black transition-colors"
                >
                  Save Stack
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
