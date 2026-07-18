import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Ticket, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    active: true,
    expires_at: ""
  });

  const [couponToDelete, setCouponToDelete] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist
          setCoupons([]);
        } else {
          throw error;
        }
      } else {
        setCoupons(data || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenDrawer = (coupon: any = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value?.toString() || "",
        min_order_amount: coupon.min_order_amount?.toString() || "",
        max_discount_amount: coupon.max_discount_amount?.toString() || "",
        active: coupon.active ?? true,
        expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ""
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "",
        max_discount_amount: "",
        active: true,
        expires_at: ""
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const savePayload = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value) || 0,
      min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
      active: formData.active,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
    };

    try {
      if (editingCoupon) {
        const { error } = await supabase.from('coupons').update(savePayload).eq('id', editingCoupon.id);
        if (error) throw error;
        showToast("Coupon updated successfully", "success");
      } else {
        const { error } = await supabase.from('coupons').insert([savePayload]);
        if (error) throw error;
        showToast("Coupon created successfully", "success");
      }
      setIsDrawerOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save coupon. Table might be missing.", "error");
    }
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', couponToDelete.id);
      if (error) throw error;
      showToast("Coupon deleted successfully", "success");
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete coupon", "error");
    } finally {
      setCouponToDelete(null);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const currentCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (error && !coupons.length) {
    return (
       <div className="p-6">
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex justify-between items-center">
             <p>{error}</p>
             <button onClick={fetchCoupons} className="px-4 py-2 bg-white rounded border text-sm">Retry</button>
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Coupons & Discounts</h1>
          <p className="text-[15px] text-[#666666] mt-1">Manage promotional codes and cart discounts.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()} 
          className="flex items-center px-4 py-2.5 bg-[#111111] hover:bg-black text-white text-[14px] font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Coupon
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search by code..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : currentCoupons.length > 0 ? (
                currentCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-[#f8f9fa] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="inline-block px-3 py-1 bg-gray-100 font-mono font-bold text-[14px] text-gray-800 rounded">{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#555555] capitalize">{coupon.discount_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] font-bold text-[#111111]">
                       {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#555555]">
                       {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                        coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenDrawer(coupon)} className="p-1.5 text-[#666666] hover:text-blue-600 bg-white hover:bg-blue-50 border border-[#eaeaea] rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setCouponToDelete(coupon)} className="p-1.5 text-[#666666] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#eaeaea] rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Ticket className="w-12 h-12 text-[#dddddd] mx-auto mb-4" />
                    <h3 className="text-[16px] font-medium text-[#111111] mb-1">No coupons found</h3>
                    <p className="text-[13px] text-[#666666]">Create your first discount code to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
           <div className="px-6 py-4 border-t border-[#eaeaea] flex items-center justify-between">
              <span className="text-sm text-gray-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCoupons.length)} of {filteredCoupons.length}</span>
              <div className="flex space-x-2">
                 <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                 >
                    <ChevronLeft className="w-4 h-4" />
                 </button>
                 <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                 >
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-[#eaeaea]">
               <div className="px-6 py-4 border-b border-[#eaeaea] flex items-center justify-between bg-white">
                <h2 className="text-xl font-bold text-[#111111]">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111]"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                 <form id="coupon-form" onSubmit={handleSave} className="space-y-5">
                   <div>
                     <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Coupon Code</label>
                     <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER20" className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] font-mono uppercase" required />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Discount Type</label>
                       <select value={formData.discount_type} onChange={(e) => setFormData({...formData, discount_type: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] bg-white">
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Discount Value</label>
                       <input type="number" step="0.01" value={formData.discount_value} onChange={(e) => setFormData({...formData, discount_value: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" required />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Min Order (₹)</label>
                       <input type="number" step="0.01" value={formData.min_order_amount} onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})} placeholder="Optional" className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" />
                     </div>
                     <div>
                       <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Max Discount (₹)</label>
                       <input type="number" step="0.01" value={formData.max_discount_amount} onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})} placeholder="Optional" className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Expiry Date</label>
                     <input type="date" value={formData.expires_at} onChange={(e) => setFormData({...formData, expires_at: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" />
                   </div>

                   <div className="flex items-center space-x-2 pt-2">
                     <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="rounded border-gray-300" />
                     <span className="text-[14px] font-medium text-[#111111]">Active Status</span>
                   </div>
                 </form>
              </div>

              <div className="px-6 py-4 border-t border-[#eaeaea] flex justify-end space-x-3 bg-white">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-[#eaeaea] text-[14px] font-medium rounded-lg">Cancel</button>
                <button type="submit" form="coupon-form" className="px-6 py-2 bg-[#111111] text-white text-[14px] font-semibold rounded-lg">{editingCoupon ? 'Save' : 'Create'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {couponToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCouponToDelete(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">Delete Coupon</h3>
                <p className="text-[14px] text-[#666666]">Are you sure you want to delete coupon <b>{couponToDelete.code}</b>?</p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-[#eaeaea]">
                <button type="button" onClick={() => setCouponToDelete(null)} className="px-4 py-2 text-[14px] font-medium text-[#111111] bg-white border border-[#eaeaea] rounded-lg">Cancel</button>
                <button type="button" onClick={confirmDelete} className="px-4 py-2 text-[14px] font-medium text-white bg-rose-500 rounded-lg">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 ${toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-rose-500 text-white'}`}>
            <span className="text-[14px] font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
