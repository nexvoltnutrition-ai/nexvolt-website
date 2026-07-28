import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import {
  Trophy,
  Dumbbell,
  Users,
  ShieldCheck,
} from "lucide-react";

export function AchievementCounter() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    {
      icon: Trophy,
      value: 19,
      suffix: "+",
      title: "Sports Supported",
      description:
        "Nutrition solutions built for athletes across multiple sports.",
    },
    {
      icon: Dumbbell,
      value: 6,
      suffix: "+",
      title: "Premium Products",
      description:
        "Carefully formulated products focused on athletic performance.",
    },
    {
      icon: Users,
      value: 100,
      suffix: "%",
      title: "Athlete Focus",
      description:
        "Every decision starts with improving athletic performance.",
    },
    {
      icon: ShieldCheck,
      value: 24,
      suffix: "/7",
      title: "Support",
      description:
        "Dedicated support for every athlete on their journey.",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-black py-28 lg:py-36"
    >
      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-orange-500/20 blur-[160px]" />

        <div className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full bg-orange-400/10 blur-[160px]" />

      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="text-center"
        >

          <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-5 py-2 text-sm uppercase tracking-[0.3em] text-orange-400">

            Our Impact

          </span>

          <h2 className="mt-8 text-4xl md:text-5xl lg:text-7xl font-black text-white">

            Numbers That
            <span className="block text-orange-500">
              Define NEXVOLT
            </span>

          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-gray-300">

            Built with a single purpose—
            helping athletes unlock better performance every day.

          </p>

        </motion.div>

        {/* Stats Grid */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
        {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.7,
                }}
                className="group rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-orange-500/40 hover:bg-white/10 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">

                  <Icon className="w-8 h-8 text-orange-500" />

                </div>

                <h3 className="mt-8 text-5xl font-black text-white">

                  {inView && (
                    <CountUp
                      end={stat.value}
                      duration={2}
                    />
                  )}

                  {stat.suffix}

                </h3>

                <h4 className="mt-4 text-xl font-bold text-white">
                  {stat.title}
                </h4>

                <p className="mt-4 leading-8 text-gray-400">
                  {stat.description}
                </p>

              </motion.div>
            );
          })}
        </div>

        {/* Bottom Quote */}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mt-24 text-center"
        >

          <h3 className="text-3xl lg:text-5xl font-black text-white leading-tight">

            Every Number Represents
            <span className="block text-orange-500">
              An Athlete's Dream.
            </span>

          </h3>

          <p className="mt-8 max-w-3xl mx-auto text-lg leading-9 text-gray-400">

            Behind every product is countless hours of research,
            testing and refinement—because athletes deserve
            supplements built for performance, not marketing.

          </p>

        </motion.div>

      </div>

    </section>
  );
}