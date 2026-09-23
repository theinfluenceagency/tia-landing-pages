import React from "react";
import { createRoot } from "react-dom/client";
import AEOLandingPage from "../pages/aeo/AEOLandingPage.jsx";

// Mounts into the Webflow embed: <div id="tia-lp-root" data-lp="aeo"></div>
function mount() {
  const el = document.getElementById("tia-lp-root");
  if (!el) {
    console.warn("[tia-lp] #tia-lp-root not found, nothing mounted");
    return;
  }
  createRoot(el).render(<AEOLandingPage />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
