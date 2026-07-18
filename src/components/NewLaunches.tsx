import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useProducts } from "../context/ProductContext";

export function NewLaunches() {
  const { products } = useProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const newProducts = products.filter(p => p.isNew).length > 0
    ? products.filter(p => p.isNew)
    : products.slice(0, 4);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#111111]">
            New Launches
          </h2>
        </div>
        <div className="relative group -mx-6 sm:mx-0 px-6 sm:px-0">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-x-6 md:gap-x-8 pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <AnimatePresence mode="popLayout">
              {newProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-24px)] flex-none snap-start relative z-0"
                >
                  <div className="w-full h-full">
                    <ProductCard product={product} layoutMode="carousel" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Custom scrollbar navigation */}
        <div className="flex justify-center items-center mt-8 space-x-6">
          <button 
            onClick={() => scroll('left')}
            className="p-2 text-[#888888] hover:text-[#111111] transition-colors focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </button>
          
          <div className="w-48 sm:w-64 h-[2px] bg-[#e5e5e5] relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[#111111] w-1/4 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${scrollProgress * 3}%)` }}
            />
          </div>

          <button 
            onClick={() => scroll('right')}
            className="p-2 text-[#888888] hover:text-[#111111] transition-colors focus:outline-none"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </section>
  );
}
