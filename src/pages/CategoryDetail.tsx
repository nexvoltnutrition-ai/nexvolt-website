import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { supabase } from "../lib/supabase";

const CATEGORY_DATA: Record<string, {
  name: string;
  image: string;
  description: string;
  stackName: string;
  stackDescription: string;
  scienceTitle: string;
  scienceText: string;
}> = {
  protein: {
    name: "Protein",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=1600",
    description: "Premium whey isolates and blends for maximal muscle growth and recovery.",
    stackName: "The Anabolic Foundation",
    stackDescription: "Essential building blocks to repair micro-trauma and initiate hypertrophy.",
    scienceTitle: "Protein Synthesis & Muscle Repair",
    scienceText: "Following resistance training, your muscles require complete amino acid profiles to rebuild stronger. Our cold-processed isolates deliver BCAAs directly to muscle tissue rapidly, capitalizing on the anabolic window.",
  },
  creatine: {
    name: "Creatine",
    image: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=1600",
    description: "Clinically proven to increase explosive strength, power, and muscle mass.",
    stackName: "The Power Multiplier",
    stackDescription: "Supercharge your ATP reserves for those critical final reps.",
    scienceTitle: "ATP Regeneration & Cellular Hydration",
    scienceText: "Creatine monohydrate is the most extensively researched sports supplement. It replenishes adenosine triphosphate (ATP) stores, allowing you to maintain peak power output during short, intense bursts of exercise.",
  },
  hydration: {
    name: "Hydration",
    image: "https://images.unsplash.com/photo-1622618991746-fea00234ce5d?auto=format&fit=crop&q=80&w=1600",
    description: "Advanced electrolyte matrices to sustain performance and prevent cramping.",
    stackName: "The Fluid Balance Matrix",
    stackDescription: "Maintain plasma volume and optimize nerve-to-muscle firing.",
    scienceTitle: "Osmolality & Mineral Replenishment",
    scienceText: "Even a 2% drop in hydration can plummet physical and cognitive performance. Our hydration complexes provide the exact sodium, potassium, and magnesium ratios needed to match sweat loss rates.",
  },
  "pre-workout": {
    name: "Pre-Workout",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1600",
    description: "Explosive energy, laser focus, and skin-tearing pumps.",
    stackName: "The Ignition Sequence",
    stackDescription: "Prime your central nervous system for maximum output.",
    scienceTitle: "Vasodilation & CNS Stimulation",
    scienceText: "Effective pre-workouts do more than just caffeine. Citrulline malate expands blood vessels for better nutrient delivery, while nootropics dial in your focus so every rep is intentional.",
  },
  recovery: {
    name: "Recovery",
    image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&q=80&w=1600",
    description: "Accelerate tissue repair and optimize nighttime rest.",
    stackName: "The Rebuild Protocol",
    stackDescription: "Down-regulate after intense training and prepare for tomorrow.",
    scienceTitle: "Parasympathetic Shift & Amino Recovery",
    scienceText: "Growth doesn't happen in the gym; it happens during recovery. Our formulas help shift your nervous system into a parasympathetic state while delivering targeted aminos like L-Glutamine to support immune function and gut health.",
  },
  "performance-energy": {
    name: "Performance Energy",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1600",
    description: "Sustained fuel for endurance events and long training sessions.",
    stackName: "The Endurance Engine",
    stackDescription: "Dual-source carbohydrates and steady-state energy.",
    scienceTitle: "Glycogen Sparing & Sustained Output",
    scienceText: "For activities lasting over 60 minutes, relying on intramuscular glycogen isn't enough. Our energy formulas provide easily digestible carbohydrates to keep your blood glucose stable and delay the onset of fatigue.",
  }
};

export function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const categoryId = id || "protein";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Requirement 1 & 2: Read slug and fetch from categories table
        const slugToFetch = categoryId.toLowerCase();
        
        let { data: dbCategory, error: catError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slugToFetch)
          .single();
          
        let categoryData = dbCategory;
        
        // Fallback if not found in db by slug (maybe it's mock only or different slug)
        if (!categoryData) {
          const { data: dbCategoryByName } = await supabase
            .from("categories")
            .select("*")
            .ilike("name", categoryId.replace(/-/g, ' '))
            .single();
          
          categoryData = dbCategoryByName;
        }
        
        if (!categoryData) {
          // Total fallback to mock just in case
          categoryData = CATEGORY_DATA[slugToFetch] || null;
        }
        
        if (categoryData) {
          // Merge with mock to preserve UI text fields
          const mock = CATEGORY_DATA[slugToFetch] || CATEGORY_DATA[categoryData.name.toLowerCase().replace(/ /g, '-')] || ({} as any);
          
          setData({
            name: categoryData.name || mock.name,
            image: categoryData.image || mock.image,
            description: categoryData.description || mock.description || "",
            stackName: mock.stackName || "The Essential Stack",
            stackDescription: mock.stackDescription || "Carefully selected products for your goals.",
            scienceTitle: mock.scienceTitle || "Formulated for Results",
            scienceText: mock.scienceText || "Our products are backed by research and rigorous testing to ensure maximum efficacy.",
          });
          
          // Requirement 3: Load all active products where products.category matches categories.name
          const { data: dbProducts, error } = await supabase
            .from("products")
            .select("*")
            .eq("active", true);
            
          if (dbProducts) {
            // Requirement 4: Ensure comparison is case-insensitive and trims whitespace
            const targetCategoryName = (categoryData.name || "").trim().toLowerCase();
            
            const filtered = dbProducts.filter(p => {
              if (!p.category) return false;
              const productCategory = p.category.trim().toLowerCase();
              return productCategory === targetCategoryName;
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
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryId]);

  const categoryProducts = products;

  if (loading) {
     return <div className="py-20 text-center">Loading category details...</div>;
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">Category not found</h2>
        <Link to="/" className="text-[#f47c20] mt-4 inline-block font-medium">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#ffffff]">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-[#111111]">
        <div className="absolute inset-0">
          <img 
            src={data.image} 
            alt={data.name} 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/30"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h4 className="text-[#f47c20] font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base drop-shadow-md">
            Premium Category
          </h4>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 uppercase drop-shadow-lg">
            {data.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto drop-shadow">
            {data.description}
          </p>
        </div>
      </section>

      {/* Recommended Stack Section */}
      <section className="py-16 md:py-24 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111] mb-4 uppercase">
              {data.stackName}
            </h2>
            <p className="text-[16px] text-[#666666] max-w-2xl mx-auto font-medium">
              {data.stackDescription} Shop our top-tier {data.name.toLowerCase()} products below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500">
                No products found
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
                  alt={`${data.name} science`} 
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
              View All Supps
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
