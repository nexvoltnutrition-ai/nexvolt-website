const fs = require('fs');

const cmsFormsContent = `
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Edit, Image as ImageIcon, Layout, Link, AlignLeft, X, Package, Dumbbell, MessageSquare, LayoutGrid, Plus, Trash2, GripVertical, GripHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

export const handleImageUpload = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = \`\${Math.random().toString(36).substring(2, 15)}_\${Date.now()}.\${fileExt}\`;
  const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
  if (uploadError) throw uploadError;
  const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
  return publicUrl;
};

// --- Form Components ---

// 1. Hero Slider
export function HeroSliderForm({ data, onChange, onSave, saving }) {
  const [slides, setSlides] = useState(data || []);
  
  const addSlide = () => {
    setSlides([...slides, { id: Date.now().toString(), desktopImg: '', mobileImg: '', headline: '', subHead: '', btnText: '', btnLink: '', enabled: true }]);
  };
  
  const updateSlide = (idx, field, val) => {
    const newSlides = [...slides];
    newSlides[idx][field] = val;
    setSlides(newSlides);
  };
  
  const moveSlide = (idx, dir) => {
    if (idx + dir < 0 || idx + dir >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[idx];
    newSlides[idx] = newSlides[idx + dir];
    newSlides[idx + dir] = temp;
    setSlides(newSlides);
  };
  
  const removeSlide = (idx) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };
  
  useEffect(() => { onChange(slides); }, [slides]);

  return (
    <div className="space-y-4">
      {slides.map((slide, idx) => (
        <div key={slide.id} className="p-4 border border-gray-200 rounded-lg relative">
          <div className="flex justify-between items-center mb-3">
             <div className="flex gap-2">
                <button type="button" onClick={() => moveSlide(idx, -1)} className="p-1 hover:bg-gray-100 rounded"><ChevronUp className="w-4 h-4"/></button>
                <button type="button" onClick={() => moveSlide(idx, 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronDown className="w-4 h-4"/></button>
             </div>
             <button type="button" onClick={() => removeSlide(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold mb-1">Desktop Image URL</label>
                <input type="text" value={slide.desktopImg} onChange={e => updateSlide(idx, 'desktopImg', e.target.value)} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div>
                <label className="block text-xs font-bold mb-1">Mobile Image URL</label>
                <input type="text" value={slide.mobileImg} onChange={e => updateSlide(idx, 'mobileImg', e.target.value)} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div>
                <label className="block text-xs font-bold mb-1">Headline</label>
                <input type="text" value={slide.headline} onChange={e => updateSlide(idx, 'headline', e.target.value)} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div>
                <label className="block text-xs font-bold mb-1">Sub Heading</label>
                <input type="text" value={slide.subHead} onChange={e => updateSlide(idx, 'subHead', e.target.value)} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div>
                <label className="block text-xs font-bold mb-1">Button Text</label>
                <input type="text" value={slide.btnText} onChange={e => updateSlide(idx, 'btnText', e.target.value)} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div>
                <label className="block text-xs font-bold mb-1">Button Link</label>
                <input type="text" value={slide.btnLink} onChange={e => updateSlide(idx, 'btnLink', e.target.value)} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={slide.enabled} onChange={e => updateSlide(idx, 'enabled', e.target.checked)} />
                <label className="text-sm">Enabled</label>
             </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addSlide} className="flex items-center text-sm font-bold text-emerald-600"><Plus className="w-4 h-4 mr-1"/> Add Slide</button>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 2. Announcement Bar
export function AnnouncementBarForm({ data, onChange, onSave, saving }) {
  const [info, setInfo] = useState(data || { text: '', bgColor: '#000000', textColor: '#ffffff', enabled: true });
  useEffect(() => { onChange(info); }, [info]);

  return (
    <div className="space-y-4">
      <div><label className="block text-xs font-bold mb-1">Text</label><input type="text" value={info.text} onChange={e => setInfo({...info, text: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold mb-1">Background Color</label><input type="color" value={info.bgColor} onChange={e => setInfo({...info, bgColor: e.target.value})} className="w-full h-10 border rounded"/></div>
        <div><label className="block text-xs font-bold mb-1">Text Color</label><input type="color" value={info.textColor} onChange={e => setInfo({...info, textColor: e.target.value})} className="w-full h-10 border rounded"/></div>
      </div>
      <div className="flex items-center gap-2"><input type="checkbox" checked={info.enabled} onChange={e => setInfo({...info, enabled: e.target.checked})} /><label className="text-sm">Enabled</label></div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 3. Featured Categories
export function FeaturedCategoriesForm({ data, onChange, onSave, saving }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(data || []);
  
  useEffect(() => {
    supabase.from('categories').select('*').then(({data}) => setCategories(data || []));
  }, []);
  useEffect(() => { onChange(selected); }, [selected]);
  
  const toggleSelection = (catId) => {
    if(selected.includes(catId)) setSelected(selected.filter(id => id !== catId));
    else setSelected([...selected, catId]);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
         {categories.map(cat => (
           <label key={cat.id} className="flex items-center gap-2 text-sm p-2 border rounded cursor-pointer hover:bg-gray-50">
             <input type="checkbox" checked={selected.includes(cat.id)} onChange={() => toggleSelection(cat.id)} />
             {cat.name}
           </label>
         ))}
      </div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 4. Shop By Sport
export function ShopBySportForm({ data, onChange, onSave, saving }) {
  const [sports, setSports] = useState([]);
  const [selected, setSelected] = useState(data || []); // array of { sport_id, image }
  
  useEffect(() => {
    supabase.from('sports').select('*').then(({data}) => setSports(data || []));
  }, []);
  useEffect(() => { onChange(selected); }, [selected]);
  
  const toggleSelection = (sportId) => {
    const exists = selected.find(s => s.sport_id === sportId);
    if(exists) setSelected(selected.filter(s => s.sport_id !== sportId));
    else setSelected([...selected, { sport_id: sportId, image: '' }]);
  };
  const updateImage = (sportId, imgUrl) => {
    setSelected(selected.map(s => s.sport_id === sportId ? {...s, image: imgUrl} : s));
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
         {sports.map(sport => {
           const isSelected = selected.find(s => s.sport_id === sport.id);
           return (
             <div key={sport.id} className="p-3 border rounded">
                <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
                  <input type="checkbox" checked={!!isSelected} onChange={() => toggleSelection(sport.id)} />
                  {sport.name}
                </label>
                {isSelected && (
                  <div>
                    <label className="block text-xs font-bold mb-1">Sport Image URL</label>
                    <input type="text" value={isSelected.image} onChange={e => updateImage(sport.id, e.target.value)} className="w-full border p-2 rounded text-sm"/>
                  </div>
                )}
             </div>
           );
         })}
      </div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 5. Featured Products
export function FeaturedProductsForm({ data, onChange, onSave, saving }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(data || []); // array of { product_id, isBestSeller, isNewArrival }
  
  useEffect(() => {
    supabase.from('products').select('id, name, price').limit(50).then(({data}) => setProducts(data || []));
  }, []);
  useEffect(() => { onChange(selected); }, [selected]);
  
  const addProduct = (prodId) => {
    if(selected.find(s => s.product_id === prodId)) return;
    setSelected([...selected, { product_id: prodId, isBestSeller: false, isNewArrival: false }]);
  };
  const removeProduct = (prodId) => setSelected(selected.filter(s => s.product_id !== prodId));
  const updateFlag = (prodId, field, val) => {
    setSelected(selected.map(s => s.product_id === prodId ? {...s, [field]: val} : s));
  };
  
  return (
    <div className="space-y-4">
      <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border p-2 rounded text-sm mb-2" />
      <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm space-y-1">
        {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
           <div key={p.id} className="flex justify-between items-center hover:bg-gray-50 p-1">
              <span>{p.name} (₹{p.price})</span>
              <button type="button" onClick={() => addProduct(p.id)} className="text-emerald-600 font-bold px-2 py-1 bg-emerald-50 rounded">Add</button>
           </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-bold text-sm">Selected Products</h3>
        {selected.map(s => {
          const p = products.find(prod => prod.id === s.product_id);
          return (
             <div key={s.product_id} className="p-2 border rounded bg-gray-50 flex flex-col gap-2">
                <div className="flex justify-between font-bold text-sm"><span>{p?.name || \`Product #\${s.product_id}\`}</span><button onClick={()=>removeProduct(s.product_id)} className="text-red-500"><X className="w-4 h-4"/></button></div>
                <div className="flex gap-4 text-xs">
                   <label className="flex items-center gap-1"><input type="checkbox" checked={s.isBestSeller} onChange={e=>updateFlag(s.product_id, 'isBestSeller', e.target.checked)}/> Best Seller</label>
                   <label className="flex items-center gap-1"><input type="checkbox" checked={s.isNewArrival} onChange={e=>updateFlag(s.product_id, 'isNewArrival', e.target.checked)}/> New Arrival</label>
                </div>
             </div>
          )
        })}
      </div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 6. Homepage Collections
export function HomepageCollectionsForm({ data, onChange, onSave, saving }) {
  const [info, setInfo] = useState(data || { title: '', description: '', bannerImage: '', buttonText: '', buttonLink: '' });
  useEffect(() => { onChange(info); }, [info]);

  return (
    <div className="space-y-3">
      <div><label className="block text-xs font-bold mb-1">Title</label><input type="text" value={info.title} onChange={e => setInfo({...info, title: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div><label className="block text-xs font-bold mb-1">Description</label><textarea value={info.description} onChange={e => setInfo({...info, description: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div><label className="block text-xs font-bold mb-1">Banner Image URL</label><input type="text" value={info.bannerImage} onChange={e => setInfo({...info, bannerImage: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="block text-xs font-bold mb-1">Button Text</label><input type="text" value={info.buttonText} onChange={e => setInfo({...info, buttonText: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
        <div><label className="block text-xs font-bold mb-1">Button Link</label><input type="text" value={info.buttonLink} onChange={e => setInfo({...info, buttonLink: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      </div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 7. Promotional Banner
export function PromotionalBannerForm({ data, onChange, onSave, saving }) {
  const [info, setInfo] = useState(data || { image: '', title: '', subtitle: '', buttonText: '', buttonLink: '' });
  useEffect(() => { onChange(info); }, [info]);

  return (
    <div className="space-y-3">
      <div><label className="block text-xs font-bold mb-1">Image URL</label><input type="text" value={info.image} onChange={e => setInfo({...info, image: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div><label className="block text-xs font-bold mb-1">Title</label><input type="text" value={info.title} onChange={e => setInfo({...info, title: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div><label className="block text-xs font-bold mb-1">Subtitle</label><input type="text" value={info.subtitle} onChange={e => setInfo({...info, subtitle: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="block text-xs font-bold mb-1">Button Text</label><input type="text" value={info.buttonText} onChange={e => setInfo({...info, buttonText: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
        <div><label className="block text-xs font-bold mb-1">Button Link</label><input type="text" value={info.buttonLink} onChange={e => setInfo({...info, buttonLink: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      </div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 8. Testimonials
export function TestimonialsForm({ data, onChange, onSave, saving }) {
  const [items, setItems] = useState(data || []);
  useEffect(() => { onChange(items); }, [items]);
  
  const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', photo: '', rating: 5, review: '' }]);
  const updateItem = (idx, f, v) => { const n = [...items]; n[idx][f] = v; setItems(n); };
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id} className="p-3 border rounded space-y-2 relative">
          <button onClick={()=>removeItem(idx)} className="absolute top-2 right-2 text-red-500"><Trash2 className="w-4 h-4"/></button>
          <div><label className="block text-xs font-bold mb-1">Name</label><input type="text" value={item.name} onChange={e=>updateItem(idx, 'name', e.target.value)} className="w-full border p-1 rounded text-sm"/></div>
          <div><label className="block text-xs font-bold mb-1">Photo URL</label><input type="text" value={item.photo} onChange={e=>updateItem(idx, 'photo', e.target.value)} className="w-full border p-1 rounded text-sm"/></div>
          <div><label className="block text-xs font-bold mb-1">Rating (1-5)</label><input type="number" min="1" max="5" value={item.rating} onChange={e=>updateItem(idx, 'rating', parseInt(e.target.value))} className="w-full border p-1 rounded text-sm"/></div>
          <div><label className="block text-xs font-bold mb-1">Review</label><textarea value={item.review} onChange={e=>updateItem(idx, 'review', e.target.value)} className="w-full border p-1 rounded text-sm"/></div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="flex items-center text-sm font-bold text-emerald-600"><Plus className="w-4 h-4 mr-1"/> Add Testimonial</button>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 9. Instagram Gallery
export function InstagramGalleryForm({ data, onChange, onSave, saving }) {
  const [items, setItems] = useState(data || []);
  useEffect(() => { onChange(items); }, [items]);
  
  const addItem = () => setItems([...items, { id: Date.now().toString(), image: '', link: '' }]);
  const updateItem = (idx, f, v) => { const n = [...items]; n[idx][f] = v; setItems(n); };
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id} className="p-3 border rounded space-y-2 relative">
          <button onClick={()=>removeItem(idx)} className="absolute top-2 right-2 text-red-500"><Trash2 className="w-4 h-4"/></button>
          <div><label className="block text-xs font-bold mb-1">Image URL</label><input type="text" value={item.image} onChange={e=>updateItem(idx, 'image', e.target.value)} className="w-full border p-1 rounded text-sm"/></div>
          <div><label className="block text-xs font-bold mb-1">Link URL</label><input type="text" value={item.link} onChange={e=>updateItem(idx, 'link', e.target.value)} className="w-full border p-1 rounded text-sm"/></div>
        </div>
      ))}
      <button type="button" onClick={addItem} className="flex items-center text-sm font-bold text-emerald-600"><Plus className="w-4 h-4 mr-1"/> Add Post</button>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 10. Footer Banner
export function FooterBannerForm({ data, onChange, onSave, saving }) {
  const [info, setInfo] = useState(data || { image: '', text: '', buttonText: '', buttonLink: '' });
  useEffect(() => { onChange(info); }, [info]);

  return (
    <div className="space-y-3">
      <div><label className="block text-xs font-bold mb-1">Image URL</label><input type="text" value={info.image} onChange={e => setInfo({...info, image: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div><label className="block text-xs font-bold mb-1">Text</label><input type="text" value={info.text} onChange={e => setInfo({...info, text: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="block text-xs font-bold mb-1">Button Text</label><input type="text" value={info.buttonText} onChange={e => setInfo({...info, buttonText: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
        <div><label className="block text-xs font-bold mb-1">Button Link</label><input type="text" value={info.buttonLink} onChange={e => setInfo({...info, buttonLink: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      </div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}

// 11. SEO
export function SEOForm({ data, onChange, onSave, saving }) {
  const [info, setInfo] = useState(data || { title: '', description: '', keywords: '' });
  useEffect(() => { onChange(info); }, [info]);

  return (
    <div className="space-y-3">
      <div><label className="block text-xs font-bold mb-1">Homepage Title</label><input type="text" value={info.title} onChange={e => setInfo({...info, title: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div><label className="block text-xs font-bold mb-1">Meta Description</label><textarea value={info.description} onChange={e => setInfo({...info, description: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div><label className="block text-xs font-bold mb-1">Keywords</label><input type="text" value={info.keywords} onChange={e => setInfo({...info, keywords: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
      <div className="pt-4"><button disabled={saving} onClick={onSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Settings'}</button></div>
    </div>
  );
}
`

