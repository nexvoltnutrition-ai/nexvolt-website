import { Logo } from './Logo';
import { Link } from "react-router-dom";
import {
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-20 pb-8 border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">

          {/* Left */}
          <div className="lg:col-span-4 flex flex-col">

            <div className="mb-8">
              <Logo dark to="/" />
            </div>

            <div className="space-y-6">

              <div className="flex items-start gap-4">
                <MapPin
                  className="text-white mt-1 flex-shrink-0"
                  size={18}
                  strokeWidth={1.6}
                />

                <div className="text-[14px] leading-7 text-[#9a9a9a]">
                  <p>Indian Institute of Technology Kharagpur</p>
                  <p>Kharagpur – 721302</p>
                  <p>District: Paschim Medinipur</p>
                  <p>West Bengal, India</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone
                  className="text-white"
                  size={18}
                  strokeWidth={1.6}
                />

                <a
                  href="tel:+917987075837"
                  className="text-[14px] text-[#9a9a9a] hover:text-white transition-colors"
                >
                  +91 79870 75837
                </a>
              </div>

              <div className="flex items-center gap-4">
                <Mail
                  className="text-white"
                  size={18}
                  strokeWidth={1.6}
                />

                <a
                  href="mailto:nexvoltnutrition@gmail.com"
                  className="text-[14px] text-[#9a9a9a] hover:text-white transition-colors break-all"
                >
                  nexvoltnutrition@gmail.com
                </a>
              </div>

            </div>

          </div>

          {/* Middle */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-10">

            <div>
              <h4 className="text-[12px] font-medium tracking-widest uppercase mb-6 text-white">
                Shop
              </h4>

              <ul className="space-y-4">

                <li>
                  <Link
                    to="/products"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Products
                  </Link>
                </li>

                <li>
                  <Link
                    to="/best-sellers"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Best Sellers
                  </Link>
                </li>

                <li>
                  <Link
                    to="/compare"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Compare
                  </Link>
                </li>

                <li>
                  <Link
                    to="/blogs"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Blogs
                  </Link>
                </li>

                <li>
                  <Link
                    to="/track-order"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Track Order
                  </Link>
                </li>

              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-medium tracking-widest uppercase mb-6 text-white">
                Company
              </h4>

              <ul className="space-y-4">

                <li>
                  <Link
                    to="/about"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    About Us
                  </Link>
                </li>

                <li>
                  <Link
                    to="/contact"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Contact Us
                  </Link>
                </li>

                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/terms"
                    className="text-[14px] text-[#888888] hover:text-white transition-all duration-300"
                  >
                    Terms & Conditions
                  </Link>
                </li>

              </ul>
            </div>

          </div>

          {/* Right - Newsletter */}
          {/* Right - Newsletter */}
          <div className="lg:col-span-3 text-left">
            <h4 className="text-[12px] font-medium tracking-[0.1em] uppercase mb-4 text-white">
              Join The NEXVOLT Club
            </h4>

            <p className="text-[#888888] text-[13px] leading-relaxed mb-6">
              Get exclusive launches, athlete tips, performance content,
              nutrition insights, and early access to upcoming products.
            </p>

            <form
              className="flex flex-col space-y-3"
              onSubmit={(e) => e.preventDefault()}
            >
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

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-[#1a1a1a] pt-10 gap-6">

          <div className="text-[13px] text-[#888888] order-3 md:order-1">
            © {new Date().getFullYear()} NEXVOLT Nutrition. All Rights Reserved.
          </div>

          <div className="flex space-x-8 order-2">

            <a
              href="#"
              className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" strokeWidth={1.5} />
            </a>

            <a
              href="#"
              className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" strokeWidth={1.5} />
            </a>

            <a
              href="#"
              className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" strokeWidth={1.5} />
            </a>

            <a
              href="#"
              className="text-[#888888] hover:text-white transition-all duration-300 hover:-translate-y-1"
              aria-label="Facebook"
            >
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