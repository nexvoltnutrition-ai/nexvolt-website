import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Package, Heart, Award, MapPin, LogOut, 
  BadgeCheck, Edit3, Shield, Key, ChevronRight, 
  Copy, CheckCircle2, Ticket, Gift, X
} from 'lucide-react';

type TabType = 'profile' | 'orders' | 'wishlist' | 'rewards' | 'addresses' | 'referrals';

export function Account() {
  const { user, customerData, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const navigate = useNavigate();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    gender: '',
    dob: ''
  });

  // Password Edit State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState<{id?: string, street: string, city: string, state: string, postal_code: string, country: string, is_default: boolean}>({ street: '', city: '', state: '', postal_code: '', country: '', is_default: false });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Wishlist State
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Rewards State
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);

  // Referrals State
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);

  // Initialize profile form when customerData is ready
  useEffect(() => {
    if (customerData) {
      setProfileForm({
        name: customerData.name || '',
        phone: customerData.phone || '',
        gender: customerData.gender || '',
        dob: customerData.dob || ''
      });
    }
  }, [customerData]);

  // For copying referral code
  const [copied, setCopied] = useState(false);

  const fetchOrders = async () => {
    if (!customerData) return;
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('customer_id', customerData.id).order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
         // Because order_items relationship is broken, fetch manually
         const orderIds = data.map(o => o.id);
         const { data: itemsData } = await supabase.from('order_items').select('*').in('order_id', orderIds);
         
         if (itemsData) {
            // Fetch products for all items
            const productIds = itemsData.map(i => i.product_id);
            const { data: productsData } = await supabase.from('products').select('id, name').in('id', productIds);
            
            data.forEach(o => {
               o.items = itemsData.filter(i => i.order_id === o.id).map(i => {
                   const productInfo = productsData?.find(p => p.id === i.product_id);
                   return { 
                       product_name: productInfo?.name || 'Product', 
                       quantity: i.quantity 
                   };
               });
            });
         }
         setOrders(data);
      } else {
         setOrders(data || []);
      }
    } catch(e) {}
    setOrdersLoading(false);
  };

  const fetchAddresses = async () => {
    if (!customerData) return;
    setAddrLoading(true);
    try {
      const { data, error } = await supabase.from('adresses').select('*').eq('customer_id', customerData.id);
      if (!error && data) {
         setAddresses(data.map(d => {
            let parsed = { street: '', city: '', state: '', postal_code: '', country: '', is_default: false };
            try { if (d.address) parsed = JSON.parse(d.address); } catch(e) { parsed.street = d.address; }
            return { id: d.id, ...parsed };
         }));
      }
    } catch(e) {}
    setAddrLoading(false);
  };

  const fetchWishlist = async () => {
    if (!customerData) return;
    setWishlistLoading(true);
    try {
      const stored = localStorage.getItem(`wishlist_${customerData.id}`);
      if (stored) {
         const ids = JSON.parse(stored);
         if (ids.length > 0) {
            const { data, error } = await supabase.from('products').select('*').in('id', ids);
            if (!error && data) {
               setWishlist(data.map(p => ({ id: p.id, product_id: p.id, products: p })));
            }
         } else {
            setWishlist([]);
         }
      } else {
         setWishlist([]);
      }
    } catch(e) {}
    setWishlistLoading(false);
  };

  const fetchRewards = async () => {
    if (!customerData) return;
    setRewardsLoading(true);
    try {
      // Rewards table is a catalog, not a user history.
      const { data, error } = await supabase.from('rewards').select('*').order('points_required', { ascending: true });
      if (!error && data) setRewardsList(data);
    } catch(e) {}
    setRewardsLoading(false);
  };

  const fetchReferrals = async () => {
    if (!customerData) return;
    setReferralsLoading(true);
    try {
      const { data, error } = await supabase.from('referrals').select('*').eq('referrer_id', customerData.id).order('created_at', { ascending: false });
      if (!error && data) setReferralsList(data);
    } catch(e) {}
    setReferralsLoading(false);
  };

  useEffect(() => {
    if (customerData) {
       if (activeTab === 'orders') fetchOrders();
       if (activeTab === 'addresses') fetchAddresses();
       if (activeTab === 'wishlist') fetchWishlist();
       if (activeTab === 'rewards') fetchRewards();
       if (activeTab === 'referrals') fetchReferrals();
    }
  }, [activeTab, customerData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData) return;
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
       const { error } = await supabase.from('customers')
         .update(profileForm)
         .eq('id', customerData.id);
       if (error) throw error;
       setProfileSuccess('Profile updated successfully! Refreshing...');
       setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
       setProfileError(err.message || 'Failed to update profile');
    } finally {
       setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.app_metadata.provider === 'google') return;
    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: pwdForm.current
      });
      if (signInError) throw new Error('Current password is incorrect');

      const { error: updateError } = await supabase.auth.updateUser({
        password: pwdForm.new
      });
      if (updateError) throw updateError;
      
      setPwdSuccess('Password updated successfully');
      setPwdForm({ current: '', new: '' });
      setIsEditingPassword(false);
    } catch (err: any) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData) return;
    setAddrLoading(true);
    try {
      const addressJson = JSON.stringify({
        street: addrForm.street,
        city: addrForm.city,
        state: addrForm.state,
        postal_code: addrForm.postal_code,
        country: addrForm.country,
        is_default: addrForm.is_default
      });

      console.log('--- DEBUG ADDRESS SAVE ---');
      const { data: authData } = await supabase.auth.getUser();
      console.log('1. Current authenticated user ID:', authData?.user?.id);
      console.log('2. Current customer ID:', customerData.id);

      if (addrForm.is_default) {
        const { data: allAddr } = await supabase.from('adresses').select('*').eq('customer_id', customerData.id);
        if (allAddr) {
           for (const o of allAddr) {
              try {
                let p = JSON.parse(o.address);
                if (p.is_default && o.id !== addrForm.id) {
                   p.is_default = false;
                   await supabase.from('adresses').update({ address: JSON.stringify(p) }).eq('id', o.id);
                }
              } catch(e) {}
           }
        }
      }
      
      let error = null;
      if (addrForm.id) {
         const payload = {
           address: addressJson,
           name: customerData.name || '',
           phone: customerData.phone || ''
         };
         console.log('3. Exact address payload being sent (UPDATE):', payload);
         const { data: resultData, error: updateError } = await supabase.from('adresses').update(payload).eq('id', addrForm.id).select();
         console.log('4. Supabase query result:', resultData);
         console.log('5. Supabase insert/update error:', updateError);
         error = updateError;
      } else {
         const payload = {
           address: addressJson,
           name: customerData.name || '',
           phone: customerData.phone || '',
           customer_id: customerData.id
         };
         console.log('3. Exact address payload being sent (INSERT):', payload);
         const { data: resultData, error: insertError } = await supabase.from('adresses').insert([payload]).select();
         console.log('4. Supabase query result:', resultData);
         console.log('5. Supabase insert/update error:', insertError);
         
         if (insertError) {
             if (insertError.code === '42501' || insertError.message?.includes('RLS') || insertError.message?.includes('policy')) {
                 console.log('6. RLS policy error detected:', insertError.message);
             } else {
                 console.log('7. Validation constraints error detected:', insertError.message, insertError.details, insertError.hint);
             }
         }
         error = insertError;
      }
      
      if (!error) {
        setIsAddingAddr(false);
        setAddrForm({ street: '', city: '', state: '', postal_code: '', country: '', is_default: false });
        fetchAddresses();
      } else {
        console.error('Final error object:', error);
      }
    } catch(e) {
        console.error('Unexpected exception during save:', e);
    }
    setAddrLoading(false);
  };

  const getPasswordStrengthScore = (pwd: string) => {
     let score = 0;
     if (!pwd) return 0;
     if (pwd.length > 5) score++;
     if (pwd.length > 8) score++;
     if (/\d/.test(pwd)) score++;
     if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
     if (/[^a-zA-Z0-9]/.test(pwd)) score++;
     return Math.min(score, 5);
  };
  const pwdScore = getPasswordStrengthScore(pwdForm.new);

  if (loading) {
    return (
      <div className="py-24 text-center min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#FF6A00] border-l-transparent animate-spin mx-auto"></div>
      </div>
    );
  }

  // If not logged in or doesn't have customerData
  if (!user || !customerData) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Dashboard', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'referrals', label: 'Referrals', icon: Ticket },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'N';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const memberSince = customerData.created_at 
    ? new Date(customerData.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '2026';

  const calculateProgress = (points: number) => {
    // arbitrary thresholds: Silver (0-500), Gold (500-2000), Platinum (2000+)
    if (points < 500) return (points / 500) * 100;
    if (points < 2000) return ((points - 500) / 1500) * 100;
    return 100; // Platinum maxed out visually
  };

  const nextTier = customerData.points < 500 ? 'Gold' : customerData.points < 2000 ? 'Platinum' : 'Max Tier';
  const pointsRemaining = customerData.points < 500 ? 500 - customerData.points : customerData.points < 2000 ? 2000 - customerData.points : 0;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`NEX-${customerData.id.split('-')[0].toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-12 md:py-20 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111111]">
            My Account
          </h1>
          <p className="mt-2 text-[#666666] font-medium">Manage your orders, rewards, and personal details.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Modern Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaeaea]/50 hidden lg:block sticky top-24">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#FF6A00]/10 text-[#FF6A00]'
                        : 'text-[#666666] hover:bg-[#fcfcfc] hover:text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className={`w-[18px] h-[18px] ${activeTab === tab.id ? 'text-[#FF6A00]' : 'text-[#888888]'}`} />
                      {tab.label}
                    </div>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-[#FF6A00]" />}
                  </button>
                ))}
              </nav>
              
              <div className="pt-4 mt-4 border-t border-[#eaeaea]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Horizontal Scroll Nav */}
            <div className="lg:hidden flex overflow-x-auto pb-4 gap-2 no-scrollbar border-b border-[#eaeaea]">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-bold transition-all whitespace-nowrap flex-shrink-0 border ${
                    activeTab === tab.id
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-[#666666] border-[#eaeaea] hover:border-[#cccccc]'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-[#888888]'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Premium Account Header Card */}
                <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#eaeaea]/50 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A00]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#111111] to-[#333333] text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-black/10">
                          {getInitials(customerData.name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                          <BadgeCheck className="w-6 h-6 text-[#FF6A00] fill-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#111111] leading-tight flex items-center gap-2">
                          {customerData.name || 'Athletic Member'}
                        </h2>
                        <p className="text-[#666666] font-medium">{customerData.email || customerData.phone}</p>
                        <p className="text-[13px] text-[#888888] font-medium mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                          Member since {memberSince}
                        </p>
                      </div>
                    </div>

                    {/* Tier Overview inside Header */}
                    <div className="bg-[#fcfcfc] border border-[#eaeaea] rounded-2xl p-5 sm:min-w-[240px]">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <p className="text-[11px] font-black uppercase text-[#888888] tracking-widest mb-1">Current Status</p>
                          <p className="text-xl font-black text-[#FF6A00] uppercase">{customerData.tier} TIER</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-[#111111] leading-none">{customerData.points}</p>
                          <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mt-1">PTS</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-[#eaeaea] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#FF6A00] rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${calculateProgress(customerData.points)}%` }}
                          />
                        </div>
                        {pointsRemaining > 0 ? (
                          <p className="text-[11px] font-bold text-[#888888] text-right">
                            {pointsRemaining} pts to <span className="text-[#111111]">{nextTier}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] font-bold text-[#FF6A00] text-right">Max Tier Reached</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'View Orders', icon: Package, route: 'orders', color: 'bg-blue-50 text-blue-600' },
                    { label: 'Saved Addresses', icon: MapPin, route: 'addresses', color: 'bg-green-50 text-green-600' },
                    { label: 'Wishlist', icon: Heart, route: 'wishlist', color: 'bg-red-50 text-red-600' },
                    { label: 'Refer & Earn', icon: Ticket, route: 'referrals', color: 'bg-purple-50 text-purple-600' }
                  ].map((action, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveTab(action.route as TabType)}
                      className="bg-white border border-[#eaeaea]/80 rounded-[20px] p-5 flex flex-col items-center justify-center text-center hover:border-[#111111] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all group"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <span className="text-[13px] font-bold text-[#111111]">{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Two Column details: Profile Info & Security */}
                <div className="grid lg:grid-cols-2 gap-6">
                  
                  {/* Profile Info Card */}
                  <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#eaeaea]/80 shadow-sm relative group">
                    <button 
                       onClick={() => setIsEditingProfile(!isEditingProfile)}
                       className="absolute top-6 right-6 p-2 text-[#888888] hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 rounded-full transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#111111]" />
                      </div>
                      <h3 className="text-lg font-black text-[#111111]">Personal Info</h3>
                    </div>
                    
                    {profileError && <p className="text-red-500 text-sm mb-4 font-medium">{profileError}</p>}
                    {profileSuccess && <p className="text-green-500 text-sm mb-4 font-medium">{profileSuccess}</p>}

                    {isEditingProfile ? (
                       <form onSubmit={handleUpdateProfile} className="space-y-4">
                         <div>
                            <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Full Name</label>
                            <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                         </div>
                         <div>
                            <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Email</label>
                            <input type="email" disabled value={customerData.email || ''} className="w-full px-3 py-2 border rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                         </div>
                         <div>
                            <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Phone Number</label>
                            <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Gender</label>
                              <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                                 <option value="">Select</option>
                                 <option value="Male">Male</option>
                                 <option value="Female">Female</option>
                                 <option value="Other">Other</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Date of Birth</label>
                              <input type="date" value={profileForm.dob} onChange={e => setProfileForm({...profileForm, dob: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                           </div>
                         </div>
                         <div className="flex gap-2 pt-2">
                            <button type="submit" disabled={profileSaving} className="px-4 py-2 bg-[#111111] text-white text-sm font-bold rounded-xl disabled:opacity-50">Save Changes</button>
                            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 bg-gray-100 text-[#111111] text-sm font-bold rounded-xl">Cancel</button>
                         </div>
                       </form>
                    ) : (
                      <div className="space-y-5">
                        <div>
                          <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Full Name</p>
                          <p className="text-[15px] font-semibold text-[#111111]">{customerData.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Email Address</p>
                          <p className="text-[15px] font-semibold text-[#111111]">{customerData.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Phone Number</p>
                          <p className="text-[15px] font-semibold text-[#111111]">{customerData.phone || 'Not provided'}</p>
                        </div>
                        {(customerData.gender || customerData.dob) && (
                           <div className="grid grid-cols-2 gap-4">
                             {customerData.gender && (
                                <div>
                                  <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Gender</p>
                                  <p className="text-[14px] font-semibold text-[#111111]">{customerData.gender}</p>
                                </div>
                             )}
                             {customerData.dob && (
                                <div>
                                  <p className="text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Date of Birth</p>
                                  <p className="text-[14px] font-semibold text-[#111111]">{customerData.dob}</p>
                                </div>
                             )}
                           </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Security Card */}
                  <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#eaeaea]/80 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#111111]" />
                      </div>
                      <h3 className="text-lg font-black text-[#111111]">Account Security</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-[#111111] mb-0.5">Primary Sign-in</p>
                          <p className="text-[12px] text-[#888888] capitalize">{user?.app_metadata?.provider || 'Email / Password'}</p>
                        </div>
                        {user?.app_metadata?.provider === 'google' && (
                           <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider rounded-md">Linked</div>
                        )}
                      </div>
                      <div className="w-full h-px bg-[#eaeaea]"></div>
                      
                      {user?.app_metadata?.provider !== 'google' && (
                         <>
                           {pwdError && <p className="text-red-500 text-sm font-medium">{pwdError}</p>}
                           {pwdSuccess && <p className="text-green-500 text-sm font-medium">{pwdSuccess}</p>}
                           
                            {isEditingPassword ? (
                              <form onSubmit={handleUpdatePassword} className="space-y-3">
                                 <div>
                                   <input type="password" required placeholder="Current Password" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                                 </div>
                                 <div className="space-y-1.5">
                                   <input type="password" required placeholder="New Password" value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                                   {pwdForm.new && (
                                     <div className="flex gap-1 h-1.5 mt-2">
                                       {[1,2,3,4,5].map(level => (
                                          <div key={level} className={`flex-1 rounded-full ${level <= pwdScore ? (pwdScore < 3 ? 'bg-red-500' : pwdScore < 5 ? 'bg-amber-400' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                                 <div className="flex gap-2 pt-2">
                                    <button type="submit" disabled={pwdLoading || pwdForm.new.length < 6} className="px-4 py-2 bg-[#111111] text-white text-sm font-bold rounded-xl disabled:opacity-50">Update</button>
                                    <button type="button" onClick={() => setIsEditingPassword(false)} className="px-4 py-2 bg-gray-100 text-[#111111] text-sm font-bold rounded-xl">Cancel</button>
                                 </div>
                              </form>
                           ) : (
                             <button onClick={() => setIsEditingPassword(true)} className="flex items-center gap-3 text-[#111111] hover:text-[#FF6A00] transition-colors group">
                               <div className="w-8 h-8 rounded-full bg-[#f8f9fa] group-hover:bg-[#FF6A00]/10 flex items-center justify-center transition-colors">
                                 <Key className="w-4 h-4" />
                               </div>
                               <span className="text-[14px] font-bold">Update Password</span>
                             </button>
                           )}
                         </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 {ordersLoading ? (
                    <div className="bg-white rounded-[32px] p-12 text-center border border-[#eaeaea]/80 flex flex-col items-center justify-center">
                       <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-gray-500 font-bold">Loading Orders...</p>
                    </div>
                 ) : orders.length > 0 ? (
                    <div className="bg-white rounded-[32px] border border-[#eaeaea]/80 overflow-hidden shadow-sm">
                       <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
                               <tr>
                                  <th className="px-6 py-4 text-[11px] font-black uppercase text-[#888888] tracking-widest">Order ID</th>
                                  <th className="px-6 py-4 text-[11px] font-black uppercase text-[#888888] tracking-widest">Date</th>
                                  <th className="px-6 py-4 text-[11px] font-black uppercase text-[#888888] tracking-widest">Status</th>
                                  <th className="px-6 py-4 text-[11px] font-black uppercase text-[#888888] tracking-widest">Total Amount</th>
                                  <th className="px-6 py-4 text-[11px] font-black uppercase text-[#888888] tracking-widest text-right">Action</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaeaea]">
                               {orders.map((o) => (
                                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-6 py-4 font-bold text-[#111111]">ORD-{o.id}</td>
                                     <td className="px-6 py-4 text-sm text-[#666666]">{new Date(o.created_at).toLocaleDateString()}</td>
                                     <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                                           o.order_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                           o.order_status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                           {o.order_status || 'Pending'}
                                        </span>
                                     </td>
                                     <td className="px-6 py-4 font-bold text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(o.subtotal || o.total_amount || 0)}</td>
                                     <td className="px-6 py-4 text-right">
                                        <button onClick={() => setSelectedOrder(o)} className="text-[#FF6A00] font-bold text-sm hover:underline">View Details</button>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                       </div>
                    </div>
                 ) : (
                  <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-[#eaeaea]/80 text-center shadow-sm">
                    <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-8 h-8 text-[#cccccc]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#111111] mb-2">No active orders</h2>
                    <p className="text-[#666666] mb-8 max-w-sm mx-auto">It looks like you haven't placed an order yet. Start shopping to fuel your fitness journey.</p>
                    <Link to="/products" className="inline-flex items-center justify-center px-8 py-3.5 bg-[#FF6A00] text-white font-bold text-[14px] uppercase tracking-wider rounded-xl hover:bg-[#e65c00] transition-all hover:shadow-lg hover:shadow-[#FF6A00]/20">
                      Explore Products
                    </Link>
                  </div>
                 )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 {wishlistLoading ? (
                    <div className="bg-white rounded-[32px] p-12 text-center border border-[#eaeaea]/80 flex flex-col items-center justify-center">
                       <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-gray-500 font-bold">Loading Wishlist...</p>
                    </div>
                 ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                       {wishlist.map((w) => {
                          const p = w.products;
                          if (!p) return null;
                          return (
                             <div key={w.id} className="bg-white rounded-[24px] border border-[#eaeaea]/80 p-4 shadow-sm group">
                                <Link to={`/product/${p.slug}`} className="block relative aspect-square bg-[#f8f9fa] rounded-[16px] mb-4 overflow-hidden">
                                   {p.image1 ? <img src={p.image1} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
                                   <button 
                                     onClick={(e) => {
                                        e.preventDefault();
                                        const key = `wishlist_${customerData.id}`;
                                        let ids = [];
                                        try { const stored = localStorage.getItem(key); if(stored) ids=JSON.parse(stored); } catch(e){}
                                        ids = ids.filter((id:any) => id !== w.product_id);
                                        localStorage.setItem(key, JSON.stringify(ids));
                                        fetchWishlist();
                                     }}
                                     className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md hover:bg-red-50"
                                   >
                                      <Heart className="w-4 h-4 fill-current" />
                                   </button>
                                </Link>
                                <div className="space-y-1 text-center">
                                   <h3 className="font-bold text-[#111111] truncate">{p.name || 'Unknown Product'}</h3>
                                   <p className="text-[#FF6A00] font-black">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.price)}</p>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 ) : (
                  <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-[#eaeaea]/80 text-center shadow-sm">
                    <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-8 h-8 text-[#cccccc]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#111111] mb-2">Your wishlist is empty</h2>
                    <p className="text-[#666666] mb-8 max-w-sm mx-auto">Save your favorite supplements and gear here to easily find them later.</p>
                    <Link to="/products" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-[#111111] text-[#111111] font-bold text-[14px] uppercase tracking-wider rounded-xl hover:bg-[#111111] hover:text-white transition-all">
                      Browse Store
                    </Link>
                  </div>
                 )}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                
                {/* Rewards Hero */}
                <div className="bg-[#111111] rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FF6A00]/20 rounded-full blur-[80px]"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#222222] rounded-full text-[#FF6A00] text-[11px] font-black uppercase tracking-widest mb-4">
                        <Award className="w-3.5 h-3.5" />
                        NEXVOLT Rewards
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-black mb-2">{customerData.points} PTS</h2>
                      <p className="text-[#888888] font-medium">Equates to roughly {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((customerData.points || 0) * 0.5)} in store credit.</p>
                    </div>
                    
                    <button className="w-full md:w-auto px-8 py-4 bg-[#FF6A00] text-white rounded-xl font-bold uppercase tracking-wider text-[13px] hover:bg-[#e65c00] transition-colors shadow-lg shadow-[#FF6A00]/20">
                      Redeem Now
                    </button>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="bg-white rounded-[32px] p-8 border border-[#eaeaea]/80 shadow-sm">
                  <h3 className="text-xl font-black text-[#111111] mb-6">Current Tier Benefits: {customerData.tier}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {['Free Shipping on all orders', '1 Point per ₹1 spent', 'Early access to sales', 'Birthday Bonus Points'].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-[#fcfcfc] rounded-[16px] border border-[#eaeaea]/50">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="font-bold text-[#111111] text-[14px]">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reward Catalog */}
                <div className="bg-white rounded-[32px] p-8 border border-[#eaeaea]/80 shadow-sm">
                  <h3 className="text-xl font-black text-[#111111] mb-6">Available Rewards</h3>
                  {rewardsLoading ? (
                     <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div></div>
                  ) : rewardsList.length > 0 ? (
                     <div className="space-y-4">
                       {rewardsList.map(r => (
                         <div key={r.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <div>
                               <p className="font-bold text-sm text-[#111111]">{r.title}</p>
                               <p className="text-xs text-gray-500">{r.description || r.reward_type}</p>
                            </div>
                            <div className="text-right">
                               <span className="font-black text-[#FF6A00] block">{r.points_required} PTS</span>
                               {customerData.points >= r.points_required && (
                                   <button className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-1 rounded inline-block mt-1">Redeem</button>
                               )}
                            </div>
                         </div>
                       ))}
                     </div>
                  ) : (
                     <p className="text-gray-500 text-sm">No rewards currently available.</p>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 {addrLoading && addresses.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-12 text-center border border-[#eaeaea]/80 flex flex-col items-center justify-center">
                       <div className="w-8 h-8 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-gray-500 font-bold">Loading Addresses...</p>
                    </div>
                 ) : (
                    <>
                      {isAddingAddr && (
                         <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#eaeaea] shadow-md mb-6">
                            <h3 className="text-xl font-black text-[#111111] mb-6">{addrForm.id ? 'Edit Address' : 'Add New Address'}</h3>
                            <form onSubmit={handleSaveAddress} className="space-y-4">
                               <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                     <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Street Address</label>
                                     <input type="text" required value={addrForm.street} onChange={e => setAddrForm({...addrForm, street: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                                  </div>
                                  <div>
                                     <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">City</label>
                                     <input type="text" required value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                                  </div>
                                  <div>
                                     <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">State / Province</label>
                                     <input type="text" required value={addrForm.state} onChange={e => setAddrForm({...addrForm, state: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                                  </div>
                                  <div>
                                     <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Postal Code</label>
                                     <input type="text" required value={addrForm.postal_code} onChange={e => setAddrForm({...addrForm, postal_code: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                                  </div>
                                  <div>
                                     <label className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-1">Country</label>
                                     <input type="text" required value={addrForm.country} onChange={e => setAddrForm({...addrForm, country: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                                  </div>
                                  <div className="flex items-center gap-2 mt-6">
                                     <input type="checkbox" id="is_default" checked={addrForm.is_default} onChange={e => setAddrForm({...addrForm, is_default: e.target.checked})} className="rounded text-[#FF6A00] focus:ring-[#FF6A00]" />
                                     <label htmlFor="is_default" className="text-sm font-bold text-[#111111]">Set as default address</label>
                                  </div>
                               </div>
                               <div className="flex gap-3 pt-4">
                                  <button type="submit" disabled={addrLoading} className="px-6 py-2.5 bg-[#111111] text-white text-[13px] font-bold uppercase tracking-wider rounded-xl disabled:opacity-50">Save Address</button>
                                  <button type="button" onClick={() => setIsAddingAddr(false)} className="px-6 py-2.5 bg-gray-100 text-[#111111] text-[13px] font-bold uppercase tracking-wider rounded-xl">Cancel</button>
                               </div>
                            </form>
                         </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-6">
                        {addresses.map((a) => (
                           <div key={a.id} className={`bg-white rounded-[24px] p-6 border shadow-sm relative ${a.is_default ? 'border-[#111111]' : 'border-[#eaeaea]'}`}>
                              {a.is_default && (
                                 <span className="absolute top-4 right-4 bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">Default</span>
                              )}
                              <div className="space-y-1 mb-6 pr-12">
                                 <p className="font-bold text-[#111111] text-lg">{a.street}</p>
                                 <p className="text-[#666666]">{a.city}, {a.state} {a.postal_code}</p>
                                 <p className="text-[#666666]">{a.country}</p>
                              </div>
                              <div className="flex gap-3">
                                 <button 
                                    className="text-sm font-bold text-[#FF6A00] hover:underline"
                                    onClick={() => {
                                       setAddrForm(a);
                                       setIsAddingAddr(true);
                                       window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                 >Edit</button>
                                 <button 
                                    className="text-sm font-bold text-[#FF6A00] hover:underline"
                                    onClick={async () => {
                                       await supabase.from('adresses').delete().eq('id', a.id);
                                       fetchAddresses();
                                    }}
                                 >Remove</button>
                                 {!a.is_default && (
                                    <button 
                                       className="text-sm font-bold text-[#111111] hover:underline"
                                       onClick={async () => {
                                          const { data: allAddr } = await supabase.from('adresses').select('*').eq('customer_id', customerData.id);
                                          if (allAddr) {
                                            for (const o of allAddr) {
                                               try {
                                                 let p = JSON.parse(o.address);
                                                 p.is_default = (o.id === a.id);
                                                 await supabase.from('adresses').update({ address: JSON.stringify(p) }).eq('id', o.id);
                                               } catch(e) {}
                                            }
                                          }
                                          fetchAddresses();
                                       }}
                                    >Set as Default</button>
                                 )}
                              </div>
                           </div>
                        ))}

                        {!isAddingAddr && (
                           <button onClick={() => setIsAddingAddr(true)} className="h-48 border-2 border-dashed border-[#eaeaea] rounded-[24px] flex flex-col items-center justify-center text-center hover:border-[#111111] hover:bg-[#fcfcfc] transition-all group">
                             <div className="w-12 h-12 rounded-full bg-[#f8f9fa] group-hover:bg-white flex items-center justify-center mb-3">
                               <MapPin className="w-5 h-5 text-[#888888] group-hover:text-[#111111]" />
                             </div>
                             <span className="font-bold text-[#111111] text-[15px]">Add New Address</span>
                             <span className="text-[#888888] text-[13px] mt-1">Delivery or Billing</span>
                           </button>
                        )}
                      </div>
                    </>
                 )}
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-[#eaeaea]/80 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#FF6A00] to-yellow-400"></div>
                  
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Gift className="w-10 h-10 text-[#FF6A00]" />
                  </div>
                  <h2 className="text-3xl font-black text-[#111111] mb-4">Give ₹500, Get ₹500</h2>
                  <p className="text-[#666666] mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    Share your unique code with a friend. They get ₹500 off their first order, and you get 1000 Reward Points (worth ₹500).
                  </p>
                  
                  <div className="max-w-sm mx-auto bg-[#f8f9fa] border-2 border-[#eaeaea] rounded-2xl p-2 flex items-center">
                    <div className="flex-1 font-mono font-bold text-lg text-[#111111] tracking-wider px-4">
                      NEX-{String(customerData.id).split('-')[0].toUpperCase()}
                    </div>
                    <button 
                      onClick={handleCopyReferral}
                      className="flex items-center gap-2 px-6 py-3.5 bg-[#111111] text-white rounded-xl font-bold uppercase tracking-wider text-[13px] hover:bg-[#333333] transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mt-6">Terms & Conditions Apply</p>
                </div>
                
                <div className="bg-white rounded-[32px] p-8 border border-[#eaeaea]/80 shadow-sm">
                  <h3 className="text-xl font-black text-[#111111] mb-6">Referral History</h3>
                  {referralsLoading ? (
                     <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div></div>
                  ) : referralsList.length > 0 ? (
                     <div className="space-y-4">
                       {referralsList.map(r => (
                         <div key={r.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <div>
                               <p className="font-bold text-sm text-[#111111]">Referred: {r.referred_email}</p>
                               <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                               {r.status || 'Pending'}
                            </span>
                         </div>
                       ))}
                     </div>
                  ) : (
                     <p className="text-gray-500 text-sm">You haven't referred anyone yet.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-[#eaeaea] flex items-center justify-between">
              <div>
                 <h2 className="text-xl font-black text-[#111111]">Order ORD-{selectedOrder.id}</h2>
                 <p className="text-sm text-[#888888] font-medium mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-full transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Order Timeline (Simple) */}
              <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#eaeaea]">
                  <h3 className="text-sm font-bold text-[#111111] mb-4">Order Status</h3>
                  <div className="flex items-center">
                    <div className="flex-1 flex flex-col items-center">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ['Pending', 'Processing', 'Shipped', 'Delivered'].includes(selectedOrder.order_status) || !selectedOrder.order_status
                          ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                       }`}>1</div>
                       <p className="text-xs font-bold mt-2">Placed</p>
                    </div>
                    <div className={`flex-1 h-1 ${
                       ['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.order_status) ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className="flex-1 flex flex-col items-center">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.order_status)
                          ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                       }`}>2</div>
                       <p className="text-xs font-bold mt-2">Processing</p>
                    </div>
                    <div className={`flex-1 h-1 ${
                       ['Shipped', 'Delivered'].includes(selectedOrder.order_status) ? 'bg-green-500' : 'bg-gray-200'
                     }`}></div>
                    <div className="flex-1 flex flex-col items-center">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ['Shipped', 'Delivered'].includes(selectedOrder.order_status)
                          ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                       }`}>3</div>
                       <p className="text-xs font-bold mt-2">Shipped</p>
                    </div>
                    <div className={`flex-1 h-1 ${
                       ['Delivered'].includes(selectedOrder.order_status) ? 'bg-green-500' : 'bg-gray-200'
                     }`}></div>
                    <div className="flex-1 flex flex-col items-center">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ['Delivered'].includes(selectedOrder.order_status)
                          ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                       }`}>4</div>
                       <p className="text-xs font-bold mt-2">Delivered</p>
                    </div>
                  </div>
              </div>

              {/* Items */}
              <div>
                 <h3 className="text-sm font-bold text-[#111111] mb-3">Items</h3>
                 <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                       selectedOrder.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-white p-3 border border-[#eaeaea] rounded-lg">
                             <div>
                                <p className="font-semibold text-[14px]">{item.product_name}</p>
                                <p className="text-[12px] text-gray-500">Qty: {item.quantity}</p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <p className="text-sm text-gray-500">No items found.</p>
                    )}
                 </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-3">Shipping Details</h3>
                <div className="bg-[#fcfcfc] p-4 rounded-xl border border-[#eaeaea] text-sm text-gray-700">
                  <p className="font-semibold text-black mb-1">{customerData.name}</p>
                  {customerData.phone && <p>{customerData.phone}</p>}
                  {/* Real address formatting could be handled if saved in order, currently orders table doesn't have shipping address in the mocked format. We just show customer info. */}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-sm font-bold text-[#111111] mb-3">Summary</h3>
                <div className="bg-[#fcfcfc] p-4 rounded-xl border border-[#eaeaea] text-sm">
                   <div className="flex justify-between mb-2"><p className="text-gray-500">Subtotal</p><p className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selectedOrder.subtotal || selectedOrder.total_amount || 0)}</p></div>
                   <div className="flex justify-between mb-2"><p className="text-gray-500">Shipping</p><p className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(selectedOrder.shipping_fee || 0)}</p></div>
                   <div className="flex justify-between mt-4 pt-4 border-t font-bold text-base"><p>Total</p><p>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((selectedOrder.total_amount || selectedOrder.subtotal || 0) + (selectedOrder.shipping_fee || 0))}</p></div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#eaeaea] text-right bg-white">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-black transition-colors">
                 Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
