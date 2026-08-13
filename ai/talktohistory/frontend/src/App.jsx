import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import LovePreloader from "./components/LovePreloader";
import ScrollToTop from "./components/ScrollToTop";
import BrandLogo from "./components/BrandLogo";
import ScreenshotGuard from "./components/ScreenshotGuard";
import HomePage from "./pages/HomePage";
import PreferPage from "./pages/PreferPage";
import PickPage from "./pages/PickPage";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";
import ChatRoomLobbyPage from "./pages/ChatRoomLobbyPage";
import ChatRoomCreatePage from "./pages/ChatRoomCreatePage";
import ChatRoomPage from "./pages/ChatRoomPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const [booting, setBooting] = useState(true);
  const finishBoot = useCallback(() => setBooting(false), []);

  return (
    <>
      <ScreenshotGuard />
      {booting && <LovePreloader durationMs={8000} onDone={finishBoot} />}

      <div className={booting ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-500"}>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/prefer" element={<><Navbar /><PreferPage /></>} />
            <Route path="/pick" element={<><Navbar /><PickPage /></>} />
            <Route path="/about" element={<><Navbar /><AboutPage /></>} />
            <Route path="/profile" element={<><Navbar /><ProfilePage /></>} />
            <Route path="/rooms" element={<><Navbar /><ChatRoomLobbyPage /></>} />
            <Route path="/rooms/new" element={<><Navbar /><ChatRoomCreatePage /></>} />
            <Route path="/rooms/:roomId" element={<ChatRoomPage />} />
            <Route path="/chat/:characterId" element={<ChatPage />} />
            <Route path="*" element={
              <>
                <Navbar />
                <div className="min-h-screen hero-bg flex items-center justify-center text-center px-4 pt-16">
                  <div>
                    <div className="mb-6 flex justify-center">
                      <BrandLogo className="text-3xl sm:text-4xl" />
                    </div>
                    <h1 className="font-headline text-4xl font-extrabold text-dark mb-4">Page Not Found</h1>
                    <p className="text-muted mb-8">This path went quiet. Let&apos;s get you back.</p>
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
