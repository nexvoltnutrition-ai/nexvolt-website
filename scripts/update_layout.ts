import * as fs from 'fs';
const file = 'src/components/admin/AdminLayout.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('AdminCoupons')) {
    content = content.replace(
        'import { Settings } from "lucide-react";',
        'import { Settings, Ticket, MessageSquare } from "lucide-react";'
    );
    content = content.replace(
        '{ name: "Rewards", path: "/admin/rewards", icon: Gift },',
        `{ name: "Rewards", path: "/admin/rewards", icon: Gift },
  { name: "Coupons", path: "/admin/coupons", icon: Ticket },
  { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },`
    );
    fs.writeFileSync(file, content);
    console.log("Updated AdminLayout");
}
