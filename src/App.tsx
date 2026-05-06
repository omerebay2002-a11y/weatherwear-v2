import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppShell from "./components/layout/AppShell";
import Wardrobe from "./pages/Wardrobe";
import Today from "./pages/Today";
import SignInScreen from "./components/auth/SignInScreen";
import { useAuth } from "./contexts/AuthContext";
import MigrationBanner from "./components/auth/MigrationBanner";

export default function App() {
  const location = useLocation();
  const { userId, loading } = useAuth();

  if (loading) return null; // brief flicker while Firebase resolves session

  if (!userId) return <SignInScreen />;

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
