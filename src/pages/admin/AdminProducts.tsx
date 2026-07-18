import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, Edit, Trash2, Package, X, Image as ImageIcon, LayoutList, Network, Layers, FileText, Upload, GripVertical, Copy, Eye, Search as SearchIcon, Target, CheckCircle, Heart, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";
import { useProducts } from "../../context/ProductContext";

type TabType = 'basic' | 'media' | 'variants' | 'sports' | 'content' | 'seo';




export function AdminProducts() {
  const { refreshProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [analytics, setAnalytics] = useState<any[]>([
    { title: "Total Products", value: "0", color: "text-[#111111]" },
    { title: "Active Inventory", value: "0", color: "text-emerald-500" },
    { title: "Low Stock", value: "0", color: "text-rose-500" },
    { title: "Avg. Price", value: "₹0", color: "text-blue-500" },
    { title: "Top Category", value: "-", color: "text-purple-500" },
  ]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Dynamic mapping options
  const [mappingOptions, setMappingOptions] = useState({
    categories: [] as any[],
    secondaryCategories: [] as any[],
    sports: [] as any[],
    athletics: [] as any[],
    goals: [] as any[],
    benefits: [] as any[],
    trainingLevels: [] as any[],
    ageGroups: [] as any[],
    genders: [] as any[], aiTags: [] as any[]
  });

  const [sportSearchQuery, setSportSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchMappingOptions();
    
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'products' }, (payload) => {
        fetchProducts(); // Refresh products on change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMappingOptions = async () => {
    try {
      const safeFetch = async (table: string) => {
        const { data, error } = await supabase.from(table).select('id, name').limit(100);
        if (error) return [];
        return data || [];
      };

      const [
        categories, sports, athleteTypes, goals, aiTags
      ] = await Promise.all([
        safeFetch('categories'),
        safeFetch('sports'),
        safeFetch('athlete_types'),
        safeFetch('goals'),
        safeFetch('ai_tags')
      ]);

      setMappingOptions({
        categories,
        secondaryCategories: [], // Unused now
        sports,
        athletics: athleteTypes,
        goals,
        benefits: [], // Unused now
        trainingLevels: [], // Unused
        ageGroups: [], // Unused
        genders: [], // Unused
        aiTags // Added aiTags instead
      });
    } catch (e) {
      console.warn("Failed to fetch mapping options:", e);
    }
  };

  const fetchProducts = async () => {
    setFetchError(null);
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (data) {
        const mappedData = data.map(p => ({
          ...p,
          inStock: p.active !== undefined ? p.active : (p.stock > 0),
          image: p.image1 || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800",
          sport: p.sport || "",
          sports: [p.sport].filter(Boolean),
          category: p.category || "Nutrition"
        }));
        setProducts(mappedData);

        // Compute analytics
        const total = mappedData.length;
        const active = mappedData.filter(p => p.inStock).length;
        const lowStock = mappedData.filter(p => p.stock > 0 && p.stock <= 5).length;
        const avgPrice = total > 0 ? (mappedData.reduce((acc, p) => acc + (p.price || 0), 0) / total).toFixed(2) : "0.00";
        
        const categoriesCount = mappedData.reduce((acc, p) => {
           acc[p.category] = (acc[p.category] || 0) + 1;
           return acc;
        }, {} as Record<string, number>);
        const topCategory = Object.keys(categoriesCount).sort((a,b) => categoriesCount[b] - categoriesCount[a])[0] || "-";

        setAnalytics([
          { title: "Total Products", value: total.toString(), color: "text-[#111111]" },
          { title: "Active Inventory", value: active.toString(), color: "text-emerald-500" },
          { title: "Low Stock", value: lowStock.toString(), color: "text-rose-500" },
          { title: "Avg. Price", value: `₹${avgPrice}`, color: "text-blue-500" },
          { title: "Top Category", value: topCategory, color: "text-purple-500" },
        ]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setFetchError('Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [draggedImgKey, setDraggedImgKey] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedImgKey(key);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedImgKey || draggedImgKey === targetKey) return;
    
    setFormData(prev => ({
      ...prev,
      [draggedImgKey]: prev[targetKey as keyof typeof prev],
      [targetKey]: prev[draggedImgKey as keyof typeof prev]
    }));
    setDraggedImgKey(null);
  };

  const handleImageUpload = async (file: File, key: string) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, [key]: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please ensure the "products" bucket exists and is public.');
    } finally {
      setUploadingImage(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    image6: "",
    flavor: "",
    weight: "",
    sku: "",
    stock: "10",
    price: "",
    salePrice: "",
    discount: "",
    sports: "",
    athleteCategories: "",
    goals: "",
    whyUseThis: "",
    benefits: "",
    sciText: "",
    recoveryBenefits: "",
    metaTitle: "",
    metaDescription: "",
    tags: "",
    inStock: true, featured: false, bestSeller: false,
    mappedCategories: [] as string[],
    secondaryCategory: "",
    mappedSports: [] as string[],
    mappedAthletics: [] as string[],
    mappedGoals: [] as string[],
    mappedBenefits: [] as string[],
    mappedTrainingLevels: [] as string[],
    mappedAgeGroups: [] as string[],
    mappedGenders: [] as string[],
    mappedAiTags: [] as string[]
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "All Categories" || product.category === categoryFilter;
    
    // Check sports arrays
    const productSports = product.sports || [product.sport];
    const matchesSport = sportFilter === "All Sports" || productSports.includes(sportFilter);
    
    const matchesStock = stockFilter === "All Stock" || 
                         (stockFilter === "In Stock" && product.stock > 0) || 
                         (stockFilter === "Out of Stock" && product.stock <= 0);

    const matchesStatus = statusFilter === "All Status" || 
                          (statusFilter === "Active" && product.inStock) || 
                          (statusFilter === "Inactive" && !product.inStock);

    return matchesSearch && matchesCategory && matchesSport && matchesStock && matchesStatus;
  });

  const handleOpenDrawer = async (product: any = null) => {
    setActiveTab('basic');
    if (product) {
      setEditingProduct(product);
      setFormData(prev => ({
        ...prev,
        name: product.name || "",
        slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        shortDescription: product.description || "",
        fullDescription: product.sciText || "",
        image1: product.image1 || "",
        image2: product.image2 || "",
        image3: product.image3 || "",
        image4: product.image4 || "",
        image5: product.image5 || "",
        image6: product.image6 || "",
        flavor: product.flavor || "",
        weight: "",
        sku: `NV-${product.id}`,
        stock: "10",
        price: product.price?.toString() || "",
        salePrice: "",
        discount: "",
        sports: product.sports?.join(", ") || product.sport || "",
        athleteCategories: "",
        goals: product.goal || "",
        whyUseThis: product.howToUse || "",
        benefits: product.features?.join("\n") || "",
        sciText: product.sciText || "",
        recoveryBenefits: "",
        metaTitle: product.name,
        metaDescription: product.description || "",
        tags: product.features?.join(", ") || "",
        inStock: product.inStock ?? true,
        featured: product.featured || false,
        bestSeller: product.best_seller || false
      }));

      // Fetch mappings safely
      const safeGetIds = async (table: string, col: string) => {
        try {
          const { data, error } = await supabase.from(table).select(col).eq('product_id', product.id);
          if (error) return [];
          return data.map((d: any) => d[col]?.toString()) || [];
        } catch { return []; }
      };

      const [mCats, mAthletics, mGoals, mAiTags] = await Promise.all([
        safeGetIds('category_product_mapping', 'category_id'),
        safeGetIds('product_athlete_types', 'athlete_type_id'),
        safeGetIds('product_goals', 'goal_id'),
        safeGetIds('product_ai_tags', 'ai_tag_id')
      ]);

      const mSports = await (async () => {
        try {
          const { data, error } = await supabase.from('sport_product_mapping').select('sport_name').eq('product_id', product.id);
          if (error) return [];
          return data.map((d: any) => {
            const sp = mappingOptions.sports.find(s => s.name === d.sport_name);
            return sp ? sp.id.toString() : d.sport_name;
          });
        } catch { return []; }
      })();

      setFormData(prev => ({
        ...prev,
        mappedCategories: mCats,
        secondaryCategory: "",
        mappedSports: mSports,
        mappedAthletics: mAthletics,
        mappedGoals: mGoals,
        mappedBenefits: [],
        mappedTrainingLevels: [],
        mappedAgeGroups: [],
        mappedGenders: [],
        mappedAiTags: mAiTags || []
      }));

    } else {
      setEditingProduct(null);
      setFormData({
         name: "", slug: "", shortDescription: "", fullDescription: "", image1: "", image2: "", image3: "", image4: "", image5: "", image6: "", flavor: "", weight: "", sku: "", stock: "0", price: "", salePrice: "", discount: "", sports: "", athleteCategories: "", goals: "", whyUseThis: "", benefits: "", sciText: "", recoveryBenefits: "", metaTitle: "", metaDescription: "", tags: "", inStock: true, featured: false, bestSeller: false, mappedCategories: [], secondaryCategory: "", mappedSports: [], mappedAthletics: [], mappedGoals: [], mappedBenefits: [], mappedTrainingLevels: [], mappedAgeGroups: [], mappedGenders: [], mappedAiTags: []
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadingImage) {
      alert("Please wait for images to finish uploading.");
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.fullDescription || "",
      short_description: formData.shortDescription || "",
      price: parseFloat(formData.price) || 0,
      sale_price: parseFloat(formData.salePrice) || null,
      stock: parseInt(formData.stock) || (formData.inStock ? 10 : 0),
      category: formData.mappedCategories.length > 0 ? (mappingOptions.categories.find(c => c.id.toString() === formData.mappedCategories[0])?.name || "Nutrition") : "Nutrition",
      sport: formData.mappedSports.length > 0 ? (mappingOptions.sports.find(s => s.id.toString() === formData.mappedSports[0] || s.name === formData.mappedSports[0])?.name || "General") : "General",
      image1: formData.image1,
      image2: formData.image2,
      image3: formData.image3,
      image4: formData.image4,
      image5: formData.image5,
      image6: formData.image6,
      sku: formData.sku || "",
      active: formData.inStock,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      featured: formData.featured,
      best_seller: formData.bestSeller
    };

    try {
      let savedProductId = null;
      if (editingProduct) {
        const { data, error } = await supabase.from('products').update(productData).eq('id', editingProduct.id).select();
        if (error) throw error;
        savedProductId = editingProduct.id;
      } else {
        const { data, error } = await supabase.from('products').insert([productData]).select();
        if (error) throw error;
        if (data && data[0]) {
           savedProductId = data[0].id;
        }
      }
      
      // Handle mappings to dedicated tables
      if (savedProductId) {
         const saveMappingSafe = async (table: string, col: string, ids: string[]) => {
           try {
             // Delete existing bindings
             await supabase.from(table).delete().eq('product_id', savedProductId);
             if (ids.length > 0) {
               const insertData = ids.map(id => ({
                 product_id: savedProductId,
                 [col]: id
               }));
               await supabase.from(table).insert(insertData);
             }
           } catch {
             // Silence errors if table doesn't exist
           }
         };

         await Promise.all([
           saveMappingSafe('category_product_mapping', 'category_id', formData.mappedCategories),
           saveMappingSafe('product_athlete_types', 'athlete_type_id', formData.mappedAthletics),
           saveMappingSafe('product_goals', 'goal_id', formData.mappedGoals),
           saveMappingSafe('product_ai_tags', 'ai_tag_id', formData.mappedAiTags)
         ]);

         try {
           await supabase.from('sport_product_mapping').delete().eq('product_id', savedProductId);
           if (formData.mappedSports.length > 0) {
             const insertSports = formData.mappedSports.map(id => {
               const s = mappingOptions.sports.find(sp => sp.id.toString() === id || sp.name === id);
               return { product_id: savedProductId, sport_name: s ? s.name : id };
             });
             console.log("Selected sports:", formData.mappedSports); console.log("Inserting sport mappings:", insertSports);
             await supabase.from('sport_product_mapping').insert(insertSports);
           }
         } catch (e) {
           console.error("Error saving sport mappings:", e);
         }
      }

      fetchProducts();
      refreshProducts();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== productToDelete.id));
      refreshProducts();
      showToast("Product deleted successfully", "success");
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast("Failed to delete product", "error");
    }
  };

  const handleDuplicate = async (product: any) => {
    try {
      const duplicateData = {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: product.price,
        sale_price: product.sale_price,
        stock: product.stock,
        category: product.category,
        sport: product.sport,
        image1: product.image1,
        image2: product.image2,
        image3: product.image3,
        image4: product.image4,
        image5: product.image5,
        image6: product.image6,
      };
      const { error } = await supabase.from('products').insert([duplicateData]);
      if (error) throw error;
      fetchProducts();
      refreshProducts();
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Failed to duplicate product');
    }
  }

  const tabs: { id: TabType, label: string, icon: React.ElementType }[] = [
    { id: 'basic', label: 'Basic Info', icon: LayoutList },
    { id: 'media', label: 'Images', icon: ImageIcon },
    { id: 'variants', label: 'Variants', icon: Layers },
    { id: 'sports', label: 'Product Mapping', icon: Network },
    { id: 'content', label: 'Content Info', icon: FileText },
    { id: 'seo', label: 'SEO', icon: SearchIcon },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">Products & Inventory</h1>
          <p className="text-[15px] text-[#666666] mt-1">Manage catalog, variants, sport mappings, and view inventory analytics.</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer()} 
          className="flex items-center px-4 py-2.5 bg-[#111111] hover:bg-black text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {analytics.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col justify-center">
            <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.title}</p>
            <p className={`text-[24px] font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#eaeaea] shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f8f9fa] border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-[#111111]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] text-[#666666] focus:outline-none"
          >
            <option value="All Categories">All Categories</option>
            {mappingOptions.categories.map(c => (
               <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          
          <select 
            value={sportFilter} 
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] text-[#666666] focus:outline-none"
          >
            <option value="All Sports">All Sports</option>
            {mappingOptions.sports.map(s => (
               <option key={s.id} value={s.name}>{s.name}</option>
            ))}
            <option value="General">General</option>
          </select>

          <select 
            value={stockFilter} 
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] text-[#666666] focus:outline-none"
          >
            <option value="All Stock">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[#eaeaea] bg-white rounded-lg text-[13px] text-[#666666] focus:outline-none"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             {/* ... */}
            <thead className="bg-[#f8f9fa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">SKU / Stock</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Sports Mapping</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#888888] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                <tr key={product.id} className="hover:bg-[#f8f9fa] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-[#f8f8f8] rounded-md overflow-hidden border border-[#eaeaea]">
                        <img className="h-full w-full object-contain mix-blend-multiply p-1" src={product.image} alt={product.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-[14px] font-medium text-[#111111] leading-tight mb-1">{product.name}</div>
                        <div className="text-[12px] text-[#888888]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)} {product.sale_price ? <span className="line-through ml-1 text-gray-400">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.sale_price)}</span> : null}</div>
                        <div className="flex gap-1 mt-1">
                          {product.featured && <span className="inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded font-medium">Featured</span>}
                          {product.best_seller && <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-medium">Best Seller</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[13px] font-mono text-[#555555]">{product.sku || 'N/A'}</div>
                    <div className={`text-[12px] font-medium mt-0.5 ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {product.stock} in stock
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[14px] text-[#555555]">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {product.sports?.map((sport: string, idx: number) => (
                        <span key={idx} className="inline-flex px-1.5 py-0.5 bg-[#f0f0f0] text-[#555555] text-[10px] font-medium rounded-sm border border-[#e0e0e0]">
                          {sport}
                        </span>
                      )) || (
                        <span className="inline-flex px-1.5 py-0.5 bg-[#f0f0f0] text-[#555555] text-[10px] font-medium rounded-sm border border-[#e0e0e0]">
                          {product.sport}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${product.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[13px] font-medium text-[#111111]">{product.inStock ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[13px] text-[#555555]">{new Date(product.created_at || Date.now()).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => window.open(`/product/${product.id}`, '_blank')} className="p-1.5 text-[#666666] hover:text-[#111111] bg-white hover:bg-gray-100 border border-[#eaeaea] rounded transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleDuplicate(product)} className="p-1.5 text-[#666666] hover:text-[#111111] bg-white hover:bg-gray-100 border border-[#eaeaea] rounded transition-colors"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenDrawer(product)} className="p-1.5 text-[#666666] hover:text-blue-600 bg-white hover:bg-blue-50 border border-[#eaeaea] rounded transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setProductToDelete(product)} className="p-1.5 text-[#666666] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#eaeaea] rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {fetchError ? (
            <div className="text-center py-12 text-rose-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-[16px] font-medium mb-1">{fetchError}</h3>
              <button onClick={fetchProducts} className="mt-4 px-4 py-2 bg-[#111111] text-white rounded-lg text-sm">Try Again</button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-[16px] font-medium text-[#111111] mb-1">Loading products...</h3>
            </div>
          ) : filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-[#dddddd] mx-auto mb-4" />
              <h3 className="text-[16px] font-medium text-[#111111] mb-1">No products found</h3>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && filteredProducts.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-[#eaeaea] bg-white flex items-center justify-between">
            <div className="text-[13px] text-[#666666]">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium text-[#666666] hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-[13px] font-medium ${currentPage === i + 1 ? 'bg-[#111111] text-white border-[#111111]' : 'border-[#eaeaea] text-[#666666] hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                className="px-3 py-1 border border-[#eaeaea] rounded text-[13px] font-medium text-[#666666] hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-[#eaeaea]"
            >
              <div className="px-6 py-4 border-b border-[#eaeaea] flex items-center justify-between col-span-full bg-white relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#888888] hover:text-[#111111] transition-colors p-2 rounded-md"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex border-b border-[#eaeaea] px-6 overflow-x-auto no-scrollbar bg-[#f8f9fa]">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-[13px] font-medium ${activeTab === tab.id ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#666666] hover:text-[#111111]'}`}>
                    <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc]">
                <form id="product-form" onSubmit={handleSave} className="space-y-6">
                  {/* BASIC TAB */}
                  {activeTab === 'basic' && (
                    <div className="space-y-5">
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Product Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" required /></div>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Slug</label><input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] font-mono text-[#666666]" /></div>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Short Description</label><textarea value={formData.shortDescription} onChange={(e) => setFormData({...formData, shortDescription: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                      <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Full Description</label><textarea value={formData.fullDescription} onChange={(e) => setFormData({...formData, fullDescription: e.target.value})} rows={6} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                    </div>
                  )}

                  {/* MEDIA TAB */}
                  {activeTab === 'media' && (
                    <div className="space-y-5">
                       <div 
                         draggable
                         onDragStart={(e) => handleDragStart(e, 'image1')}
                         onDragOver={handleDragOver}
                         onDrop={(e) => handleDrop(e, 'image1')}
                       >
                         <label className="block text-[13px] font-bold text-[#111111] mb-1.5 cursor-grab">Main Image Upload (Drag to reorder)</label>
                         <div className="flex gap-4 items-center relative">
                           {formData.image1 && (
                             <div className="relative group">
                               <img src={formData.image1} alt="Main" className="w-16 h-16 object-cover rounded-md border" />
                               <button 
                                 type="button" 
                                 onClick={() => setFormData({...formData, image1: ''})}
                                 className="absolute -top-2 -right-2 bg-white rounded-full shadow-md border hover:bg-rose-50 text-rose-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                             </div>
                           )}
                           <div className="flex-1">
                             <input type="text" value={formData.image1} onChange={(e) => setFormData({...formData, image1: e.target.value})} placeholder="URL" className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] mb-3" />
                             <input type="file" accept="image/*" disabled={uploadingImage} onChange={(e) => { if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], 'image1'); }} className="text-[14px]" />
                           </div>
                         </div>
                       </div>
                       
                       <div className="pt-2">
                         <label className="block text-[13px] font-bold text-[#111111] mb-1.5">Gallery Uploads (Drag to reorder)</label>
                         <div className="grid grid-cols-1 gap-4">
                           {['image2', 'image3', 'image4', 'image5', 'image6'].map((imgKey) => (
                             <div 
                               key={imgKey} 
                               draggable
                               onDragStart={(e) => handleDragStart(e, imgKey)}
                               onDragOver={handleDragOver}
                               onDrop={(e) => handleDrop(e, imgKey)}
                               className="flex gap-4 items-center border p-3 rounded-lg bg-[#f8f9fa] cursor-grab"
                             >
                               {formData[imgKey as keyof typeof formData] && typeof formData[imgKey as keyof typeof formData] === 'string' && formData[imgKey as keyof typeof formData] !== '' && (
                                 <div className="relative group">
                                   <img src={formData[imgKey as keyof typeof formData] as string} alt={imgKey} className="w-12 h-12 object-cover rounded-md border pointer-events-none" />
                                   <button 
                                     type="button" 
                                     onClick={() => setFormData({...formData, [imgKey]: ''})}
                                     className="absolute -top-2 -right-2 bg-white rounded-full shadow-md border hover:bg-rose-50 text-rose-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                     <X className="w-3 h-3" />
                                   </button>
                                 </div>
                               )}
                               <div className="flex-1">
                                 <input type="text" value={formData[imgKey as keyof typeof formData] as string} onChange={(e) => setFormData({...formData, [imgKey]: e.target.value})} placeholder={`${imgKey} URL`} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] mb-2" />
                                 <input type="file" accept="image/*" disabled={uploadingImage} onChange={(e) => { if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0], imgKey); }} className="text-[14px]" />
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  )}

                  {/* VARIANTS TAB */}
                  {activeTab === 'variants' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Flavor</label><input type="text" value={formData.flavor} onChange={(e) => setFormData({...formData, flavor: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                        <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Weight / Size</label><input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                        <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">SKU</label><input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] font-mono" /></div>
                        <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Stock</label><input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                        <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">MRP (₹)</label><input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                        <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Sale Price (₹)</label><input type="number" step="0.01" value={formData.salePrice} onChange={(e) => setFormData({...formData, salePrice: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                        <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Discount %</label><input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                      </div>
                      <div>
                        <div className="flex space-x-6">
                          <label className="flex items-center space-x-2">
                             <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} className="rounded border-gray-300" />
                             <span className="text-[14px] font-medium text-[#111111]">Active / In Stock</span>
                          </label>
                          <label className="flex items-center space-x-2">
                             <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="rounded border-gray-300" />
                             <span className="text-[14px] font-medium text-[#111111]">Featured</span>
                          </label>
                          <label className="flex items-center space-x-2">
                             <input type="checkbox" checked={formData.bestSeller} onChange={(e) => setFormData({...formData, bestSeller: e.target.checked})} className="rounded border-gray-300" />
                             <span className="text-[14px] font-medium text-[#111111]">Best Seller</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MAPPING TAB */}
                  {activeTab === 'sports' && (
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        
                        {/* CATEGORY MAPPING */}
                        <details className="group bg-white border border-[#eaeaea] rounded-xl overflow-hidden" open>
                          <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-[#f8f9fa] hover:bg-[#f1f3f5] transition-colors">
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-[#666666]" />
                              <h3 className="text-[14px] font-bold text-[#111111]">Category Mapping</h3>
                            </div>
                            <ChevronDown className="w-5 h-5 text-[#888888] transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="p-5 border-t border-[#eaeaea] space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[13px] font-bold text-[#111111] mb-2">Primary Category</label>
                                <select 
                                  value={formData.mappedCategories[0] || ""} 
                                  onChange={(e) => setFormData(prev => ({...prev, mappedCategories: [e.target.value]}))}
                                  className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] bg-white outline-none focus:ring-2 focus:ring-black"
                                >
                                  <option value="">Select Primary</option>
                                  {mappingOptions.categories.map(c => (
                                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[13px] font-bold text-[#111111] mb-2">Secondary Category</label>
                                <select 
                                  value={formData.secondaryCategory} 
                                  onChange={(e) => setFormData(prev => ({...prev, secondaryCategory: e.target.value}))}
                                  className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] bg-white outline-none focus:ring-2 focus:ring-black"
                                >
                                  <option value="">Select Secondary</option>
                                  {mappingOptions.secondaryCategories.map(c => (
                                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </details>

                        {/* SPORTS MAPPING */}
                        <details className="group bg-white border border-[#eaeaea] rounded-xl overflow-hidden" open>
                          <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-[#f8f9fa] hover:bg-[#f1f3f5] transition-colors">
                            <div className="flex items-center gap-3">
                              <Network className="w-5 h-5 text-[#666666]" />
                              <h3 className="text-[14px] font-bold text-[#111111]">Sports Mapping</h3>
                            </div>
                            <ChevronDown className="w-5 h-5 text-[#888888] transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="p-5 border-t border-[#eaeaea] space-y-4">
                            <div className="relative">
                              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                              <input 
                                type="text"
                                placeholder="Search sports..."
                                value={sportSearchQuery}
                                onChange={(e) => setSportSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-[#eaeaea] rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-black"
                              />
                            </div>
                            
                            {formData.mappedSports.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {formData.mappedSports.map(id => {
                                  const s = mappingOptions.sports.find(sp => sp.id.toString() === id || sp.name === id);
                                  return s ? (
                                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111111] text-white text-[12px] font-medium rounded-full">
                                      {s.name}
                                      <button type="button" onClick={() => setFormData(prev => ({...prev, mappedSports: prev.mappedSports.filter(sId => sId !== id)}))} className="hover:text-rose-400">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                              {mappingOptions.sports.filter(s => s.name.toLowerCase().includes(sportSearchQuery.toLowerCase()) && !formData.mappedSports.includes(s.id.toString()) && !formData.mappedSports.includes(s.name)).map(s => (
                                <button type="button" key={s.id} onClick={() => setFormData(prev => ({...prev, mappedSports: [...prev.mappedSports, s.id.toString()]}))} className="px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] font-medium transition-colors text-left bg-white text-[#555555] hover:border-gray-300">
                                  {s.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </details>

                        {/* ATHLETICS MAPPING */}
                        {formData.mappedSports.some(s => s.toLowerCase() === 'athletics') && (
                          <details className="group bg-white border border-[#eaeaea] rounded-xl overflow-hidden" open>
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-[#f8f9fa] hover:bg-[#f1f3f5] transition-colors">
                              <div className="flex items-center gap-3">
                                <Target className="w-5 h-5 text-[#666666]" />
                                <h3 className="text-[14px] font-bold text-[#111111]">Athletics Specialization</h3>
                              </div>
                              <ChevronDown className="w-5 h-5 text-[#888888] transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="p-5 border-t border-[#eaeaea]">
                              <div className="flex flex-wrap gap-4">
                                {mappingOptions.athletics.map(a => {
                                  const isSelected = formData.mappedAthletics.includes(a.id.toString());
                                  return (
                                    <label key={a.id} className="flex items-center gap-2 cursor-pointer group/label">
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#111111] border-[#111111]' : 'border-[#cccccc] group-hover/label:border-[#888888]'}`}>
                                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                      </div>
                                      <span className="text-[14px] text-[#333333] font-medium">{a.name}</span>
                                      <input 
                                        type="checkbox"
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() => setFormData(prev => ({...prev, mappedAthletics: isSelected ? prev.mappedAthletics.filter(id => id !== a.id.toString()) : [...prev.mappedAthletics, a.id.toString()]}))}
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </details>
                        )}

                        {/* GOALS MAPPING */}
                        <details className="group bg-white border border-[#eaeaea] rounded-xl overflow-hidden" open>
                          <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-[#f8f9fa] hover:bg-[#f1f3f5] transition-colors">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-[#666666]" />
                              <h3 className="text-[14px] font-bold text-[#111111]">Performance Goals</h3>
                            </div>
                            <ChevronDown className="w-5 h-5 text-[#888888] transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="p-5 border-t border-[#eaeaea]">
                            <div className="flex flex-wrap gap-2">
                              {mappingOptions.goals.map(g => {
                                const isSelected = formData.mappedGoals.includes(g.id.toString());
                                return (
                                  <button type="button" key={g.id} onClick={() => setFormData(prev => ({...prev, mappedGoals: isSelected ? prev.mappedGoals.filter(id => id !== g.id.toString()) : [...prev.mappedGoals, g.id.toString()]}))} className={`px-4 py-1.5 rounded-full border text-[12px] font-medium transition-colors flex items-center gap-1.5 ${isSelected ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#eaeaea] bg-white text-[#666666] hover:bg-gray-50'}`}>
                                    {isSelected && <CheckCircle className="w-3 h-3" />}
                                    {g.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </details>

                        {/* NEXAI RECOMMENDATION TAGS */}
                        <details className="group bg-white border border-[#eaeaea] rounded-xl overflow-hidden" open>
                          <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-[#f8f9fa] hover:bg-[#f1f3f5] transition-colors">
                            <div className="flex items-center gap-3">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                              <h3 className="text-[14px] font-bold text-[#111111]">NEXAI Recommendation Tags</h3>
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-purple-100 text-purple-700">AI Logic</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-[#888888] transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="p-5 border-t border-[#eaeaea] space-y-6">
                            
                            <div>
                              <div className="flex flex-wrap gap-4">
                                {mappingOptions.aiTags.map((tag: any) => {
                                  const isSelected = formData.mappedAiTags.includes(tag.id.toString());
                                  return (
                                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer group/label">
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-[#cccccc] group-hover/label:border-[#888888]'}`}>
                                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                      </div>
                                      <span className="text-[14px] text-[#333333] font-medium">{tag.name}</span>
                                      <input 
                                        type="checkbox"
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() => setFormData(prev => ({...prev, mappedAiTags: isSelected ? prev.mappedAiTags.filter(id => id !== tag.id.toString()) : [...prev.mappedAiTags, tag.id.toString()]}))}
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </details>

                      </div>

                      {/* SUMMARY CARD */}
                      <div className="lg:w-1/3">
                        <div className="bg-[#f8f9fa] border border-[#eaeaea] rounded-xl p-5 sticky top-6">
                          <h3 className="text-[14px] font-bold text-[#111111] mb-5 flex items-center gap-2 pb-3 border-b border-[#eaeaea]">
                            <Layers className="w-4 h-4 text-[#888888]" />
                            Mapping Summary
                          </h3>
                          <ul className="space-y-4 text-[13px] text-[#555555]">
                            <li>
                              <strong className="block text-[#111111] mb-1.5 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-[#888888]"/> Category</strong>
                              <span className="text-[#333333] pl-5 block">
                                {(mappingOptions.categories.find(c => c.id.toString() === formData.mappedCategories[0])?.name) || 'None'}
                              </span>
                            </li>
                            <li>
                              <strong className="block text-[#111111] mb-1.5 flex items-center gap-1.5"><Network className="w-3.5 h-3.5 text-[#888888]"/> Sports</strong>
                              <div className="flex flex-wrap gap-1 pl-5">
                                {formData.mappedSports.length > 0 ? formData.mappedSports.map(id => {
                                  const sport = mappingOptions.sports.find(s => s.id.toString() === id || s.name === id);
                                  return sport ? <span key={id} className="px-1.5 py-0.5 bg-white border border-[#eaeaea] rounded text-[11px] font-medium text-[#333333]">{sport.name}</span> : null;
                                }) : 'None'}
                              </div>
                            </li>
                            {formData.mappedSports.some(id => {
                              const s = mappingOptions.sports.find(sp => sp.id.toString() === id || sp.name === id);
                              return s?.name.toLowerCase() === 'athletics';
                            }) && formData.mappedAthletics.length > 0 && (
                              <li>
                                <strong className="block text-[#111111] mb-1.5 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-[#888888]"/> Athletics</strong>
                                <span className="text-[#333333] pl-5 block">{formData.mappedAthletics.map(id => mappingOptions.athletics.find((a: any) => a.id.toString() === id)?.name).filter(Boolean).join(', ')}</span>
                              </li>
                            )}
                            <li>
                              <strong className="block text-[#111111] mb-1.5 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#888888]"/> Goals</strong>
                              <span className="text-[#333333] pl-5 block">
                                {formData.mappedGoals.length > 0 ? formData.mappedGoals.map(id => mappingOptions.goals.find((g: any) => g.id.toString() === id)?.name).filter(Boolean).join(', ') : 'None'}
                              </span>
                            </li>
                            <li>
                              <strong className="block text-[#111111] mb-1.5 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-purple-600"/> AI Tags</strong>
                              <span className="text-[#333333] pl-5 block">
                                {formData.mappedAiTags.length > 0 ? formData.mappedAiTags.map(id => mappingOptions.aiTags.find((t: any) => t.id.toString() === id)?.name).filter(Boolean).join(', ') : 'None'}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PERFORMANCE CONTENT TAB */}
                  {activeTab === 'content' && (
                    <div className="space-y-5">
                       <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Why Use This</label><textarea value={formData.whyUseThis} onChange={(e) => setFormData({...formData, whyUseThis: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                       <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Benefits</label><textarea value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                       <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Science-Based Explanation</label><textarea value={formData.sciText} onChange={(e) => setFormData({...formData, sciText: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                       <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Recovery Benefits</label><textarea value={formData.recoveryBenefits} onChange={(e) => setFormData({...formData, recoveryBenefits: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                    </div>
                  )}

                  {/* SEO TAB */}
                  {activeTab === 'seo' && (
                    <div className="space-y-5">
                       <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Meta Title</label><input type="text" value={formData.metaTitle} onChange={(e) => setFormData({...formData, metaTitle: e.target.value})} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                       <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Meta Description</label><textarea value={formData.metaDescription} onChange={(e) => setFormData({...formData, metaDescription: e.target.value})} rows={3} className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                       <div><label className="block text-[13px] font-bold text-[#111111] mb-1.5">Tags</label><input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="protein, whey, recovery" className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[14px]" /></div>
                    </div>
                  )}
                </form>
              </div>

              <div className="px-6 py-4 border-t border-[#eaeaea] flex justify-end space-x-3 bg-white">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 border border-[#eaeaea] text-[#111111] text-[14px] font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" form="product-form" className="px-6 py-2 bg-[#111111] text-white text-[14px] font-semibold rounded-lg hover:bg-black transition-colors">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setProductToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">Delete Product</h3>
                <p className="text-[14px] text-[#666666]">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-[#eaeaea]">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 text-[14px] font-medium text-[#111111] bg-white border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 text-[14px] font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Delete Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 ${
              toast.type === 'success' ? 'bg-[#111111] text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
            <span className="text-[14px] font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
