
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Layout, Image as ImageIcon, MessageSquare, LayoutGrid, Megaphone, Edit, Save, ListOrdered, X, Layers, Instagram, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as CMS from '../../components/admin/cms/CMSForms';

const SECTIONS = [
  { id: 'hero_slider', title: 'Hero Slider', desc: 'Manage unlimited banners for the top of the homepage.', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'announcement_bar', title: 'Announcement Bar', desc: 'Top bar text and colors.', icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'featured_categories', title: 'Featured Categories', desc: 'Select and order categories.', icon: LayoutGrid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'shop_by_sport', title: 'Shop By Sport', desc: 'Select sports and upload images.', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'featured_products', title: 'Featured Products', desc: 'Select products and mark badges.', icon: ListOrdered, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'homepage_collections', title: 'Homepage Collections', desc: 'Manage collections banner.', icon: Layout, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'promotional_banner', title: 'Promotional Banner', desc: 'Mid-page promotional section.', icon: ImageIcon, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  { id: 'testimonials', title: 'Testimonials', desc: 'Manage customer reviews.', icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'instagram_gallery', title: 'Instagram Gallery', desc: 'Upload gallery images.', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'footer_banner', title: 'Footer Banner', desc: 'Pre-footer call to action.', icon: ImageIcon, color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'seo', title: 'Global SEO', desc: 'Homepage meta tags and keywords.', icon: Search, color: 'text-teal-600', bg: 'bg-teal-50' }
];

export function AdminHomepage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setSettings({});
    setLoading(false);
  };

  const handleOpenDrawer = (sectionId: string) => {
    setActiveSection(sectionId);
    setFormData(settings[sectionId]);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedSettings = { ...settings, [activeSection as string]: formData };
      setSettings(updatedSettings);
      setToast({ type: 'success', message: 'Settings saved temporarily ' });
      setIsDrawerOpen(false);
    } catch (error: any) {
      setToast({ type: 'error', message: 'Failed to save' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const renderForm = () => {
    switch (activeSection) {
      case 'hero_slider': return <CMS.HeroSliderForm />;
      case 'announcement_bar': return <CMS.AnnouncementBarForm />;
      case 'featured_categories': return <CMS.FeaturedCategoriesForm />;
      case 'shop_by_sport': return <CMS.ShopBySportForm />;
      case 'featured_products': return <CMS.FeaturedProductsForm />;
      case 'homepage_collections': return <CMS.HomepageCollectionsForm />;
      case 'promotional_banner': return <CMS.PromotionalBannerForm />;
      case 'testimonials': return <CMS.TestimonialsForm />;
      case 'instagram_gallery': return <CMS.InstagramGalleryForm />;
      case 'footer_banner': return <CMS.FooterBannerForm />;
      case 'seo': return <CMS.SEOForm />;
      default: return null;
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111111]">Homepage Management (CMS)</h1>
        <p className="text-[#666666] mt-1">Manage and edit your storefront homepage directly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map((section) => (
          <div key={section.id} className="bg-white rounded-xl border border-[#eaeaea] p-6 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${section.bg} flex items-center justify-center`}>
                <section.icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <button 
                onClick={() => handleOpenDrawer(section.id)}
                className="p-2 rounded-lg border border-[#eaeaea] text-[#666666] hover:bg-black hover:text-white hover:border-black transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#111111] mb-1">{section.title}</h2>
              <p className="text-[13px] text-[#666666] leading-relaxed">{section.desc}</p>
            </div>
            {settings[section.id] && (
               <div className="mt-4 inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold">
                 Configured
               </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsDrawerOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
             />
             <motion.div 
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-[#eaeaea]"
             >
               <div className="px-6 py-4 border-b border-[#eaeaea] flex items-center justify-between col-span-full bg-white relative z-10">
                 <div>
                   <h2 className="text-xl font-bold text-[#111111]">
                     Edit {SECTIONS.find(s => s.id === activeSection)?.title}
                   </h2>
                 </div>
                 <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111] transition-colors p-2 rounded-md hover:bg-[#f8f9fa]">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                  {renderForm()}
               </div>
             </motion.div>
           </>
        )}
      </AnimatePresence>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 ${
          toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-red-500 text-white'
        }`}>
          <span className="text-[14px] font-medium max-w-md">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
