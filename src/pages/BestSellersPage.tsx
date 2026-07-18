import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";

const SORTS = ["Featured", "Best Selling", "Price: Low to High", "Price: High to Low", "Newest", "Highest Rated"];

export function BestSellersPage() {
  const { products } = useProducts();
  const [sortBy, setSortBy] = useState("Featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortedProducts = useMemo(() => {
    let result = [...products];

    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Newest":
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case "Highest Rated":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "Best Selling":
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // Featured (default order)
        break;
    }

    return result;
  }, [sortBy]);

  return (
    <div className="pt-8 pb-24 bg-white min-h-screen">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-12">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[#111111] mb-3">
          Best Sellers
        </h1>
        <p className="text-[#666666] text-[15px] max-w-2xl">
          Our most trusted performance nutrition products for athletes.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Bar: Count & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-[#eaeaea]">
           <div className="text-[14px] text-[#666666]">
             Showing <span className="font-medium text-[#111111]">{sortedProducts.length}</span> products
           </div>

           <div className="relative z-20">
             <button 
               onClick={() => setIsSortOpen(!isSortOpen)}
               className="flex items-center gap-3 px-4 py-2.5 border border-[#eaeaea] text-[13px] font-medium uppercase tracking-widest text-[#111111] bg-white w-full sm:w-[200px] justify-between transition-colors hover:border-[#111111]"
             >
               <span className="truncate">{sortBy}</span>
               <ChevronDown className="w-4 h-4" />
             </button>
             <AnimatePresence>
               {isSortOpen && (
                 <motion.div 
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 5 }}
                   className="absolute right-0 top-full mt-2 w-full sm:w-[200px] bg-white border border-[#eaeaea] shadow-lg py-2"
                 >
                   {SORTS.map(sort => (
                     <button
                       key={sort}
                       onClick={() => { setSortBy(sort); setIsSortOpen(false); }}
                       className={`block w-full text-left px-4 py-2 text-[13px] hover:bg-[#f8f8f8] transition-colors ${sortBy === sort ? "font-medium text-[#111]" : "text-[#666]"}`}
                     >
                       {sort}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} layoutMode="collection-4" />
          ))}
        </div>
      </div>
    </div>
  );
}
