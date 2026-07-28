import { motion } from "framer-motion";
import {
  ShieldCheck,
  Trophy,
  Zap,
  HeartHandshake,
} from "lucide-react";

export function CoreValues() {
  return (
    <section className="relative bg-white py-28 lg:py-36 overflow-hidden">

      {/* Background */}

      <div className="absolute -right-32 top-20 h-[450px] w-[450px] rounded-full bg-orange-100 blur-[150px] opacity-40" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">

        {/* Heading */}

        <motion.div
          initial={{ opacity:0,y:30 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          transition={{ duration:.7 }}
          className="text-center"
        >

          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">

            Core Values

          </span>

          <h2 className="mt-8 text-4xl md:text-5xl lg:text-7xl font-black">

            What Drives

            <span className="block text-orange-500">
              Everything We Do
            </span>

          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-gray-600">

            Every product, every decision and every innovation at
            NEXVOLT is guided by principles that put athletes first.

          </p>

        </motion.div>

        {/* Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">

          {/* Card 1 */}

          <motion.div
            initial={{ opacity:0,y:40 }}
            whileInView={{ opacity:1,y:0 }}
            viewport={{ once:true }}
            transition={{ duration:.6 }}
            className="group rounded-[32px] border border-gray-200 p-8 hover:-translate-y-3 hover:shadow-2xl transition-all duration-500"
          >

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

              <ShieldCheck className="w-8 h-8 text-orange-500"/>

            </div>

            <h3 className="mt-8 text-2xl font-bold">

              Integrity

            </h3>

            <p className="mt-5 text-gray-600 leading-8">

              Honest ingredients, transparent labels and zero shortcuts.

            </p>

          </motion.div>

          {/* Card 2 */}

          <motion.div
            initial={{ opacity:0,y:40 }}
            whileInView={{ opacity:1,y:0 }}
            viewport={{ once:true }}
            transition={{ delay:.15,duration:.6 }}
            className="group rounded-[32px] border border-gray-200 p-8 hover:-translate-y-3 hover:shadow-2xl transition-all duration-500"
          >

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

              <Zap className="w-8 h-8 text-orange-500"/>

            </div>

            <h3 className="mt-8 text-2xl font-bold">

              Innovation

            </h3>

            <p className="mt-5 text-gray-600 leading-8">

              Science-backed nutrition designed for modern athletes.

            </p>

          </motion.div>
          {/* Card 3 */}

          <motion.div
            initial={{ opacity:0,y:40 }}
            whileInView={{ opacity:1,y:0 }}
            viewport={{ once:true }}
            transition={{ delay:.3,duration:.6 }}
            className="group rounded-[32px] border border-gray-200 p-8 hover:-translate-y-3 hover:shadow-2xl transition-all duration-500"
          >

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

              <Trophy className="w-8 h-8 text-orange-500"/>

            </div>

            <h3 className="mt-8 text-2xl font-bold">

              Excellence

            </h3>

            <p className="mt-5 text-gray-600 leading-8">

              Every formula is crafted to help athletes perform at
              their highest level, every single day.

            </p>

          </motion.div>

          {/* Card 4 */}

          <motion.div
            initial={{ opacity:0,y:40 }}
            whileInView={{ opacity:1,y:0 }}
            viewport={{ once:true }}
            transition={{ delay:.45,duration:.6 }}
            className="group rounded-[32px] border border-gray-200 p-8 hover:-translate-y-3 hover:shadow-2xl transition-all duration-500"
          >

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

              <HeartHandshake className="w-8 h-8 text-orange-500"/>

            </div>

            <h3 className="mt-8 text-2xl font-bold">

              Athlete First

            </h3>

            <p className="mt-5 text-gray-600 leading-8">

              Every decision begins with one simple question —
              will this genuinely help athletes perform better?

            </p>

          </motion.div>

        </div>

        {/* Premium Quote */}

        <motion.div
          initial={{ opacity:0,y:40 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          transition={{ duration:.8 }}
          className="mt-28 rounded-[40px] bg-black text-white p-12 lg:p-16 text-center"
        >

          <p className="text-3xl lg:text-5xl font-black leading-tight">

            "Success isn't built overnight.

            It's built through thousands of disciplined decisions."

          </p>

          <div className="mt-10 w-24 h-1 bg-orange-500 mx-auto rounded-full" />

        </motion.div>

        {/* Bottom CTA Banner */}

        <motion.div
          initial={{ opacity:0,scale:.96 }}
          whileInView={{ opacity:1,scale:1 }}
          viewport={{ once:true }}
          transition={{ duration:.8 }}
          className="mt-20 rounded-[40px] bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 p-12 lg:p-16 text-white"
        >

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div>

              <p className="uppercase tracking-[0.3em] text-orange-100 text-sm font-semibold">
                OUR PROMISE
              </p>

              <h3 className="mt-6 text-4xl lg:text-5xl font-black leading-tight">

                We Never Compromise
                On Athlete Performance.

              </h3>

            </div>

            <div>

              <p className="text-lg leading-9 text-orange-50">

                From ingredient selection to product development,
                our commitment remains the same — creating premium
                sports nutrition that athletes can trust with confidence.

              </p>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}