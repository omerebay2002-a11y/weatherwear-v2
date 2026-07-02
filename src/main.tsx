import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./contexts/AuthContext";
import { WardrobeProvider } from "./contexts/WardrobeContext";
import { markOnboarded } from "./lib/profile";
import { fitFigureToBase, setAvatarRender } from "./lib/avatar-store";
import "./index.css";

// Personalized one-off share links: open with ?avatar=<image-url> to land
// straight in the room as that figure (skips onboarding, seeds the wardrobe).
// The image lives at its own URL — nothing personal is committed to the repo.
(function teaserBootstrap() {
  try {
    // Read from the query OR the hash. Vercel's _vercel_share access redirect
    // strips the query string but preserves the #fragment, so share links use
    // #avatar=<url>.
    const fromQuery = new URLSearchParams(window.location.search).get("avatar");
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("avatar");
    const av = fromQuery || fromHash;
    if (!av) return;
    markOnboarded();
    void fitFigureToBase(av).then(setAvatarRender);
  } catch {
    /* ignore */
  }
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WardrobeProvider>
            <App />
          </WardrobeProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
