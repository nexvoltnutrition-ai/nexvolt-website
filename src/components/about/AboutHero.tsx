import { motion } from "framer-motion";
import { ArrowDownRight, ShieldCheck, Zap, Trophy } from "lucide-react";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-white">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-44 -left-44 w-[520px] h-[520px] rounded-full bg-orange-100 blur-[120px] opacity-40" />

        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-orange-50 blur-[120px] opacity-60" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-28 lg:pt-36 pb-24">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2"
        >

          <Zap className="w-4 h-4 text-orange-500" />

          <span className="text-sm font-semibold tracking-wide text-orange-600 uppercase">
            About NEXVOLT
          </span>

        </motion.div>

        {/* Main Heading */}

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: .15, duration: .7 }}
          className="mt-8 text-5xl md:text-6xl lg:text-8xl font-black leading-[1.02] tracking-tight text-black max-w-6xl"
        >

          Built For

          <span className="block text-orange-500">
            Athletes.
          </span>

          Engineered For

          <span className="block">
            Champions.
          </span>

        </motion.h1>

        {/* Description */}

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: .3, duration: .7 }}
          className="mt-10 max-w-3xl text-lg md:text-xl leading-9 text-gray-600"
        >

          NEXVOLT exists because athletes deserve better.

          While most supplement brands focus on bodybuilders,
          we build performance nutrition specifically for athletes
          who train harder, recover faster and compete to win.

        </motion.p>

        {/* CTA Buttons */}

        <motion.div
          initial={{ opacity:0,y:30 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          transition={{ delay:.45,duration:.7 }}
          className="flex flex-wrap gap-5 mt-12"
        >

          <a
            href="/products"
            className="group inline-flex items-center gap-3 rounded-full bg-black text-white px-8 py-4 text-sm font-semibold transition-all duration-300 hover:bg-orange-500"
          >

            Explore Products

            <ArrowDownRight
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />

          </a>

          <a
            href="#story"
            className="rounded-full border border-gray-300 px-8 py-4 font-semibold hover:border-black transition-all duration-300"
          >
            Our Story
          </a>

        </motion.div>

        {/* Feature Cards */}

        <motion.div
          initial={{ opacity:0,y:40 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          transition={{ delay:.6,duration:.8 }}
          className="grid lg:grid-cols-3 gap-6 mt-24"
        >

          {/* Card 1 */}

          <div className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

              <Zap className="w-7 h-7 text-orange-500"/>

            </div>

            <h3 className="mt-8 text-2xl font-bold">

              Performance First

            </h3>

            <p className="mt-4 text-gray-600 leading-8">

              Every formula is designed to improve endurance,
              recovery, strength and athletic performance —
              not just appearance.

            </p>

          </div>

          {/* Card 2 */}

          <div className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

              <ShieldCheck className="w-7 h-7 text-orange-500"/>

            </div>

            <h3 className="mt-8 text-2xl font-bold">

              Clean & Trusted

            </h3>

            <p className="mt-4 text-gray-600 leading-8">

              Premium ingredients, transparent sourcing and
              uncompromising quality standards in every product.

            </p>

          </div>

          {/* Card 3 */}

          <div className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

              <Trophy className="w-7 h-7 text-orange-500"/>

            </div>

            <h3 className="mt-8 text-2xl font-bold">

              Built To Win

            </h3>

            <p className="mt-4 text-gray-600 leading-8">

              Whether you're preparing for your first competition
              or chasing international medals, NEXVOLT grows with you.

            </p>

          </div>

        </motion.div>
        {/* Bottom Section */}

          <div className="mt-24 lg:mt-28 grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >

              <p className="uppercase tracking-[0.3em] text-orange-500 text-sm font-semibold">
                PERFORMANCE WITHOUT LIMITS
              </p>

              <h2 className="mt-6 text-4xl lg:text-6xl font-black leading-tight">
                Fueling India's
                <br />
                Next Generation
                <br />
                Of Athletes.
              </h2>

              <p className="mt-8 text-gray-600 text-lg leading-9 max-w-xl">
                Every athlete deserves access to premium sports nutrition,
                world-class ingredients and products that genuinely improve
                performance. That's the future NEXVOLT is building.
              </p>

            </motion.div>

            {/* Right Image */}

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .8 }}
              className="relative"
            >

              <div className="rounded-[36px] overflow-hidden">

                <img
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80"
                  alt="Athlete Training"
                  className="w-full h-[600px] object-cover"
                />

              </div>

              {/* Floating Card */}

              <div className="absolute left-8 -bottom-10 bg-white rounded-3xl shadow-2xl px-8 py-6 border border-gray-100">

                <p className="text-5xl font-black text-orange-500">
                  19+
                </p>

                <p className="mt-2 text-sm tracking-[0.2em] uppercase text-gray-500">
                  Sports Supported
                </p>

              </div>

              {/* Floating Card */}

              <div className="absolute right-8 top-8 bg-black rounded-3xl px-8 py-6">

                <p className="text-4xl font-black text-white">
                  100%
                </p>

                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gray-300">
                  Premium Quality
                </p>

              </div>

            </motion.div>

          </div>

          {/* Scroll Indicator */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              y: [0, 10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="flex justify-center mt-24"
          >

            <div className="flex flex-col items-center">

              <span className="uppercase tracking-[0.35em] text-xs text-gray-500">
                Scroll
              </span>

              <div className="mt-4 h-16 w-[2px] bg-gradient-to-b from-orange-500 to-transparent rounded-full" />

            </div>

          </motion.div>

      </div>

    </section>
  );
}