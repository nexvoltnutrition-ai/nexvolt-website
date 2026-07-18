import { motion } from "motion/react";
import { Search, FlaskConical, Activity, Leaf } from "lucide-react";

const VALUES = [
  {
    icon: Activity,
    title: "Athlete Focused",
    description: "Built specifically for physical needs and goals.",
  },
  {
    icon: Leaf,
    title: "Clean Ingredients",
    description: "No unnecessary fillers or artificial blends.",
  },
  {
    icon: FlaskConical,
    title: "Recovery Science",
    description: "Clinically backed formulas for optimal repair.",
  },
  {
    icon: Search,
    title: "Performance Driven",
    description: "Designed for endurance, strength, and output.",
  },
];

export function TrustValues() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {VALUES.map((value, idx) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-[#F8F8F8] rounded-full flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
                <value.icon className="w-6 h-6 text-[#111111] stroke-[1.5]" />
              </div>
              <h3 className="text-[17px] font-medium text-[#111111] mb-2.5 tracking-tight">{value.title}</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[260px] mx-auto">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
