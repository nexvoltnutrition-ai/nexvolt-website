import * as fs from 'fs';
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('AdminCoupons')) {
    content = content.replace(
        'import { AdminRewards } from "./pages/admin/AdminRewards";',
        `import { AdminRewards } from "./pages/admin/AdminRewards";
import { AdminCoupons } from "./pages/admin/AdminCoupons";
import { AdminReviews } from "./pages/admin/AdminReviews";`
    );
    content = content.replace(
        '<Route path="rewards" element={<AdminRewards />} />',
        `<Route path="rewards" element={<AdminRewards />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />`
    );
    fs.writeFileSync(file, content);
    console.log("Updated App.tsx");
}
