import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppShell from "./components/layout/AppShell";
import Wardrobe from "./pages/Wardrobe";
import Today from "./pages/Today";
import SignInScreen from "./components/auth/SignInScreen";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import { useAuth } from "./contexts/AuthContext";
import { useWardrobe } from "./contexts/WardrobeContext";
import { isOnboarded } from "./lib/profile";
import MigrationBanner from "./components/auth/MigrationBanner";

export default function App() {
  const location = useLocation();
  const { userId, loading, configured } = useAuth();
  const { items, loading: wardrobeLoading } = useWardrobe();
  const [onboarded, setOnboarded] = useState(isOnboarded);

  if (loading || wardrobeLoading) return null; // brief flicker while session/wardrobe resolve

  // Sign-in is required only when Firebase is configured.
  // Without env vars, the app runs locally with localStorage (offline mode).
  if (configured && !userId) return <SignInScreen />;

  // First run: the questionnaire game seeds the wardrobe. Users who already
  // have items (e.g. synced from the cloud) skip it.
  if (!onboarded && items.length === 0) {
    return <OnboardingFlow onComplete={() => setOnboarded(true)} />;
  }

  return (
    <>
      <MigrationBanner />
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Wardrobe />} />
            <Route path="/today" element={<Today />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </>
  );
}
