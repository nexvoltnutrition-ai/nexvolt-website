import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FounderModalProps {
  open: boolean;
  onClose: () => void;
}

export function FounderModal({
  open,
  onClose,
}: FounderModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999]"
          />

          {/* Modal */}

          <motion.div
            initial={{ opacity: 0, y: 60, scale: .95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: .95 }}
            transition={{ duration: .35 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[36px] bg-white shadow-2xl">

              {/* Close */}

              <button
                onClick={onClose}
                className="absolute top-6 right-6 h-12 w-12 rounded-full bg-gray-100 hover:bg-orange-500 hover:text-white transition-all"
              >
                <X className="mx-auto" />
              </button>

              {/* Header */}

              <div className="p-12 border-b border-gray-100">

                <span className="uppercase tracking-[0.25em] text-orange-500 text-sm font-semibold">
                  Founder Story
                </span>

                <h2 className="mt-5 text-5xl font-black">
                  Why NEXVOLT Exists
                </h2>

              </div>

              {/* Content */}

              <div className="p-12 space-y-8 text-gray-600 leading-9 text-lg">

                <p>
                  NEXVOLT was born from a simple observation.
                  Most supplements available today are designed for
                  bodybuilding, while athletes across different sports
                  require completely different nutritional support.
                </p>

                <p>
                  Whether you're a sprinter, football player,
                  cricketer, cyclist or swimmer, your body demands
                  recovery, endurance and explosive performance—
                  not just muscle size.
                </p>

                <p>
                  That's why we started NEXVOLT.
                  Every product is created with one goal:
                  helping athletes perform better, recover faster
                  and compete with confidence.
                </p>

                <p>
                  This is only the beginning.
                  Our vision is to build India's most trusted
                  athlete-first sports nutrition brand.
                </p>

              </div>

              {/* Footer */}

              <div className="border-t border-gray-100 p-10 flex justify-between items-center">

                <div>

                  <h3 className="font-black text-2xl">
                    NEXVOLT Founder
                  </h3>

                  <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mt-2">
                    Built For Athletes
                  </p>

                </div>

                <button
                  onClick={onClose}
                  className="rounded-full bg-black text-white px-8 py-4 hover:bg-orange-500 transition-all"
                >
                  Close
                </button>

              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FounderModal;