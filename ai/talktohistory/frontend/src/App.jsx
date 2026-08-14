import { useState, useCallback, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import LovePreloader from "./components/LovePreloader";
import ScrollToTop from "./components/ScrollToTop";
import BrandLogo from "./components/BrandLogo";
import ScreenshotGuard from "./components/ScreenshotGuard";
import { LanguageProvider, useI18n } from "./i18n/LanguageContext";

const HomePage = lazy(() => import("./pages/HomePage"));
const PreferPage = lazy(() => import("./pages/PreferPage"));
const PickPage = lazy(() => import("./pages/PickPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ChatRoomLobbyPage = lazy(() => import("./pages/ChatRoomLobbyPage"));
const ChatRoomCreatePage = lazy(() => import("./pages/ChatRoomCreatePage"));
const ChatRoomPage = lazy(() => import("./pages/ChatRoomPage"));
const JoinRoomPage = lazy(() => import("./pages/JoinRoomPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const BOOT_KEY = "yallo:booted";

function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <Navbar />
      <div className="min-h-screen hero-bg flex items-center justify-center text-center px-4 pt-16">
        <div>
          <div className="mb-6 flex justify-center">
            <BrandLogo className="text-3xl sm:text-4xl" />
          </div>
          <h1 className="font-headline text-4xl font-extrabold text-dark mb-4">{t("notFound.title")}</h1>
          <p className="text-muted mb-8">{t("notFound.sub")}</p>
          <Link to="/" className="btn-glow text-white font-bold px-8 py-3 rounded-2xl inline-block">
            {t("notFound.home")}
          </Link>
        </div>
      </div>
    </>
  );
}

function PageFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(() => {
    try {
      return !sessionStorage.getItem(BOOT_KEY);
    } catch {
      return true;
    }
  });

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* ignore */
    }
    setBooting(false);
  }, []);

  return (
    <>
      <ScreenshotGuard />
      <LanguageProvider>
      {booting && <LovePreloader durationMs={2500} onDone={finishBoot} />}

      {!booting && (
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<><Navbar /><HomePage /></>} />
              <Route path="/prefer" element={<><Navbar /><PreferPage /></>} />
              <Route path="/pick" element={<><Navbar /><PickPage /></>} />
              <Route path="/about" element={<><Navbar /><AboutPage /></>} />
              <Route path="/profile" element={<><Navbar /><ProfilePage /></>} />
              <Route path="/rooms" element={<><Navbar /><ChatRoomLobbyPage /></>} />
              <Route path="/rooms/new" element={<><Navbar /><ChatRoomCreatePage /></>} />
              <Route path="/join/:roomId" element={<><Navbar /><JoinRoomPage /></>} />
              <Route path="/rooms/:roomId" element={<ChatRoomPage />} />
              <Route path="/chat/:characterId" element={<ChatPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
      </LanguageProvider>
    </>
  );
}
