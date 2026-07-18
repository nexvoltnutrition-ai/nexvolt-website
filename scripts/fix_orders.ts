import * as fs from 'fs';
const file = 'src/pages/admin/AdminOrders.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  `          };
        });
      } else {`,
  `          };
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
        
      } else {`
);

fs.writeFileSync(file, content);
console.log("Fixed AdminOrders.tsx");
