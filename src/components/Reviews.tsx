import { motion } from "motion/react";
import { Star, CheckCircle2 } from "lucide-react";

const HARDCODED_REVIEWS = [
  {
    id: 1,
    name: "Rahul M.",
    product: "ProRoti Protein",
    review: "Best tasting protein I've ever had. Mixes perfectly without any clumps. Highly recommended for daily use.",
    rating: 5,
  },
  {
    id: 2,
    name: "Vikram S.",
    product: "Hydration+Recovery",
    review: "Noticed a significant difference in my recovery time after long runs. The citrus flavor is extremely refreshing.",
    rating: 5,
  },
  {
    id: 3,
    name: "Aditi P.",
    product: "NightTime Complete",
    review: "Finally a supplement that actually helps me sleep better and wake up completely recovered. Love the minimal ingredients.",
    rating: 4,
  },
];

export function Reviews() {
  const REVIEWS = HARDCODED_REVIEWS;
  
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-center text-[#111111] mb-12">
          Real Results from Athletes
        </h2>
        
        <div className="flex overflow-x-auto pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-6 sm:gap-8 snap-x snap-mandatory hide-scrollbar">
          {REVIEWS.map((review, idx) => (
            <motion.div
              layout
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative flex-none w-[85vw] sm:w-auto snap-center bg-white border border-[#eaeaea] p-8 rounded-[8px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow"
            >
              <div className="flex items-center space-x-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-[14px] h-[14px] ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              
              <p className="text-[#111111] mb-8 italic text-[14px] leading-relaxed opacity-80">
                "{(review.review || review.review)}"
              </p>
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[#111111] text-[14px] flex items-center tracking-tight">
                    {review.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 ml-1.5" strokeWidth={2.5} />
                  </p>
                  <p className="text-[12px] text-gray-500 mt-1 uppercase tracking-wide font-medium">Verified</p>
                </div>
                <p className="text-[11px] font-medium text-gray-500 bg-white px-2.5 py-1 border border-gray-200 rounded-sm">
                  {review.product}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
