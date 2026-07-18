import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    benefit: string;
    price: number;
    oldPrice?: number;
    rating?: number;
    reviews?: number;
    image: string;
    gallery?: string[];
    badge?: string;
    slug: string;
    inStock?: boolean;
    isNew?: boolean;
    category?: string;
    description?: string;
    goal?: string;
    sport?: string;
  };
  layoutMode?: 'carousel' | 'collection-4' | 'collection-3';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layoutMode = 'carousel' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { customerData } = useAuth();
  
  const inStock = product.inStock !== false;
  const rating = product.rating || 5;

  const isCollection = layoutMode === 'collection-3' || layoutMode === 'collection-4';
  const isGrid3 = layoutMode === 'collection-3';

  const images = Array.from(new Set([product.image, ...(product.gallery || [])])).filter(Boolean);
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasMultipleImages && !isHovered) {
      timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [hasMultipleImages, isHovered, images.length]);

  useEffect(() => {
    if (customerData) {
      const stored = localStorage.getItem(`wishlist_${customerData.id}`);
      if (stored) {
         const ids = JSON.parse(stored);
         setIsWishlisted(ids.includes(product.id));
      }
    }
  }, [customerData, product.id]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock) {
      const cartProduct: any = {
         ...product,
         category: product.category || 'Nutrition',
         goal: product.goal || '',
         sport: product.sport || '',
         description: product.description || product.benefit,
         dateAdded: new Date().toISOString()
      };
      addToCart(cartProduct, 1);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customerData) {
       alert("Please log in to save to your wishlist.");
       return;
    }
    
    const key = `wishlist_${customerData.id}`;
    let ids = [];
    try {
       const stored = localStorage.getItem(key);
       if (stored) ids = JSON.parse(stored);
    } catch(e) {}
    
    if (isWishlisted) {
       setIsWishlisted(false);
       ids = ids.filter((id: any) => id !== product.id);
       localStorage.setItem(key, JSON.stringify(ids));
    } else {
       setIsWishlisted(true);
       if (!ids.includes(product.id)) ids.push(product.id);
       localStorage.setItem(key, JSON.stringify(ids));
    }
  };

  return (
    <div className={`flex flex-col relative z-0 ${isCollection ? 'h-full' : ''}`}>
      {/* Image Section */}
      <div 
        className={`relative bg-[#f6f6f6] overflow-hidden rounded-md cursor-pointer group/image ${isGrid3 ? 'aspect-[3/4] lg:aspect-[2/3]' : 'aspect-[3/4]'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button 
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
           <Heart className={`w-[18px] h-[18px] ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#111111] hover:text-[#FF6A00]'}`} />
        </button>
        {product.badge && (
          <div className="absolute top-3 left-3 z-30 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-[4px] bg-white text-black shadow-sm">
            {product.badge}
          </div>
        )}
        {!inStock && (
          <div className="absolute top-12 left-3 z-30 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-[4px] bg-black text-white">
            Sold Out
          </div>
        )}
        
        <Link to={`/product/${product.slug}`} className="block w-full h-full relative">
          {images.map((img, idx) => {
            const isCurrent = idx === currentImageIndex;
            let opacityClass = 'opacity-0 z-0';
            if (isCurrent) {
              opacityClass = !inStock ? 'opacity-50 z-10' : 'opacity-100 z-10';
            }
            return (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply transition-all duration-500 ease-in-out group-hover/image:scale-[1.04] ${!inStock ? 'grayscale' : ''} ${opacityClass}`}
              />
            );
          })}
        </Link>

        {/* Nav arrows (visible on hover) */}
        {hasMultipleImages && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 hover:bg-white text-black shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 hover:bg-white text-black shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots (visible on hover) */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
            {images.map((_, idx) => (
              <div 
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentImageIndex ? 'w-3 bg-black' : 'w-1.5 bg-black/30 hover:bg-black/50'}`}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`${isGrid3 ? 'pt-6' : isCollection ? 'pt-5' : 'pt-4'} flex flex-col flex-grow`}>
        <div className={`flex items-center space-x-1 ${isGrid3 ? 'mb-3' : 'mb-2'}`}>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-[12px] h-[12px] ${i < Math.floor(rating) ? 'fill-[#111111] text-[#111111]' : 'fill-[#eaeaea] text-[#eaeaea]'}`} />
            ))}
          </div>
          <span className="text-[12px] text-[#888888] ml-1">({product.reviews || 0})</span>
        </div>
        
        <Link to={`/product/${product.slug}`} className={`text-[15px] font-medium text-black leading-snug hover:underline block truncate ${isCollection ? 'mb-2' : ''}`}>
          {product.name}
        </Link>
        <p className={`text-[13px] text-[#666666] truncate leading-relaxed ${isGrid3 ? 'mb-6' : isCollection ? 'mb-4' : 'mb-3'}`}>
          {product.benefit}
        </p>
        
        <div className={`flex items-center gap-2 ${isGrid3 ? 'mb-8' : isCollection ? 'mb-6' : 'mb-4'}`}>
          <span className="text-[15px] font-bold text-black">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}</span>
          {product.oldPrice && (
            <span className="text-[13px] text-[#888888] line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.oldPrice)}</span>
          )}
        </div>
        
        <button 
          disabled={!inStock}
          onClick={handleAddToCart}
          className={`mt-auto w-full py-3.5 rounded-[4px] text-[12px] font-bold tracking-wider uppercase transition-colors duration-300 ${inStock ? 'bg-black text-white hover:bg-[#222222]' : 'bg-[#f5f5f5] text-[#aaaaaa] cursor-not-allowed'}`}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
