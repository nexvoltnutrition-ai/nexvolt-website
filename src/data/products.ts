export type VariantOption = {
  id: string;
  name: string;
  price?: number; // Override price
  oldPrice?: number;
  inStock?: boolean;
  image?: string; // Specific image for this variant
};

export type VariantCategory = {
  id: string; // 'flavor', 'weight', 'packaging', 'size', etc
  name: string; // 'Flavor', 'Weight', 'Packaging', 'Size'
  options: VariantOption[];
};

export type ProductVariantCombination = {
  id: string;
  sku: string;
  attributes: Record<string, string>; // e.g. { flavor: 'Chocolate', weight: '1kg' }
  price: number;
  stock: number;
  images: string[];
};

export type Product = {
  images?: string[];
  brand?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  image6?: string;
  short_description?: string;
  sale_price?: number;
  featured?: boolean;
  best_seller?: boolean;
  active?: boolean;
  id: string | number;
  name: string;
  benefit: string;
  description?: string;
  price: number; // Base price
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string; // Main image
  gallery?: string[]; // Additional images
  category: string;
  goal: string;
  sport: string;
  sports?: string[];
  badge?: string;
  inStock: boolean;
  stock?: number;
  isNew: boolean;
  slug: string;
  dateAdded: string;
  variants?: VariantCategory[];
  skuVariants?: ProductVariantCombination[];
};

const FLAVORS_CREATINE_PRE = [
  { id: 'f_unflavored', name: 'Unflavoured' },
  { id: 'f_watermelon', name: 'Watermelon Burst' },
  { id: 'f_blue_raspberry', name: 'Blue Raspberry' },
  { id: 'f_fruity_punch', name: 'Fruity Punch' },
  { id: 'f_lemon_lime', name: 'Lemon Lime' },
  { id: 'f_green_apple', name: 'Green Apple' },
  { id: 'f_pineapple', name: 'Pineapple' },
  { id: 'f_grape', name: 'Grape' },
];

const FLAVORS_PROTEIN = [
  { id: 'f_chocolate', name: 'Chocolate' },
  { id: 'f_mango', name: 'Mango' },
  { id: 'f_cookies_cream', name: 'Cookies & Cream' },
  { id: 'f_cold_coffee', name: 'Cold Coffee' },
  { id: 'f_vanilla', name: 'Vanilla' },
  { id: 'f_unflavored', name: 'Unflavoured' },
];

const WEIGHTS_250_500 = [
  { id: 'w_250', name: '250g', price: 1200 },
  { id: 'w_500', name: '500g', price: 2000 },
];

const WEIGHTS_1_2_KG = [
  { id: 'w_1000', name: '1kg', price: 3600 },
  { id: 'w_2000', name: '2kg', price: 6400 },
];

