import * as fs from 'fs';
const file = 'src/components/admin/AdminLayout.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('Ticket,')) {
    content = content.replace(
        '  Settings,',
        '  Settings,\n  Ticket,\n  MessageSquare,'
    );
    fs.writeFileSync(file, content);
    console.log("Fixed AdminLayout.tsx");
}
