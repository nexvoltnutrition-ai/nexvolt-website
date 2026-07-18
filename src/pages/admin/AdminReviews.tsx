import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, MessageSquare, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({
    product_id: "",
    customer_id: "",
    rating: "5",
    title: "",
    content: "",
    status: "approved"
  });

  const [reviewToDelete, setReviewToDelete] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [
        { data: reviewsData, error: reviewsError },
        { data: productsData },
        { data: customersData }
      ] = await Promise.all([
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name'),
        supabase.from('customers').select('id, name')
      ]);

      if (reviewsError) throw reviewsError;
      
      setReviews(reviewsData || []);
      setProducts(productsData || []);
      setCustomers(customersData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenDrawer = (review: any = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        product_id: review.product_id?.toString() || "",
        customer_id: review.customer_id?.toString() || "",
        rating: review.rating?.toString() || "5",
        title: review.title || "",
        content: review.content || "",
        status: review.status || "approved"
      });
    } else {
      setEditingReview(null);
      setFormData({
        product_id: "",
        customer_id: "",
        rating: "5",
        title: "",
        content: "",
        status: "approved"
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const savePayload = {
      product_id: formData.product_id ? parseInt(formData.product_id) : null,
      customer_id: formData.customer_id ? formData.customer_id : null,
      rating: parseInt(formData.rating) || 5,
      title: formData.title,
      content: formData.content,
      status: formData.status
    };

    try {
      if (editingReview) {
        const { error } = await supabase.from('reviews').update(savePayload).eq('id', editingReview.id);
        if (error) throw error;
        showToast("Review updated successfully", "success");
      } else {
        const { error } = await supabase.from('reviews').insert([savePayload]);
        if (error) throw error;
        showToast("Review created successfully", "success");
      }
      setIsDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save review", "error");
    }
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewToDelete.id);
      if (error) throw error;
      showToast("Review deleted successfully", "success");
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to delete review", "error");
    } finally {
      setReviewToDelete(null);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const p = products.find(prod => prod.id == r.product_id);
    const matchesSearch = p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || r.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === "all" || r.rating.toString() === filterRating;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (error && !reviews.length) {
    return (
       <div className="p-6">
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex justify-between items-center">
             <p>{error}</p>
             <button onClick={fetchData} className="px-4 py-2 bg-white rounded border text-sm">Retry</button>
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Product Reviews</h1>
          <p className="text-[15px] text-[#666666] mt-1">Moderate customer feedback and ratings.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()} 
          className="flex items-center px-4 py-2.5 bg-[#111111] hover:bg-black text-white text-[14px] font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Review
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search reviews..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-[#111111]"
          />
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
           <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] focus:outline-none flex-1 sm:flex-none">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
           </select>
           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] focus:outline-none flex-1 sm:flex-none">
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Title & Content</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : currentReviews.length > 0 ? (
                currentReviews.map((review) => {
                  const prod = products.find(p => p.id == review.product_id);
                  const cust = customers.find(c => c.id == review.customer_id);
                  return (
                  <tr key={review.id} className="hover:bg-[#f8f9fa] transition-colors group">
                    <td className="px-6 py-4">
                       <p className="font-bold text-[14px] text-[#111111]">{prod?.name || 'Unknown Product'}</p>
                       <p className="text-[12px] text-[#666666] mt-0.5">{cust?.name || 'Guest'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center text-amber-500">
                          {Array.from({length: 5}).map((_, i) => (
                             <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                       </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                       <p className="font-bold text-[13px] text-[#111111] truncate">{review.title}</p>
                       <p className="text-[12px] text-[#666666] truncate mt-0.5">{review.content}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                        review.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                        review.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {review.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenDrawer(review)} className="p-1.5 text-[#666666] hover:text-blue-600 bg-white hover:bg-blue-50 border border-[#eaeaea] rounded transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setReviewToDelete(review)} className="p-1.5 text-[#666666] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#eaeaea] rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-[#dddddd] mx-auto mb-4" />
                    <h3 className="text-[16px] font-medium text-[#111111] mb-1">No reviews found</h3>
                    <p className="text-[13px] text-[#666666]">Adjust filters or wait for new customer feedback.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
           <div className="px-6 py-4 border-t border-[#eaeaea] flex items-center justify-between">
              <span className="text-sm text-gray-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of {filteredReviews.length}</span>
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
                <h2 className="text-xl font-bold text-[#111111]">{editingReview ? 'Edit Review' : 'Add Review'}</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111]"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                 <form id="review-form" onSubmit={handleSave} className="space-y-5">
                   <div>
                     <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Product</label>
                     <select value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] bg-white" required>
                        <option value="">Select Product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Customer</label>
                     <select value={formData.customer_id} onChange={(e) => setFormData({...formData, customer_id: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] bg-white">
                        <option value="">Guest (Or Select Customer...)</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Rating (1-5)</label>
                       <input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" required />
                     </div>
                     <div>
                       <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Status</label>
                       <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] bg-white">
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                       </select>
                     </div>
                   </div>

                   <div>
                     <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Title</label>
                     <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" required />
                   </div>

                   <div>
                     <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Content</label>
                     <textarea rows={4} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" required />
                   </div>
                 </form>
              </div>

              <div className="px-6 py-4 border-t border-[#eaeaea] flex justify-end space-x-3 bg-white">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-[#eaeaea] text-[14px] font-medium rounded-lg">Cancel</button>
                <button type="submit" form="review-form" className="px-6 py-2 bg-[#111111] text-white text-[14px] font-semibold rounded-lg">{editingReview ? 'Save' : 'Add'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReviewToDelete(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">Delete Review</h3>
                <p className="text-[14px] text-[#666666]">Are you sure you want to delete this review?</p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-[#eaeaea]">
                <button type="button" onClick={() => setReviewToDelete(null)} className="px-4 py-2 text-[14px] font-medium text-[#111111] bg-white border border-[#eaeaea] rounded-lg">Cancel</button>
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
