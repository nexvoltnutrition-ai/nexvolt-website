import { motion } from "framer-motion";
import { Target, Zap, Trophy } from "lucide-react";

export function CompanyStory() {
  return (
    <section
      id="story"
      className="relative bg-white py-28 lg:py-36 overflow-hidden"
    >
      {/* Background Glow */}

      <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-orange-100 blur-[140px] opacity-40" />

      <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-orange-50 blur-[120px] opacity-70" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">

        {/* Section Badge */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2"
        >

          <Target className="w-4 h-4 text-orange-500" />

          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
            Our Story
          </span>

        </motion.div>

        {/* Heading */}

        <motion.h2
          initial={{ opacity:0,y:40 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          transition={{ delay:.15,duration:.7 }}
          className="mt-8 max-w-5xl text-4xl md:text-5xl lg:text-7xl font-black leading-tight"
        >

          Why We Built

          <span className="block text-orange-500">
            NEXVOLT.
          </span>

        </motion.h2>

        {/* Intro */}

        <motion.p
          initial={{ opacity:0,y:35 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          transition={{ delay:.3,duration:.7 }}
          className="mt-8 max-w-3xl text-lg leading-9 text-gray-600"
        >

          For years, athletes have been forced to choose products
          designed for bodybuilders instead of supplements built for
          real athletic performance.

          We believed that needed to change.

        </motion.p>

        {/* Story Grid */}

        <div className="grid lg:grid-cols-2 gap-20 items-center mt-24">

          {/* Left Story */}

          <motion.div
            initial={{ opacity:0,x:-50 }}
            whileInView={{ opacity:1,x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.8 }}
          >

            <div className="border-l-4 border-orange-500 pl-8">

              <p className="text-gray-700 text-lg leading-9">

                The supplement industry has spent decades building
                products for muscle size, aesthetics and bodybuilding.

              </p>

              <p className="mt-8 text-gray-700 text-lg leading-9">

                But runners, footballers, swimmers, cyclists,
                badminton players, cricketers and every competitive
                athlete require something completely different.

              </p>

              <p className="mt-8 text-gray-700 text-lg leading-9">

                Better endurance.

                Faster recovery.

                More explosive power.

                Greater consistency.

              </p>

            </div>

          </motion.div>

          {/* Right Cards */}

          <motion.div
            initial={{ opacity:0,x:50 }}
            whileInView={{ opacity:1,x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.8 }}
            className="space-y-6"
          >

            {/* Card */}

            <div className="rounded-3xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-500">

              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

                <Zap className="w-7 h-7 text-orange-500"/>

              </div>

              <h3 className="mt-6 text-2xl font-bold">

                Performance Over Appearance

              </h3>

              <p className="mt-4 leading-8 text-gray-600">

                Every NEXVOLT formula starts with athletic performance,
                not bodybuilding trends.

              </p>

            </div>

            {/* Card */}

            <div className="rounded-3xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-500">

              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

                <Trophy className="w-7 h-7 text-orange-500"/>

              </div>

              <h3 className="mt-6 text-2xl font-bold">

                Built For Competition

              </h3>

              <p className="mt-4 leading-8 text-gray-600">

                Whether you're preparing for district, national or
                international competition, our goal is to help you
                perform at your absolute best.

              </p>

            </div>
            {/* Quote */}

            <motion.div
              initial={{ opacity: 0, scale: .95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: .7 }}
              className="mt-16 rounded-[32px] bg-black p-10 text-white"
            >

              <p className="text-3xl lg:text-4xl font-black leading-tight">

                "We're not building another supplement company.

                We're building India's first athlete-first
                performance nutrition brand."

              </p>

            </motion.div>

          </motion.div>

        </div>

        {/* Timeline */}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mt-32"
        >

          <div className="grid md:grid-cols-4 gap-8">

            {/* Step 1 */}

            <div className="relative">

              <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                01
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                The Problem
              </h3>

              <p className="mt-4 text-gray-600 leading-8">
                Athletes had very few supplements specifically designed
                for performance instead of aesthetics.
              </p>

            </div>

            {/* Step 2 */}

            <div>

              <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                02
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Research
              </h3>

              <p className="mt-4 text-gray-600 leading-8">
                We studied athletes from multiple sports to understand
                their recovery, endurance and nutrition needs.
              </p>

            </div>

            {/* Step 3 */}

            <div>

              <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                03
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Development
              </h3>

              <p className="mt-4 text-gray-600 leading-8">
                Every product was designed around performance,
                consistency and clean ingredients.
              </p>

            </div>

            {/* Step 4 */}

            <div>

              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                04
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                NEXVOLT
              </h3>

              <p className="mt-4 text-gray-600 leading-8">
                A brand committed to helping athletes unlock their full
                potential through smarter sports nutrition.
              </p>

            </div>

          </div>

        </motion.div>

        {/* Bottom Banner */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mt-32 rounded-[40px] bg-gradient-to-r from-orange-500 to-orange-600 text-white p-10 lg:p-16"
        >

          <div className="grid lg:grid-cols-3 gap-10 text-center">

            <div>

              <h3 className="text-5xl font-black">
                19+
              </h3>

              <p className="mt-3 uppercase tracking-[0.2em] text-orange-100">
                Sports
              </p>

            </div>

            <div>

              <h3 className="text-5xl font-black">
                100%
              </h3>

              <p className="mt-3 uppercase tracking-[0.2em] text-orange-100">
                Athlete Focused
              </p>

            </div>

            <div>

              <h3 className="text-5xl font-black">
                1
              </h3>

              <p className="mt-3 uppercase tracking-[0.2em] text-orange-100">
                Mission
              </p>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}