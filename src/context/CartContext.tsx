import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../data/products';

export interface CartItem {
  id: string;
  productId: number | string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: Product, quantity?: number, openCart?: boolean) => void;
  removeFromCart: (id: string, e?: React.MouseEvent) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  isCartOpen: false,
  setIsCartOpen: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartTotal: 0,
  loading: true
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        const localCart = localStorage.getItem('guest_cart');
        
        let initialCart: CartItem[] = [];
        
        if (metadata && metadata.cart) {
          initialCart = metadata.cart as CartItem[];
        }
        
        if (localCart) {
           const parsedLocal = JSON.parse(localCart) as CartItem[];
           parsedLocal.forEach(localItem => {
              const existing = initialCart.find(i => i.id === localItem.id);
              if (existing) {
                 existing.quantity += localItem.quantity;
              } else {
                 initialCart.push(localItem);
              }
           });
           localStorage.removeItem('guest_cart');
           await supabase.auth.updateUser({
               data: { cart: initialCart }
           });
        }
        setCart(initialCart);
      } else {
        const localCart = localStorage.getItem('guest_cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
      }
      setLoading(false);
    }
    loadCart();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'SIGNED_IN') {
          loadCart();
       } else if (event === 'SIGNED_OUT') {
          setCart([]);
       }
    });

    return () => {
      authListener.subscription.unsubscribe();
    }
  }, []);

  async function syncCartToSupabase(newCart: CartItem[]) {
     const { data: { session } } = await supabase.auth.getSession();
     if (session?.user) {
        await supabase.auth.updateUser({
           data: { cart: newCart }
        });
     } else {
        localStorage.setItem('guest_cart', JSON.stringify(newCart));
     }
  }

  function addToCart(product: Product, quantity = 1, openCart = true) {
    setCart(prev => {
      let newCart = [...prev];
      const cartItemId = product.id.toString(); 
      const existingIndex = newCart.findIndex(item => item.id === cartItemId);
      
      let availableStock = product.stock ?? (product.inStock ? 50 : 0);
      
      if (existingIndex >= 0) {
        const newQuantity = newCart[existingIndex].quantity + quantity;
        newCart[existingIndex] = {
           ...newCart[existingIndex],
           quantity: newQuantity > availableStock ? availableStock : newQuantity,
           product: product
        };
      } else {
        if (availableStock > 0) {
          newCart.push({
            id: cartItemId,
            productId: product.id,
            product,
            quantity: quantity > availableStock ? availableStock : quantity,
          });
        }
      }
      
      syncCartToSupabase(newCart);
      if (openCart) {
        setIsCartOpen(true);
      }
      return newCart;
    });
  }

  function removeFromCart(id: string, e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== id);
      syncCartToSupabase(newCart);
      return newCart;
    });
  }

  function updateQuantity(id: string, quantity: number) {
    setCart(prev => {
      const newCart = prev.map(item => {
        if (item.id === id) {
          let availableStock = item.product.stock ?? (item.product.inStock ? 50 : 0);
          let newQuantity = quantity;
          if (newQuantity > availableStock) newQuantity = availableStock;
          if (newQuantity < 1) newQuantity = 1;
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      syncCartToSupabase(newCart);
      return newCart;
    });
  }

  function clearCart() {
    setCart([]);
    syncCartToSupabase([]);
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + ((item.product.price || 0) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
