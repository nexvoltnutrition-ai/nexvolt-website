import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SPORTS as MOCK_SPORTS } from "../data/sports";
import { supabase } from "../lib/supabase";

export function ShopBySport() {



  

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sports, setSports] = useState<any[]>(MOCK_SPORTS);

  useEffect(() => {
    async function fetchSports() {
      try {
        let { data } = await supabase.from("sports").select("*");
        if (data && data.length > 0) {
          
          // Merge Supabase data with MOCK_SPORTS to preserve athletics subTabs and other frontend-only mock fields if needed
          const merged = data.map(dbSport => {
            const mock = MOCK_SPORTS.find(m => m.id === dbSport.id);
            return {
              ...mock,
              ...dbSport,
            };
          });
          setSports(merged);
        }
      } catch (err) {
        console.error("Failed to fetch sports:", err);
      }
    }
    fetchSports();
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
        <div className="flex justify-between items-end mb-8 lg:mb-10 text-center sm:text-left">
          <div className="w-full text-center">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#111111] mb-4">
              Shop by Sport
            </h2>
            <p className="text-[15px] text-gray-500 max-w-2xl mx-auto">
              Targeted solutions tailored to your specific athletic needs and goals.
            </p>
          </div>
        </div>
        
        <div className="relative group -mx-6 sm:mx-0 px-6 sm:px-0">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-x-4 md:gap-x-6 lg:gap-x-8 pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {sports.map((sport, idx) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className="w-[calc(60%-16px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(16.666667%-26.666667px)] flex-none snap-start group/card flex flex-col items-center"
              >
                <Link to={`/sports/${sport.slug || sport.id}`} className="w-full flex flex-col items-center">
                  <div className="w-full aspect-square overflow-hidden bg-[#f8f8f8] mb-5 transform transition-transform duration-400 ease-in-out group-hover/card:-translate-y-2 relative">
                    <img
                      src={sport.image}
                      alt={sport.name}
                      className="w-full h-full object-cover transition-all duration-700 ease-out mix-blend-multiply group-hover/card:scale-[1.03] group-hover/card:brightness-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/0 transition-colors duration-500"></div>
                  </div>
                  <div className="text-center">
                    <span className="relative inline-block text-[#111111] text-[15px] font-medium tracking-wide uppercase after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1px] after:bg-[#111111] after:transition-all after:duration-400 ease-in-out group-hover/card:after:w-full">
                      {sport.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation arrows (visible only when hover or on larger screens) */}
        <div className="flex justify-center items-center mt-8 space-x-6">
          <button 
            onClick={() => scroll('left')}
            className="p-2 text-[#888888] hover:text-[#111111] transition-colors focus:outline-none bg-[#f8f8f8] hover:bg-[#eaeaea] rounded-full"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="p-2 text-[#888888] hover:text-[#111111] transition-colors focus:outline-none bg-[#f8f8f8] hover:bg-[#eaeaea] rounded-full"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </section>
  );
}
