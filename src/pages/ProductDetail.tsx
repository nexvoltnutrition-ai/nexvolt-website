import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Zap, ShieldCheck, Dumbbell, Activity, Check, Heart, Share2, Plus, Minus } from "lucide-react";
import { BestSellers } from "../components/BestSellers";
import { Product, VariantOption, VariantCategory } from "../data/products";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";

const FLAVOR_STYLES: Record<string, string> = {
  f_chocolate: "bg-[#4E342E]",
  f_mango: "bg-[#FFB300]",
  f_cookies_cream: "bg-[#E0E0E0]",
  f_cold_coffee: "bg-[#795548]",
  f_vanilla: "bg-[#FFF9C4]",
  f_unflavored: "bg-[#F5F5F5]",
  f_watermelon: "bg-[#FF5252]",
  f_blue_raspberry: "bg-[#448AFF]",
  f_fruity_punch: "bg-[#FF4081]",
  f_lemon_lime: "bg-[#CDDC39]",
  f_green_apple: "bg-[#8BC34A]",
  f_pineapple: "bg-[#FFEB3B]",
  f_grape: "bg-[#9C27B0]",
  default: "bg-[#111111]"
};

const TABS = ["Description", "Ingredients", "How to Use", "Reviews"];

export function ProductDetail() {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  // Fallback to first if products available but slug not found
  const product = products.find((p) => p.slug === slug) || products[0];

  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantOption>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Description");
  const [pincode, setPincode] = useState("");

  // Initialize selected variants when product changes
  useEffect(() => {
    if (!product) return;
    if (product.variants) {
      const initial: Record<string, VariantOption> = {};
      product.variants.forEach((category) => {
        if (category.options?.length > 0) {
          initial[category.id] = category.options[0];
        }
      });
      setSelectedVariants(initial);
    } else {
      setSelectedVariants({});
    }
    setActiveImageIndex(0);
    setQuantity(1);
  }, [product]);

  const handleVariantChange = (categoryId: string, option: VariantOption) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [categoryId]: option,
    }));
    setActiveImageIndex(0); // Reset image index on variant change
  };

  // Find the currently active SKU variant combination
  const activeSku = useMemo(() => {
    if (!product.skuVariants || product.skuVariants.length === 0) return null;
    
    return product.skuVariants.find(sku => {
      // Check if this SKU matches all selected variants
      return Object.entries(selectedVariants).every(([categoryId, option]) => {
        return sku.attributes[categoryId] === (option as VariantOption).id;
      });
    }) || product.skuVariants[0]; // fallback to first if none matches perfectly
  }, [product, selectedVariants]);

  const handleAddToCart = () => {
    if (activeSku?.stock === 0) return;
    // Map selected variants to cart item product properties
    const cartProduct = { ...product };
    // update image for cart based on active SKU if needed
    if (activeSku && activeSku.images && activeSku.images.length > 0) {
       cartProduct.image = activeSku.images[0];
    }
    addToCart(cartProduct, quantity);
  };

  const handleBuyNow = () => {
    if (activeSku?.stock === 0) return;
    const cartProduct = { ...product };
    if (activeSku && activeSku.images && activeSku.images.length > 0) {
       cartProduct.image = activeSku.images[0];
    }
    addToCart(cartProduct, quantity, false);
    navigate('/checkout', { state: { isBuyNow: true } });
  };

  // Determine current price
  const currentPrice = activeSku?.price ?? product.price;

  // Simulate an old price for demonstration (usually 20-30% higher)
  const oldPrice = Math.floor(currentPrice * 1.25);
  const discountPercent = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);

  // Determine stock
  const currentStock = activeSku?.stock ?? (product.inStock ? 50 : 0);

  // Build gallery from active SKU or product
  const gallery = useMemo(() => {
    let images = [];
    if (activeSku?.images && activeSku.images.length > 0) {
      images = activeSku.images;
    } else if (product.gallery && product.gallery.length > 0) {
      images = product.gallery;
    } else {
      images = [product.image];
    }
    
    // Ensure all images are unique and filter out empty ones
    return Array.from(new Set(images.filter(Boolean)));
  }, [activeSku, product]);

  const dynamicTitle = useMemo(() => {
    const parts = [product.name];
    if (selectedVariants['flavor']) parts.push(selectedVariants['flavor'].name);
    if (selectedVariants['weight']) parts.push(selectedVariants['weight'].name);
    return parts.join(" | ");
  }, [product.name, selectedVariants]);

  return (
    <div className="pt-8 pb-16 md:py-16 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[12px] sm:text-[13px] text-[#888888] mb-8 uppercase tracking-wider font-medium">
          <Link to="/" className="hover:text-[#f47c20] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#f47c20] transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-[#111111] truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-20">
          
          {/* LEFT SIDE: Image Gallery & Rich Content */}
          <div className="lg:col-span-7 flex flex-col gap-12">
            
            <div className="flex flex-col-reverse sm:flex-row gap-4 h-fit">
              {/* Thumbnails (Vertical on desktop/tablet, Horizontal on small mobile) */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible w-full sm:w-20 lg:w-24 shrink-0 no-scrollbar py-1">
                {gallery.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative aspect-[3/4] sm:aspect-square rounded-md overflow-hidden bg-[#f4f4f4] cursor-pointer transition-all duration-300 ${activeImageIndex === i ? 'ring-2 ring-[#f47c20] border-transparent' : 'border border-[#eaeaea] hover:border-[#cccccc]'}`}
                  >
                     <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-[#f4f4f4] rounded-lg overflow-hidden border border-[#eaeaea] relative group aspect-[4/5] sm:aspect-auto sm:h-[600px] lg:h-[700px]">
                <img 
                  src={gallery[activeImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-cover sm:object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.15] origin-center"
                />
              </div>
            </div>

            {/* PRODUCT HIGHLIGHTS */}
            <div className="border-t border-[#eaeaea] pt-10">
               <h3 className="text-[20px] font-bold text-[#111111] mb-6">Why Athletes Choose This</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {[
                   { icon: Zap, title: "Faster Recovery" },
                   { icon: Activity, title: "Improved Performance" },
                   { icon: Star, title: "Trusted By Athletes" },
                   { icon: ShieldCheck, title: "Lab Tested" },
                   { icon: Dumbbell, title: "Premium Ingredients" },
                   { icon: Check, title: "Zero Filler" }
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col items-start p-4 bg-[#fcfcfc] border border-[#eaeaea] rounded-xl hover:border-[#cccccc] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#eaeaea] shadow-sm flex items-center justify-center mb-3">
                         <item.icon className="w-5 h-5 text-[#111111]" />
                      </div>
                      <span className="text-[14px] font-bold text-[#111111] leading-tight">{item.title}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* NEXAI SECTION */}
            <div 
              onClick={() => window.dispatchEvent(new Event('open-nexai'))}
              className="border-2 border-transparent bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-2xl overflow-hidden group cursor-pointer hover:border-[#f47c20]/50 transition-colors shadow-xl relative"
            >
               <div className="absolute inset-0 bg-[#f47c20] opacity-0 group-hover:opacity-5 transition-opacity blur-xl"></div>
               <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 relative z-10 gap-4">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-[#f47c20] fill-[#f47c20]" />
                     </div>
                     <div>
                        <h4 className="text-[16px] font-bold text-white tracking-wide uppercase">Ask NEXAI About This Product</h4>
                        <p className="text-[13px] text-[#a0a0a0] mt-0.5">Performance & nutrition intelligence for {product.name}</p>
                     </div>
                  </div>
                  <button className="w-full sm:w-auto px-6 py-2.5 bg-[#f47c20] text-white text-[13px] font-bold uppercase tracking-wider rounded-lg shadow-[0_4px_14px_rgba(244,124,32,0.3)] group-hover:bg-[#d66a18] group-hover:-translate-y-0.5 transition-all">
                     Consult AI
                  </button>
               </div>
               <div className="px-6 py-5 bg-white/5 relative z-10">
                  <p className="text-[12px] font-bold text-white/50 uppercase tracking-widest mb-4">Suggested Queries</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       "Is this right for my sport?",
                       "When should I take this?",
                       "What should I combine it with?",
                       "Who should avoid this product?"
                     ].map((q, i) => (
                       <span key={i} className="text-[13px] text-[#d0d0d0] flex items-center bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#f47c20] mr-3 shrink-0"></span> {q}
                       </span>
                     ))}
                  </div>
               </div>
            </div>

            {/* ATHLETE USE CASES */}
            <div>
               <h3 className="text-[16px] font-bold uppercase tracking-widest text-[#888888] mb-4">Best For These Disciplines</h3>
               <div className="flex flex-wrap gap-2">
                 {["Cricket", "Football", "Athletics", "Marathon", "HYROX", "CrossFit"].map((sport, i) => (
                   <span key={i} className="px-4 py-2 border border-[#eaeaea] bg-white rounded-full text-[14px] font-bold text-[#111111] hover:border-[#111111] transition-colors cursor-default shadow-sm">
                     {sport}
                   </span>
                 ))}
               </div>
            </div>

            {/* QUICK TRUST */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#eaeaea] pt-8">
               {[
                 "Lab Tested", "Authentic Product", "Fast Shipping", "Quality Assured"
               ].map((trust, i) => (
                 <div key={i} className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-8 h-8 flex justify-center items-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    </div>
                    <span className="text-[12px] font-bold uppercase text-[#111111]">{trust}</span>
                 </div>
               ))}
            </div>

          </div>

          {/* RIGHT SIDE: Product Info */}
          <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-0">
            {/* Standard Brand generic text */}
            <h4 className="text-[#f47c20] text-[13px] font-bold tracking-[0.15em] mb-2 uppercase">
              NEXVOLT PREMIER
            </h4>

            {/* Dynamic Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#111111] mb-4 leading-[1.1]">
              {dynamicTitle}
            </h1>

            {/* Ratings */}
            <div className="flex items-center space-x-4 mb-6">
               <div className="flex bg-[#f8f8f8] px-3 py-1.5 rounded-full items-center">
                  <Star className="w-4 h-4 fill-[#f47c20] text-[#f47c20] mr-1.5" />
                  <span className="text-[14px] font-bold text-[#111111]">{product.rating}</span>
               </div>
               <span className="text-[14px] text-[#666666] underline decoration-[#eaeaea] underline-offset-4 cursor-pointer hover:text-[#111111] hover:decoration-[#111111] transition-colors">
                 ({product.reviews} authentic reviews)
               </span>
            </div>

            {/* Pricing Section */}
            <div className="flex flex-col mb-8 p-5 bg-[#fcfcfc] border border-[#f0f0f0] rounded-xl">
              <div className="flex items-end space-x-3 mb-1">
                <span className="text-3xl font-bold text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(currentPrice)}</span>
                <span className="text-lg text-[#999999] line-through mb-1">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(oldPrice)}</span>
                <span className="bg-[#f47c20]/10 text-[#f47c20] px-2 py-1 text-[12px] font-bold uppercase tracking-wider rounded-md mb-1.5">
                  Save {discountPercent}%
                </span>
              </div>
              <span className="text-[12px] text-[#777777]">Inclusive of all taxes</span>
            </div>
            
            {/* Dynamic Variants */}
            {product.variants?.map((category) => {
              // FLAVOR SELECTOR
              if (category.id === 'flavor') {
                return (
                  <div key={category.id} className="mb-8">
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#111111]">
                        Select {category.name}
                      </h3>
                      <span className="text-[14px] font-medium text-[#f47c20]">
                        {selectedVariants[category.id]?.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {category.options.map((option) => {
                        const isActive = selectedVariants[category.id]?.id === option.id;
                        const bgColor = FLAVOR_STYLES[option.id] || FLAVOR_STYLES.default;
                        
                        return (
                          <button 
                            key={option.id}
                            onClick={() => handleVariantChange(category.id, option)}
                            className={`flex items-center p-2 rounded-lg border-2 transition-all duration-300 ${
                              isActive 
                              ? 'border-[#f47c20] bg-white ring-1 ring-[#f47c20]/20' 
                              : 'border-[#eaeaea] bg-white hover:border-[#cccccc]'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full shrink-0 shadow-inner ${bgColor} border border-black/5`}></span>
                            <span className={`ml-3 text-[13px] font-medium text-left leading-tight ${isActive ? 'text-[#111111]' : 'text-[#666666]'}`}>
                              {option.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              // WEIGHT SELECTOR
              if (category.id === 'weight') {
                return (
                  <div key={category.id} className="mb-8">
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#111111]">
                        Select {category.name}
                      </h3>
                      <span className="text-[14px] font-medium text-[#f47c20]">
                        {selectedVariants[category.id]?.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {category.options.map((option) => {
                        const isActive = selectedVariants[category.id]?.id === option.id;
                        return (
                          <button 
                            key={option.id}
                            onClick={() => handleVariantChange(category.id, option)}
                            className={`px-6 py-2.5 rounded-full border transition-all duration-300 text-[14px] font-bold ${
                              isActive 
                              ? 'border-[#111111] bg-[#111111] text-white shadow-md' 
                              : 'border-[#eaeaea] text-[#555555] hover:border-[#111111] hover:text-[#111111] bg-white'
                            }`}
                          >
                            {option.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // FALLBACK (other generic variants)
              return (
                <div key={category.id} className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#111111]">
                      {category.name}: <span className="text-[#f47c20] text-[14px] ml-1">{selectedVariants[category.id]?.name}</span>
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {category.options.map((option) => (
                      <button 
                        key={option.id}
                        onClick={() => handleVariantChange(category.id, option)}
                        className={`px-5 py-2.5 rounded-md border transition-all duration-300 text-[13px] font-medium ${
                          selectedVariants[category.id]?.id === option.id 
                          ? 'border-[#111111] bg-[#111111] text-white' 
                          : 'border-[#eaeaea] text-[#666666] hover:border-[#111111] hover:text-[#111111] bg-white'
                        }`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Stock indicator inside main flow */}
            <div className="mb-4 h-6 flex items-center text-[13px] font-bold">
              {currentStock > 0 ? (
                <span className="text-[#00C853] flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C853]"></span>
                  </span>
                  In Stock & Ready to Ship
                </span>
              ) : (
                <span className="text-[#FF5252] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5252]"></span>
                  Currently out of stock
                </span>
              )}
            </div>

            {/* CTA's */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center justify-between border-2 border-[#111111] rounded-xl bg-white w-full sm:w-32 h-[56px] px-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-2xl text-[#888888] hover:text-[#111111] transition-colors p-1"
                ><Minus className="w-4 h-4" strokeWidth={3} /></button>
                <span className="text-[16px] font-bold text-[#111111]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="text-2xl text-[#888888] hover:text-[#111111] transition-colors p-1"
                ><Plus className="w-4 h-4" strokeWidth={3} /></button>
              </div>
              
              <button 
                disabled={currentStock === 0}
                onClick={handleAddToCart}
                className={`flex-1 h-[56px] rounded-xl flex items-center justify-center text-[14px] font-bold tracking-widest uppercase transition-all duration-300 shadow-md ${
                  currentStock > 0 
                  ? 'bg-[#111111] text-white hover:bg-[#333333] hover:shadow-lg hover:-translate-y-0.5' 
                  : 'bg-[#e5e5e5] text-[#888888] cursor-not-allowed shadow-none'
                }`}
              >
                {currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {currentStock > 0 && (
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 h-[56px] rounded-xl flex items-center justify-center text-[14px] font-bold tracking-widest uppercase transition-all duration-300 bg-[#f47c20] text-white hover:bg-[#d96a17] hover:shadow-lg hover:-translate-y-0.5 shadow-md"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Delivery Checker */}
            <div className="bg-[#fcfcfc] border border-[#f0f0f0] rounded-xl p-5 mb-6">
              <h4 className="flex items-center text-[14px] font-bold text-[#111111] mb-3">
                <MapPin className="w-4 h-4 mr-2 text-[#f47c20]" /> Check Delivery
              </h4>
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={pincode}
                   onChange={(e) => setPincode(e.target.value)}
                   placeholder="Enter Pincode"
                   className="flex-1 border border-[#eaeaea] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] transition-colors"
                 />
                 <button className="px-6 rounded-lg bg-[#ffffff] border-2 border-[#111111] text-[#111111] font-bold text-[13px] hover:bg-[#111111] hover:text-white transition-colors">
                   CHECK
                 </button>
              </div>
            </div>

            {/* Product Tabs */}
            <div className="w-full">
              <div className="flex space-x-6 border-b border-[#eaeaea] mb-6 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-[14px] font-bold tracking-wide uppercase whitespace-nowrap transition-colors relative ${
                      activeTab === tab ? 'text-[#111111]' : 'text-[#888888] hover:text-[#444444]'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f47c20]"></span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="min-h-[150px] text-[#555555] text-[14px] leading-relaxed">
                {activeTab === "Description" && (
                  <p>{product.description || product.benefit}. Scientifically formulated to deliver maximum performance and faster recovery. Each scoop provides ultra-pure fuel for your muscles, helping you push through the hardest sets and build lean mass effectively.</p>
                )}
                {activeTab === "Ingredients" && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Primary Component (100% pure)</li>
                    <li>Natural & Artificial Flavors</li>
                    <li>Digestive Enzyme Blend</li>
                    <li>Zero Added Sugar</li>
                  </ul>
                )}
                {activeTab === "How to Use" && (
                  <p>Mix 1 scoop with 200-250ml of cold water or milk. Shake well before consuming. For best results, take one serving immediately after your workout or first thing in the morning on non-training days.</p>
                )}
                {activeTab === "Reviews" && (
                  <div className="flex items-center justify-center h-full text-[#888888] italic">
                    Loading {product.reviews} customer reviews...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t border-[#eaeaea] pt-16 bg-[#fcfcfc]">
         <BestSellers />
      </div>
    </div>
  );
}

