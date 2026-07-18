import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Eye, PackageCheck, AlertCircle, PackageX, RefreshCw, Archive, X, Filter, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { supabase } from "../../lib/supabase";

export function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({ pending: 0, delivered: 0, cancelled: 0, prepaid: 0, cod: 0 });
  const [orderTrends, setOrderTrends] = useState<any[]>([]);
  
  // Filters
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sportFilter, setSportFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        
        const customerIds = data.map(o => o.customer_id).filter(Boolean);
        const { data: customers } = await supabase.from('customers').select('id, name, email, phone').in('id', customerIds);
        
        const orderIds = data.map(o => o.id);
        const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderIds);
        const productIds = items ? items.map(i => i.product_id) : [];
        const { data: products } = await supabase.from('products').select('id, name').in('id', productIds);

        const mapped = data.map(o => {
          const cust = customers?.find(c => c.id === o.customer_id);
          const orderItems = items?.filter(i => i.order_id === o.id) || [];
          
          return {
            ...o,
            customer: cust?.name || "Unknown",
            email: cust?.email || "No email",
            phone: cust?.phone || "No phone",
            date: new Date(o.created_at).toLocaleDateString(),
            amount: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(o.subtotal || o.total_amount || 0),
            items: orderItems.length,
            sport: "General",
            status: o.order_status || o.status || 'Pending',
            payment_method: o.payment_method, products: orderItems.map((i: any) => {
              const p = products?.find(p => p.id === i.product_id);
              return `${p?.name || 'Product'} (x${i.quantity})`;
            }).join(', ') || "Unknown items",
            address: "No Address",
            payment: o.payment_status || o.payment_method || "Online"
          };
        });
        
        setOrdersData(mapped);

        setAnalytics({
          pending: mapped.filter((o: any) => o.status === 'Pending').length,
          delivered: mapped.filter((o: any) => o.status === 'Delivered').length,
          cancelled: mapped.filter((o: any) => o.status === 'Cancelled').length,
          prepaid: mapped.filter((o: any) => o.payment_method?.toLowerCase() !== 'cod').length,
          cod: mapped.filter((o: any) => o.payment_method?.toLowerCase() === 'cod').length
        });
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trends = days.map(d => ({ name: d, orders: 0, revenue: 0 }));
        
        mapped.forEach((o: any) => {
          const d = new Date(o.created_at || new Date()).getDay();
          trends[d].orders += 1;
          trends[d].revenue += (o.subtotal || o.total_amount || 0);
        });
        
        setOrderTrends([...trends.slice(1), trends[0]]);
        
      } else {
        setOrdersData([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) || order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesSport = sportFilter === "All" || order.sport === sportFilter;
    return matchesSearch && matchesStatus && matchesSport;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sportFilter]);

  const handleOpenDrawer = (order: any) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (selectedOrder) {
      try {
         await supabase.from('orders').update({ order_status: newStatus }).eq('id', selectedOrder.id);
         const updatedOrder = { ...selectedOrder, status: newStatus, order_status: newStatus };
         setSelectedOrder(updatedOrder);
         setOrdersData(ordersData.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      } catch (err) {
         console.error("Failed to update status", err);
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Orders & Analytics</h1>
          <p className="text-[15px] text-[#666666] mt-1">Manage fulfillment, shipping, and view order analytics.</p>
        </div>
        <div className="flex items-center space-x-2">
           <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] font-medium text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
              <option value="Lifetime">Total Lifetime</option>
           </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
    { title: "Pending Orders", value: analytics.pending.toString(), color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    { title: "Delivered Orders", value: analytics.delivered.toString(), color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Cancelled Orders", value: analytics.cancelled.toString(), color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Prepaid Orders", value: analytics.prepaid.toString(), color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "COD Orders", value: analytics.cod.toString(), color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" }
  ].map((stat, idx) => (
          <div key={idx} className={`bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-center ${stat.border}`}>
            <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.title}</p>
            <p className={`text-[24px] font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm p-6 flex flex-col">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-[16px] font-bold text-[#111111] mb-1">Order Volume Trends</h2>
            <p className="text-[13px] text-[#666666]">Daily order volume for the selected period.</p>
          </div>
        </div>
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={orderTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#111111', fontSize: '14px', fontWeight: 600 }}
                labelStyle={{ color: '#666666', fontSize: '12px', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Table & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search orders, customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-[#111111]"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
           <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] text-[#666666] focus:outline-none"
           >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
           </select>
           
           <select 
              value={sportFilter} 
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] text-[#666666] focus:outline-none"
           >
              <option value="All">All Sports</option>
              <option value="Powerlifting">Powerlifting</option>
              <option value="HYROX">HYROX</option>
              <option value="CrossFit">CrossFit</option>
              <option value="Marathon">Marathon</option>
              <option value="Cricket">Cricket</option>
           </select>
           
           <button className="px-3 py-2 border border-[#eaeaea] text-[#666666] text-[13px] font-medium rounded-lg hover:bg-gray-50 flex items-center"><RefreshCw className="w-4 h-4 mr-1"/> Sync</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (
                <tr key={order.id} className="hover:bg-[#f8f9fa] transition-colors group cursor-pointer" onClick={() => handleOpenDrawer(order)}>
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-bold text-[#111111]">{order.id}</p>
                    <p className="text-[12px] text-[#888888]">{order.items} items</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[14px] text-[#111111] font-medium">{order.customer}</p>
                    <p className="text-[12px] text-[#555555]">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#888888]">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-bold text-[#111111]">{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="p-1.5 text-[#666666] hover:text-[#111111] bg-white hover:bg-gray-100 border border-[#eaeaea] rounded transition-colors inline-flex opacity-0 group-hover:opacity-100 items-center">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filteredOrders.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-[#eaeaea] flex items-center justify-between">
              <p className="text-[13px] text-[#666666]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
              </p>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium disabled:opacity-50"
                >Prev</button>
                {Array.from({ length: Math.ceil(filteredOrders.length / itemsPerPage) }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded text-[13px] font-medium ${currentPage === i + 1 ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#eaeaea]'}`}
                  >{i + 1}</button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                  className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          )}
        </div>

       <AnimatePresence>
        {isDrawerOpen && selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-[#eaeaea]">
               <div className="px-6 py-4 border-b border-[#eaeaea] flex items-center justify-between bg-white relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">{selectedOrder.id}</h2>
                  <p className="text-[13px] font-medium mt-1">
                    <span className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                  </p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111] p-2 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>

               <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc] space-y-6">
                 {/* Quick Actions */}
                 <div className="grid grid-cols-5 gap-2">
                   <button onClick={() => handleUpdateStatus('Processing')} className="flex flex-col items-center justify-center p-3 bg-white border border-[#eaeaea] rounded-lg hover:border-[#111111]"><PackageCheck className="w-5 h-5 text-gray-600 mb-1"/><span className="text-[11px] font-semibold text-gray-700">Process</span></button>
                   <button onClick={() => handleUpdateStatus('Shipped')} className="flex flex-col items-center justify-center p-3 bg-white border border-[#eaeaea] rounded-lg hover:border-[#111111]"><Archive className="w-5 h-5 text-blue-600 mb-1"/><span className="text-[11px] font-semibold text-blue-700">Ship</span></button>
                   <button onClick={() => handleUpdateStatus('Delivered')} className="flex flex-col items-center justify-center p-3 bg-white border border-[#eaeaea] rounded-lg hover:border-[#111111]"><PackageCheck className="w-5 h-5 text-emerald-600 mb-1"/><span className="text-[11px] font-semibold text-emerald-700">Deliver</span></button>
                   <button onClick={() => handleUpdateStatus('Pending')} className="flex flex-col items-center justify-center p-3 bg-white border border-[#eaeaea] rounded-lg hover:border-[#111111]"><AlertCircle className="w-5 h-5 text-amber-600 mb-1"/><span className="text-[11px] font-semibold text-amber-700">Hold</span></button>
                   <button onClick={() => handleUpdateStatus('Cancelled')} className="flex flex-col items-center justify-center p-3 bg-white border border-[#eaeaea] rounded-lg hover:border-[#111111]"><PackageX className="w-5 h-5 text-rose-600 mb-1"/><span className="text-[11px] font-semibold text-rose-700">Cancel</span></button>
                 </div>

                 {/* Order Specifics */}
                 <div className="bg-white p-5 rounded-xl border border-[#eaeaea]">
                    <h3 className="text-[14px] font-bold text-[#111111] mb-4">Customer Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-[13px]">
                       <div><p className="text-gray-500 mb-1">Name</p><p className="font-medium">{selectedOrder.customer}</p></div>
                       <div><p className="text-gray-500 mb-1">Email</p><p className="font-medium text-blue-600">{selectedOrder.email}</p></div>
                       <div><p className="text-gray-500 mb-1">Phone</p><p className="font-medium">{selectedOrder.phone}</p></div>
                       <div className="col-span-2"><p className="text-gray-500 mb-1">Shipping Address</p><p className="font-medium">{selectedOrder.address}</p></div>
                    </div>
                 </div>

                 <div className="bg-white p-5 rounded-xl border border-[#eaeaea]">
                    <h3 className="text-[14px] font-bold text-[#111111] mb-4">Line Items ({selectedOrder.items})</h3>
                    <div className="text-[13px] font-medium text-gray-800">
                       {selectedOrder.products?.split(', ').map((p: string, i: number) => <p key={i} className="mb-2 pb-2 border-b border-gray-100 last:border-0">{p}</p>)}
                    </div>
                 </div>

                 <div className="bg-white p-5 rounded-xl border border-[#eaeaea]">
                    <h3 className="text-[14px] font-bold text-[#111111] mb-4">Payment Summary</h3>
                     <div className="flex justify-between items-center text-[13px] mb-2"><p className="text-gray-500">Method</p><p className="font-medium">{selectedOrder.payment}</p></div>
                     <div className="flex justify-between items-center text-[13px] mb-2"><p className="text-gray-500">Subtotal</p><p className="font-medium">{selectedOrder.amount}</p></div>
                     <div className="flex justify-between items-center text-[13px] mb-2"><p className="text-gray-500">Shipping</p><p className="font-medium">₹0</p></div>
                     <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100"><p className="font-bold text-[#111111]">Total</p><p className="font-bold text-[16px] text-[#111111]">{selectedOrder.amount}</p></div>
                 </div>
              </div>

               <div className="px-6 py-4 border-t border-[#eaeaea] bg-white text-right">
                <button onClick={() => setIsDrawerOpen(false)} className="px-6 py-2 bg-[#111111] text-white text-[14px] font-semibold rounded-lg hover:bg-black transition-colors">Close</button>
              </div>
            </motion.div>
          </>
        )}
       </AnimatePresence>
    </div>
  );
}
