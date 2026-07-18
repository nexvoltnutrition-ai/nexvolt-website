import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, Eye, Image as ImageIcon, Calendar, Clock, Tag, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ImageUpload } from '../../components/ImageUpload';
import { TiptapEditor } from '../../components/TiptapEditor';
import { AdminBlogEditor } from './AdminBlogEditor';
import slugify from 'slugify';

export function AdminBlogs() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    tags: '',
    featured_image: '',
    content: '',
    excerpt: '',
    author: '',
    author_image: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    featured: false,
    published_at: ''
  });

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
         if (error.code === '42P01') {
            console.log('blogs table does not exist, creating it implicitly or returning empty array');
            setPosts([]);
         } else {
            throw error;
         }
      } else if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (post: any = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        category: post.category || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        featured_image: post.featured_image || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        author: post.author || '',
        author_image: post.author_image || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        status: post.status || 'draft',
        featured: post.featured || false,
        published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0,16) : ''
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        category: '',
        tags: '',
        featured_image: '',
        content: '',
        excerpt: '',
        author: '',
        author_image: '',
        meta_title: '',
        meta_description: '',
        status: 'draft',
        featured: false,
        published_at: ''
      });
    }
    setIsDrawerOpen(true);
  };

  const calculateReadingTime = (text: string) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const textWithoutHtml = text.replace(/<[^>]*>?/gm, '');
    const noOfWords = textWithoutHtml.split(/\s/g).length;
    const minutes = noOfWords / wordsPerMinute;
    return Math.max(1, Math.ceil(minutes));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: slugify(title, { lower: true, strict: true })
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("Current Authenticated User (Save):", authData?.user, "Error:", authError);
      if (authError || !authData?.user) {
        throw new Error("Authentication failed: No valid authenticated user found.");
      }

      const reading_time = calculateReadingTime(formData.content);
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      let publishedAtValue = null;
      if (formData.published_at) {
         publishedAtValue = new Date(formData.published_at).toISOString();
      } else if (formData.status === 'published' && (!editingPost || editingPost.status !== 'published')) {
         publishedAtValue = new Date().toISOString();
      } else if (editingPost && editingPost.published_at) {
         publishedAtValue = editingPost.published_at;
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        tags: tagsArray,
        featured_image: formData.featured_image,
        content: formData.content,
        excerpt: formData.excerpt,
        author: formData.author,
        author_image: formData.author_image,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        status: formData.status,
        featured: formData.featured,
        reading_time,
        published_at: publishedAtValue,
        updated_at: new Date().toISOString()
      };

      if (editingPost) {
        console.log("Updating blog id:", editingPost.id);
        console.log("Update payload:", payload);
        const { data, error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', editingPost.id)
          .select();
          
        console.log("Supabase response - Data:", data, "Error:", error);
        if (error) throw error;
        if (!data || data.length === 0) {
           throw new Error("Update failed: No rows were updated. Check RLS policies.");
        }
        showToast('Blog post updated successfully', 'success');
      } else {
        console.log("Inserting new blog. Payload:", payload);
        const { data, error } = await supabase
          .from('blogs')
          .insert([{ ...payload, views: 0 }])
          .select();
        console.log("Supabase insert response - Data:", data, "Error:", error);
        if (error) throw error;
        showToast('Blog post created successfully', 'success');
      }

      setIsDrawerOpen(false);
      fetchPosts();
    } catch (error: any) {
      console.error('Error saving post:', error);
      showToast(error.message || 'Error saving blog post', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("Current Authenticated User (Delete):", authData?.user, "Error:", authError);
      if (authError || !authData?.user) {
        throw new Error("Authentication failed: No valid authenticated user found.");
      }

      console.log("Deleting blog id:", id);
      const { data, error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)
        .select();
        
      console.log("Supabase delete response - Data:", data, "Error:", error);
      if (error) throw error;
      if (!data || data.length === 0) {
         throw new Error("Delete failed: No rows were deleted. Check RLS policies.");
      }
      showToast('Post deleted successfully', 'success');
      fetchPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      showToast(error.message || 'Error deleting post', 'error');
    }
  };
  
  const handleToggleFeature = async (post: any) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("Current Authenticated User (Toggle Feature):", authData?.user, "Error:", authError);
      if (authError || !authData?.user) {
        throw new Error("Authentication failed: No valid authenticated user found.");
      }
      
      const updatePayload = { featured: !post.featured, updated_at: new Date().toISOString() };
      console.log("Updating feature for blog id:", post.id, "Payload:", updatePayload);

      const { data, error } = await supabase
        .from('blogs')
        .update(updatePayload)
        .eq('id', post.id)
        .select();
        
      console.log("Supabase toggle feature response - Data:", data, "Error:", error);
      if (error) throw error;
      if (!data || data.length === 0) {
         throw new Error("Update failed: No rows were updated. Check RLS policies.");
      }
      showToast(post.featured ? 'Post unfeatured' : 'Post featured successfully', 'success');
      fetchPosts();
    } catch (error: any) {
      console.error('Error featuring post:', error);
      showToast(error.message || 'Error updating feature status', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => 
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Blog CMS</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage articles, guides, and news.</p>
        </div>
        <button onClick={() => handleOpenDrawer()} className="bg-[#111111] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-gray-900 transition-colors flex items-center shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search posts by title, slug, or category..." 
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#eaeaea] rounded-lg text-[14px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-[#eaeaea]">
            <tr>
              <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Post</th>
              <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaeaea]">
             {loading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mb-2"></div>
                         Loading posts...
                      </div>
                   </td>
                </tr>
             ) : paginatedPosts.length > 0 ? (
                 paginatedPosts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 flex items-center">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden mr-4 border border-gray-200 shrink-0">
                        {post.featured_image ? (
                           <img src={post.featured_image} alt="" className="w-full h-full object-cover"/>
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#111111] line-clamp-1 flex items-center">
                           {post.featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1.5" />}
                           {post.title}
                        </p>
                        <p className="text-[12px] text-gray-500 line-clamp-1 truncate mt-0.5">/{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[12px] font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">{post.category || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                         <span className={"px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md " + (post.status?.toLowerCase() === 'published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-800 border border-gray-200')}>{post.status}</span>
                         {post.published_at && new Date(post.published_at) > new Date() && post.status?.toLowerCase() === 'published' && (
                            <span className="text-[10px] text-orange-600 flex items-center font-medium bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100"><Clock className="w-3 h-3 mr-1" /> Scheduled</span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleToggleFeature(post)} className={"p-2 hover:bg-gray-100 rounded-lg transition-colors " + (post.featured ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500")} title={post.featured ? "Unfeature" : "Feature"}>
                          <Star className="w-4 h-4" fill={post.featured ? "currentColor" : "none"}/>
                        </button>
                        <a href={"/blogs/" + post.slug} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors" title="Preview">
                          <Eye className="w-4 h-4"/>
                        </a>
                        <button onClick={() => handleOpenDrawer(post)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
             ) : (
                <tr>
                   <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                         <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                         <p className="text-sm font-medium">No blog posts found.</p>
                         {searchTerm && <p className="text-xs mt-1">Try adjusting your search criteria.</p>}
                      </div>
                   </td>
                </tr>
             )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing {(currentPage - 1) * postsPerPage + 1} to {Math.min(currentPage * postsPerPage, filteredPosts.length)} of {filteredPosts.length} posts</span>
            <div className="flex gap-1">
               <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors">Previous</button>
               <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      
      <AnimatePresence>
        {isDrawerOpen && (
           <AdminBlogEditor 
              post={editingPost} 
              onClose={() => {
                 setIsDrawerOpen(false);
                 fetchPosts();
              }} 
           />
        )}
      </AnimatePresence>

    </div>
  );
}