const PACKAGING_POUCH_TUB = [
  { id: 'p_pouch', name: 'Pouch Ziplock' },
  { id: 'p_tub', name: 'Tub/Dabba' },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Creatine Monohydrate",
    benefit: "Strength & Power Output",
    description: "Pure, unadulterated creatine monohydrate to fuel your muscles, enhance strength, and support intense workouts.",
    price: 1200,
    rating: 4.9,
    reviews: 412,
    image: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=800",
    ],
    category: "Creatine",
    goal: "Strength",
    sport: "Gym Training",
    badge: "Best Seller",
    inStock: true,
    isNew: false,
    slug: "creatine-monohydrate",
    dateAdded: "2023-01-01",
    variants: [
      {
        id: 'flavor',
        name: 'Flavour',
        options: FLAVORS_CREATINE_PRE
      },
      {
        id: 'weight',
        name: 'Weight',
        options: WEIGHTS_250_500
      },
      {
        id: 'packaging',
        name: 'Packaging',
        options: PACKAGING_POUCH_TUB
      }
    ]
  },
  {
    id: 2,
    name: "Whey Protein",
    benefit: "Advanced Muscle Repair",
    description: "Premium whey protein for optimal muscle growth and recovery. Fast-absorbing and easy to digest.",
    price: 3600,
    rating: 4.8,
    reviews: 310,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800",
    category: "Protein",
    goal: "Muscle Growth",
    sport: "Gym Training",
    inStock: true,
    isNew: false,
    slug: "whey-protein",
    dateAdded: "2023-02-15",
    variants: [
      {
        id: 'flavor',
        name: 'Flavour',
        options: FLAVORS_PROTEIN
      },
      {
        id: 'weight',
        name: 'Weight',
        options: WEIGHTS_1_2_KG
      },
      {
        id: 'packaging',
        name: 'Packaging',
        options: [
          { id: 'p_pouch', name: 'Pouch' },
          { id: 'p_tub', name: 'Tub/Dabba' },
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Isolate Protein",
    benefit: "Ultra-Pure Muscle Recovery",
    description: "Ultra-filtered whey isolate delivering maximum protein content with near-zero fat and carbs.",
    price: 4400,
    rating: 4.9,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    category: "Protein",
    goal: "Muscle Growth",
    sport: "Gym Training",
    badge: "Top Rated",
    inStock: true,
    isNew: false,
    slug: "isolate-protein",
    dateAdded: "2023-05-10",
    variants: [
      {
        id: 'flavor',
        name: 'Flavour',
        options: FLAVORS_PROTEIN
      },
      {
        id: 'weight',
        name: 'Weight',
        options: WEIGHTS_1_2_KG
      },
      {
        id: 'packaging',
        name: 'Packaging',
        options: [
          { id: 'p_pouch', name: 'Pouch' },
          { id: 'p_tub', name: 'Tub/Dabba' },
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Casein Protein",
    benefit: "Sustained Amino Acid Release",
    description: "Slow-digesting micellar casein to feed your muscles during sleep and prolonged periods of fasting.",
    price: 3840,
    rating: 4.7,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1511295742362-92c96b5ade36?auto=format&fit=crop&q=80&w=800",
    category: "Protein",
    goal: "Recovery",
    sport: "Gym Training",
    inStock: true,
    isNew: false,
    slug: "casein-protein",
    dateAdded: "2023-08-20",
    variants: [
      {
        id: 'flavor',
        name: 'Flavour',
        options: FLAVORS_PROTEIN
      },
      {
        id: 'weight',
        name: 'Weight',
        options: WEIGHTS_1_2_KG
      },
      {
        id: 'packaging',
        name: 'Packaging',
        options: [
          { id: 'p_pouch', name: 'Pouch' },
          { id: 'p_tub', name: 'Tub/Dabba' },
        ]
      }
    ]
  },
  {
    id: 5,
    name: "Pre-Workout",
    benefit: "Explosive Energy & Focus",
    description: "Advanced pre-workout engine formulated for peak performance, razor-sharp focus, and intense pumps.",
    price: 2800,
    rating: 4.8,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
    category: "Pre-Workout",
    goal: "Energy",
    sport: "Gym Training",
    badge: "Trending",
    inStock: true,
    isNew: false,
    slug: "pre-workout",
    dateAdded: "2023-03-10",
    variants: [
      {
        id: 'flavor',
        name: 'Flavour',
        options: FLAVORS_CREATINE_PRE
      },
      {
        id: 'variant',
        name: 'Size / Packaging',
        options: [
          { id: 'pv_300g', name: '300g Tub', price: 2800 },
          { id: 'pv_30s', name: 'Box of 30 Sachets', price: 3200 },
          { id: 'pv_15s', name: 'Starter Pack (15 Sachets)', price: 1760 },
          { id: 'pv_1s', name: 'Single Sachet', price: 160 },
        ]
      }
    ]
  },
  {
    id: 6,
    name: "Hydration + Recovery",
    benefit: "Critical Intra-Workout Fuel",
    description: "Premium ORS-inspired hydration formula packed with essential electrolytes and amino acids for peak endurance.",
    price: 2400,
    rating: 4.9,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1622618991746-fea00234ce5d?auto=format&fit=crop&q=80&w=800",
    category: "Hydration",
    goal: "Hydration",
    sport: "Running",
    inStock: true,
    isNew: false,
    slug: "hydration-recovery",
    dateAdded: "2023-06-15",
    variants: [
      {
        id: 'variant',
        name: 'Packaging',
        options: [
          { id: 'hr_30s', name: 'Sachet Box (30 Sachets)', price: 2400 },
          { id: 'hr_500g', name: '500g Tub', price: 2240 },
        ]
      }
    ]
  },
  {
    id: 7,
    name: "Training Gums",
    benefit: "Instant Workout Energy",
    description: "Performance chewing gum engineered to deliver clean, fast-acting energy right when you need it.",
    price: 800,
    rating: 4.6,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&q=80&w=800",
    category: "Performance Energy",
    goal: "Energy",
    sport: "Gym Training",
    badge: "New Launch",
    inStock: true,
    isNew: true,
    slug: "training-gums",
    dateAdded: "2024-05-01",
    variants: [
      {
        id: 'variant',
        name: 'Pack Size',
        options: [
          { id: 'tg_10', name: 'Performance Gum Pouch (10 gums)', price: 800 },
          { id: 'tg_30', name: 'Performance Gum Bottle (30 gums)', price: 2000 },
        ]
      }
    ]
  }
];

// Ensure all products have realistic 4-image galleries
const COMMON_GALLERY = [
  "https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800"
];

PRODUCTS.forEach(product => {
  if (!product.gallery) {
    product.gallery = [];
  }
  // Remove the main image from gallery if it's there to avoid it counting towards length before Set
  const existingGallery = product.gallery.filter(img => img !== product.image);
  
  // Fill up to 3 extra images so with the main image we have 4
  const needed = 3 - existingGallery.length;
  if (needed > 0) {
    product.gallery = [...existingGallery, ...COMMON_GALLERY.slice(0, needed)];
  } else {
    product.gallery = existingGallery;
  }

  // Generate flat SKU combinations
  if (product.variants && product.variants.length > 0) {
    product.skuVariants = [];
    
    // Helper to generate cartesian product
    const generateCombinations = (
      categories: VariantCategory[],
      currentIndex: number,
      currentAttributes: Record<string, string>,
      currentPrice: number
    ) => {
      if (currentIndex === categories.length) {
        // Base images are product image + gallery
        let variantImages = [product.image, ...product.gallery!];
        
        // Let's create an illusion of different products by swapping the main image based on flavor
        if (currentAttributes['flavor']) {
          const flavorId = currentAttributes['flavor'];
          // map some IDs to distinct images so the UI shows an image change on click!
          if (flavorId.includes('chocolate')) variantImages[0] = "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('mango')) variantImages[0] = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('cookies_cream')) variantImages[0] = "https://images.unsplash.com/photo-1622618991746-fea00234ce5d?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('cold_coffee')) variantImages[0] = "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('vanilla')) variantImages[0] = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('watermelon')) variantImages[0] = "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('blue_raspberry')) variantImages[0] = "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('unflavored')) variantImages[0] = "https://images.unsplash.com/photo-1511295742362-92c96b5ade36?auto=format&fit=crop&q=80&w=800";
          else if (flavorId.includes('lemon_lime')) variantImages[0] = "https://images.unsplash.com/photo-1622618991746-fea00234ce5d?auto=format&fit=crop&q=80&w=800";
        }

        product.skuVariants!.push({
          id: `sku_${product.id}_${Object.values(currentAttributes).join('-')}`,
          sku: `SKU-${product.id}-${Object.values(currentAttributes).map(v => v.slice(0, 3).toUpperCase()).join('-')}`,
          attributes: { ...currentAttributes },
          price: currentPrice,
          stock: Math.floor(Math.random() * 50) + 5, // Random stock 5-54 for realism
          images: variantImages
        });
        return;
      }

      const category = categories[currentIndex];
      category.options.forEach(option => {
        const newAttributes = { ...currentAttributes, [category.id]: option.id };
        // Use option price if provided, otherwise bubble current up
        const newPrice = option.price ?? currentPrice;
        generateCombinations(categories, currentIndex + 1, newAttributes, newPrice);
      });
    };

    generateCombinations(product.variants, 0, {}, product.price);
  } else {
    product.skuVariants = [{
      id: `sku_${product.id}_default`,
      sku: `SKU-${product.id}-DEF`,
      attributes: {},
      price: product.price,
      stock: 42,
      images: [product.image, ...product.gallery!]
    }];
  }
});
