import * as fs from 'fs';
const file = 'src/pages/admin/AdminCustomers.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('const [currentPage, setCurrentPage] = useState(1);')) {
    content = content.replace(
        'const [filteredUsers, setFilteredUsers] = useState<any[]>([]);',
        'const [filteredUsers, setFilteredUsers] = useState<any[]>([]);\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 10;'
    );

    content = content.replace(
        'setFilteredUsers(result);',
        'setFilteredUsers(result);\n    setCurrentPage(1);'
    );
    
    content = content.replace(
        /\{filteredUsers\.map\(\(user, idx\) => \(/,
        `{filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user, idx) => (`
    );

    // Insert pagination controls after the table div
    content = content.replace(
        /<\/table>\n\s*<\/div>\n\s*<\/div>/,
        `</table>\n          </div>\n          {filteredUsers.length > itemsPerPage && (\n            <div className="px-6 py-4 border-t border-[#eaeaea] flex items-center justify-between">\n              <p className="text-[13px] text-[#666666]">\n                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries\n              </p>\n              <div className="flex gap-1">\n                <button \n                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}\n                  disabled={currentPage === 1}\n                  className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium disabled:opacity-50"\n                >Prev</button>\n                {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }).map((_, i) => (\n                  <button \n                    key={i}\n                    onClick={() => setCurrentPage(i + 1)}\n                    className={\`px-3 py-1 border rounded text-[13px] font-medium \${currentPage === i + 1 ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#eaeaea]'}\`}\n                  >{i + 1}</button>\n                ))}\n                <button \n                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}\n                  disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}\n                  className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium disabled:opacity-50"\n                >Next</button>\n              </div>\n            </div>\n          )}\n        </div>`
    );

    fs.writeFileSync(file, content);
    console.log("Updated AdminCustomers.tsx with pagination");
}
