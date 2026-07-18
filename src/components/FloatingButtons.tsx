import { MessageCircle, Instagram } from "lucide-react";
import { motion } from "motion/react";

export function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100"
      >
        <Instagram className="w-5 h-5" />
      </motion.a>
      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
      >
        <MessageCircle className="w-5 h-5" />
      </motion.a>
    </div>
  );
}
