import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FounderSection() {
  return (
    <section className="relative overflow-hidden bg-white py-28 lg:py-36">

      {/* Background */}

      <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-orange-100 blur-[150px] opacity-40" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Founder Image */}

          <motion.div
            initial={{ opacity:0,x:-50 }}
            whileInView={{ opacity:1,x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.8 }}
            className="relative"
          >

            <div className="rounded-[40px] overflow-hidden shadow-2xl">

              <img
                src="/images/founder.jpg"
                alt="Founder"
                className="w-full h-[650px] object-cover"
              />

            </div>

            {/* Experience Card */}

            <div className="absolute bottom-8 left-8 rounded-3xl bg-white shadow-xl border border-gray-100 px-8 py-6">

              <h3 className="text-4xl font-black text-orange-500">
                Athlete
              </h3>

              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gray-500">
                First Mindset
              </p>

            </div>

          </motion.div>

          {/* Content */}

          <motion.div
            initial={{ opacity:0,x:50 }}
            whileInView={{ opacity:1,x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.8 }}
          >

            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm uppercase tracking-[0.25em] font-semibold text-orange-600">

              Founder Message

            </span>

            <h2 className="mt-8 text-4xl md:text-5xl lg:text-6xl font-black leading-tight">

              Why I Started
              <span className="block text-orange-500">
                NEXVOLT
              </span>

            </h2>

            <p className="mt-8 text-lg leading-9 text-gray-600">

              As an athlete, I realised that most supplements
              available in the market were created for bodybuilding,
              not for real athletic performance.

            </p>

            <p className="mt-8 text-lg leading-9 text-gray-600">

              I wanted to create a brand that genuinely supports
              speed, endurance, recovery and consistency—
              helping athletes unlock their full potential.

            </p>

            <p className="mt-8 text-lg leading-9 text-gray-600">

              NEXVOLT is more than a supplement company.

              It is a commitment to every athlete who dreams bigger.

            </p>
            {/* Signature */}

            <div className="mt-12">

              <h3 className="text-3xl font-black">
                NEXVOLT Founder
              </h3>

              <p className="mt-2 uppercase tracking-[0.25em] text-sm text-orange-500 font-semibold">
                Building India's Athlete Brand
              </p>

            </div>

            {/* Quote */}

            <div className="mt-12 rounded-[32px] border border-orange-200 bg-orange-50 p-8">

              <p className="text-2xl lg:text-3xl font-black leading-relaxed text-black">

                "Champions don't need hype.
                They need products they can trust."

              </p>

            </div>

            {/* CTA */}

            <div className="mt-12 flex flex-wrap gap-5">

              <button
                className="group inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 text-white font-semibold transition-all duration-300 hover:bg-orange-500"
              >

                Read Full Story

                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />

              </button>

              <a
                href="/products"
                className="rounded-full border border-gray-300 px-8 py-4 font-semibold transition-all duration-300 hover:border-black"
              >

                Explore Products

              </a>

            </div>

          </motion.div>

        </div>

        {/* Bottom Banner */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mt-28 rounded-[40px] bg-black p-12 lg:p-16 text-center"
        >

          <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold">

            Our Promise

          </p>

          <h3 className="mt-6 text-4xl lg:text-6xl font-black text-white leading-tight">

            Every Athlete
            <span className="block">
              Deserves Better Nutrition.
            </span>

          </h3>

          <p className="mt-8 max-w-3xl mx-auto text-lg leading-9 text-gray-400">

            Our mission is simple—build premium sports nutrition
            that helps athletes recover faster, perform stronger
            and compete with confidence.

          </p>

        </motion.div>

      </div>

    </section>
  );
}