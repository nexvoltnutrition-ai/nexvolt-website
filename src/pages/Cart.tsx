import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center min-h-[60vh] bg-[#fcfcfc]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-[#111111] mb-2 tracking-tight">Your Cart is Empty</h1>
        <p className="text-[#666666] mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/products"
          className="bg-[#111111] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[13px] hover:bg-black hover:-translate-y-0.5 shadow-lg transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24 font-sans bg-[#fcfcfc] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111111] mb-12 flex items-center gap-4">
          <ShoppingBag className="w-8 h-8 opacity-80" />
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            {cart.map((item) => (
              <div key={item.id} className="flex bg-white border border-[#eaeaea] p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
                <Link to={`/product/${item.product.slug}`} className="w-32 h-32 bg-[#f8f8f8] rounded-xl flex-shrink-0 overflow-hidden border border-[#f0f0f0]">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </Link>
                <div className="ml-6 flex-grow flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${item.product.slug}`} className="text-[18px] font-bold text-[#111111] leading-tight hover:underline">
                      {item.product.name}
                    </Link>
                    <button 
                      onClick={(e) => removeFromCart(item.id, e)}
                      className="text-[#888888] hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 bg-gray-50 rounded-full opacity-60 hover:opacity-100 hover:bg-red-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[13px] font-medium text-[#888888] uppercase tracking-wider mb-2">
                    {item.product.category}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 border-2 border-[#eaeaea] rounded-xl bg-gray-50 h-12 px-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#111] hover:bg-white rounded-lg transition-colors shadow-sm bg-white border border-[#eaeaea]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-[15px] font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#111] hover:bg-white rounded-lg transition-colors shadow-sm bg-white border border-[#eaeaea]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[20px] font-bold text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format((item.product.price * item.quantity))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#eaeaea] rounded-2xl p-8 h-fit shadow-lg shadow-black/5 sticky top-32">
            <h2 className="text-[20px] font-black tracking-tight text-[#111111] mb-6">Order Summary</h2>
            <div className="space-y-4 text-[15px] mb-6 border-b border-[#eaeaea] pb-6">
              <div className="flex justify-between items-center">
                <span className="text-[#666666] font-medium">Subtotal</span>
                <span className="font-bold text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666666] font-medium">Shipping</span>
                <span className="text-[#f47c20] font-bold text-[13px] uppercase tracking-wider bg-[#f47c20]/10 px-2 py-1 rounded">Free</span>
              </div>
            </div>
            <div className="flex justify-between items-end mb-8">
              <span className="font-medium text-[#666666]">Total</span>
              <span className="text-3xl font-black text-[#111111]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartTotal)}</span>
            </div>
            <Link 
              to="/checkout" 
              className="flex items-center justify-center w-full bg-[#111111] text-white py-4 rounded-xl text-[14px] font-bold uppercase tracking-widest hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Secure Checkout
            </Link>
            <div className="mt-4 text-center">
              <p className="text-[#888888] text-[12px] flex items-center justify-center gap-1">
                Tax calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
