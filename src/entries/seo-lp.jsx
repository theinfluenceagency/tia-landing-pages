import React from "react";
import { createRoot } from "react-dom/client";
import SEOLandingPage from "../pages/seo/SEOLandingPage.jsx";

// Mounts into the Webflow embed: <div id="tia-lp-root" data-lp="seo"></div>
function mount() {
  const el = document.getElementById("tia-lp-root");
  if (!el) {
    console.warn("[tia-lp] #tia-lp-root not found, nothing mounted");
    return;
  }
  createRoot(el).render(<SEOLandingPage />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
