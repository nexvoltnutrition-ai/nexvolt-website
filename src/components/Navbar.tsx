import { Logo } from './Logo';
import { motion, AnimatePresence } from "motion/react";
import { Search, Heart, User, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchOverlay } from "./SearchOverlay";
import { useCart } from "../context/CartContext";

const MENU_ITEMS = [
  { name: "Products", path: "/products" },
  { name: "Best Sellers", path: "/best-sellers" },
  { name: "NEX AI", path: "/nexai" },
  { name: "About Us", path: "/about" },
  { name: "Blogs", path: "/blogs" },
  { name: "Track Order", path: "/track-order" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#eaeaea] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-[74px] md:h-[90px]">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 w-[190px] sm:w-auto">
              <Logo to="/" onClick={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 lg:space-x-12">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="group relative text-[14px] font-medium text-[#111111] transition-colors py-1 uppercase tracking-[0.05em]"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#111111] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
              <button 
                className="text-[#111111] hover:text-[#555555] transition-colors flex items-center justify-center"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </button>
              <Link to="/wishlist" className="hidden sm:flex text-[#111111] hover:text-[#555555] transition-colors items-center justify-center">
                <Heart className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </Link>
              <Link to="/account" className="hidden sm:flex text-[#111111] hover:text-[#555555] transition-colors items-center justify-center">
                <User className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </Link>
              <button onClick={() => setIsCartOpen(true)} className="text-[#111111] hover:text-[#555555] transition-colors relative flex items-center justify-center">
                <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.75} />
                <span className="absolute -top-1.5 -right-2 bg-[#111111] text-white text-[9px] font-medium h-[16px] w-[16px] min-w-[16px] min-h-[16px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center ml-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-[#111111] hover:text-[#555555] focus:outline-none flex items-center justify-center"
                >
                  {isMobileMenuOpen ? (
                     <X className="h-[22px] w-[22px]" strokeWidth={1.75} />
                  ) : (
                     <Menu className="h-7 w-7" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-white border-t border-[#eaeaea] shadow-lg absolute w-full"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {MENU_ITEMS.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-2 py-3 text-[14px] font-medium text-[#111111] uppercase tracking-[0.05em] border-b border-[#f5f5f5] hover:pl-4 transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex space-x-6 px-2 py-6 mt-2">
                  <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-[#111111] hover:text-[#555555] flex items-center text-[13px] font-medium uppercase tracking-[0.05em]">
                     <User className="h-[22px] w-[22px] mr-3" strokeWidth={1.75} /> Profile
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-[#111111] hover:text-[#555555] flex items-center text-[13px] font-medium uppercase tracking-[0.05em]">
                     <Heart className="h-[22px] w-[22px] mr-3" strokeWidth={1.75} /> Wishlist
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
