import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out font-sans">
        <div className="flex items-center justify-between p-4 border-b border-[#eaeaea]">
          <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty.</p>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
                className="bg-[#111111] text-white px-6 py-2 rounded-full font-medium hover:bg-black transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 border border-[#eaeaea] p-3 rounded-xl bg-white relative group">
                <Link to={`/product/${item.product.slug}`} onClick={() => setIsCartOpen(false)} className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#111111] line-clamp-1">{item.product.name}</h3>
                    <div className="text-sm text-gray-500">{item.product.category}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="font-bold text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.product.price)}</div>
                    <div className="flex items-center gap-2 border border-[#eaeaea] rounded-lg px-2 py-1 bg-gray-50">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="hover:text-black text-gray-500 p-0.5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="hover:text-black text-gray-500 p-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => removeFromCart(item.id, e)}
                  className="absolute -top-2 -right-2 bg-white border border-[#eaeaea] rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-[#eaeaea] bg-gray-50">
            <div className="flex items-center justify-between font-bold text-[#111111] mb-4 text-lg">
              <span>Subtotal</span>
              <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartTotal)}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/cart');
                }}
                className="flex-1 border-2 border-[#111111] text-[#111111] bg-white py-3 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                View Cart
              </button>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  // navigate('/checkout'); // Optional, fallback to cart for now
                  navigate('/cart');
                }}
                className="flex-1 bg-[#111111] text-white flex items-center justify-center gap-2 py-3 rounded-full font-bold hover:bg-black transition-colors shadow-lg shadow-black/10 hover:shadow-black/20"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
