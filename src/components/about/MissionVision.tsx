import { motion } from "framer-motion";
import { Target, Eye } from "lucide-react";

export function MissionVision() {
  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-28 lg:py-36">

      {/* Background */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[450px] w-[450px] rounded-full bg-orange-100 blur-[140px] opacity-40" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        {/* Heading */}

        <motion.div
          initial={{ opacity:0,y:30 }}
          whileInView={{ opacity:1,y:0 }}
          viewport={{ once:true }}
          transition={{ duration:.7 }}
          className="text-center"
        >

          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
            Mission & Vision
          </span>

          <h2 className="mt-8 text-4xl md:text-5xl lg:text-7xl font-black">

            More Than A
            <span className="block text-orange-500">
              Supplement Brand
            </span>

          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-gray-600">

            NEXVOLT isn't here to sell protein.

            We're here to build India's most trusted
            performance nutrition ecosystem for athletes.

          </p>

        </motion.div>

        {/* Cards */}

        <div className="grid lg:grid-cols-2 gap-10 mt-24">

          {/* Mission */}

          <motion.div
            initial={{ opacity:0,x:-40 }}
            whileInView={{ opacity:1,x:0 }}
            viewport={{ once:true }}
            transition={{ duration:.8 }}
            className="rounded-[36px] bg-white border border-gray-200 p-10 shadow-sm hover:shadow-2xl transition-all duration-500"
          >

            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">

              <Target className="w-8 h-8 text-orange-500"/>

            </div>

            <p className="mt-8 uppercase tracking-[0.3em] text-orange-500 text-sm font-semibold">
              OUR MISSION
            </p>

            <h3 className="mt-5 text-4xl font-black">

              Fuel Every Athlete
              To Perform Better.

            </h3>

            <p className="mt-8 text-lg leading-9 text-gray-600">

              We create premium sports nutrition designed for
              endurance, strength, recovery and peak athletic
              performance across every sport.

            </p>

            <ul className="mt-10 space-y-5">

              <li className="flex items-center gap-4">

                <span className="w-3 h-3 rounded-full bg-orange-500"/>

                <span>Performance-focused formulations</span>

              </li>

              <li className="flex items-center gap-4">

                <span className="w-3 h-3 rounded-full bg-orange-500"/>

                <span>Clean & transparent ingredients</span>

              </li>

              <li className="flex items-center gap-4">

                <span className="w-3 h-3 rounded-full bg-orange-500"/>

                <span>Built specifically for athletes</span>

              </li>

            </ul>

          </motion.div>
          {/* Vision Card */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="rounded-[36px] bg-black text-white p-10 hover:-translate-y-2 transition-all duration-500"
          >

            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center">

              <Eye className="w-8 h-8 text-white"/>

            </div>

            <p className="mt-8 uppercase tracking-[0.3em] text-orange-300 text-sm font-semibold">
              OUR VISION
            </p>

            <h3 className="mt-5 text-4xl font-black leading-tight">

              Build India's
              <br />
              Most Trusted
              <br />
              Athlete Brand.

            </h3>

            <p className="mt-8 text-lg leading-9 text-gray-300">

              Our vision is to become the performance partner of every
              athlete—from school competitions to the Olympic stage—
              through science-backed nutrition and unwavering quality.

            </p>

            <ul className="mt-10 space-y-5">

              <li className="flex items-center gap-4">

                <span className="w-3 h-3 rounded-full bg-orange-500"/>

                <span>Support every sport equally</span>

              </li>

              <li className="flex items-center gap-4">

                <span className="w-3 h-3 rounded-full bg-orange-500"/>

                <span>Innovate through sports science</span>

              </li>

              <li className="flex items-center gap-4">

                <span className="w-3 h-3 rounded-full bg-orange-500"/>

                <span>Create a global Indian brand</span>

              </li>

            </ul>

          </motion.div>

        </div>

        {/* Quote Section */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mt-28 rounded-[40px] border border-orange-200 bg-gradient-to-r from-orange-50 to-white p-10 lg:p-16"
        >

          <p className="text-center text-3xl lg:text-5xl font-black leading-tight text-black">

            "Champions aren't built by chance.

            They're built by discipline,
            consistency and the right fuel."

          </p>

        </motion.div>

        {/* Bottom Stats */}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-24"
        >

          <div className="text-center">

            <h3 className="text-5xl font-black text-orange-500">
              19+
            </h3>

            <p className="mt-3 uppercase tracking-[0.2em] text-gray-500">
              Sports
            </p>

          </div>

          <div className="text-center">

            <h3 className="text-5xl font-black">
              100%
            </h3>

            <p className="mt-3 uppercase tracking-[0.2em] text-gray-500">
              Athlete Focus
            </p>

          </div>

          <div className="text-center">

            <h3 className="text-5xl font-black">
              24×7
            </h3>

            <p className="mt-3 uppercase tracking-[0.2em] text-gray-500">
              Support
            </p>

          </div>

          <div className="text-center">

            <h3 className="text-5xl font-black">
              1
            </h3>

            <p className="mt-3 uppercase tracking-[0.2em] text-gray-500">
              Mission
            </p>

          </div>

        </motion.div>

      </div>

    </section>
  );
}