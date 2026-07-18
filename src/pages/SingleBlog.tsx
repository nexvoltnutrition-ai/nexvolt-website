import { Logo } from '../components/Logo';
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ChevronLeft, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import DOMPurify from 'dompurify';

export function SingleBlog() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      fetchBlog(slug);
    }
  }, [slug]);

  const fetchBlog = async (postSlug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', postSlug)
        .single();

      if (error) {
        console.error("Supabase error fetching single blog:", error);
        
        // We only want to redirect if it truly means "not found" (0 rows).
        if (error.code === 'PGRST116') {
           console.warn(`Blog with slug '${postSlug}' not found.`);
           navigate('/blogs');
           return;
        }
        
        setBlog(null);
        return;
      }

      let blogData = data;
      
      if (!blogData) {
        console.warn(`Blog with slug '${postSlug}' not found.`);
        navigate('/blogs');
        return;
      }

      // Check if it's scheduled for future and not admin
      // For a real app we'd check if user is admin. Here we'll just allow it or rely on status
      if (blogData.status !== 'Published') {
         // Might redirect if strict
      }

      setBlog(blogData);

      if (blogData.related_blogs && blogData.related_blogs.length > 0) {
         const { data: relatedData } = await supabase
            .from('blogs')
            .select('id, title, slug, image, featured_image, category, created_at, published_at')
            .in('slug', blogData.related_blogs)
            .eq('status', 'Published')
            .limit(3);
         
         if (relatedData) setRelated(relatedData);
      } else {
         // Fetch random or recent related
         const { data: relatedData } = await supabase
            .from('blogs')
            .select('id, title, slug, image, featured_image, category, created_at, published_at')
            .neq('id', data.id)
            .eq('status', 'Published')
            .order('created_at', { ascending: false })
            .limit(3);
         if (relatedData) setRelated(relatedData);
      }
    } catch (err) {
      console.error(err);
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="py-24 flex justify-center items-center min-h-[60vh]">
           <div className="w-8 h-8 border-4 border-gray-200 border-t-[#111111] rounded-full animate-spin"></div>
        </div>
     );
  }

  if (!blog) return null;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16 md:py-20">
        <Link to="/blogs" className="inline-flex items-center text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#111111] transition-colors mb-12">
           <ChevronLeft className="w-4 h-4 mr-1" /> Back to Journal
        </Link>

        <div className="text-center mb-12 max-w-3xl mx-auto">
           {blog.category && (
              <div className="text-[12px] font-black uppercase tracking-widest text-[#f47c20] mb-5">
                {blog.category}
              </div>
           )}
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#111111] mb-6 leading-[1.1]">
             {blog.title}
           </h1>
           <div className="flex items-center justify-center gap-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
              <span>{blog.published_at || blog.created_at ? format(new Date(blog.published_at || blog.created_at), 'MMMM dd, yyyy') : ''}</span>
              {blog.reading_time && (
                 <>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    <span>{blog.reading_time} MIN READ</span>
                 </>
              )}
           </div>
        </div>

        {(blog.image || blog.featured_image) && (
           <div className="aspect-[21/9] md:aspect-[2.35/1] mb-16 rounded-3xl overflow-hidden bg-[#f8f8f8] shadow-lg">
              <img src={blog.image || blog.featured_image} alt={blog.title} className="w-full h-full object-cover" />
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px] gap-12">
           <div 
              className="prose prose-lg md:prose-xl max-w-none text-gray-800 font-serif leading-relaxed prose-headings:font-sans prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-2xl prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-td:border prose-td:border-gray-300 prose-td:p-2"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
           />
           
           <div className="hidden lg:flex flex-col items-center gap-4 sticky top-32 h-fit">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2" style={{ writingMode: 'vertical-rl' }}>Share</span>
              <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#111111] hover:border-[#111111] transition-colors"><Twitter className="w-4 h-4"/></button>
              <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#111111] hover:border-[#111111] transition-colors"><Facebook className="w-4 h-4"/></button>
              <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#111111] hover:border-[#111111] transition-colors"><Linkedin className="w-4 h-4"/></button>
              <button className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#111111] hover:border-[#111111] transition-colors"><LinkIcon className="w-4 h-4"/></button>
           </div>
        </div>

        {blog.tags && blog.tags.length > 0 && (
           <div className="mt-16 flex flex-wrap gap-2">
              {blog.tags.map((tag: string) => (
                 <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-700 text-[12px] font-bold uppercase tracking-wider rounded-lg">
                    {tag}
                 </span>
              ))}
           </div>
        )}

        <div className="border-t border-gray-200 mt-16 pt-16">
           <h3 className="text-2xl font-black text-[#111111] mb-8 uppercase tracking-tight">Keep Reading</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map(r => (
                 <Link to={`/blogs/${r.slug}`} key={r.id} className="group">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                       {r.image || r.featured_image ? (
                          <img src={r.image || r.featured_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100"><Logo className="opacity-30 scale-75" /></div>
                       )}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{r.category || 'Article'}</div>
                    <h4 className="text-[15px] font-black text-[#111111] leading-snug group-hover:underline decoration-2">{r.title}</h4>
                 </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
