import { Logo } from '../components/Logo';
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

export function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error("Supabase error fetching blogs (query: published=true, status='published', order: published_at DESC):", error);
      }

      if (data && data.length > 0) {
         // Filter out scheduled posts that are in the future
         const now = new Date();
         const publishedBlogs = data.filter(blog => {
            if (blog.published_at) {
               return new Date(blog.published_at) <= now;
            }
            return true;
         });
         setBlogs(publishedBlogs);
      } else if (data && data.length === 0) {
        console.warn("Fetch returned no rows for query: .eq('published', true).eq('status', 'published') from table 'blogs'. Verify Row Level Security (RLS) policies allow anonymous SELECT, or check if data matches the filters.");
        setBlogs([]);
      }
    } catch (err) {
      console.error("Exception fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach(b => {
       if (b.category) cats.add(b.category);
    });
    return Array.from(cats);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
     let filtered = blogs;
     if (searchTerm) {
        filtered = filtered.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || (b.tags && b.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))));
     }
     if (selectedCategory) {
        filtered = filtered.filter(b => b.category === selectedCategory);
     }
     return filtered;
  }, [blogs, searchTerm, selectedCategory]);

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredBlogs.slice(start, start + postsPerPage);
  }, [filteredBlogs, currentPage]);

  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  return (
    <div className="py-16 md:py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111111] mb-4 text-center uppercase">
          The Baseline
        </h1>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto text-[15px]">Insights, science, and elite strategies from the bleeding edge of sports nutrition.</p>

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
           <div className="flex flex-wrap items-center gap-2">
              <button 
                 onClick={() => { setSelectedCategory(null); setCurrentPage(1); }} 
                 className={`px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${selectedCategory === null ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                 All Articles
              </button>
              {categories.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} 
                    className={`px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${selectedCategory === cat ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
           
           <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="Search articles..." 
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                 className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-[14px] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
              />
           </div>
        </div>

        {loading ? (
           <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[#111111] rounded-full animate-spin"></div>
           </div>
        ) : paginatedBlogs.length > 0 ? (
           <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                 {paginatedBlogs.map(blog => (
                   <Link to={`/blogs/${blog.slug}`} key={blog.id} className="group flex flex-col h-full">
                      <div className="aspect-[4/3] overflow-hidden mb-5 bg-[#f8f8f8] rounded-2xl relative">
                        {blog.featured_image ? (
                           <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-gray-100"><Logo className="opacity-30 scale-75" /></div>
                        )}
                        {blog.category && (
                           <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#111111] shadow-sm">
                              {blog.category}
                           </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                        <span>{blog.published_at || blog.created_at ? format(new Date(blog.published_at || blog.created_at), 'MMM dd, yyyy') : ''}</span>
                        {blog.author && (
                           <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span>{blog.author}</span>
                           </>
                        )}
                        {blog.reading_time && (
                           <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span>{blog.reading_time} MIN READ</span>
                           </>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-[#111111] leading-snug group-hover:underline decoration-2 underline-offset-4 mb-3">
                        {blog.title}
                      </h3>
                      {(blog.excerpt || blog.meta_description) && (
                         <p className="text-[14px] text-gray-600 line-clamp-2 mt-auto">
                            {blog.excerpt || blog.meta_description}
                         </p>
                      )}
                   </Link>
                 ))}
              </div>

              {totalPages > 1 && (
                 <div className="flex justify-center items-center mt-16 gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 border border-gray-200 rounded-full text-[13px] font-bold text-[#111111] disabled:opacity-30 hover:bg-gray-50 transition-colors">Prev</button>
                    <div className="flex gap-1 mx-4">
                       {Array.from({ length: totalPages }).map((_, i) => (
                          <button 
                             key={i} 
                             onClick={() => setCurrentPage(i + 1)}
                             className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#111111] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                             {i + 1}
                          </button>
                       ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 border border-gray-200 rounded-full text-[13px] font-bold text-[#111111] disabled:opacity-30 hover:bg-gray-50 transition-colors">Next</button>
                 </div>
              )}
           </>
        ) : (
           <div className="text-center py-24">
              <p className="text-lg font-medium text-gray-500">No articles found matching your criteria.</p>
           </div>
        )}
      </div>
    </div>
  );
}
