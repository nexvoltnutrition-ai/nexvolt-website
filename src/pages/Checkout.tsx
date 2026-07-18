import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Lock, MapPin, CheckCircle, CreditCard, ChevronRight, Plus, Minus, AlertCircle, ShieldCheck, Truck, Tag, Search, Trash2, Award } from "lucide-react";

export function Checkout() {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart, setIsCartOpen } = useCart();
  const { customerData, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isBuyNow = location.state?.isBuyNow || false;

  useEffect(() => {
    // Ensure cart drawer is always closed when entering checkout page
    if (setIsCartOpen) {
      setIsCartOpen(false);
    }
  }, [setIsCartOpen]);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddrs, setLoadingAddrs] = useState(true);
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
  
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [isEditingAddr, setIsEditingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({
    street: '', city: '', state: '', postal_code: '', country: '', is_default: false
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (customerData) {
      fetchAddresses();
    } else {
      setLoadingAddrs(false);
    }
  }, [customerData]);

  const fetchAddresses = async () => {
    if (!customerData) return;
    setLoadingAddrs(true);
    try {
      const { data, error } = await supabase.from('adresses').select('*').eq('customer_id', customerData.id);
      if (!error && data) {
         const parsedAddrs = data.map(d => {
            let parsed = { street: '', city: '', state: '', postal_code: '', country: '', is_default: false };
            try { if (d.address) parsed = JSON.parse(d.address); } catch(e) { parsed.street = d.address; }
            return { id: d.id, ...parsed };
         });
         setAddresses(parsedAddrs);
         const def = parsedAddrs.find(a => a.is_default);
         if (def) setSelectedAddrId(def.id);
         else if (parsedAddrs.length > 0) setSelectedAddrId(parsedAddrs[0].id);
      }
    } catch(e) {}
    setLoadingAddrs(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData) return;
    setLoadingAddrs(true);
    try {
      const addressJson = JSON.stringify({
        street: addrForm.street,
        city: addrForm.city,
        state: addrForm.state,
        postal_code: addrForm.postal_code,
        country: addrForm.country,
        is_default: addrForm.is_default || addresses.length === 0
      });

      if (addrForm.is_default) {
        const { data: allAddr } = await supabase.from('adresses').select('*').eq('customer_id', customerData.id);
        if (allAddr) {
           for (const o of allAddr) {
              try {
                let p = JSON.parse(o.address);
                if (p.is_default) {
                   p.is_default = false;
                   await supabase.from('adresses').update({ address: JSON.stringify(p) }).eq('id', o.id);
                }
              } catch(e) {}
           }
        }
      }
      
      const payload = {
         address: addressJson,
         name: customerData.name || '',
         phone: customerData.phone || '',
         customer_id: customerData.id
      };
      
      const { data, error: insertError } = await supabase.from('adresses').insert([payload]).select().single();
      
      if (!insertError && data) {
        setIsAddingAddr(false);
        setIsEditingAddr(false);
        setAddrForm({ street: '', city: '', state: '', postal_code: '', country: '', is_default: false });
        await fetchAddresses();
        setSelectedAddrId(data.id);
      }
    } catch(e) {}
    setLoadingAddrs(false);
  };

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handlePlaceOrder = async () => {
    if (!customerData) {
       navigate("/login?redirect=/checkout");
       return;
    }
    if (!selectedAddrId) {
       setError("Please select a shipping address.");
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return;
    }
    if (cart.length === 0) {
       setError("Your cart is empty.");
       return;
    }
    
    setError("");
    setPlacingOrder(true);
    
    // Calculate generic MRP / savings based on cart items providing oldPrice, or default 15% mockup discount
    const cartMRP = cart.reduce((total, item) => {
      const mrp = item.product.oldPrice || (item.product.price * 1.15); // mockup 15% if oldPrice doesn't exist
      return total + (mrp * item.quantity);
    }, 0);
    const shippingFee = cartTotal > 1500 ? 0 : 50;
    const grandTotal = cartTotal + shippingFee;

    try {
        const orderPayload = {
           customer_id: customerData.id,
           payment_status: "Pending",
           order_status: "Pending",
           subtotal: cartTotal,
           discount: cartDiscount
        };
        const { data: orderData, error: orderError } = await supabase.from('orders').insert([orderPayload]).select().single();
        
        if (orderError) throw orderError;
        
        if (orderData) {
            const orderItems = cart.map(item => ({
               order_id: orderData.id,
               product_id: item.productId,
               quantity: item.quantity,
               price: item.product.price
            }));
            
            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;
            
            clearCart();
            setToast({ message: "Order placed successfully", type: 'success' });
            setTimeout(() => {
                setSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
        }
    } catch (err: any) {
        setError(err.message || "Failed to place order. Please try again.");
        setToast({ message: "Failed to place order", type: "error" });
    } finally {
        setPlacingOrder(false);
    }
  };

  // Calculate fields for display
  const cartMRP = cart.reduce((total, item) => {
    const mrp = item.product.oldPrice || (item.product.price * 1.15); // mockup 15% if oldPrice doesn't exist
    return total + (mrp * item.quantity);
  }, 0);
  const cartDiscount = cartMRP - cartTotal;
  const shippingFee = cartTotal > 1500 ? 0 : 50;
  const grandTotal = cartTotal + shippingFee;

  if (success) {
     return (
       <div className="py-24 min-h-[80vh] bg-[#fcfcfc] flex items-center justify-center -mt-10">
         <div className="max-w-md w-full bg-white p-8 sm:p-12 text-center rounded-[32px] border border-[#eaeaea] shadow-sm">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
               <CheckCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black text-[#111111] tracking-tight mb-3">Order Confirmed</h1>
            <p className="text-[#666666] mb-8 text-[15px] leading-relaxed">
               Your order has been placed successfully and is being processed. Thank you for choosing us!
            </p>
            <div className="space-y-3">
              <Link to="/account?tab=orders" className="block w-full py-4 bg-[#111111] text-white text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all hover:bg-black hover:shadow-lg active:scale-[0.98]">
                 Track Order
              </Link>
              <Link to="/" className="block w-full py-4 bg-gray-50 text-[#111111] text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all hover:bg-gray-100 active:scale-[0.98]">
                 Continue Shopping
              </Link>
            </div>
         </div>
       </div>
     );
  }

  return (
    <div className="py-8 md:py-16 bg-[#f8f9fa] min-h-screen relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
            <span className="text-[14px] font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-2 text-[12px] font-bold text-[#888888] mb-3">
             <Link to="/cart" className="hover:text-[#111111] transition-colors">CART</Link>
             <ChevronRight className="w-3 h-3" />
             <span className="text-[#111111] uppercase tracking-wider">Secure Checkout</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#111111] tracking-tight">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
           
           {/* LEFT COLUMN: Address, Items, Payment */}
           <div className="lg:col-span-7 xl:col-span-8 space-y-6 md:space-y-8">
              
              {error && (
                 <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold">Checkout Issue</p>
                      <p className="text-sm mt-0.5 opacity-90">{error}</p>
                    </div>
                 </div>
              )}

              {/* 1. Delivery Address */}
              <div className="bg-white rounded-[24px] border border-[#eaeaea] shadow-sm overflow-hidden">
                 <div className="p-5 md:p-6 border-b border-[#eaeaea] flex items-center justify-between bg-[#fcfcfc]">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center">
                          <span className="text-sm font-bold">1</span>
                       </div>
                       <h2 className="text-lg md:text-xl font-bold text-[#111111]">Delivery Address</h2>
                    </div>
                 </div>
                 
                 <div className="p-5 md:p-6 text-left">
                    {!customerData ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center shadow-inner">
                           <p className="text-[#666666] mb-5 text-[14px]">Please log in to manage your addresses and track your orders seamlessly.</p>
                           <Link to="/login?redirect=/checkout" className="inline-flex py-3 px-8 bg-[#111111] text-white text-[13px] font-bold uppercase tracking-widest rounded-xl transition-transform hover:scale-[1.02] hover:shadow-lg">
                              Login / Register Securely
                           </Link>
                        </div>
                    ) : loadingAddrs ? (
                        <div className="flex justify-center p-12">
                          <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (addresses.length === 0 && !isAddingAddr && !isEditingAddr) ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center border-dashed">
                           <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                             <MapPin className="w-6 h-6" />
                           </div>
                           <p className="text-[#111111] font-bold text-[16px] mb-2">No Saved Addresses</p>
                           <p className="text-[#666666] mb-6 text-[13px]">Add a delivery address to proceed with your order.</p>
                           <button onClick={() => setIsAddingAddr(true)} className="inline-flex py-3 px-8 bg-[#111111] text-white text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all hover:bg-[#222]">
                              Add New Address
                           </button>
                        </div>
                    ) : isAddingAddr || isEditingAddr ? (
                        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4">
                           <h3 className="text-[14px] font-bold text-[#111111] mb-6 uppercase tracking-widest">{isEditingAddr ? 'Edit Address' : 'Add New Address'}</h3>
                           <form onSubmit={handleSaveAddress} className="space-y-5">
                              <div className="grid sm:grid-cols-2 gap-5">
                                 <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5 focus-within:text-[#111111]">Street Address</label>
                                    <input type="text" required value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#111111] focus:border-transparent outline-none transition-all" placeholder="House/Flat No., Building Name, Street" />
                                 </div>
                                 <div>
                                    <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5 focus-within:text-[#111111]">City</label>
                                    <input type="text" required value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#111111] focus:border-transparent outline-none transition-all" />
                                 </div>
                                 <div>
                                    <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5 focus-within:text-[#111111]">State / Province</label>
                                    <input type="text" required value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#111111] focus:border-transparent outline-none transition-all" />
                                 </div>
                                 <div>
                                    <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5 focus-within:text-[#111111]">Postal Code</label>
                                    <input type="text" required value={addrForm.postal_code} onChange={e => setAddrForm({...addrForm, postal_code: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#111111] focus:border-transparent outline-none transition-all" />
                                 </div>
                                 <div>
                                    <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1.5 focus-within:text-[#111111]">Country</label>
                                    <input type="text" required value={addrForm.country} onChange={e => setAddrForm({...addrForm, country: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#111111] focus:border-transparent outline-none transition-all" />
                                 </div>
                              </div>
                              <div className="flex gap-3 pt-4 border-t border-gray-200">
                                 <button type="submit" disabled={loadingAddrs} className="px-8 py-3 bg-[#111111] text-white text-[13px] font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 hover:bg-[#222] transition-colors shadow-sm">Save Address</button>
                                 <button type="button" onClick={() => { setIsAddingAddr(false); setIsEditingAddr(false); }} className="px-8 py-3 bg-white border border-gray-300 text-[#111111] text-[13px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                              </div>
                           </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                           {addresses.map(a => {
                              const isSelected = selectedAddrId === a.id;
                              return (
                                <div 
                                  key={a.id} 
                                  onClick={() => setSelectedAddrId(a.id)}
                                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[#FF6A00] bg-[#FFF8F3]' : 'border-[#eaeaea] hover:border-gray-300 bg-white'}`}
                                >
                                  <div className="flex items-start gap-4">
                                      <div className={`w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-[#FF6A00]' : 'border-[#cccccc]'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-[#FF6A00] rounded-full" />}
                                      </div>
                                      <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <p className="font-extrabold text-[#111111] text-[16px]">{customerData.name}</p>
                                            {a.is_default && <span className="text-[10px] font-bold bg-[#FF6A00]/10 text-[#FF6A00] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                                          </div>
                                          {isSelected && (
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); setAddrForm(a); setIsEditingAddr(true); }}
                                              className="text-[11px] font-bold text-[#FF6A00] uppercase tracking-wider hover:underline"
                                            >
                                              Edit
                                            </button>
                                          )}
                                        </div>
                                        <p className="text-[#444444] text-[14px] leading-relaxed mt-1 break-words pr-12">
                                          {a.street}, {a.city}, {a.state} {a.postal_code}, <br/>{a.country}
                                        </p>
                                        <p className="text-[#444444] font-medium text-[13px] mt-2">+91 {customerData.phone}</p>
                                      </div>
                                  </div>
                                </div>
                              );
                           })}
                           <button 
                              onClick={() => { setAddrForm({ street: '', city: '', state: '', postal_code: '', country: '', is_default: false }); setIsAddingAddr(true); }} 
                              className="w-full py-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-[13px] font-bold text-[#666666] hover:bg-white hover:border-[#111111] hover:text-[#111111] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm"
                           >
                              <Plus className="w-4 h-4" /> Add Another Address
                           </button>
                        </div>
                    )}
                 </div>
              </div>

              {/* 2. Order Items */}
              {!isBuyNow && (
              <div className="bg-white rounded-[24px] border border-[#eaeaea] shadow-sm overflow-hidden">
                 <div className="p-5 md:p-6 border-b border-[#eaeaea] flex items-center justify-between bg-[#fcfcfc]">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center">
                          <span className="text-sm font-bold">2</span>
                       </div>
                       <h2 className="text-lg md:text-xl font-bold text-[#111111]">Order Items</h2>
                    </div>
                    <span className="text-[13px] font-bold text-[#666]">{cart.length} Items</span>
                 </div>
                 
                 <div className="p-5 md:p-6 divide-y divide-[#eaeaea]">
                    {cart.length === 0 ? (
                       <div className="py-8 text-center animate-in fade-in">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-[#111111] font-bold mb-2">Cart is empty</p>
                          <Link to="/" className="text-[#FF6A00] font-bold text-sm tracking-wider uppercase hover:underline hover:underline-offset-4">Go Shopping</Link>
                       </div>
                    ) : (
                       cart.map(item => {
                         const maxStock = item.product.stock || 10;
                         const itemMRP = item.product.oldPrice || (item.product.price * 1.15);
                         const hasDiscount = itemMRP > item.product.price;
                         
                         return (
                           <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 sm:gap-6 animate-in fade-in">
                              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#f8f9fa] rounded-2xl border border-[#eaeaea] overflow-hidden flex-shrink-0 relative group">
                                 {
                                    (() => {
                                        const imgSrc = item.product?.image || (item.product?.images && item.product.images[0]) || '';
                                        return <img src={imgSrc} alt={item.product?.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />;
                                    })()
                                  }
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                 <div>
                                   <div className="flex justify-between items-start gap-4">
                                     <div>
                                        <p className="text-[11px] font-extrabold text-[#FF6A00] uppercase tracking-widest mb-1">{item.product.brand || 'Premium'}</p>
                                        <h4 className="text-[15px] sm:text-[16px] font-bold text-[#111111] leading-snug">{item.product.name}</h4>
                                     </div>
                                     <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg" title="Remove item">
                                       <Trash2 className="w-4 h-4" />
                                     </button>
                                   </div>
                                 </div>
                                 
                                 <div className="flex flex-wrap items-end justify-between mt-4 gap-4">
                                   <div className="flex items-center bg-white border border-[#eaeaea] rounded-xl overflow-hidden shadow-sm h-10 w-28">
                                     <button 
                                        disabled={item.quantity <= 1}
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-10 h-full flex items-center justify-center text-[#888] hover:text-[#111] hover:bg-gray-50 transition-colors disabled:opacity-30"
                                     ><Minus className="w-3.5 h-3.5" /></button>
                                     <div className="flex-1 h-full flex items-center justify-center text-[13px] font-bold text-[#111] border-x border-[#eaeaea] bg-gray-50">
                                       {item.quantity}
                                     </div>
                                     <button 
                                        disabled={item.quantity >= maxStock}
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-10 h-full flex items-center justify-center text-[#888] hover:text-[#111] hover:bg-gray-50 transition-colors disabled:opacity-30"
                                     ><Plus className="w-3.5 h-3.5" /></button>
                                   </div>
                                   
                                   <div className="text-right">
                                     {hasDiscount && (
                                       <p className="text-[12px] text-[#888] line-through font-medium mb-0.5">
                                         {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((itemMRP * item.quantity))}
                                       </p>
                                     )}
                                     <p className="text-[18px] font-black text-[#111111]">
                                       {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(((item.product.price || 0) * item.quantity))}
                                     </p>
                                   </div>
                                 </div>
                              </div>
                           </div>
                         )
                       })
                    )}
                 </div>
              </div>
              )}

              {/* Payment Method */}
              <div className="bg-white rounded-[24px] border border-[#eaeaea] shadow-sm overflow-hidden relative">
                 <div className="p-5 md:p-6 border-b border-[#eaeaea] flex items-center bg-[#fcfcfc] gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center">
                       <span className="text-sm font-bold">{isBuyNow ? "2" : "3"}</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-[#111111]">Payment Options</h2>
                 </div>
                 <div className="p-5 md:p-6">
                    <div className="p-5 rounded-2xl border-2 border-[#111111] bg-[#fafafa] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-5 h-5 rounded-full border-2 border-[#111111] flex items-center justify-center flex-shrink-0">
                              <div className="w-2.5 h-2.5 bg-[#111111] rounded-full" />
                           </div>
                           <div>
                              <p className="font-bold text-[#111111] text-[15px]">Cash on Delivery (COD)</p>
                              <p className="text-[13px] text-[#666666] mt-1">Pay at your doorstep securely.</p>
                           </div>
                        </div>
                        <CreditCard className="w-6 h-6 text-[#111111] opacity-20" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mt-4 ml-2">Online payments coming soon.</p>
                 </div>
              </div>

           </div>

           {/* RIGHT COLUMN: Order Summary & Trust */}
           <div className="lg:col-span-5 xl:col-span-4 lg:sticky top-24 space-y-6">
              
              {/* Rewards / Coupons */}
              <div className="bg-gradient-to-br from-[#FFF8F3] to-white rounded-[24px] border border-[#FFE7B3] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#111111] text-[15px]">NutriPoints</h3>
                </div>
                <p className="text-[13px] text-[#666] mb-0 leading-relaxed">
                   You will earn <strong className="text-[#FF6A00] font-black">{Math.floor(cartTotal * 0.05)} Points</strong> from this order. They will be added to your account after delivery.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#eaeaea] shadow-md shadow-gray-200/50">
                 <h2 className="text-xl font-black text-[#111111] mb-6">Order Summary</h2>
                 
                 {/* Compact Items for Buy Now */}
                 {isBuyNow && cart.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-[#eaeaea] space-y-4 max-h-[300px] overflow-y-auto pr-2">
                       {cart.map(item => {
                         const imgSrc = item.product?.image || (item.product?.images && item.product.images[0]) || '';
                         return (
                           <div key={item.id} className="flex gap-4 items-center">
                              <img src={imgSrc} alt={item.product?.name} className="w-16 h-16 rounded-xl bg-[#f8f9fa] border border-[#eaeaea] object-cover mix-blend-multiply flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[14px] font-bold text-[#111111] leading-tight truncate">{item.product.name}</h4>
                                 <p className="text-[12px] text-[#888] mt-1 font-medium">Qty: <span className="text-[#111]">{item.quantity}</span></p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                 <p className="text-[14px] font-black text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(((item.product.price || 0) * item.quantity))}</p>
                              </div>
                           </div>
                         )
                       })}
                    </div>
                 )}

                 {/* Coupons */}
                 <div className="mb-6 flex gap-2">
                   <div className="relative flex-1">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                     <input 
                       type="text" 
                       placeholder="HAVE A COUPON?"
                       value={couponCode}
                       onChange={(e) => setCouponCode(e.target.value)}
                       className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[12px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-[#111] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                     />
                   </div>
                   <button 
                     disabled={!couponCode || isApplyingCoupon}
                     onClick={() => { setIsApplyingCoupon(true); setTimeout(() => setIsApplyingCoupon(false), 1000) }}
                     className="px-6 bg-[#111] text-white text-[12px] font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 hover:bg-[#333] transition-colors relative overflow-hidden"
                   >
                     {isApplyingCoupon ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                     ) : 'Apply'}
                   </button>
                 </div>

                 <div className="space-y-4 pt-2 text-[14px]">
                    <div className="flex justify-between text-[#666] font-medium">
                       <span>Total MRP</span>
                       <span className="">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartMRP)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium pb-4 border-b border-gray-100 border-dashed">
                       <span>Discount on MRP</span>
                       <span className="">-{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-[#666] font-medium pt-2">
                       <span>Sub Total</span>
                       <span className="text-[#111] font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#666] font-medium">
                       <span>Shipping Fee</span>
                       <span className={shippingFee === 0 ? "text-emerald-600 font-bold uppercase tracking-wider text-[12px]" : "font-medium"}>
                         {shippingFee === 0 ? "Free" : `₹${shippingFee}`}
                       </span>
                    </div>
                    
                    <div className="flex justify-between pt-6 border-t border-[#eaeaea] mt-6 items-end">
                       <div>
                         <span className="font-black text-[#111111] text-lg block">Grand Total</span>
                         <span className="text-[10px] text-[#888] font-bold uppercase tracking-widest">Inclusive of all taxes</span>
                       </div>
                       <span className="font-black text-[#FF6A00] text-[28px] leading-none tracking-tight">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(grandTotal)}</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="bg-emerald-50 text-emerald-700 text-center py-3 rounded-xl text-[13px] font-bold tracking-wide mt-4 border border-emerald-100 shadow-inner mt-4">
                        You save {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartDiscount)} on this order! 🎉
                      </div>
                    )}
                 </div>

                 <button 
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || cart.length === 0 || !customerData || !selectedAddrId}
                    className="w-full mt-6 h-[56px] bg-[#111111] text-white text-[15px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-[#FF6A00] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group"
                 >
                    {placingOrder ? (
                       <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Placing Order...
                       </>
                    ) : (
                       <>
                          <Lock className="w-4 h-4 mr-1 text-white/70" /> 
                          Place Order Securely
                       </>
                    )}
                 </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                 <div className="bg-white p-4.5 rounded-[20px] border border-[#eaeaea] flex flex-col items-center justify-center text-center shadow-sm hover:border-[#111] transition-colors">
                    <ShieldCheck className="w-7 h-7 text-emerald-500 mb-2.5" strokeWidth={1.5} />
                    <span className="text-[11px] font-extrabold text-[#111] uppercase tracking-wider mb-1">100% Secure</span>
                    <span className="text-[10px] text-[#888] font-medium leading-tight mt-1">Encrypted Payment</span>
                 </div>
                 <div className="bg-white p-4.5 rounded-[20px] border border-[#eaeaea] flex flex-col items-center justify-center text-center shadow-sm hover:border-[#111] transition-colors">
                    <CheckCircle className="w-7 h-7 text-emerald-500 mb-2.5" strokeWidth={1.5} />
                    <span className="text-[11px] font-extrabold text-[#111] uppercase tracking-wider mb-1">Authentic</span>
                    <span className="text-[10px] text-[#888] font-medium leading-tight mt-1">Sourced Directly</span>
                 </div>
                 <div className="bg-white p-4.5 rounded-[20px] border border-[#eaeaea] flex flex-col items-center justify-center text-center shadow-sm hover:border-[#111] transition-colors">
                    <Truck className="w-7 h-7 text-emerald-500 mb-2.5" strokeWidth={1.5} />
                    <span className="text-[11px] font-extrabold text-[#111] uppercase tracking-wider mb-1">Fast Dispatch</span>
                    <span className="text-[10px] text-[#888] font-medium leading-tight mt-1">Ships in 24 Hours</span>
                 </div>
                 <div className="bg-white p-4.5 rounded-[20px] border border-[#eaeaea] flex flex-col items-center justify-center text-center shadow-sm hover:border-[#111] transition-colors">
                    <Tag className="w-7 h-7 text-emerald-500 mb-2.5" strokeWidth={1.5} />
                    <span className="text-[11px] font-extrabold text-[#111] uppercase tracking-wider mb-1">Easy Returns</span>
                    <span className="text-[10px] text-[#888] font-medium leading-tight mt-1">14-Day Policy</span>
                 </div>
              </div>

           </div>

        </div>
      </div>
    </div>
  );
}
