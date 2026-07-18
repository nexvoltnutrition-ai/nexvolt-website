import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Product } from "../data/products";

export interface ProductContextType {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  refreshProducts: async () => {},
});

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").order('id', { ascending: false });
      
      if (error) {
        console.error("Error fetching products from Supabase:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mappedProducts: any[] = data
          .filter((sp: any) => sp.active !== false && sp.deleted !== true)
          .map((sp: any) => {
          const gallery = [sp.image1, sp.image2, sp.image3, sp.image4, sp.image5, sp.image6].filter(Boolean);
          
          const price = sp.sale_price && sp.sale_price < sp.price ? sp.sale_price : sp.price;
          const oldPrice = sp.sale_price && sp.sale_price < sp.price ? sp.price : undefined;

          // Note: using default variants if not present in DB to keep the UI functional
          return {
            id: sp.id,
            name: sp.name,
            benefit: sp.short_description || sp.description || sp.name,
            description: sp.description,
            price: price || 0,
            oldPrice: oldPrice,
            category: sp.category || "General",
            sport: sp.sport || "All",
            inStock: sp.stock > 0,
            stock: sp.stock || 0,
            badge: sp.badges || "",
            image: sp.image1 || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800",
            gallery: gallery,
            slug: sp.slug,
            dateAdded: sp.created_at,
            rating: sp.rating || 5,
            reviews: sp.reviews || 0,
            isNew: false,
          };
        });
        setProducts(mappedProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
