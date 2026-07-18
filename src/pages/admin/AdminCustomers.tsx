import React, { useState, useMemo, useEffect } from "react";
import { Search, ExternalLink, Trophy, Star, Activity, ShoppingBag, X, ChevronDown, Award, Crown, Shield, SortAsc, SortDesc } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

const getCalculatedTier = (spent: number) => {
  if (spent >= 25000) return 'Diamond Athlete';
  if (spent >= 10000) return 'Gold Athlete';
  return 'Silver Athlete';
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("All Customers");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState("Profile");
  const [drawerAddresses, setDrawerAddresses] = useState<any[]>([]);
  const [drawerWishlist, setDrawerWishlist] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const loadCustomerDetails = async (customer: any) => {
     setSelectedUser(customer);
     setActiveDrawerTab("Profile");
     setDrawerLoading(true);
     
     try {
        const safeFetch = async (query: any) => {
           try { const { data } = await query; return data || []; }
           catch (e) { return []; }
        };
        const [addressesData, wishlistData] = await Promise.all([
           safeFetch(supabase.from('addresses').select('*').eq('customer_id', customer.id)),
           safeFetch(supabase.from('wishlist').select('*, product:products(*)').eq('customer_id', customer.id))
        ]);
        
        const altAdresses = await safeFetch(supabase.from('adresses').select('*').eq('customer_id', customer.id));
        
        setDrawerAddresses(addressesData?.length ? addressesData : altAdresses);
        setDrawerWishlist(wishlistData || []);
     } catch (err) {
        console.error("Error loading customer details:", err);
     } finally {
        setDrawerLoading(false);
     }
  };
  
  // Sorting
  const [sortField, setSortField] = useState<string>("totalSpent");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const [
        { data: customersData, error: customersError },
        { data: ordersData, error: ordersError }
      ] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*')
      ]);

      if (customersError) {
         console.error('Error fetching customers:', customersError);
      } else if (customersData) {
         setCustomers(customersData.map((c: any) => {
            const customerOrders = (ordersData || []).filter((o: any) => o.customer_id === c.id);
            const spent = customerOrders.reduce((sum: number, o: any) => sum + (o.subtotal || o.total_amount || 0), 0) + (c.total_spent || 0);
            const joinedDate = new Date(c.created_at).toLocaleDateString();
            const lastOrderDate = customerOrders.length > 0 
                ? new Date(Math.max(...customerOrders.map((o: any) => new Date(o.created_at).valueOf()))).toLocaleDateString()
                : "N/A";

            return {
               id: c.id,
               name: c.name || "Unknown",
               email: c.email || "No email",
               phone: c.phone || "No phone",
               totalSpent: spent,
               orders: customerOrders.length || 0,
               loyalty: c.points || 0,
               joined: joinedDate,
               lastOrder: lastOrderDate,
               image: "https://i.pravatar.cc/150?u=" + c.id,
               rawCustomerData: c,
               rawOrders: customerOrders
            }
         }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format helper for customers with effective tier
  const customersWithTiers = useMemo(() => {
    return customers.map(c => ({
      ...c,
      currentTier: c.manualTier || getCalculatedTier(c.totalSpent)
    }));
  }, [customers]);

  // Analytics Metrics
  const totalCustomers = customersWithTiers.length;
  const silverAthletes = customersWithTiers.filter(c => c.currentTier === 'Silver Athlete').length;
  const goldAthletes = customersWithTiers.filter(c => c.currentTier === 'Gold Athlete').length;
  const diamondAthletes = customersWithTiers.filter(c => c.currentTier === 'Diamond Athlete').length;
  const repeatCustomers = customersWithTiers.filter(c => c.orders > 1).length;

  // Filter & Sort
  const filteredCustomers = useMemo(() => {
    let result = customersWithTiers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "All Customers" || c.currentTier === activeTab;
      return matchesSearch && matchesTab;
    });

    result = result.sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a];
      let bVal: any = b[sortField as keyof typeof b];

      // Handle tier sorting specifically
      if (sortField === 'currentTier') {
         const tierOrder: Record<string, number> = { 'Diamond Athlete': 3, 'Gold Athlete': 2, 'Silver Athlete': 1 };
         aVal = tierOrder[a.currentTier as string] || 0;
         bVal = tierOrder[b.currentTier as string] || 0;
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customersWithTiers, searchTerm, activeTab, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleUpdateTier = async (id: string, newTier: string | null) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, manualTier: newTier } : c));
    if (selectedUser && selectedUser.id === id) {
       setSelectedUser((prev: any) => ({ ...prev, currentTier: newTier || getCalculatedTier(prev.totalSpent), manualTier: newTier }));
    }
    
    try {
      const tierToSave = newTier || getCalculatedTier(selectedUser?.totalSpent || 0);
      await supabase.from('customers').update({ tier: tierToSave }).eq('id', id);
    } catch (err) {
      console.error("Error updating tier:", err);
    }
  };

  const tabs = [
    { name: "All Customers", count: totalCustomers },
    { name: "Silver Athlete", count: silverAthletes },
    { name: "Gold Athlete", count: goldAthletes },
    { name: "Diamond Athlete", count: diamondAthletes },
  ];

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <SortAsc className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1 text-[#111111]" /> : <SortDesc className="w-3 h-3 ml-1 text-[#111111]" />;
  };

  const TierBadge = ({ tier }: { tier: string }) => {
    if (tier === 'Diamond Athlete') return <span className="inline-flex items-center px-2 py-1 text-[11px] font-bold uppercase rounded bg-black text-white"><Crown className="w-3 h-3 mr-1" /> Diamond</span>;
    if (tier === 'Gold Athlete') return <span className="inline-flex items-center px-2 py-1 text-[11px] font-bold uppercase rounded bg-amber-100 text-amber-800"><Trophy className="w-3 h-3 mr-1" /> Gold</span>;
    return <span className="inline-flex items-center px-2 py-1 text-[11px] font-bold uppercase rounded bg-slate-100 text-slate-800"><Shield className="w-3 h-3 mr-1 text-slate-500" /> Silver</span>;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Loyalty & Customers</h1>
          <p className="text-[15px] text-[#666666] mt-1">Manage athlete tiers, orders, and NEXPoints.</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col justify-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1">Total Customers</p>
            <p className="text-[24px] font-bold text-[#111111]">{totalCustomers}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-1">Silver Athletes</p>
            <p className="text-[24px] font-bold text-slate-800">{silverAthletes}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-amber-600 mb-1">Gold Athletes</p>
            <p className="text-[24px] font-bold text-amber-600">{goldAthletes}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-300 bg-gray-50 shadow-sm flex flex-col justify-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-1">Diamond Athletes</p>
            <p className="text-[24px] font-bold text-black">{diamondAthletes}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Repeat Customers</p>
            <p className="text-[24px] font-bold text-emerald-600">{repeatCustomers}</p>
         </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm flex flex-col">
         <div className="flex border-b border-[#eaeaea] overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button 
                 key={tab.name}
                 onClick={() => setActiveTab(tab.name)}
                 className={`flex items-center px-6 py-4 text-[14px] font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.name ? 'border-[#111111] text-[#111111]' : 'border-transparent text-gray-500 hover:text-[#111111]'}`}
              >
                 {tab.name} <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] ${activeTab === tab.name ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
              </button>
            ))}
         </div>
         <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
              <input 
                type="text" 
                placeholder="Search athletes by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-[#111111]"
              />
            </div>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
             <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
              <tr>
                <th onClick={() => handleSort('name')} className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider cursor-pointer group hover:text-[#111111]">
                   <div className="flex items-center">Athlete <SortIcon field="name" /></div>
                </th>
                <th onClick={() => handleSort('currentTier')} className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider cursor-pointer group hover:text-[#111111]">
                   <div className="flex items-center">Current Tier <SortIcon field="currentTier" /></div>
                </th>
                <th onClick={() => handleSort('totalSpent')} className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider cursor-pointer group hover:text-[#111111]">
                   <div className="flex items-center">Total Spent <SortIcon field="totalSpent" /></div>
                </th>
                <th onClick={() => handleSort('orders')} className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider cursor-pointer group hover:text-[#111111]">
                   <div className="flex items-center">Orders <SortIcon field="orders" /></div>
                </th>
                <th onClick={() => handleSort('loyalty')} className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider cursor-pointer group hover:text-[#111111]">
                   <div className="flex items-center">Points <SortIcon field="loyalty" /></div>
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Sport</th>
                <th onClick={() => handleSort('lastOrder')} className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider cursor-pointer group hover:text-[#111111]">
                   <div className="flex items-center">Last Order <SortIcon field="lastOrder" /></div>
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((customer) => (
                <tr key={customer.id} className="hover:bg-[#f8f9fa] transition-colors group">
                  <td className="px-6 py-4 cursor-pointer" onClick={() => loadCustomerDetails(customer)}>
                     <div className="flex items-center">
                        <img src={customer.image} alt="" className="w-10 h-10 rounded-full object-cover mr-3 bg-gray-100" />
                        <div>
                          <p className="text-[14px] font-bold text-[#111111]">{customer.name}</p>
                          <p className="text-[12px] text-gray-500">{customer.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col items-start gap-1">
                       <TierBadge tier={customer.currentTier} />
                       {customer.manualTier && <span className="text-[10px] text-purple-600 font-bold tracking-wide uppercase">Manual Override</span>}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-bold text-[#111111]">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#111111]">{customer.orders}</td>
                  <td className="px-6 py-4 text-[14px] font-bold text-amber-500">{customer.loyalty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{customer.sport}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-500">{customer.lastOrder}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                     <div className="relative group/menu">
                        <button className="text-[12px] border border-gray-200 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50">Manage Tier</button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#eaeaea] rounded-xl shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 p-2">
                           <button onClick={() => handleUpdateTier(customer.id, 'Diamond Athlete')} className="w-full text-left px-3 py-2 text-[13px] font-medium hover:bg-gray-50 rounded-lg flex items-center"><Crown className="w-3 h-3 mr-2" /> Set Diamond</button>
                           <button onClick={() => handleUpdateTier(customer.id, 'Gold Athlete')} className="w-full text-left px-3 py-2 text-[13px] font-medium hover:bg-gray-50 rounded-lg flex items-center"><Trophy className="w-3 h-3 mr-2" /> Set Gold</button>
                           <button onClick={() => handleUpdateTier(customer.id, 'Silver Athlete')} className="w-full text-left px-3 py-2 text-[13px] font-medium hover:bg-gray-50 rounded-lg flex items-center"><Shield className="w-3 h-3 mr-2" /> Set Silver</button>
                           {customer.manualTier && (
                             <div className="border-t border-gray-100 mt-1 pt-1">
                               <button onClick={() => handleUpdateTier(customer.id, null)} className="w-full text-left px-3 py-2 text-[13px] text-rose-500 font-medium hover:bg-rose-50 rounded-lg">Remove Override</button>
                             </div>
                           )}
                        </div>
                     </div>
                     <button onClick={() => loadCustomerDetails(customer)} className="text-[#666666] hover:text-[#111111] p-1.5 transition-colors"><ExternalLink className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filteredCustomers.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-[#eaeaea] flex items-center justify-between">
              <p className="text-[13px] text-[#666666]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
              </p>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium disabled:opacity-50"
                >Prev</button>
                {Array.from({ length: Math.ceil(filteredCustomers.length / itemsPerPage) }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded text-[13px] font-medium ${currentPage === i + 1 ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#eaeaea]'}`}
                  >{i + 1}</button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredCustomers.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredCustomers.length / itemsPerPage)}
                  className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          )}
        </div>

       {/* Customer Details Drawer */}
       <AnimatePresence>
        {selectedUser && (
           <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#fcfcfc] shadow-2xl flex flex-col border-l border-[#eaeaea]">
               <div className="p-8 border-b border-[#eaeaea] bg-white text-center pt-12 relative">
                  <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X className="w-5 h-5"/></button>
                  <img src={selectedUser.image} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border border-gray-100 bg-gray-50" />
                  <h2 className="text-2xl font-bold text-[#111111]">{selectedUser.name}</h2>
                  <p className="text-[14px] text-gray-500">{selectedUser.email} • {selectedUser.joined}</p>
                  <div className="mt-4 flex justify-center"><TierBadge tier={selectedUser.currentTier} /></div>
               </div>

                <div className="flex border-b border-[#eaeaea] bg-white text-[13px] font-bold">
                   {['Profile', 'Orders', 'Wishlist', 'Addresses', 'Rewards'].map(tab => (
                     <button 
                        key={tab}
                        onClick={() => setActiveDrawerTab(tab)}
                        className={`flex-1 py-3 text-center border-b-2 transition-colors ${activeDrawerTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                     >
                        {tab}
                     </button>
                   ))}
                </div>

                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                   {drawerLoading ? (
                      <div className="flex justify-center items-center h-32">
                         <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                      </div>
                   ) : (
                      <>
                         {activeDrawerTab === 'Profile' && (
                           <>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                                   <ShoppingBag className="w-5 h-5 text-gray-400 mb-2"/>
                                   <p className="text-[12px] text-gray-500 uppercase font-bold tracking-wider mb-1">Total Spent</p>
                                   <p className="text-[18px] font-bold text-[#111111]">{formatCurrency(selectedUser.totalSpent)}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                                   <Activity className="w-5 h-5 text-gray-400 mb-2"/>
                                   <p className="text-[12px] text-gray-500 uppercase font-bold tracking-wider mb-1">Total Orders</p>
                                   <p className="text-[18px] font-bold text-[#111111]">{selectedUser.orders}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center col-span-2">
                                   <Trophy className="w-5 h-5 text-amber-500 mb-2"/>
                                   <p className="text-[12px] text-gray-500 uppercase font-bold tracking-wider mb-1">NEXPoints Balance</p>
                                   <p className="text-[24px] font-bold text-[#111111]">{selectedUser.loyalty.toLocaleString()}</p>
                                </div>
                             </div>

                             <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-4">
                                <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-3">Loyalty Progress</h3>
                                {selectedUser.currentTier !== 'Diamond Athlete' && (
                                  <div className="mb-4">
                                     <div className="flex justify-between text-[12px] text-gray-500 mb-1 font-medium">
                                        <span>Current: {selectedUser.currentTier}</span>
                                        <span>Target: {selectedUser.currentTier === 'Silver Athlete' ? 'Gold Athlete' : 'Diamond Athlete'}</span>
                                     </div>
                                     <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-black rounded-full" style={{ width: `${selectedUser.currentTier === 'Silver Athlete' ? (selectedUser.totalSpent / 10000) * 100 : (selectedUser.totalSpent / 25000) * 100}%` }}></div>
                                     </div>
                                     <p className="text-[12px] text-gray-500 mt-2">Spend {formatCurrency(Math.max(0, (selectedUser.currentTier === 'Silver Athlete' ? 10000 : 25000) - selectedUser.totalSpent))} more to unlock the next tier.</p>
                                  </div>
                                )}
                                
                                <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-3 mt-6">Contact Info</h3>
                                <div className="space-y-2 text-sm text-gray-700">
                                   <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                                   <p><strong>Joined:</strong> {selectedUser.joined}</p>
                                </div>
                             </div>
                           </>
                         )}

                         {activeDrawerTab === 'Orders' && (
                            <div className="space-y-3">
                               {selectedUser.rawOrders && selectedUser.rawOrders.length > 0 ? (
                                  selectedUser.rawOrders.map((o: any) => (
                                     <div key={o.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between font-bold text-[14px]">
                                           <span>ORD-{o.id}</span>
                                           <span>{formatCurrency(o.total_amount || o.subtotal || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-[12px] text-gray-500 mt-1">
                                           <span>{new Date(o.created_at).toLocaleDateString()}</span>
                                           <span className={`px-2 py-0.5 rounded-full ${o.order_status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>{o.order_status || 'Pending'}</span>
                                        </div>
                                     </div>
                                  ))
                               ) : <p className="text-sm text-gray-500 text-center py-4">No orders found.</p>}
                            </div>
                         )}

                         {activeDrawerTab === 'Wishlist' && (
                            <div className="space-y-3">
                               {drawerWishlist && drawerWishlist.length > 0 ? (
                                  drawerWishlist.map((w: any) => (
                                     <div key={w.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                                        {w.product?.image ? <img src={w.product.image} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 bg-gray-100 rounded" />}
                                        <div>
                                           <p className="font-bold text-[13px] text-black">{w.product?.name || 'Unknown Product'}</p>
                                           <p className="text-[12px] text-gray-500">{formatCurrency(w.product?.price || 0)}</p>
                                        </div>
                                     </div>
                                  ))
                               ) : <p className="text-sm text-gray-500 text-center py-4">Wishlist is empty.</p>}
                            </div>
                         )}

                         {activeDrawerTab === 'Addresses' && (
                            <div className="space-y-3">
                               {drawerAddresses && drawerAddresses.length > 0 ? (
                                  drawerAddresses.map((a: any) => (
                                     <div key={a.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">
                                        <p className="font-bold mb-1">{a.full_name || a.name || 'Saved Address'}</p>
                                        <p className="text-gray-600">{a.address_line_1} {a.address_line_2}</p>
                                        <p className="text-gray-600">{a.city}, {a.state} {a.zip_code || a.pincode}</p>
                                        <p className="text-gray-600">{a.country}</p>
                                        {a.phone && <p className="text-gray-500 mt-1">📞 {a.phone}</p>}
                                     </div>
                                  ))
                               ) : <p className="text-sm text-gray-500 text-center py-4">No saved addresses.</p>}
                            </div>
                         )}

                         {activeDrawerTab === 'Rewards' && (
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-center">
                                <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3"/>
                                <h3 className="text-lg font-bold text-black mb-1">{selectedUser.loyalty} Points available</h3>
                                <p className="text-sm text-gray-500 mb-4">Points can be redeemed for discounts on the next purchase.</p>
                                <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm font-bold">
                                   Tier: {selectedUser.currentTier}
                                </div>
                            </div>
                         )}
                      </>
                   )}
                </div>
            </motion.div>
           </>
        )}
       </AnimatePresence>

    </div>
  );
}

