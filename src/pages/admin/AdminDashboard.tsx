import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Dumbbell,
  AlertTriangle,
  RotateCcw,
  Clock,
  Plus,
  Image as ImageIcon,
  PenSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { supabase } from "../../lib/supabase";

const QUICK_ACTIONS = [
  { name: "Add Product", icon: Package, path: "/admin/products" },
  { name: "Add Sport", icon: Activity, path: "/admin/sports" },
  { name: "Add Athlete Stack", icon: Dumbbell, path: "/admin/stacks" },
  { name: "Upload Banner", icon: ImageIcon, path: "/admin/homepage" },
  { name: "Create Blog", icon: PenSquare, path: "/admin/blogs" },
];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dashboardData, setDashboardData] = useState({
    stats: [] as any[],
    recentOrders: [] as any[],
    topProducts: [] as any[],
    customerAnalytics: [] as any[],
    revenueData: [] as any[],
    revenueTotal: 0,
    sportPerformance: [] as any[],
    athleteEngagementData: [] as any[]
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch exact counts
      const [
        { count: totalProducts },
        { count: totalCategories },
        { count: totalSports }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('sports').select('*', { count: 'exact', head: true })
      ]);

      // 2. Fetch all raw rows for aggregations
      const [
        { data: ordersData },
        { data: orderItemsData },
        { data: customersData },
        { data: productsData }
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('order_items').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('products').select('id, name, image')
      ]);

      const orders = ordersData || [];
      const orderItems = orderItemsData || [];
      const customers = customersData || [];
      const products = productsData || [];

      // 3. Process Stats
      const totalOrdersCount = orders.length;
      const totalCustomersCount = customers.length;
      
      const deliveredOrCompletedRows = orders.filter(o => 
        ['Delivered', 'Completed'].includes(o.order_status)
      );
      
      let totalRevenue = 0;
      for (const order of deliveredOrCompletedRows) {
        totalRevenue += Number(order.subtotal || order.total_amount || 0);
      }

      const pendingOrdersCount = orders.filter(o => o.order_status === 'Pending').length;
      const processingOrdersCount = orders.filter(o => o.order_status === 'Processing').length;
      const shippedOrdersCount = orders.filter(o => o.order_status === 'Shipped').length;
      const deliveredOrdersCount = orders.filter(o => o.order_status === 'Delivered').length;

      const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
      };

      const STATS = [
        { title: "Total Revenue", value: formatCurrency(totalRevenue), trend: "0%", isPositive: true, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: "Total Orders", value: totalOrdersCount.toString(), trend: "0%", isPositive: true, icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Total Customers", value: totalCustomersCount.toString(), trend: "0%", isPositive: true, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
        { title: "Total Products", value: (totalProducts || 0).toString(), trend: "0%", isPositive: true, icon: Package, color: "text-orange-500", bg: "bg-orange-50" },
        { title: "Total Categories", value: (totalCategories || 0).toString(), trend: "0%", isPositive: true, icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
        { title: "Total Sports", value: (totalSports || 0).toString(), trend: "0%", isPositive: true, icon: Dumbbell, color: "text-cyan-500", bg: "bg-cyan-50" },
        { title: "Pending Orders", value: pendingOrdersCount.toString(), trend: "0%", isPositive: true, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Processing Orders", value: processingOrdersCount.toString(), trend: "0%", isPositive: true, icon: RotateCcw, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Shipped Orders", value: shippedOrdersCount.toString(), trend: "0%", isPositive: true, icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
        { title: "Delivered Orders", value: deliveredOrdersCount.toString(), trend: "0%", isPositive: true, icon: AlertTriangle, color: "text-emerald-500", bg: "bg-emerald-50" },
      ];

      // 4. Process Recent Orders
      const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const recent10 = sortedOrders.slice(0, 10).map(o => {
         const customer = customers.find(c => c.id === o.customer_id);
         return {
           id: o.id.toString(),
           customer: customer ? customer.name : 'Unknown',
           amount: formatCurrency(o.subtotal || o.total_amount || 0),
           date: new Date(o.created_at).toLocaleDateString(),
           status: o.order_status || 'Pending'
         };
      });

      // 5. Customer Analytics
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      let newCustomersThisMonth = 0;
      let activeCustomers = new Set();
      let customerOrderCounts: Record<string, number> = {};

      customers.forEach(c => {
        const cDate = new Date(c.created_at);
        if (cDate.getMonth() === thisMonth && cDate.getFullYear() === thisYear) {
          newCustomersThisMonth++;
        }
      });

      orders.forEach(o => {
         if (o.customer_id) {
           activeCustomers.add(o.customer_id);
           customerOrderCounts[o.customer_id] = (customerOrderCounts[o.customer_id] || 0) + 1;
         }
      });

      let repeatCustomers = 0;
      Object.values(customerOrderCounts).forEach(count => {
         if (count > 1) repeatCustomers++;
      });

      const CUSTOMER_ANALYTICS = [
        { label: "New Customers This Month", value: newCustomersThisMonth.toString(), trend: "0%" },
        { label: "Active Customers", value: activeCustomers.size.toString(), trend: "0%" },
        { label: "Repeat Customers", value: repeatCustomers.toString(), trend: "0%" },
      ];

      // 6. Top Products
      const productSalesAndRevenue: Record<string, { sales: number, revenue: number }> = {};
      
      // Calculate from all orders, or restricted to delivered/shipped? 
      // The prompt just says "Total Orders, Revenue Generated" per product. We will count from all orders.
      orderItems.forEach(item => {
        const pId = item.product_id;
        if (!productSalesAndRevenue[pId]) {
          productSalesAndRevenue[pId] = { sales: 0, revenue: 0 };
        }
        productSalesAndRevenue[pId].sales += Number(item.quantity) || 0;
        productSalesAndRevenue[pId].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
      });

      const topProductsEntries = Object.entries(productSalesAndRevenue)
        .sort((a, b) => b[1].sales - a[1].sales)
        .slice(0, 5);

      const TOP_PRODUCTS = topProductsEntries.map(([pId, data]) => {
         const p = products.find(p => p.id.toString() === pId.toString());
         return {
           name: p ? p.name : `Product ID ${pId}`,
           sales: data.sales.toString(),
           revenue: formatCurrency(data.revenue),
           image: p && p.image ? p.image : "https://via.placeholder.com/150"
         };
      });

      // 7. Calculate Revenue Data for Chart using Orders
      // Group by month
      const monthlyRevenue: Record<string, { revenue: number, orders: number }> = {};
      orders.forEach(o => {
         const d = new Date(o.created_at);
         const month = d.toLocaleString('default', { month: 'short' });
         if (!monthlyRevenue[month]) monthlyRevenue[month] = { revenue: 0, orders: 0 };
         monthlyRevenue[month].orders += 1;
         if (['Delivered', 'Completed'].includes(o.order_status)) {
            monthlyRevenue[month].revenue += Number(o.subtotal || o.total_amount || 0);
         }
      });
      // Sort months generally? Or just display whatever months exist.
      const REVENUE_DATA = Object.entries(monthlyRevenue).map(([name, data]) => ({ name, revenue: data.revenue, orders: data.orders }));

      setDashboardData({
         stats: STATS,
         recentOrders: recent10,
         customerAnalytics: CUSTOMER_ANALYTICS,
         topProducts: TOP_PRODUCTS,
         revenueData: REVENUE_DATA,
         revenueTotal: totalRevenue,
         sportPerformance: [],
         athleteEngagementData: []
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && dashboardData.stats.length === 0) {
    return (
       <div className="flex items-center justify-center min-h-[50vh]">
         <div className="w-10 h-10 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
       </div>
    );
  }

  if (error) {
    return (
       <div className="p-6 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-between">
          <p className="font-medium">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-white rounded-lg text-sm font-bold border border-rose-200">Retry</button>
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Intelligence Dashboard</h1>
          <p className="text-[15px] text-[#666666] mt-1">Real-time business performance and athlete commerce analytics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action, idx) => (
            <Link 
              key={idx} 
              to={action.path}
              className="flex items-center px-4 py-2 bg-white border border-[#eaeaea] hover:border-[#111111] hover:shadow-sm text-[#111111] text-[13px] font-semibold rounded-lg transition-all"
            >
              <action.icon className="w-4 h-4 mr-2 text-[#666666]" />
              {action.name}
            </Link>
          ))}
          <button onClick={fetchData} disabled={loading} className="flex items-center px-4 py-2 bg-[#111111] text-white text-[13px] font-bold rounded-lg hover:bg-black transition-all">
             {loading ? <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
             Refresh Data
          </button>
        </div>
      </div>

      {/* 1. Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {dashboardData.stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col hover:border-[#cccccc] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-[#666666] text-[11px] font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
              <p className="text-[22px] xl:text-[24px] font-black text-[#111111] leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* 2. Revenue Analytics Section */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#eaeaea] shadow-sm flex flex-col p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-[16px] font-bold text-[#111111] mb-1">Monthly Revenue</h2>
              <p className="text-[13px] text-[#666666]">Revenue against completed orders.</p>
            </div>
            <div className="text-right">
              <p className="text-[24px] font-black text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dashboardData.revenueTotal)}</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            {dashboardData.revenueData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={dashboardData.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#111111" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} tickFormatter={(value) => `₹${value/1000}k`} />
                   <RechartsTooltip 
                     contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     itemStyle={{ color: '#111111', fontSize: '14px', fontWeight: 600 }}
                     labelStyle={{ color: '#666666', fontSize: '12px', marginBottom: '4px' }}
                   />
                   <Area type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                 </AreaChart>
               </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm">No revenue data available</div>
            )}
          </div>
        </div>

        {/* 3. Customer Analytics */}
        <div className="bg-[#111111] rounded-xl border border-[#333333] shadow-sm flex flex-col text-white">
          <div className="px-6 py-5 border-b border-[#333333]">
            <h2 className="text-[16px] font-bold flex items-center">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              Customer Analytics
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {dashboardData.customerAnalytics.map((item, idx) => (
              <div key={idx} className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-[13px] text-gray-400">{item.label}</p>
                </div>
                <p className="text-[20px] font-bold tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* 4. Recent Orders Table */}
         <div className="xl:col-span-2 bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#eaeaea] flex justify-between items-center">
            <div>
              <h2 className="text-[16px] font-bold text-[#111111]">Recent Orders</h2>
              <p className="text-[13px] text-[#666666] mt-0.5">Latest 10 orders.</p>
            </div>
            <Link to="/admin/orders" className="text-[13px] font-semibold text-[#111111] hover:underline">View All Orders</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {dashboardData.recentOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-bold text-[#111111]">ORD-{order.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-[#555555]">{order.customer}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-[#555555]">{order.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-bold text-[#111111]">{order.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {dashboardData.recentOrders.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-500 font-medium">No recent orders.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

         {/* 5. Top Products */}
         <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm flex flex-col">
            <div className="px-6 py-5 border-b border-[#eaeaea] flex justify-between items-center">
              <div>
                <h2 className="text-[16px] font-bold text-[#111111]">Top Products</h2>
                <p className="text-[13px] text-[#666666] mt-0.5">By total quantity sold.</p>
              </div>
              <Link to="/admin/products" className="text-[13px] font-semibold text-[#111111] hover:underline">All</Link>
            </div>
            <div className="divide-y divide-[#eaeaea]">
              {dashboardData.topProducts.map((product, idx) => (
                <div key={idx} className="p-4 flex items-center hover:bg-[#f8f9fa] transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 mr-4 border border-[#eaeaea]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-[13px] font-bold text-[#111111] truncate">{product.name}</h3>
                    <p className="text-[12px] text-[#666666] mt-0.5">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black text-[#111111]">{product.revenue}</p>
                  </div>
                </div>
              ))}
              {dashboardData.topProducts.length === 0 && (
                  <div className="p-8 text-center text-[13px] text-gray-500 font-medium">No product sales yet.</div>
              )}
            </div>
          </div>
       </div>
    </div>
  );
}
