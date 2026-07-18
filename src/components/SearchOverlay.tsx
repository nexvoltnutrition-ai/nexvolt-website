import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { SPORTS } from "../data/sports";
import { supabase } from "../lib/supabase";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dbBlogs, setDbBlogs] = useState<any[]>([]);
  
  useEffect(() => {
     const fetchBlogs = async () => {
        const { data } = await supabase.from('blogs').select('*').eq('status', 'Published');
        if (data) setDbBlogs(data);
     };
     fetchBlogs();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => {
        setQuery("");
      }, 300);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  // Searching logic
  const searchLower = query.toLowerCase().trim();

  // Extract products
  const matchedProducts = searchLower ? products.filter(p => {
    return p.name.toLowerCase().includes(searchLower) ||
           p.category.toLowerCase().includes(searchLower) ||
           p.goal.toLowerCase().includes(searchLower) ||
           p.sport.toLowerCase().includes(searchLower) ||
           (p.sports && p.sports.some(s => s.toLowerCase().includes(searchLower))) ||
           (p.variants && p.variants.some(v => v.options.some(o => o.name.toLowerCase().includes(searchLower))));
  }).slice(0, 4) : [];

  const matchedSports = searchLower ? SPORTS.filter(s => {
    return s.name.toLowerCase().includes(searchLower) ||
           s.description.toLowerCase().includes(searchLower) ||
           s.stackName.toLowerCase().includes(searchLower);
  }).slice(0, 3) : [];

  const matchedBlogs = searchLower ? dbBlogs.filter(b => {
    return (b.title || "").toLowerCase().includes(searchLower) ||
           (b.category || "").toLowerCase().includes(searchLower);
  }).slice(0, 2) : [];

  const hasResults = searchLower.length > 0 && (matchedProducts.length > 0 || matchedSports.length > 0 || matchedBlogs.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Search container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 w-full z-[70] bg-white border-b border-[#eaeaea] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              {/* Search Header */}
              <div className="flex items-center h-[82px] md:h-[100px] border-b border-[#eaeaea]">
                <Search className="w-6 h-6 text-[#888888] mr-4 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, flavors, sports, athletes..."
                  className="w-full h-full bg-transparent outline-none text-xl md:text-3xl font-medium tracking-tight text-[#111111] placeholder:text-[#cccccc]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  onClick={handleClose}
                  className="ml-4 p-2 rounded-full hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6 text-[#111111]" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="max-h-[calc(100vh-100px)] overflow-y-auto py-8 md:py-12 custom-scrollbar">
                {!searchLower ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1">
                      <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mb-4">Trending Searches</h3>
                      <div className="flex flex-col space-y-3">
                        <button onClick={() => setQuery("Creatine")} className="text-left text-[15px] font-medium hover:text-[#f47c20] transition-colors">Creatine Monohydrate</button>
                        <button onClick={() => setQuery("Cricket")} className="text-left text-[15px] font-medium hover:text-[#f47c20] transition-colors">Cricket Supplements</button>
                        <button onClick={() => setQuery("Chocolate")} className="text-left text-[15px] font-medium hover:text-[#f47c20] transition-colors">Chocolate Whey</button>
                        <button onClick={() => setQuery("Recovery")} className="text-left text-[15px] font-medium hover:text-[#f47c20] transition-colors">Recovery Stack</button>
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mb-6 border-b border-[#eaeaea] pb-2 text-left">Popular Sports</h3>
                          <div className="flex flex-col space-y-4">
                            {SPORTS.slice(0, 3).map(sport => (
                              <Link 
                                key={sport.id} 
                                to={`/sports/${(sport as any).slug || sport.id}`}
                                onClick={handleClose}
                                className="group flex items-center space-x-4"
                              >
                                <div className="w-12 h-12 rounded-md overflow-hidden bg-[#f8f8f8] flex-shrink-0">
                                  <img src={sport.image} alt={sport.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <span className="text-[14px] font-medium text-[#111111] group-hover:text-[#f47c20] transition-colors">{sport.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mb-6 border-b border-[#eaeaea] pb-2 text-left">Athlete Stacks</h3>
                          <div className="flex flex-col space-y-4">
                            {SPORTS.slice(3, 6).map(sport => (
                              <Link 
                                key={`stack-${sport.id}`} 
                                to={`/sports/${(sport as any).slug || sport.id}`}
                                onClick={handleClose}
                                className="group flex flex-col text-left"
                              >
                                <span className="text-[14px] font-medium text-[#111111] leading-snug group-hover:text-[#f47c20] transition-colors mb-1">{sport.stackName}</span>
                                <span className="text-[12px] text-[#888888]">Used in {sport.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mb-6 border-b border-[#eaeaea] pb-2 text-left">Trending Products</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {products.slice(4, 8).map(product => (
                              <Link 
                                key={product.id} 
                                to={`/product/${product.slug}`}
                                onClick={handleClose}
                                className="group flex flex-col items-center"
                              >
                                <div className="w-full aspect-square bg-[#f8f8f8] p-2 mb-2 rounded-lg overflow-hidden relative">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                                </div>
                                <span className="text-[11px] font-medium text-center leading-tight group-hover:text-[#f47c20] transition-colors line-clamp-2">{product.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!hasResults ? (
                      <div className="py-20 text-center">
                        <Search className="w-12 h-12 text-[#dddddd] mx-auto mb-4" />
                        <h2 className="text-2xl font-medium text-[#111111] mb-2">No results found for "{query}"</h2>
                        <p className="text-[#666666]">Try checking for spelling errors or try another term.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Products column */}
                        <div className="lg:col-span-3">
                          <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mb-6 border-b border-[#eaeaea] pb-2 text-left">Matched Products</h3>
                          {matchedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                              {matchedProducts.map(product => (
                                <Link 
                                  key={product.id} 
                                  to={`/product/${product.slug}`}
                                  onClick={handleClose}
                                  className="group flex flex-col"
                                >
                                  <div className="w-full aspect-square bg-[#f8f8f8] p-4 mb-4 rounded-lg overflow-hidden relative">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-[#111111] text-[10px] font-bold uppercase tracking-widest rounded-sm border border-[#eaeaea]">
                                      {product.category}
                                    </div>
                                  </div>
                                  <span className="text-[12px] font-medium text-[#888888] mb-1">{product.sport}</span>
                                  <span className="text-[14px] font-medium leading-snug group-hover:text-[#f47c20] transition-colors text-left">{product.name}</span>
                                  <span className="text-[14px] font-bold text-[#111111] mt-1 text-left">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}</span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[#888888] text-[14px] text-left">No products match this query.</p>
                          )}
                        </div>

                        {/* Sidebar column (Sports & Blogs) */}
                        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-[#eaeaea] pt-8 lg:pt-0 lg:pl-8">
                          {matchedSports.length > 0 && (
                            <div className="mb-10">
                              <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mb-6 border-b border-[#eaeaea] pb-2 text-left">Matched Sports</h3>
                              <div className="flex flex-col space-y-4">
                            {matchedSports.map(sport => (
                                  <Link 
                                    key={sport.id} 
                                    to={`/sports/${(sport as any).slug || sport.id}`}
                                    onClick={handleClose}
                                    className="group flex items-center space-x-4"
                                  >
                                    <div className="w-16 h-16 rounded-md overflow-hidden bg-[#f8f8f8] flex-shrink-0">
                                      <img src={sport.image} alt={sport.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                      <span className="text-[15px] font-medium text-[#111111] group-hover:text-[#f47c20] transition-colors">{sport.name}</span>
                                      <span className="text-[12px] text-[#666666] line-clamp-1">{sport.stackName}</span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {matchedBlogs.length > 0 && (
                            <div>
                              <h3 className="text-[12px] font-bold text-[#888888] uppercase tracking-widest mb-6 border-b border-[#eaeaea] pb-2 text-left">Articles</h3>
                              <div className="flex flex-col space-y-4">
                                {matchedBlogs.map(blog => (
                                  <Link 
                                    key={blog.id} 
                                    to={`/blogs/${blog.slug}`}
                                    onClick={handleClose}
                                    className="group flex flex-col text-left"
                                  >
                                    <span className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-1">{blog.category || "Article"}</span>
                                    <span className="text-[14px] font-medium text-[#111111] group-hover:text-[#f47c20] leading-snug transition-colors">{blog.title}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
