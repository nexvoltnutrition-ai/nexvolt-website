import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36 bg-white">

      {/* Background Glow */}

      <div className="absolute inset-0">

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-orange-100 blur-[180px] opacity-60" />

      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="rounded-[42px] bg-black text-white px-8 py-16 lg:px-20 lg:py-24 text-center overflow-hidden relative"
        >

          {/* Orange Glow */}

          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-orange-500/20 blur-[120px]" />

          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-orange-500/10 blur-[120px]" />

          <span className="inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2 uppercase tracking-[0.25em] text-sm text-orange-400 font-semibold">

            Join The Movement

          </span>

          <h2 className="mt-8 text-4xl md:text-5xl lg:text-7xl font-black leading-tight">

            Built For Athletes.
            <span className="block text-orange-500">
              Ready For Champions.
            </span>

          </h2>

          <p className="mt-8 max-w-3xl mx-auto text-lg leading-9 text-gray-300">

            Discover premium sports nutrition engineered to help
            you recover faster, train harder and perform at your best.

          </p>

          {/* Buttons */}

          <div className="mt-14 flex flex-wrap justify-center gap-6">

            <Link
              to="/products"
              className="group inline-flex items-center gap-3 rounded-full bg-orange-500 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:bg-orange-600"
            >

              Shop Products

              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />

            </Link>

            <Link
              to="/login"
              className="rounded-full border border-white/20 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:border-orange-500 hover:bg-white/10"
            >

              Join NEXVOLT

            </Link>

          </div>

          {/* Bottom Text */}

          <div className="mt-16 flex flex-wrap justify-center gap-10 text-sm uppercase tracking-[0.2em] text-gray-400">

            <span>Performance</span>

            <span>Recovery</span>

            <span>Strength</span>

            <span>Endurance</span>

            <span>Consistency</span>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default CTA;