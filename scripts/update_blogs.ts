import * as fs from 'fs';
const file = 'src/pages/admin/AdminBlogs.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('supabase.from')) {
    content = content.replace(
        'import { Search, Plus, Edit, Trash2, X } from "lucide-react";\nimport { motion, AnimatePresence } from "motion/react";',
        'import { Search, Plus, Edit, Trash2, X } from "lucide-react";\nimport { motion, AnimatePresence } from "motion/react";\nimport { supabase } from "../../lib/supabase";'
    );
    
    // Replace const DUMMY_POSTS = [...]
    content = content.replace(/const DUMMY_POSTS = \[[\s\S]*?\];\n\n/, '');

    // Replace the component body state
    content = content.replace(
        'const [posts, setPosts] = useState(DUMMY_POSTS);',
        `const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.code !== 'PGRST205') console.error(error);
        setPosts([]);
      } else {
        setPosts(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };`
    );

    // Replace handleSave
    content = content.replace(
        /const handleSave = \(\w+\) => \{[\s\S]*?setIsDrawerOpen\(false\);\n  \};/,
        `const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    
    try {
      if (editingPost) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingPost.id);
        if (error) throw error;
        showToast("Blog updated", "success");
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
        showToast("Blog created", "success");
      }
      setIsDrawerOpen(false);
      fetchPosts();
    } catch (err: any) {
       console.error(err);
       showToast(err.message || "Failed to save blog", "error");
    }
  };`
    );

    // Replace handleDelete
    content = content.replace(
        /const handleDelete = \(id: number\) => \{[\s\S]*?\};\n  \};/,
        `const handleDelete = async (id: number) => {
    if (window.confirm("Delete this blog post?")) {
      try {
         const { error } = await supabase.from('blogs').delete().eq('id', id);
         if (error) throw error;
         showToast("Blog deleted", "success");
         fetchPosts();
      } catch (err: any) {
         console.error(err);
         showToast("Failed to delete", "error");
      }
    }
  };`
    );

    content = content.replace(
        /<tbody className="divide-y divide-\[#eaeaea\]">[\s\S]*?<\/tbody>/,
        `<tbody className="divide-y divide-[#eaeaea]">
             {loading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                      Loading...
                   </td>
                </tr>
             ) : filteredPosts.length > 0 ? (
                 filteredPosts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden mr-3"><img src={post.image} alt="" className="w-full h-full object-cover"/></div>
                      <div><p className="text-[14px] font-bold text-[#111111]">{post.title}</p><p className="text-[12px] text-gray-500">{post.author} • {post.date || new Date(post.created_at).toLocaleDateString()}</p></div>
                    </td>
                    <td className="px-6 py-4"><span className="text-[13px] text-gray-600 bg-gray-100 px-2 py-1 rounded">{post.sport}</span></td>
                    <td className="px-6 py-4">
                      <span className={\`px-2 py-1 text-[11px] font-bold uppercase rounded \${post.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}\`}>{post.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenDrawer(post)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))
             ) : (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                      No blog posts found.
                   </td>
                </tr>
             )}
          </tbody>`
    );

    // add toast UI
    content = content.replace(
      '</AnimatePresence>\n    </div>',
      `</AnimatePresence>\n\n      <AnimatePresence>\n        {toast && (\n          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={\`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 \${toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-rose-500 text-white'}\`}>\n            <span className="text-[14px] font-medium">{toast.message}</span>\n          </motion.div>\n        )}\n      </AnimatePresence>\n    </div>`
    );

    fs.writeFileSync(file, content);
    console.log("Updated AdminBlogs.tsx");
} else {
    console.log("Already updated");
}
