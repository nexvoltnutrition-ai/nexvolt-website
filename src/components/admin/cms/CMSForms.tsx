
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Edit, Image as ImageIcon, Layout, Link, AlignLeft, X, Package, Dumbbell, MessageSquare, LayoutGrid, Plus, Trash2, GripVertical, GripHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

export const handleImageUpload = async (file: File) => {
  const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
  if (uploadError) throw uploadError;
  const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
  return publicUrl;
};

// --- Form Components ---

// 1. Hero Slider
export function HeroSliderForm() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data } = await supabase.from('hero_slides').select('*').order('sort_order', { ascending: true });
    if (data) {
      setSlides(data);
    }
    setLoading(false);
  };

  const handleUpload = async (file: File, idx: number, field: string) => {
    try {
      const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'png';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('homepage').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('homepage').getPublicUrl(fileName);
      console.log("Public URL:", publicUrl);
      
      setSlides(prev => {
        const newSlides = [...prev];
        newSlides[idx] = { ...newSlides[idx], [field]: publicUrl };
        console.log("Slide State:", newSlides[idx]);
        return newSlides;
      });
    } catch (err: any) {
      console.error("Upload failed", err);
      setMsg({ text: err.message || "Upload failed", type: "error" }); 
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    }
  };

  const addSlide = () => {
    setSlides([...slides, { 
      id: 'new_' + Date.now(), 
      desktop_image: '', 
      mobile_image: '', 
      headline: '', 
      sub_heading: '', 
      button_text: '', 
      button_link: '', 
      enabled: true,
      sort_order: slides.length
    }]);
  };

  const updateSlideLocal = (idx: number, field: string, val: any) => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[idx] = { ...newSlides[idx], [field]: val };
      return newSlides;
    });
  };

  const removeSlide = async (idx: number) => {
    const slide = slides[idx];
    if (!String(slide.id).startsWith('new_')) {
      await supabase.from('hero_slides').delete().eq('id', slide.id);
    }
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const payload = {
          desktop_image: slide.desktop_image || '',
          mobile_image: slide.mobile_image || '',
          headline: '',
          sub_heading: '',
          button_text: '',
          button_link: slide.button_link || '',
          enabled: slide.enabled !== undefined ? slide.enabled : true,
          sort_order: i
        };
        
        console.log("Saving slide...");
        console.log("Payload:", payload);
        
        if (!String(slide.id).startsWith('new_')) {
          console.log("Update payload...");
          const { error: updateError, data: updateData } = await supabase.from('hero_slides').update(payload).eq('id', slide.id).select();
          if (updateError) {
            console.error("Supabase error", updateError);
            throw new Error(updateError.message);
          }
          console.log("Update success", updateData);
        } else {
          console.log("Insert payload...");
          const { error: insertError, data: insertData } = await supabase.from('hero_slides').insert([payload]).select();
          if (insertError) {
            console.error("Supabase error", insertError);
            throw new Error(insertError.message);
          }
          console.log("Insert success", insertData);
        }
      }
      setMsg({ text: "Saved successfully!", type: "success" }); 
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
      await fetchSlides();
    } catch (err: any) {
      console.error("Supabase error", err);
      setMsg({ text: err.message || "Error saving", type: "error" }); 
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const newSlides = [...slides];
    const item = newSlides.splice(draggedIdx, 1)[0];
    newSlides.splice(targetIdx, 0, item);
    // Update sort orders
    newSlides.forEach((s, i) => s.sort_order = i);
    setSlides(newSlides);
    setDraggedIdx(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {slides.map((slide, idx) => (
        <div 
          key={slide.id} 
          className="p-4 border border-gray-200 rounded-lg relative bg-white"
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
        >
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2 cursor-grab text-gray-400 hover:text-black">
                <GripVertical className="w-5 h-5" />
                <span className="text-xs font-bold">Drag to reorder</span>
             </div>
             <button type="button" onClick={() => removeSlide(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold mb-1">Desktop Image</label>
                {slide.desktop_image && <img src={slide.desktop_image} alt="" className="h-16 mb-2 object-cover" />}
                <input type="file" accept="image/*" onChange={e => {
                   if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0], idx, 'desktop_image');
                }} className="w-full text-xs" />
             </div>
             <div>
                <label className="block text-xs font-bold mb-1">Mobile Image</label>
                {slide.mobile_image && <img src={slide.mobile_image} alt="" className="h-16 mb-2 object-cover" />}
                <input type="file" accept="image/*" onChange={e => {
                   if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0], idx, 'mobile_image');
                }} className="w-full text-xs" />
             </div>

             <div>
                <label className="block text-xs font-bold mb-1">Destination URL</label>
                <input type="text" value={slide.button_link || ''} onChange={e => updateSlideLocal(idx, 'button_link', e.target.value)} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={slide.enabled} onChange={e => updateSlideLocal(idx, 'enabled', e.target.checked)} />
                <label className="text-sm font-bold">Enabled</label>
             </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addSlide} className="flex items-center text-sm font-bold text-emerald-600"><Plus className="w-4 h-4 mr-1"/> Add Slide</button>
      {msg.text && <div className={`text-sm font-bold mt-2 ${msg.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{msg.text}</div>}
      <div className="pt-4"><button disabled={saving} onClick={handleSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">{saving ? 'Saving...' : 'Save Slider Directly'}</button></div>
    </div>
  );
}

// 2. Announcement Bar
export function AnnouncementBarForm() {
  const [info, setInfo] = useState<any>({ 
    enabled: true,
    text: '',
    link: '',
    open_new_tab: false,
    bg_color: '#f47c20',
    text_color: '#ffffff',
    font_size: '13px',
    font_weight: '500',
    height: '40',
    text_align: 'center',
    marquee: false,
    marquee_speed: 15,
    pause_on_hover: true,
    close_button: false,
    sticky: false
  });
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  
  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.from('announcement_bar').select('*').limit(1);
        if (data && data.length > 0) {
          setInfo(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSaveBar = async () => {
    setSavingState(true);
    setMsg({ text: "", type: "" });
    try {
      const payload = { ...info, updated_at: new Date().toISOString() };
      if (payload.id) {
        const { error } = await supabase.from('announcement_bar').update(payload).eq('id', payload.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('announcement_bar').insert(payload).select();
        if (error) throw error;
        if (data && data.length > 0) setInfo(data[0]);
      }
      setMsg({ text: "Saved successfully!", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err: any) {
      console.error(err);
      setMsg({ text: err.message || "Error saving", type: "error" });
    } finally {
      setSavingState(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 font-bold cursor-pointer">
          <input type="checkbox" checked={info.enabled} onChange={e => setInfo({...info, enabled: e.target.checked})} />
          Enabled
        </label>
        <label className="flex items-center gap-2 font-bold cursor-pointer">
          <input type="checkbox" checked={info.sticky} onChange={e => setInfo({...info, sticky: e.target.checked})} />
          Sticky Header
        </label>
        <label className="flex items-center gap-2 font-bold cursor-pointer">
          <input type="checkbox" checked={info.close_button} onChange={e => setInfo({...info, close_button: e.target.checked})} />
          Show Close Button
        </label>
      </div>
      
      <div>
        <label className="block text-xs font-bold mb-1">Announcement Text</label>
        <textarea value={info.text || ''} onChange={e => setInfo({...info, text: e.target.value})} className="w-full border p-2 rounded text-sm"/>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Link URL</label>
          <input type="text" value={info.link || ''} onChange={e => setInfo({...info, link: e.target.value})} className="w-full border p-2 rounded text-sm"/>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 font-bold cursor-pointer">
            <input type="checkbox" checked={info.open_new_tab} onChange={e => setInfo({...info, open_new_tab: e.target.checked})} />
            Open Link in New Tab
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Background Color</label>
          <input type="color" value={info.bg_color || '#f47c20'} onChange={e => setInfo({...info, bg_color: e.target.value})} className="w-full h-10 border rounded"/>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Text Color</label>
          <input type="color" value={info.text_color || '#ffffff'} onChange={e => setInfo({...info, text_color: e.target.value})} className="w-full h-10 border rounded"/>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Font Size</label>
          <input type="text" value={info.font_size || ''} onChange={e => setInfo({...info, font_size: e.target.value})} placeholder="e.g. 13px" className="w-full border p-2 rounded text-sm"/>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Font Weight</label>
          <select value={info.font_weight || '500'} onChange={e => setInfo({...info, font_weight: e.target.value})} className="w-full border p-2 rounded text-sm">
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Text Align</label>
          <select value={info.text_align || 'center'} onChange={e => setInfo({...info, text_align: e.target.value})} className="w-full border p-2 rounded text-sm">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      
      <div className="p-3 border rounded-lg bg-gray-50 space-y-3">
        <label className="flex items-center gap-2 font-bold cursor-pointer">
          <input type="checkbox" checked={info.marquee} onChange={e => setInfo({...info, marquee: e.target.checked})} />
          Enable Marquee (Scrolling Text)
        </label>
        {info.marquee && (
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold mb-1">Speed (seconds)</label>
                <input type="number" value={info.marquee_speed || 15} onChange={e => setInfo({...info, marquee_speed: parseInt(e.target.value)})} className="w-full border p-2 rounded text-sm"/>
             </div>
             <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input type="checkbox" checked={info.pause_on_hover} onChange={e => setInfo({...info, pause_on_hover: e.target.checked})} />
                  Pause on Hover
                </label>
             </div>
          </div>
        )}
      </div>

      
      {msg.text && <div className={`font-bold ${msg.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{msg.text}</div>}
      
      <div className="pt-4 border-t">
        <h3 className="text-xs font-bold mb-2">Live Preview</h3>
        <div 
          className={`w-full overflow-hidden flex items-center ${info.marquee ? 'whitespace-nowrap' : ''}`}
          style={{
            backgroundColor: info.bg_color || '#f47c20',
            color: info.text_color || '#ffffff',
            height: info.height ? `${info.height}px` : '40px',
            fontSize: info.font_size || '13px',
            fontWeight: info.font_weight || '500',
            textAlign: (info.text_align as any) || 'center'
          }}
        >
          <div className={`w-full flex items-center ${info.text_align === 'left' ? 'justify-start' : info.text_align === 'right' ? 'justify-end' : 'justify-center'}`}>
             {info.marquee ? (
                <div className="animate-marquee" style={{ animationDuration: `${info.marquee_speed || 15}s` }}>
                   <span className="pr-16">{info.text || 'Your announcement here'}</span>
                   <span className="pr-16">{info.text || 'Your announcement here'}</span>
                </div>
             ) : (
                <div className="px-10">{info.text || 'Your announcement here'}</div>
             )}
          </div>
        </div>
      </div>

      <div className="pt-4">

        <button disabled={savingState} onClick={handleSaveBar} className="bg-black text-white px-4 py-2 rounded-lg text-sm w-full font-bold">
          {savingState ? 'Saving...' : 'Save Announcement Bar'}
        </button>
      </div>
    </div>
  );
}
// 3. Featured Categories
export function FeaturedCategoriesForm({ data, onChange, onSave, saving }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>(data || []);
  
  useEffect(() => {
    supabase.from('categories').select('*').then(({data}) => setCategories(data || []));
  }, []);
  useEffect(() => { onChange(selected); }, [selected]);
  
  const toggleSelection = (catId: any) => {
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
export function ShopBySportForm({ data, onChange, onSave, saving }: any) {
  const [sports, setSports] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>(data || []); // array of { sport_id, image }
  
  useEffect(() => {
    supabase.from('sports').select('*').then(({data}) => setSports(data || []));
  }, []);
  useEffect(() => { onChange(selected); }, [selected]);
  
  const toggleSelection = (sportId: any) => {
    const exists = selected.find(s => s.sport_id === sportId);
    if(exists) setSelected(selected.filter(s => s.sport_id !== sportId));
    else setSelected([...selected, { sport_id: sportId, image: '' }]);
  };
  const updateImage = (sportId: any, imgUrl: string) => {
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
export function FeaturedProductsForm({ data, onChange, onSave, saving }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any[]>(data || []); // array of { product_id, isBestSeller, isNewArrival }
  
  useEffect(() => {
    supabase.from('products').select('id, name, price').limit(50).then(({data}) => setProducts(data || []));
  }, []);
  useEffect(() => { onChange(selected); }, [selected]);
  
  const addProduct = (prodId: any) => {
    if(selected.find(s => s.product_id === prodId)) return;
    setSelected([...selected, { product_id: prodId, isBestSeller: false, isNewArrival: false }]);
  };
  const removeProduct = (prodId: any) => setSelected(selected.filter(s => s.product_id !== prodId));
  const updateFlag = (prodId: any, field: string, val: any) => {
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
                <div className="flex justify-between font-bold text-sm"><span>{p?.name || `Product #${s.product_id}`}</span><button onClick={()=>removeProduct(s.product_id)} className="text-red-500"><X className="w-4 h-4"/></button></div>
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
export function HomepageCollectionsForm({ data, onChange, onSave, saving }: any) {
  const [info, setInfo] = useState<any>(data || { title: '', description: '', bannerImage: '', buttonText: '', buttonLink: '' });
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
export function PromotionalBannerForm({ data, onChange, onSave, saving }: any) {
  const [info, setInfo] = useState<any>(data || { image: '', title: '', subtitle: '', buttonText: '', buttonLink: '' });
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
export function TestimonialsForm({ data, onChange, onSave, saving }: any) {
  const [items, setItems] = useState<any[]>(data || []);
  useEffect(() => { onChange(items); }, [items]);
  
  const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', photo: '', rating: 5, review: '' }]);
  const updateItem = (idx: number, f: string, v: any) => { const n = [...items]; n[idx][f] = v; setItems(n); };
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

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
export function InstagramGalleryForm({ data, onChange, onSave, saving }: any) {
  const [items, setItems] = useState<any[]>(data || []);
  useEffect(() => { onChange(items); }, [items]);
  
  const addItem = () => setItems([...items, { id: Date.now().toString(), image: '', link: '' }]);
  const updateItem = (idx: number, f: string, v: any) => { const n = [...items]; n[idx][f] = v; setItems(n); };
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

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
export function FooterBannerForm({ data, onChange, onSave, saving }: any) {
  const [info, setInfo] = useState<any>(data || { image: '', text: '', buttonText: '', buttonLink: '' });
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
export function SEOForm({ data, onChange, onSave, saving }: any) {
  const [info, setInfo] = useState<any>(data || { title: '', description: '', keywords: '' });
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
