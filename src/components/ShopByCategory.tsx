import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const MOCK_CATEGORIES = [
  {
    name: "Protein",
    label: "Muscle Growth",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Creatine",
    label: "Strength & Power",
    image: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Hydration",
    label: "Active Hydration",
    image: "https://images.unsplash.com/photo-1622618991746-fea00234ce5d?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Pre-Workout",
    label: "Explosive Energy",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Recovery",
    label: "Nighttime Repair",
    image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Performance Energy",
    label: "Instant Energy",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800",
  },
];

export function ShopByCategory() {

  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES);

  useEffect(() => {
    async function fetchCategories() {
      try {
        let { data } = await supabase.from("categories").select("*");
        if (data && data.length > 0) {
          
          const merged = data.map(dbCat => {
            const mock = MOCK_CATEGORIES.find(m => m.name.toLowerCase() === dbCat.name.toLowerCase());
            return {
              ...mock,
              ...dbCat,
            };
          });
          setCategories(merged);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <div className="flex justify-between items-end mb-8 lg:mb-10 text-center sm:text-left justify-center sm:justify-between">
          <div className="w-full text-center">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#111111] mb-4">
              Shop by Category
            </h2>
            <p className="text-[15px] text-gray-500 max-w-2xl mx-auto">
              Precision-formulated supplements to support every phase of your training journey.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10 lg:gap-x-8 lg:gap-y-12">
          {categories.map((category, idx) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative group/card flex flex-col items-center"
            >
              <Link to={`/category/${category.name.toLowerCase().replace(/ /g, '-')}`} className="w-full flex flex-col items-center">
                <div className="w-full aspect-square overflow-hidden bg-[#f8f8f8] mb-5 transform transition-transform duration-400 ease-in-out group-hover/card:-translate-y-2">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-all duration-700 ease-out mix-blend-multiply group-hover/card:scale-[1.03] group-hover/card:brightness-105"
                  />
                </div>
                <div className="text-center">
                  <span className="relative inline-block text-[#111111] text-[15px] font-medium tracking-wide after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1px] after:bg-[#111111] after:transition-all after:duration-400 ease-in-out group-hover/card:after:w-full">
                    {category.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
