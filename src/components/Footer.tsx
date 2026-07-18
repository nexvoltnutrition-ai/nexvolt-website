import { Logo } from './Logo';
import { Link } from "react-router-dom";
import { Instagram, Youtube, Twitter, Facebook, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-20 pb-8 border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20 text-center lg:text-left">
          
          {/* Brand & Left content */}
          <div className="lg:col-span-4 pr-0 lg:pr-12 flex flex-col items-center lg:items-start">
            <div className="mb-6">
              <Logo dark to="/" />
            </div>
            <p className="text-[#888888] text-[14px] leading-relaxed max-w-[320px]">
              Premium sports nutrition engineered for athletes focused on strength, recovery, hydration, and elite performance.
            </p>
          </div>

          {/* Middle Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-10 text-left">
            <div>
               <h4 className="text-[12px] font-medium tracking-widest uppercase mb-6 text-white">Shop</h4>
               <ul className="space-y-4">
                 {['All Products', 'Best Sellers', 'New Launches', 'Compare Products', 'Bundles'].map(link => (
                   <li key={link}>
                     <Link to="#" className="text-[14px] text-[#888888] hover:text-white hover:translate-x-0.5 inline-block transition-all duration-300">
                       {link}
                     </Link>
                   </li>
                 ))}
               </ul>
            </div>
            <div>
               <h4 className="text-[12px] font-medium tracking-widest uppercase mb-6 text-white">Support</h4>
               <ul className="space-y-4">
                 {['Track Order', 'Shipping Policy', 'Return Policy', 'FAQs', 'Contact Us'].map(link => (
                   <li key={link}>
                     <Link to="#" className="text-[14px] text-[#888888] hover:text-white hover:translate-x-0.5 inline-block transition-all duration-300">
                       {link}
                     </Link>
                   </li>
                 ))}
               </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
               <h4 className="text-[12px] font-medium tracking-widest uppercase mb-6 text-white">Company</h4>
               <ul className="space-y-4">
                 {['About NEXVOLT', 'Journal / Blogs', 'Privacy Policy', 'Terms of Service', 'Careers'].map(link => (
                   <li key={link}>
                     <Link to="#" className="text-[14px] text-[#888888] hover:text-white hover:translate-x-0.5 inline-block transition-all duration-300">
                       {link}
                     </Link>
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* Right - Newsletter */}
          <div className="lg:col-span-3 text-left">
            <h4 className="text-[12px] font-medium tracking-[0.1em] uppercase mb-4 text-white">Join The Nexvolt Club</h4>
            <p className="text-[#888888] text-[13px] leading-relaxed mb-6">
              Get exclusive launches, athlete tips, performance content, and early access offers.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-[#111111] border border-[#2a2a2a] rounded-[4px] text-white px-4 py-3.5 text-[14px] focus:outline-none focus:border-[#555555] transition-colors placeholder-[#555555]"
                required
              />
              <button
                type="submit"
                className="bg-white text-black rounded-[4px] px-4 py-3.5 text-[13px] font-medium uppercase tracking-[0.1em] hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group"
              >
                Subscribe
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>

        {/* Social & Bottom Bar Container */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-[#1a1a1a] pt-10 gap-6">
          <div className="text-[13px] text-[#888888] order-3 md:order-1">
            &copy; {new Date().getFullYear()} NEXVOLT. All rights reserved.
          </div>
          
          <div className="flex space-x-8 order-2 md:order-2">
            <a href="#" className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
              <Instagram className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a href="#" className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="YouTube">
              <Youtube className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a href="#" className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Twitter">
              <Twitter className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a href="#" className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Facebook">
              <Facebook className="w-5 h-5" strokeWidth={1.5} />
            </a>
          </div>

          <div className="text-[12px] text-[#555555] tracking-[0.2em] uppercase font-medium order-1 md:order-3">
            Made for Peak Performance.
          </div>
        </div>
      </div>
    </footer>
  );
}