fs.writeFileSync('src/components/admin/cms/CMSForms.tsx', cmsFormsContent);

const adminHomepageContent = `
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
  const [activeSection, setActiveSection] = useState(null);
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('homepage_settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') {
        // Only throw if it's not a "row not found" error
        console.error(error);
      }
      if (data && data.settings) {
        setSettings(data.settings);
      } else {
        // Fallback defaults
        setSettings({});
      }
    } catch (err) {
      console.error('Error fetching homepage settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (sectionId) => {
    setActiveSection(sectionId);
    setFormData(settings[sectionId]);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedSettings = { ...settings, [activeSection]: formData };
      setSettings(updatedSettings);

      const { data: existing, error: checkErr } = await supabase.from('homepage_settings').select('id').eq('id', 1).single();
      
      let saveError;
      if (existing) {
        const { error } = await supabase.from('homepage_settings').update({ settings: updatedSettings, updated_at: new Date().toISOString() }).eq('id', 1);
        saveError = error;
      } else {
        const { error } = await supabase.from('homepage_settings').insert([{ id: 1, settings: updatedSettings }]);
        saveError = error;
      }

      if (saveError) {
        if(saveError.code === 'PGRST205') {
            throw new Error("The 'homepage_settings' table does not exist in your Supabase database. Please create it with columns: id (int, pk), settings (jsonb), updated_at (timestamptz).");
        }
        throw saveError;
      }

      setToast({ type: 'success', message: 'Settings saved successfully' });
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setToast({ type: 'error', message: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const renderForm = () => {
    const props = { data: settings[activeSection], onChange: setFormData, onSave: handleSave, saving };
    switch (activeSection) {
      case 'hero_slider': return <CMS.HeroSliderForm {...props} />;
      case 'announcement_bar': return <CMS.AnnouncementBarForm {...props} />;
      case 'featured_categories': return <CMS.FeaturedCategoriesForm {...props} />;
      case 'shop_by_sport': return <CMS.ShopBySportForm {...props} />;
      case 'featured_products': return <CMS.FeaturedProductsForm {...props} />;
      case 'homepage_collections': return <CMS.HomepageCollectionsForm {...props} />;
      case 'promotional_banner': return <CMS.PromotionalBannerForm {...props} />;
      case 'testimonials': return <CMS.TestimonialsForm {...props} />;
      case 'instagram_gallery': return <CMS.InstagramGalleryForm {...props} />;
      case 'footer_banner': return <CMS.FooterBannerForm {...props} />;
      case 'seo': return <CMS.SEOForm {...props} />;
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
              <div className={\`w-12 h-12 rounded-xl \${section.bg} flex items-center justify-center\`}>
                <section.icon className={\`w-6 h-6 \${section.color}\`} />
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
        <div className={\`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 \${
          toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-red-500 text-white'
        }\`}>
          <span className="text-[14px] font-medium max-w-md">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
`

fs.writeFileSync('src/pages/admin/AdminHomepage.tsx', adminHomepageContent);

