import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import LovePreloader from "./components/LovePreloader";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import PreferPage from "./pages/PreferPage";
import PickPage from "./pages/PickPage";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);

  return (
    <>
      {booting && <LovePreloader durationMs={4000} onDone={finishBoot} />}

      <div className={booting ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-500"}>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/prefer" element={<><Navbar /><PreferPage /></>} />
            <Route path="/pick" element={<><Navbar /><PickPage /></>} />
            <Route path="/about" element={<><Navbar /><AboutPage /></>} />
            <Route path="/chat/:characterId" element={<ChatPage />} />
            <Route path="*" element={
              <>
                <Navbar />
                <div className="min-h-screen hero-bg flex items-center justify-center text-center px-4 pt-16">
                  <div>
                    <div className="text-7xl mb-6 flex justify-center">
                      <img src="/flirt.png" alt="Flirt Net" className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="font-headline text-4xl font-extrabold text-dark mb-4">Page Not Found</h1>
                    <p className="text-muted mb-8">This spark went cold. Let&apos;s get you back.</p>
                    <Link to="/" className="btn-glow text-white font-bold px-8 py-3 rounded-2xl inline-block">
                      Go Home
                    </Link>
                  </div>
                </div>
              </>
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}
