import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, SlidersHorizontal, ChevronDown, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import { useProducts } from "../context/ProductContext";

const GOALS = ["Muscle Growth", "Recovery", "Endurance", "Hydration", "Energy", "Strength"];
const SORTS = ["Featured", "Best Sellers", "Newest", "Highest Rated", "Price Low to High", "Price High to Low"];

export function Products() {
  const { products } = useProducts();
  
  const [categories, setCategories] = useState<string[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({ min: 0, max: 100000 });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [availability, setAvailability] = useState<{inStock: boolean, newLaunch: boolean}>({ inStock: false, newLaunch: false });
  const [sortBy, setSortBy] = useState("Featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: cats }, { data: sps }] = await Promise.all([
          supabase.from("categories").select("name"),
          supabase.from("sports").select("name")
        ]);
        if (cats) setCategories(cats.map(c => c.name));
        if (sps) setSports(sps.map(s => s.name));
      } catch (err) {
        console.error("Error fetching filters", err);
      }
    }
    fetchData();
  }, []);

  // Prevent background scrolling when filter drawer is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedGoals([]);
    setSelectedSports([]);
    setPriceRange({ min: 0, max: 100000 });
    setSelectedRating(null);
    setAvailability({ inStock: false, newLaunch: false });
    // Keep search query to allow searching without filters
  };

  // Derive active filters count and create chip items
  const activeFiltersCount = selectedCategories.length + selectedGoals.length + selectedSports.length + (selectedRating ? 1 : 0) + (availability.inStock ? 1 : 0) + (availability.newLaunch ? 1 : 0) + (priceRange.min > 0 || priceRange.max < 100000 ? 1 : 0);

  const activeChips = useMemo(() => {
    const chips: { id: string, label: string, onRemove: () => void }[] = [];
    
    selectedCategories.forEach(cat => {
      chips.push({ id: `cat-${cat}`, label: cat, onRemove: () => toggleSelection(setSelectedCategories, cat) });
    });
    selectedGoals.forEach(goal => {
      chips.push({ id: `goal-${goal}`, label: goal, onRemove: () => toggleSelection(setSelectedGoals, goal) });
    });
    selectedSports.forEach(sport => {
      chips.push({ id: `sport-${sport}`, label: sport, onRemove: () => toggleSelection(setSelectedSports, sport) });
    });
    if (availability.inStock) {
      chips.push({ id: 'inStock', label: 'In Stock', onRemove: () => setAvailability(prev => ({...prev, inStock: false})) });
    }
    if (availability.newLaunch) {
      chips.push({ id: 'newLaunch', label: 'New Launch', onRemove: () => setAvailability(prev => ({...prev, newLaunch: false})) });
    }
    if (selectedRating) {
      chips.push({ id: 'rating', label: `${selectedRating}+ Stars`, onRemove: () => setSelectedRating(null) });
    }
    if (priceRange.min > 0 || priceRange.max < 100000) {
      chips.push({ id: 'price', label: `₹${priceRange.min} - ₹${priceRange.max}`, onRemove: () => setPriceRange({ min: 0, max: 100000 }) });
    }
    
    return chips;
  }, [selectedCategories, selectedGoals, selectedSports, availability, selectedRating, priceRange]);


  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    // Filters
    if (selectedCategories.length > 0) result = result.filter(p => selectedCategories.includes(p.category));
    if (selectedGoals.length > 0) result = result.filter(p => selectedGoals.includes(p.goal));
    if (selectedSports.length > 0) result = result.filter(p => selectedSports.includes(p.sport));
    if (selectedRating !== null) result = result.filter(p => p.rating >= selectedRating);
    if (availability.inStock) result = result.filter(p => p.inStock);
    if (availability.newLaunch) result = result.filter(p => p.isNew);
    
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Sorting
    switch (sortBy) {
      case "Price Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Newest":
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case "Highest Rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "Best Sellers":
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // Featured (default order)
        break;
    }

    return result;
  }, [searchQuery, selectedCategories, selectedGoals, selectedSports, priceRange, selectedRating, availability, sortBy]);

  return (
    <div className="pt-8 pb-24 bg-white min-h-screen">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-10">
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-[#111111] mb-4">
          All Products
        </h1>
        <p className="text-[#666666] text-[16px] max-w-2xl">
          Performance nutrition designed to optimize every phase of your training.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-[#eaeaea]">
           
           {/* Actions */}
           <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-black text-white text-[13px] font-bold uppercase tracking-widest transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              {/* Sort Dropdown */}
              <div className="relative z-20 flex-1 sm:flex-none">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-3 px-6 py-3 border border-[#eaeaea] hover:border-[#111111] text-[13px] font-bold uppercase tracking-widest text-[#111111] bg-white w-full sm:w-[220px] justify-between transition-colors"
                >
                  <span className="truncate">Sort: {sortBy}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isSortOpen && (
                     <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                        <motion.div 
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 5 }}
                           className="absolute right-0 top-full mt-2 w-full bg-white border border-[#eaeaea] shadow-xl py-2 z-20 rounded-lg overflow-hidden"
                        >
                           {SORTS.map(sort => (
                           <button
                              key={sort}
                              onClick={() => { setSortBy(sort); setIsSortOpen(false); }}
                              className={`block w-full text-left px-5 py-3 text-[13px] hover:bg-[#f8f8f8] transition-colors ${sortBy === sort ? "font-bold text-[#111]" : "text-[#666]"}`}
                           >
                              {sort}
                           </button>
                           ))}
                        </motion.div>
                     </>
                  )}
                </AnimatePresence>
              </div>
           </div>

           {/* Search */}
           <div className="relative w-full sm:w-80 lg:w-96 order-first sm:order-last">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
             <input 
               type="text" 
               placeholder="Search products..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-[#f8f8f8] border border-transparent focus:border-[#eaeaea] focus:bg-white focus:outline-none transition-colors text-[14px] rounded-lg"
             />
           </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
           <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#888888] mr-2">Active Filters:</span>
              {activeChips.map(chip => (
                 <span key={chip.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f8f8] border border-[#eaeaea] rounded-full text-[12px] text-[#111111] font-medium">
                    {chip.label}
                    <button onClick={chip.onRemove} className="text-[#888888] hover:text-[#111111] p-0.5 rounded-full hover:bg-gray-200 transition-colors">
                       <X className="w-3 h-3" />
                    </button>
                 </span>
              ))}
              <button 
                 onClick={clearFilters}
                 className="text-[12px] font-bold text-[#f47c20] hover:text-[#d66a18] underline ml-2 transition-colors"
              >
                 Clear All
              </button>
           </div>
        )}

        {/* Product Grid - Full Width */}
        <div>
          {filteredAndSortedProducts.length === 0 ? (
             <div className="py-32 text-center bg-[#f8f9fa] rounded-2xl border border-dashed border-[#eaeaea]">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#eaeaea]">
                 <Search className="w-6 h-6 text-[#888888]" />
               </div>
               <h3 className="text-lg font-bold text-[#111111] mb-2">No products found</h3>
               <p className="text-[#888888] text-[15px] mb-6 max-w-md mx-auto">We couldn't find any products matching your current selected filters and search query.</p>
               <button onClick={clearFilters} className="px-6 py-2.5 bg-white border border-[#eaeaea] hover:border-[#111111] text-[#111111] text-[14px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm">
                 Clear Filters
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {filteredAndSortedProducts.map(product => (
                <ProductCard key={product.id} product={product} layoutMode="collection-4" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Drawer Overlay */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-start"
            onClick={() => setIsFilterOpen(false)}
          >
             <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: 0 }}
               exit={{ x: "-100%" }}
               transition={{ type: "spring", bounce: 0, duration: 0.4 }}
               className="w-full max-w-[360px] h-full bg-white shadow-2xl flex flex-col relative"
               onClick={(e) => e.stopPropagation()}
             >
                {/* Drawer Header */}
                <div className="px-6 py-5 border-b border-[#eaeaea] flex items-center justify-between bg-white shrink-0 z-10 relative">
                   <h2 className="text-[16px] font-bold text-[#111111] uppercase tracking-widest flex items-center gap-2">
                     <SlidersHorizontal className="w-4 h-4" />
                     Filter Products
                   </h2>
                   <button 
                     onClick={() => setIsFilterOpen(false)}
                     className="p-2 hover:bg-[#f8f8f8] rounded-full transition-colors group"
                   >
                     <X className="w-5 h-5 text-[#888888] group-hover:text-[#111111]" />
                   </button>
                </div>

                {/* Drawer Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-0">
                  
                  {/* Category Filter */}
                  <div>
                     <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#111111] mb-4">Category</h4>
                     <div className="flex flex-col gap-3">
                       {categories.map(category => (
                         <label key={category} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 border rounded-md flex items-center justify-center transition-colors ${selectedCategories.includes(category) ? "bg-[#111111] border-[#111111]" : "border-[#ccc] group-hover:border-[#111111]"}`}>
                             {selectedCategories.includes(category) && <X className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <input type="checkbox" className="hidden" checked={selectedCategories.includes(category)} onChange={() => toggleSelection(setSelectedCategories, category)} />
                           <span className="text-[14px] text-[#444444] group-hover:text-[#111111]">{category}</span>
                         </label>
                       ))}
                     </div>
                  </div>

                  {/* Sport Filter */}
                  <div>
                     <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#111111] mb-4">Sport</h4>
                     <div className="flex flex-col gap-3">
                       {sports.map(sport => (
                         <label key={sport} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 border rounded-md flex items-center justify-center transition-colors ${selectedSports.includes(sport) ? "bg-[#111111] border-[#111111]" : "border-[#ccc] group-hover:border-[#111111]"}`}>
                             {selectedSports.includes(sport) && <X className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <input type="checkbox" className="hidden" checked={selectedSports.includes(sport)} onChange={() => toggleSelection(setSelectedSports, sport)} />
                           <span className="text-[14px] text-[#444444] group-hover:text-[#111111]">{sport}</span>
                         </label>
                       ))}
                     </div>
                  </div>

                  {/* Goal Filter */}
                  <div>
                     <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#111111] mb-4">Primary Goal</h4>
                     <div className="flex flex-col gap-3">
                       {GOALS.map(goal => (
                         <label key={goal} className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 border rounded-md flex items-center justify-center transition-colors ${selectedGoals.includes(goal) ? "bg-[#111111] border-[#111111]" : "border-[#ccc] group-hover:border-[#111111]"}`}>
                             {selectedGoals.includes(goal) && <X className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <input type="checkbox" className="hidden" checked={selectedGoals.includes(goal)} onChange={() => toggleSelection(setSelectedGoals, goal)} />
                           <span className="text-[14px] text-[#444444] group-hover:text-[#111111]">{goal}</span>
                         </label>
                       ))}
                     </div>
                  </div>
                  
                  {/* Price Filter */}
                  <div>
                     <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#111111] mb-4">Price Range</h4>
                     <div className="flex items-center gap-4">
                       <div className="relative w-full">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-[13px]">₹</span>
                          <input type="number" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({...prev, min: Number(e.target.value)}))} className="w-full border border-[#eaeaea] pl-7 pr-3 py-2.5 rounded-lg text-[14px] focus:outline-none focus:border-[#111] bg-[#f8f8f8]" placeholder="Min" />
                       </div>
                       <span className="text-[#888]">-</span>
                       <div className="relative w-full">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] text-[13px]">₹</span>
                          <input type="number" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({...prev, max: Number(e.target.value)}))} className="w-full border border-[#eaeaea] pl-7 pr-3 py-2.5 rounded-lg text-[14px] focus:outline-none focus:border-[#111] bg-[#f8f8f8]" placeholder="Max" />
                       </div>
                     </div>
                  </div>

                  {/* Status & Availability Filter */}
                  <div>
                     <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#111111] mb-4">Availability</h4>
                     <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 border rounded-md flex items-center justify-center transition-colors ${availability.inStock ? "bg-[#111111] border-[#111111]" : "border-[#ccc] group-hover:border-[#111111]"}`}>
                             {availability.inStock && <X className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <input type="checkbox" className="hidden" checked={availability.inStock} onChange={(e) => setAvailability(prev => ({...prev, inStock: e.target.checked}))} />
                           <span className="text-[14px] text-[#444444] group-hover:text-[#111111]">In Stock</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <div className={`w-5 h-5 border rounded-md flex items-center justify-center transition-colors ${availability.newLaunch ? "bg-[#111111] border-[#111111]" : "border-[#ccc] group-hover:border-[#111111]"}`}>
                             {availability.newLaunch && <X className="w-3.5 h-3.5 text-white" />}
                           </div>
                           <input type="checkbox" className="hidden" checked={availability.newLaunch} onChange={(e) => setAvailability(prev => ({...prev, newLaunch: e.target.checked}))} />
                           <span className="text-[14px] text-[#444444] group-hover:text-[#111111]">New Launch</span>
                        </label>
                     </div>
                  </div>

                </div>

                {/* Drawer Footer Actions */}
                <div className="sticky bottom-0 left-0 w-full p-6 border-t border-[#eaeaea] bg-white mt-auto shrink-0 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
                   <button 
                     onClick={() => setIsFilterOpen(false)}
                     className="w-full py-3.5 bg-[#111111] hover:bg-black text-white text-[13px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-md"
                   >
                     Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                   </button>
                   <button 
                     onClick={clearFilters} 
                     className="w-full py-3.5 bg-[#f8f8f8] border border-[#eaeaea] hover:bg-white text-[#111111] text-[13px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                   >
                     Clear All
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

