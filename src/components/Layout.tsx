import { Outlet } from "react-router-dom";
import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";
import { ScrollToTop } from "./ScrollToTop";
import { TrustMarquee } from "./TrustMarquee";
import { NEXAIAssistant } from "./NEXAIAssistant";
import { CartDrawer } from "./CartDrawer";

export function Layout() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#111111] overflow-x-hidden selection:bg-[#111111] selection:text-white flex flex-col">
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <TrustMarquee />
      <Footer />
      <FloatingButtons />
      <NEXAIAssistant />
      <CartDrawer />
    </div>
  );
}
