import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SPORTS, AthleticsSubTab } from "../data/sports";

import { supabase } from "../lib/supabase";

export function SportDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const sportSlug = id || "cricket";

  const [products, setProducts] = useState<any[]>([]);

  React.useEffect(() => {
    async function fetchSportData() {
      setLoading(true);
      console.log("Looking up sport slug:", sportSlug);
      
      try {
        const { data: dbSport, error } = await supabase
          .from('sports')
          .select('*')
          .eq('slug', sportSlug.toLowerCase())
          .single();
          
        if (dbSport) {
          console.log("Found sport in DB:", dbSport.name);
          const mock = SPORTS.find(s => s.id === dbSport.id || s.name.toLowerCase() === dbSport.name.toLowerCase()) || {};
          setData({ ...mock, ...dbSport });
        } else {
          console.log("Sport not found in DB, checking mock data...");
          // Fallback to mock
          const mock = SPORTS.find((s) => s.id === sportSlug.toLowerCase() || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === sportSlug.toLowerCase());
          if (mock) {
             setData(mock);
          } else {
             setData(null);
          }
        }
      } catch (err) {
        console.error("Error fetching sport:", err);
        const mock = SPORTS.find((s) => s.id === sportSlug.toLowerCase() || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === sportSlug.toLowerCase());
        setData(mock || null);
      } finally {
        setLoading(false);
      }
    }
    fetchSportData();
  }, [sportSlug]);

  React.useEffect(() => {
    async function fetchProducts() {
      if (!data) return;
      try {
        // Requirement 1: Fetch products directly from the products table
        // Requirement 5: Ignore products where active=false
        const { data: dbProducts, error } = await supabase
          .from("products")
          .select("*")
          .eq("active", true);
        
        if (dbProducts) {
          // Requirement 3: Shop by Sport - Filter products using products.sport column
          // Requirement 4: Ensure the comparison is case-insensitive and trims whitespace
          const targetSport = sportSlug.replace(/-/g, ' ').toLowerCase();
          
          const filtered = dbProducts.filter(p => {
            if (!p.sport) return false;
            const productSport = p.sport.trim().toLowerCase();
            return productSport === targetSport;
          });
          
          const mapped = filtered.map(sp => {
             const gallery = [sp.image1, sp.image2, sp.image3, sp.image4, sp.image5, sp.image6].filter(Boolean);
             const price = sp.sale_price && sp.sale_price < sp.price ? sp.sale_price : sp.price;
             const oldPrice = sp.sale_price && sp.sale_price < sp.price ? sp.price : undefined;
             return {
                id: sp.id,
                name: sp.name,
                benefit: sp.short_description || sp.description || sp.name,
                description: sp.description,
                price: price || 0,
                oldPrice: oldPrice,
                category: sp.category || "General",
                sport: sp.sport || "All",
                inStock: sp.stock > 0,
                stock: sp.stock || 0,
                badge: sp.badges || "",
                image: sp.image1 || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800",
                gallery: gallery,
                slug: sp.slug,
                dateAdded: sp.created_at,
                rating: sp.rating || 5,
                reviews: sp.reviews || 0,
                isNew: false,
             };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, [sportSlug, data]);

  // Initialize active tab if there are subTabs
  React.useEffect(() => {
    if (data?.subTabs && data.subTabs.length > 0) {
      setActiveTabId(data.subTabs[0].id);
    } else {
      setActiveTabId(null);
    }
  }, [data]);

  const recommendedProducts = products;

  if (loading) {
     return <div className="py-20 text-center">Loading sport details...</div>;
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Sport not found</h2>
        <p className="text-gray-500 mt-2">The sport you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-[#f47c20] mt-4 inline-block font-medium">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#ffffff]">
      {/* Hero Banner */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#111111]">
        <div className="absolute inset-0">
          <img 
            src={data.image} 
            alt={data.name} 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/50 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h4 className="text-[#f47c20] font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base drop-shadow-md">
            Built for {data.name}
          </h4>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 uppercase drop-shadow-lg">
            {data.name} Performance
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto drop-shadow">
            {data.description}
          </p>
        </div>
      </section>

      {/* Recommended Stack Section */}
      <section className="py-16 md:py-24 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111] mb-4 uppercase">
              {data.stackName}
            </h2>
            <p className="text-[16px] text-[#666666] max-w-2xl mx-auto font-medium">
              {data.stackDescription} Our experts have curated the perfect combination of supplements to maximize your {data.name.toLowerCase()} potential.
            </p>
          </div>

          {/* Sub-Tabs for Athletics */}
          {data.subTabs && data.subTabs.length > 0 && (
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-[#f8f8f8] p-1.5 rounded-full border border-[#eaeaea]">
                {data.subTabs.map((tab: AthleticsSubTab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`px-8 py-3 rounded-full text-[14px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      activeTabId === tab.id
                        ? "bg-[#111111] text-white shadow-md transform scale-[1.02]"
                        : "text-[#666666] hover:text-[#111111] hover:bg-[#eaeaea]"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {recommendedProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No products available for this sport yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Science/Explanation Section */}
      <section className="py-20 bg-[#f8f8f8] border-t border-[#eaeaea]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 relative">
             <div className="aspect-[4/3] bg-[#eaeaea] overflow-hidden rounded-2xl relative shadow-xl">
               <img 
                  src={data.image} 
                  alt={`${data.name} action`} 
                  className="w-full h-full object-cover grayscale opacity-90 transition-transform duration-1000 hover:scale-105"
               />
               <div className="absolute inset-0 bg-[#f47c20]/10 mix-blend-color"></div>
             </div>
          </div>
          <div className="w-full md:w-1/2">
            <h4 className="text-[#f47c20] font-bold tracking-widest uppercase mb-3 text-[13px]">The Science</h4>
            <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-[#111111] mb-6 leading-tight">
              {data.scienceTitle}
            </h3>
            <p className="text-[16px] text-[#555555] leading-relaxed mb-8">
              {data.scienceText}
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 text-[14px] font-bold tracking-widest uppercase bg-[#111111] text-white hover:bg-[#333333] transition-colors rounded-xl shadow-md hover:shadow-lg"
            >
              Shop All Supplements
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
