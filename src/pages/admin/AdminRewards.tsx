import React, { useState, useEffect } from "react";
import { 
  Trophy, Gift, Target, Percent, TrendingUp, Edit, Users, 
  Award, Zap, CreditCard, Share2, Shield, Plus, Trash2, ArrowUpRight, ChevronRight, Activity, Calendar, Settings, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

export function AdminRewards() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tierTab, setTierTab] = useState('silver');

  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    reward_type: "Discount",
    points_required: 0,
    value: 0
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('rewards').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (data) setRewards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (reward?: any) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({
        title: reward.title || "",
        reward_type: reward.reward_type || "Discount",
        points_required: reward.points_required || 0,
        value: reward.value || 0
      });
    } else {
      setEditingReward(null);
      setFormData({
        title: "",
        reward_type: "Discount",
        points_required: 0,
        value: 0
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      title: formData.title,
      reward_type: formData.reward_type,
      points_required: parseInt(formData.points_required.toString()) || 0,
      value: parseInt(formData.value.toString()) || 0
    };

    try {
      if (editingReward) {
        await supabase.from('rewards').update(dataToSave).eq('id', editingReward.id);
      } else {
        await supabase.from('rewards').insert([dataToSave]);
      }
      fetchRewards();
      setIsDrawerOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save reward');
    }
  };

  const handleDeleteReward = async (id: number) => {
    if (window.confirm("Delete this reward?")) {
      try {
        await supabase.from('rewards').delete().eq('id', id);
        fetchRewards();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">NEXPOINTS Loyalty System</h1>
        <p className="text-[15px] text-[#666666] mt-1">Manage athlete retention, points engine, challenges, and rewards.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
         {/* Settings Navigation */}
         <div className="w-full md:w-64 border-r border-[#eaeaea] bg-gray-50 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview & Insights', icon: Trophy },
              { id: 'tiers', label: 'Tier Management', icon: Shield },
              { id: 'rules', label: 'Points Rule Engine', icon: Settings },
              { id: 'referrals', label: 'Referral Dashboard', icon: Share2 },
              { id: 'cashback', label: 'Cashback Config', icon: Percent },
              { id: 'challenges', label: 'Challenges & Streaks', icon: Target },
              { id: 'catalog', label: 'Reward Catalog', icon: Gift },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-3 rounded-lg text-[14px] font-medium transition-colors whitespace-nowrap flex items-center ${
                  activeTab === tab.id ? 'bg-[#111111] text-white shadow-md' : 'text-[#666666] hover:bg-white hover:text-[#111111]'
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-gray-300' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
         </div>

         {/* Content */}
         <div className="flex-1 p-6 md:p-8 bg-white">
            
               
               {activeTab === 'overview' && (
                 <div className="space-y-6">
                    <div>
                       <h2 className="text-[18px] font-bold text-[#111111] mb-1">Loyalty Analytics Dashboard</h2>
                       <p className="text-[13px] text-gray-500 mb-6">High-level metrics on points issuance, redemption, and member base.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {[
                        { title: "NEXPOINTS Issued", value: "24.5M", change: "+12%", trend: "up", icon: Award, color: "text-amber-500" },
                        { title: "NEXPOINTS Redeemed", value: "18.2M", change: "+8%", trend: "up", icon: Gift, color: "text-emerald-500" },
                        { title: "Active Members", value: "12,450", change: "+15%", trend: "up", icon: Users, color: "text-blue-500" },
                        { title: "Referrals Issued", value: "₹1.4M", change: "+5%", trend: "up", icon: Share2, color: "text-purple-500" },
                      ].map((stat, i) => (
                         <div key={i} className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                               <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                               <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <h3 className="text-[24px] font-bold text-[#111111]">{stat.value}</h3>
                            <p className="text-[12px] text-emerald-600 font-bold flex items-center mt-1">
                               <ArrowUpRight className="w-3 h-3 mr-1" /> {stat.change} vs last month
                            </p>
                         </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                       <div className="border border-gray-100 rounded-xl p-5">
                          <h3 className="text-[14px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Tier Distribution</h3>
                          <div className="space-y-4">
                             {[
                               { name: "Silver Athletes", value: "6,200", percent: "50%", color: "bg-gray-400" },
                               { name: "Gold Athletes", value: "4,150", percent: "33%", color: "bg-amber-400" },
                               { name: "Diamond Athletes", value: "2,100", percent: "17%", color: "bg-black" },
                             ].map((tier, i) => (
                                <div key={i}>
                                   <div className="flex justify-between text-[13px] font-bold text-[#111111] mb-1">
                                      <span>{tier.name}</span>
                                      <span>{tier.value}</span>
                                   </div>
                                   <div className="w-full bg-gray-100 rounded-full h-2">
                                      <div className={`${tier.color} h-2 rounded-full`} style={{ width: tier.percent }}></div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="border border-gray-100 rounded-xl p-5">
                          <h3 className="text-[14px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Customer Insights</h3>
                          <ul className="space-y-3">
                             <li className="flex justify-between items-center text-[13px] border-b border-gray-50 pb-2">
                               <span className="text-gray-500">Highest Point Earner</span>
                               <span className="font-bold text-[#111111]">Alex Thompson (42k pts)</span>
                             </li>
                             <li className="flex justify-between items-center text-[13px] border-b border-gray-50 pb-2">
                               <span className="text-gray-500">Most Active Challenge</span>
                               <span className="font-bold text-[#111111]">30 Day Recovery (1.2k joined)</span>
                             </li>
                             <li className="flex justify-between items-center text-[13px] border-b border-gray-50 pb-2">
                               <span className="text-gray-500">Most Redeemed Reward</span>
                               <span className="font-bold text-[#111111]">Free Shaker Bottle (840)</span>
                             </li>
                             <li className="flex justify-between items-center text-[13px]">
                               <span className="text-gray-500">Avg. Tier Upgrade Time</span>
                               <span className="font-bold text-[#111111]">4.2 Months</span>
                             </li>
                          </ul>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'tiers' && (
                 <div className="space-y-6 max-w-4xl">
                    <div>
                       <h2 className="text-[18px] font-bold text-[#111111] mb-1">Athlete Tier Management</h2>
                       <p className="text-[13px] text-gray-500 mb-6">Configure criteria and benefits for loyalty levels.</p>
                    </div>

                    <div className="flex border-b border-[#eaeaea] mb-6">
                       {['silver', 'gold', 'diamond'].map(tier => (
                          <button 
                            key={tier}
                            onClick={() => setTierTab(tier)}
                            className={`px-6 py-3 text-[14px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                              tierTab === tier ? 'border-[#111111] text-[#111111]' : 'border-transparent text-gray-400 hover:text-gray-700'
                            }`}
                          >
                             {tier} Athlete
                          </button>
                       ))}
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                       <h3 className="text-[16px] font-bold text-[#111111] mb-6 capitalize">{tierTab} Configuration</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Minimum Lifetime Spend (₹)</label>
                             <input type="number" defaultValue={tierTab === 'silver' ? '0' : tierTab === 'gold' ? '15000' : '40000'} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Points Multiplier</label>
                             <input type="number" step="0.1" defaultValue={tierTab === 'silver' ? '1.0' : tierTab === 'gold' ? '1.25' : '1.5'} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Cashback Percentage (%)</label>
                             <input type="number" defaultValue={tierTab === 'silver' ? '2' : tierTab === 'gold' ? '5' : '10'} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Referral Bonus Points</label>
                             <input type="number" defaultValue={tierTab === 'silver' ? '500' : tierTab === 'gold' ? '1000' : '2000'} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                       </div>
                       <div className="mt-6">
                           <label className="block text-[13px] font-bold text-[#111111] mb-2">Exclusive Benefits (Comma separated)</label>
                           <textarea rows={3} defaultValue={tierTab === 'silver' ? 'Standard Shipping, Birthday Reward' : tierTab === 'gold' ? 'Free Expedited Shipping, Early Access to Sales, Exclusive Discord Access' : 'Dedicated Nutritionist, VIP Event Invites, Free Product Samples Monthly'} className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]"></textarea>
                       </div>
                       <button onClick={() => alert(`${tierTab} Tier saved successfully!`)} className="mt-6 px-6 py-2.5 bg-[#111111] text-white text-[14px] font-semibold rounded-lg hover:bg-black">Save {tierTab} Tier</button>
                    </div>
                 </div>
               )}

               {activeTab === 'rules' && (
                 <div className="space-y-6 max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Points Rule Engine</h2>
                         <p className="text-[13px] text-gray-500">Configure how athletes earn points.</p>
                       </div>
                       <button className="flex items-center px-4 py-2 bg-[#111111] text-white text-[13px] font-bold rounded-lg"><Plus className="w-4 h-4 mr-2" /> Add Rule</button>
                    </div>

                    <div className="space-y-4">
                       {[
                         { name: "Purchase Earn Rate", desc: "Points earned per ₹100 spent", points: "10 Points", status: "Active" },
                         { name: "Account Creation", desc: "Reward for creating profile", points: "500 Points", status: "Active" },
                         { name: "First Order Bonus", desc: "Extra points on first purchase", points: "1000 Points", status: "Active" },
                         { name: "Birthday Reward", desc: "Annual birthday points", points: "2000 Points", status: "Active" },
                         { name: "Photo Review", desc: "Leaving a review with a photo", points: "200 Points", status: "Active" },
                         { name: "Text Review", desc: "Leaving a text-only review", points: "50 Points", status: "Active" },
                       ].map((rule, i) => (
                          <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 bg-white rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                             <div className="mb-3 sm:mb-0">
                                <h4 className="text-[14px] font-bold text-[#111111] flex items-center">{rule.name} <span className="ml-3 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] uppercase font-bold tracking-wider rounded">{rule.status}</span></h4>
                                <p className="text-[12px] text-gray-500 mt-1">{rule.desc}</p>
                             </div>
                             <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="text-[14px] font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-lg">{rule.points}</span>
                                <button className="text-gray-400 hover:text-[#111111]"><Edit className="w-4 h-4"/></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {activeTab === 'referrals' && (
                 <div className="space-y-6 max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Referral Management</h2>
                         <p className="text-[13px] text-gray-500">Monitor and configure the give/get referral program.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                       <div className="p-4 border border-gray-100 rounded-xl">
                          <p className="text-[12px] text-gray-500 font-bold uppercase">Total Shares</p>
                          <p className="text-[20px] font-bold text-[#111111]">18,420</p>
                       </div>
                       <div className="p-4 border border-gray-100 rounded-xl">
                          <p className="text-[12px] text-gray-500 font-bold uppercase">Successful Conv.</p>
                          <p className="text-[20px] font-bold text-[#111111]">4,210</p>
                       </div>
                       <div className="p-4 border border-gray-100 rounded-xl">
                          <p className="text-[12px] text-gray-500 font-bold uppercase">Revenue Generated</p>
                          <p className="text-[20px] font-bold text-emerald-600">₹8.4M</p>
                       </div>
                       <div className="p-4 border border-gray-100 rounded-xl">
                          <p className="text-[12px] text-gray-500 font-bold uppercase">Conv. Rate</p>
                          <p className="text-[20px] font-bold text-[#111111]">22.8%</p>
                       </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                       <h3 className="text-[15px] font-bold text-[#111111] mb-4">Referral Rules</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Advocate Reward (Referrer)</label>
                             <input type="text" defaultValue="₹500 Discount" className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Friend Reward (Referred)</label>
                             <input type="text" defaultValue="₹500 Off First Order" className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                          <div>
                             <label className="block text-[13px] font-bold text-[#111111] mb-2">Reward Validity (Days)</label>
                             <input type="number" defaultValue="30" className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px]" />
                          </div>
                       </div>
                       <button onClick={() => alert('Referral Rules saved successfully!')} className="mt-6 px-6 py-2.5 bg-[#111111] text-white text-[14px] font-semibold rounded-lg hover:bg-black">Save Referral Rules</button>
                    </div>
                 </div>
               )}

               {activeTab === 'cashback' && (
                 <div className="space-y-6 max-w-4xl">
                     <div className="flex justify-between items-center mb-6">
                       <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Cashback Campaigns</h2>
                         <p className="text-[13px] text-gray-500">Configure global or category-specific cashback rules.</p>
                       </div>
                       <button className="flex items-center px-4 py-2 bg-[#111111] text-white text-[13px] font-bold rounded-lg"><Plus className="w-4 h-4 mr-2" /> New Campaign</button>
                    </div>

                    <div className="space-y-4">
                       <div className="p-5 border-l-4 border-emerald-500 bg-white border-y border-r border-[#eaeaea] rounded-r-xl shadow-sm">
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className="text-[15px] font-bold text-[#111111]">10% Back on Proteins</h4>
                                <p className="text-[13px] text-gray-500 mt-1">Applies to all Whey and Isolate products.</p>
                                <div className="flex items-center mt-3 space-x-4">
                                   <span className="text-[11px] font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-600 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Valid till Jun 30</span>
                                   <span className="text-[11px] font-bold uppercase bg-emerald-50 px-2 py-1 rounded text-emerald-600">Active</span>
                                </div>
                             </div>
                             <div className="flex space-x-2">
                                <button className="p-2 border border-gray-200 rounded hover:bg-gray-50"><Edit className="w-4 h-4"/></button>
                                <button className="p-2 border border-rose-100 bg-rose-50 rounded hover:bg-rose-100 text-rose-500"><Trash2 className="w-4 h-4"/></button>
                             </div>
                          </div>
                       </div>
                       <div className="p-5 border-l-4 border-gray-300 bg-white border-y border-r border-[#eaeaea] rounded-r-xl shadow-sm">
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className="text-[15px] font-bold text-gray-500">Double Point Weekends</h4>
                                <p className="text-[13px] text-gray-400 mt-1">2x points on all purchases.</p>
                                <div className="flex items-center mt-3 space-x-4">
                                   <span className="text-[11px] font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Weekends Only</span>
                                   <span className="text-[11px] font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">Inactive</span>
                                </div>
                             </div>
                             <div className="flex space-x-2">
                                <button className="p-2 border border-gray-200 rounded hover:bg-gray-50"><Edit className="w-4 h-4"/></button>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'challenges' && (
                 <div className="space-y-6 max-w-4xl">
                     <div className="flex justify-between items-center mb-6">
                       <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Athlete Challenges & Streaks</h2>
                         <p className="text-[13px] text-gray-500">Gamify retention by creating fitness and purchase challenges.</p>
                       </div>
                       <button className="flex items-center px-4 py-2 bg-[#111111] text-white text-[13px] font-bold rounded-lg"><Plus className="w-4 h-4 mr-2" /> New Challenge</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {[
                         { name: "30 Day Hydration", desc: "Purchase electrolyte products twice in 30 days.", reward: "Free Shaker", enrolled: "840" },
                         { name: "Marathon Prep", desc: "Spend ₹5000 on endurance gels & pre-workouts.", reward: "2000 Points + Free Merch", enrolled: "320" },
                         { name: "Monthly Subscriber", desc: "Keep subscription active for 3 consecutive months.", reward: "Tier Upgrade", enrolled: "1,450" }
                       ].map((challenge, i) => (
                          <div key={i} className="border border-gray-200 rounded-xl p-5 relative group hover:border-[#111111] transition-colors bg-white">
                             <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="bg-gray-100 p-1.5 rounded"><Edit className="w-4 h-4 text-gray-600"/></button>
                             </div>
                             <h4 className="text-[15px] font-bold text-[#111111] mb-1">{challenge.name}</h4>
                             <p className="text-[13px] text-gray-500 mb-4 h-10">{challenge.desc}</p>
                             <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                                <div>
                                   <span className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Reward</span>
                                   <span className="text-[13px] font-bold text-emerald-600">{challenge.reward}</span>
                                </div>
                                <div className="text-right">
                                   <span className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Athletes Enrolled</span>
                                   <span className="text-[14px] font-bold text-[#111111]">{challenge.enrolled}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {activeTab === 'catalog' && (
                 <div className="space-y-6 max-w-4xl">
                     <div className="flex justify-between items-center mb-6">
                       <div>
                         <h2 className="text-[18px] font-bold text-[#111111] mb-1">Reward Catalog</h2>
                         <p className="text-[13px] text-gray-500">Items and discounts athletes can redeem with NEXPOINTS.</p>
                       </div>
                       <div className="flex gap-2">
                          <button className="px-3 py-2 border border-gray-200 text-[#111111] text-[13px] font-bold rounded-lg hover:bg-gray-50 flex items-center"><Target className="w-4 h-4 mr-2" /> Filter</button>
                          <button onClick={() => openDrawer()} className="px-3 py-2 bg-[#111111] text-white text-[13px] font-bold rounded-lg flex items-center"><Plus className="w-4 h-4 mr-2" /> Add Reward</button>
                       </div>
                    </div>

                    <div className="border border-[#eaeaea] rounded-xl overflow-hidden bg-white">
                       <table className="w-full text-left text-[14px]">
                          <thead className="bg-[#f8f9fa] border-b border-[#eaeaea] text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                             <tr>
                                <th className="p-4">Reward Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Cost (Points)</th>
                                <th className="p-4 text-right">Action</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eaeaea]">
                             {loading ? (
                               <tr>
                                 <td colSpan={4} className="p-4 text-center text-gray-500">Loading...</td>
                               </tr>
                             ) : rewards.length === 0 ? (
                               <tr>
                                 <td colSpan={4} className="p-4 text-center text-gray-500">No rewards found</td>
                               </tr>
                             ) : rewards.map((reward) => (
                               <tr key={reward.id} className="hover:bg-gray-50">
                                  <td className="p-4 font-bold text-[#111111]">{reward.title}</td>
                                  <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 text-[11px] rounded uppercase font-bold">{reward.reward_type}</span></td>
                                  <td className="p-4 font-mono font-bold text-amber-500">{reward.points_required}</td>
                                  <td className="p-4 text-right space-x-3">
                                     <button onClick={() => openDrawer(reward)} className="text-gray-400 hover:text-black"><Edit className="w-4 h-4 inline"/></button>
                                     <button onClick={() => handleDeleteReward(reward.id)} className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4 inline"/></button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}

            
         </div>
      </div>
      
      {/* Reward Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#eaeaea]">
                <div>
                   <h2 className="text-[20px] font-bold text-[#111111]">{editingReward ? 'Edit Reward' : 'Add Reward'}</h2>
                   <p className="text-[13px] text-gray-500 mt-1">Configure reward details and cost.</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="reward-form" onSubmit={handleSaveReward} className="space-y-5">
                   <div>
                      <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Reward Title</label>
                      <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. ₹500 Discount Voucher" className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Reward Type</label>
                        <select value={formData.reward_type} onChange={(e) => setFormData({...formData, reward_type: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]">
                          <option value="Discount">Discount</option>
                          <option value="Merchandise">Merchandise</option>
                          <option value="Service">Service</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Value (Optional)</label>
                        <input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" />
                     </div>
                   </div>
                   <div>
                      <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Cost in Points</label>
                      <input type="number" required min="0" value={formData.points_required} onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" />
                   </div>
                </form>
              </div>

              <div className="p-6 border-t border-[#eaeaea] bg-gray-50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-2.5 text-[14px] font-bold text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="reward-form"
                  className="px-5 py-2.5 text-[14px] font-bold text-white bg-[#111111] rounded-lg hover:bg-black transition-colors"
                >
                  Save Reward
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

