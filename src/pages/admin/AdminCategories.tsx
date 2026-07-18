import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, Edit, Trash2, Folder, Image as ImageIcon, LayoutList, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

export function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: false });
      if (error) {
        console.error('Error fetching categories:', error);
      } else if (data) {
        // Also fetch product counts
        const { data: productsData } = await supabase.from('products').select('category');
        const counts: Record<string, number> = {};
        if (productsData) {
           productsData.forEach(p => {
              if (p.category) {
                 counts[p.category] = (counts[p.category] || 0) + 1;
              }
           });
        }
        
        setCategories(data.map(c => ({
           id: c.id,
           name: c.name,
           slug: c.slug,
           description: c.description || "",
           image: c.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
           active: c.active !== false,
           itemCount: counts[c.name] || 0
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDrawer = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        image: category.image || "",
        active: category.active ?? true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "", slug: "", description: "", image: "", active: true
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const savePayload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      image: formData.image || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=400",
      active: formData.active
    };

    try {
      if (editingCategory) {
        await supabase.from('categories').update(savePayload).eq('id', editingCategory.id);
      } else {
        await supabase.from('categories').insert([savePayload]);
      }
      fetchCategories();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      fetchCategories();
      showToast("Category deleted successfully", "success");
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Categories</h1>
          <p className="text-[15px] text-[#666666] mt-1">Manage product categories and featured collections.</p>
        </div>
        <button onClick={() => handleOpenDrawer()} className="flex items-center px-4 py-2.5 bg-[#111111] hover:bg-black text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap">
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-shadow text-[#111111]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Products</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
               {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-[#f8f9fa] transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex-shrink-0 bg-[#f8f8f8] rounded-md overflow-hidden border border-[#eaeaea]">
                    <img className="h-full w-full object-cover" src={category.image} alt={category.name} />
                  </div>
                  <div className="ml-4">
                    <div className="text-[14px] font-medium text-[#111111] flex items-center">
                       {category.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#666666] font-mono">{category.slug}</td>
              <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#555555]">{category.itemCount || 0} items</td>
              <td className="px-6 py-4 whitespace-nowrap">
                 <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                  category.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.active ? 'Active' : 'Draft'}
                </span>
              </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex justify-end space-x-1.5">
                      <button onClick={() => handleOpenDrawer(category)} className="p-1.5 text-[#666666] hover:text-blue-600 bg-white hover:bg-blue-50 border border-transparent hover:border-[#eaeaea] rounded transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setCategoryToDelete(category)} className="p-1.5 text-[#666666] hover:text-rose-600 bg-white hover:bg-rose-50 border border-transparent hover:border-[#eaeaea] rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
               ))}
            </tbody>
          </table>
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-[#dddddd] mx-auto mb-4" />
              <h3 className="text-[16px] font-medium text-[#111111] mb-1">No categories found</h3>
            </div>
          )}
        </div>
      </div>

       <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-[#eaeaea]">
               <div className="px-6 py-4 border-b border-[#eaeaea] flex items-center justify-between bg-white">
                <h2 className="text-xl font-bold text-[#111111]">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111]"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                 <form id="category-form" onSubmit={handleSave} className="space-y-5">
                   <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Category Image (URL)</label><input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                   <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Category Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" required /></div>
                   <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Slug</label><input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] font-mono" /></div>
                   <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                   <div className="flex items-center space-x-2 pt-2"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="rounded border-gray-300" /><span className="text-[14px] font-medium text-[#111111]">Active Status</span></div>
                 </form>
              </div>
              <div className="px-6 py-4 border-t border-[#eaeaea] flex justify-end space-x-3 bg-white">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-[#eaeaea] text-[14px] font-medium rounded-lg">Cancel</button>
                <button type="submit" form="category-form" className="px-6 py-2 bg-[#111111] text-white text-[14px] font-semibold rounded-lg">{editingCategory ? 'Save' : 'Create'}</button>
              </div>
            </motion.div>
          </>
        )}
       </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setCategoryToDelete(null)}
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
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">Delete Category</h3>
                <p className="text-[14px] text-[#666666]">
                  Are you sure you want to delete this category? This action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-[#eaeaea]">
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
                  className="px-4 py-2 text-[14px] font-medium text-[#111111] bg-white border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 text-[14px] font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Delete Category
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
