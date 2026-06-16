import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppShell from "./components/layout/AppShell";
import Wardrobe from "./pages/Wardrobe";
import Today from "./pages/Today";
import Avatar from "./pages/Avatar";
import SignInScreen from "./components/auth/SignInScreen";
import { useAuth } from "./contexts/AuthContext";
import MigrationBanner from "./components/auth/MigrationBanner";
import Onboarding from "./components/onboarding/Onboarding";
import { isOnboarded } from "./lib/profile";

export default function App() {
  const location = useLocation();
  const { userId, loading, configured } = useAuth();
  const [onboarded, setOnboarded] = useState(() => isOnboarded());

  if (loading) return null; // brief flicker while Supabase resolves session

  // Sign-in is required only when Supabase is configured.
  // Without env vars, the app runs locally with localStorage (offline mode).
  if (configured && !userId) return <SignInScreen />;

  // First-run: the onboarding game (selfie + style profile) before the app.
  if (!onboarded) return <Onboarding onDone={() => setOnboarded(true)} />;

  return (
    <>
      <MigrationBanner />
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Wardrobe />} />
            <Route path="/today" element={<Today />} />
            <Route path="/avatar" element={<Avatar />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </>
  );
}
