import * as fs from 'fs';
const file = 'src/pages/admin/AdminOrders.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Remove static constants
content = content.replace(/const ORDERS_ANALYTICS = \[[\s\S]*?\];\n\n/, '');
content = content.replace(/const ORDER_TRENDS = \[[\s\S]*?\];\n\n/, '');

// Add state hooks
content = content.replace(
  'const [filterDate, setFilterDate] = useState("Last 30 Days");',
  `const [filterDate, setFilterDate] = useState("Last 30 Days");
  const [analytics, setAnalytics] = useState({ pending: 0, delivered: 0, cancelled: 0, prepaid: 0, cod: 0 });
  const [orderTrends, setOrderTrends] = useState<any[]>([]);`
);

// Update fetchOrders
content = content.replace(
  'setOrdersData(data.map(o => {',
  `const mapped = data.map(o => {`
);

content = content.replace(
  'products: orderItems.map((i: any) => {',
  `payment_method: o.payment_method, products: orderItems.map((i: any) => {`
);

content = content.replace(
  /}\);\n\s*}\n\s*} catch/g,
  `});
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

      }
    } catch`
);

// Update render variables
content = content.replace(
  '{ORDERS_ANALYTICS.map((stat, idx)',
  `{[
    { title: "Pending Orders", value: analytics.pending.toString(), color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    { title: "Delivered Orders", value: analytics.delivered.toString(), color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: "Cancelled Orders", value: analytics.cancelled.toString(), color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Prepaid Orders", value: analytics.prepaid.toString(), color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    { title: "COD Orders", value: analytics.cod.toString(), color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" }
  ].map((stat, idx)`
);

content = content.replace(
  'data={ORDER_TRENDS}',
  'data={orderTrends}'
);

fs.writeFileSync(file, content);
console.log("Updated AdminOrders.tsx");
