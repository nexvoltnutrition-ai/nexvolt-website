import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";


export function Hero() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeroSlides() {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('enabled', true)
          .order('sort_order', { ascending: true });
          
        if (error) {
          console.error("Hero Slider query error:", error);
          throw error;
        }

        console.log(`Hero Slider: Fetched ${data ? data.length : 0} enabled slides from database.`);
        
        if (data && data.length > 0) {
          setBanners(data.map(s => {
            const img = s.desktop_image || s.mobile_image;
            console.log(`Hero Slider: Slide ${s.id} image URL:`, img);
            return {
              id: s.id,
              image: img, 
              mobileImage: s.mobile_image,
              text: s.headline || "Welcome to NEXVOLT",
              subText: s.sub_heading || "",
              buttonText: s.button_text || "Shop Now",
              link: s.button_link || "/products"
            };
          }));
        } else { console.log("Hero Slider: No enabled slides found."); setBanners([]); }
      } catch (err) { console.error("Error fetching hero slides:", err); setBanners([]); } finally {
        setLoading(false);
      }
    }
    fetchHeroSlides();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, banners.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToSlide = (idx: number) => {
    if (idx !== currentSlide) {
      setDirection(idx > currentSlide ? 1 : -1);
      setCurrentSlide(idx);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
    }),
    center: {
      x: "0%",
      zIndex: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      zIndex: 0,
    }),
  };
  
  if (loading) {
    return <section className="w-full bg-[#f8f8f8] animate-pulse h-[55vh] sm:h-[50vh] md:h-[450px] lg:h-[500px] xl:h-[550px] min-h-[400px] max-h-[600px] flex items-center justify-center"></section>;
  }

  if (banners.length === 0) {
    return (
      <section className="w-full bg-black text-white py-24 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to NEXVOLT</h1>
          <p className="text-gray-400">Please add hero slides in the admin panel.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white flex justify-center">
      <div className="relative w-full max-w-[1600px] mx-auto h-[55vh] sm:h-[50vh] md:h-[450px] lg:h-[500px] xl:h-[550px] min-h-[400px] max-h-[600px] overflow-hidden group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
            style={{ willChange: "transform" }}
          >
            {/* Image (Clickable) */}
            <Link to={banners[currentSlide].link || "/products"} className="absolute inset-0 w-full h-full block bg-[#f8f8f8]">
              <picture>
                {banners[currentSlide].mobileImage && (
                  <source media="(max-width: 768px)" srcSet={banners[currentSlide].mobileImage} />
                )}
                <img
                  src={banners[currentSlide].image}
                  alt="Hero Banner"
                  className="w-full h-full object-cover object-center lg:object-[center_35%]"
                  onError={(e) => { console.error(`Hero Slider: Failed to load image: ${e.currentTarget.src}`); }}
                />
              </picture>
            </Link>

          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
