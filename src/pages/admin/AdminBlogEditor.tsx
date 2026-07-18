import { Logo } from '../../components/Logo';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Eye, Edit3, Monitor, Tablet, Smartphone, Settings, 
  History, Save, CheckCircle, Clock, Image as ImageIcon,
  Tag, Calendar, FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TiptapEditor } from '../../components/TiptapEditor';
import { ImageUpload } from '../../components/ImageUpload';
import slugify from 'slugify';
import DOMPurify from 'dompurify';

export function AdminBlogEditor({ post, onClose }: { post: any, onClose: () => void }) {
  const [formData, setFormData] = useState({
    id: post?.id || '',
    title: post?.title || '',
    slug: post?.slug || '',
    category: post?.category || '',
    tags: Array.isArray(post?.tags) ? post?.tags.join(', ') : (post?.tags || ''),
    featured_image: post?.featured_image || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    author: post?.author || '',
    author_image: post?.author_image || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    status: post?.status || 'draft',
    featured: post?.featured || false,
    published_at: post?.published_at ? new Date(post.published_at).toISOString().slice(0,16) : ''
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'seo' | 'history'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Basic autosave loop
  useEffect(() => {
    const timer = setInterval(() => {
       if (formData.title || formData.content) {
          handleAutoSave();
       }
    }, 10000);
    return () => clearInterval(timer);
  }, [formData]);

  const calculateReadingTime = (text: string) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const textWithoutHtml = text.replace(/<[^>]*>?/gm, '');
    const noOfWords = textWithoutHtml.split(/\s/g).length;
    const minutes = noOfWords / wordsPerMinute;
    return Math.max(1, Math.ceil(minutes));
  };

  const handleAutoSave = async (throwError = false) => {
    // Only auto-save if we have at least a title
    if (!formData.title) return;
    setIsSaving(true);
    
    try {
      // 1. Verify user is authenticated
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("Current Authenticated User:", authData?.user, "Error:", authError);
      
      if (authError || !authData?.user) {
         throw new Error("Authentication failed: No valid authenticated user found.");
      }

      const reading_time = calculateReadingTime(formData.content);
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      let publishedAtValue = null;
      if (formData.published_at) {
         publishedAtValue = new Date(formData.published_at).toISOString();
      } else if (formData.status === 'published' && (!post || post.status !== 'published')) {
         publishedAtValue = new Date().toISOString();
      } else if (post && post.published_at) {
         publishedAtValue = post.published_at;
      }
      
      // Auto-generated slug if empty
      const currentSlug = formData.slug || slugify(formData.title, { lower: true, strict: true });

      const payload = {
        title: formData.title,
        slug: currentSlug,
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

      if (formData.id) {
        // Update existing
        console.log("Updating blog id:", formData.id);
        console.log("Update payload:", payload);
        const { data, error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', formData.id)
          .select();
          
        console.log("Supabase response - Data:", data, "Error:", error);
        
        if (error) {
           throw error;
        }
        
        if (!data || data.length === 0) {
           throw new Error("Update failed: No rows were updated. Check RLS policies.");
        }

      } else {
        // Insert new draft
        console.log("Inserting new blog. Payload:", payload);
        const { data, error } = await supabase
          .from('blogs')
          .insert([{ ...payload, views: 0 }])
          .select()
          .single();
          
        console.log("Supabase insert response - Data:", data, "Error:", error);
        
        if (error) {
           throw error;
        }
        if (data) {
           setFormData(prev => ({ ...prev, id: data.id, slug: currentSlug }));
        }
      }
      setLastSaved(new Date());
    } catch (err) {
      console.error('Autosave failed', err);
      if (throwError) throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const manualSave = async (statusOverride?: string) => {
     if (statusOverride) {
        formData.status = statusOverride;
     }
     try {
       await handleAutoSave(true);
       alert(`Saved as ${formData.status}`);
     } catch (err: any) {
       alert(err.message || "An error occurred while saving.");
     }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden text-[#111]">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input 
               type="text" 
               value={formData.title} 
               onChange={e => setFormData({...formData, title: e.target.value})}
               placeholder="Untitled Post"
               className="text-xl font-bold border-none outline-none focus:ring-0 bg-transparent w-full md:w-96"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center text-[12px] font-medium text-gray-500 gap-1 mr-2">
             {isSaving ? (
                <><div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Saving...</>
             ) : lastSaved ? (
                <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Saved {lastSaved.toLocaleTimeString()}</>
             ) : null}
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button onClick={() => setActiveTab('editor')} className={`px-3 py-1.5 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all ${activeTab === 'editor' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}>
               <Edit3 className="w-4 h-4" /> <span className="hidden md:inline">Editor</span>
             </button>
             <button onClick={() => setActiveTab('preview')} className={`px-3 py-1.5 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}>
               <Eye className="w-4 h-4" /> <span className="hidden md:inline">Preview</span>
             </button>
             <button onClick={() => setActiveTab('history')} className={`px-3 py-1.5 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}><History className="w-4 h-4" /> <span className="hidden md:inline">History</span></button>
             <button onClick={() => setActiveTab('seo')} className={`px-3 py-1.5 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all ${activeTab === 'seo' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}>
               <Settings className="w-4 h-4" /> <span className="hidden md:inline">SEO</span>
             </button>
          </div>

          <button onClick={() => manualSave('draft')} className="hidden sm:block px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-[13px] font-bold text-gray-700 transition-colors">
            Save Draft
          </button>
          <button onClick={() => manualSave('published')} className="px-5 py-2 bg-[#111111] hover:bg-black text-white rounded-lg text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2">
            Publish
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex relative">
        
        {/* Editor View */}
        {activeTab === 'editor' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-4xl space-y-6">
               <TiptapEditor 
                 value={formData.content} 
                 onChange={(val) => setFormData({...formData, content: val})} 
               />
            </div>
            
            {/* Quick Settings Sidebar */}
            <div className="hidden xl:block w-80 shrink-0 ml-8 space-y-6">
               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Featured Image</h3>
                  <ImageUpload value={formData.featured_image} onChange={url => setFormData({...formData, featured_image: url})} />
               </div>
               
               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-2"><Tag className="w-4 h-4"/> Taxonomy</h3>
                  <div>
                    <label className="text-xs font-bold mb-1 block">Category</label>
                    <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Nutrition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-1 block">Tags (comma separated)</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. health, diet" />
                  </div>
               </div>

               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-2"><Calendar className="w-4 h-4"/> Schedule</h3>
                  <div>
                     <input type="datetime-local" value={formData.published_at} onChange={e => setFormData({...formData, published_at: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Preview View */}
        {activeTab === 'preview' && (
          <div className="flex-1 flex flex-col bg-gray-100">
             <div className="h-12 border-b border-gray-200 bg-white flex items-center justify-center gap-2">
                <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-colors ${previewDevice === 'desktop' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black'}`}><Monitor className="w-5 h-5"/></button>
                <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-lg transition-colors ${previewDevice === 'tablet' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black'}`}><Tablet className="w-5 h-5"/></button>
                <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-colors ${previewDevice === 'mobile' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black'}`}><Smartphone className="w-5 h-5"/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
                <div 
                   className={`bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 ${
                      previewDevice === 'desktop' ? 'w-full max-w-5xl' : 
                      previewDevice === 'tablet' ? 'w-[768px]' : 'w-[375px]'
                   }`}
                >
                   {/* Mock Header */}
                   <div className="h-16 bg-white border-b flex items-center px-6">
                      <Logo />
                   </div>
                   {/* Preview Content */}
                   <div className="p-6 md:p-12">
                      <div className="max-w-3xl mx-auto">
                         <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{formData.title || 'Untitled Post'}</h1>
                         {formData.featured_image && (
                            <div className="aspect-video mb-12 rounded-2xl overflow-hidden bg-gray-100">
                               <img src={formData.featured_image} alt="" className="w-full h-full object-cover"/>
                            </div>
                         )}
                         <div 
                            className="prose prose-lg md:prose-xl max-w-none font-serif leading-relaxed prose-headings:font-sans prose-headings:font-black prose-img:rounded-2xl prose-table:border-collapse prose-th:border prose-th:p-2 prose-td:border prose-td:p-2"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content || '<p>Start writing...</p>') }}
                         />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* SEO Panel */}
        {activeTab === 'seo' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
             <div className="w-full max-w-3xl space-y-8">
                <div>
                   <h2 className="text-2xl font-bold mb-2">Search Engine Optimization</h2>
                   <p className="text-gray-500 text-sm mb-8">Optimize your post for search engines and social media sharing.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                   <h3 className="font-bold text-lg border-b pb-2">Google Search Preview</h3>
                   <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm max-w-[600px]">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs">N</div>
                         <div>
                            <div className="text-sm text-gray-800">Nexvolt</div>
                            <div className="text-[12px] text-gray-500">https://nexvolt.com/blogs/{formData.slug || 'untitled-post'}</div>
                         </div>
                      </div>
                      <div className="text-[#1a0dab] text-xl cursor-pointer hover:underline truncate">
                         {formData.meta_title || formData.title || 'Untitled Post - Nexvolt'}
                      </div>
                      <div className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                         {formData.meta_description || formData.excerpt || formData.content?.replace(/<[^>]*>?/gm, '').substring(0, 160) || 'Write a meta description to see how it will appear in search results.'}
                      </div>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-bold mb-1">Focus Keyword</label>
                      </div>
                      <div>
                         <label className="block text-sm font-bold mb-1">URL Slug</label>
                         <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="post-url-slug" />
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold mb-1">Meta Title</label>
                      <input type="text" value={formData.meta_title} onChange={e => setFormData({...formData, meta_title: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm" placeholder="SEO Title (50-60 chars)" />
                      <div className={`text-xs mt-1 ${formData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>{formData.meta_title.length} / 60 characters</div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold mb-1">Meta Description</label>
                      <textarea value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} rows={3} className="w-full border rounded-lg p-2.5 text-sm" placeholder="Write a compelling description (150-160 chars)" />
                      <div className={`text-xs mt-1 ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>{formData.meta_description.length} / 160 characters</div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold mb-1">Canonical URL</label>
                      <p className="text-xs text-gray-500 mt-1">Leave blank to use default. Only use if cross-posting.</p>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                   <h3 className="font-bold text-lg border-b pb-2">Social Open Graph (OG)</h3>
                   <div className="pt-2">
                      <label className="block text-sm font-bold mb-2">OG Image override</label>
                      <p className="text-xs text-gray-500 mt-2">If left blank, the featured image will be used for social sharing.</p>
                   </div>
                </div>

             </div>
          </div>
        )}

      
        {/* Revision History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-gray-50">
             <div className="w-full max-w-3xl space-y-6">
                <div>
                   <h2 className="text-2xl font-bold mb-2">Revision History</h2>
                   <p className="text-gray-500 text-sm mb-6">View and restore previous versions of this post.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                   <div className="text-center py-12 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-bold text-gray-700">No revisions yet</p>
                      <p className="text-sm">Revisions are saved automatically as you edit.</p>
                   </div>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
