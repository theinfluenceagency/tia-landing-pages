import React, { useState, useEffect } from "react";
import WebflowFormSlot, { trackConversion } from "../../lib/webflowForm.jsx";

// Where the bundle and its own assets are served from. Set VITE_ASSET_BASE at build time
// (the jsDelivr URL for a tagged release). Defaults to the site root for local preview.
const ASSET_BASE = import.meta.env.VITE_ASSET_BASE || "/";
import { Search, FileText, MapPin, Sparkles, Award, Users, BarChart3, Check, AlertCircle } from "lucide-react";

/*
  TIA SEO Services PPC Landing Page
  Design system extracted from the live page at theinfluenceagency.com/influencer-marketing-lp
  (computed styles, not approximated). See PROJECT_INSTRUCTIONS.md for the token table.

  Typeface:   sofia-pro (Adobe Fonts kit mfz5gdk), Poppins as fallback
  Headings:   weight 900, line-height 1.1, letter-spacing normal
  Buttons:    pill (radius 500px), gradient 315deg yellow -> pink, weight 400, sentence case
  Cards:      radius 16px, padding 32px
  Sections:   padding 64px 32px, big blocks round to 64px at the top
  Shadows:    hard "sticker" 0 4px 0 #333, or soft 0 16px 16px -8px

  EVERY figure on this page is sourced from TIA's own live site. See README.md for the
  source of each one. Nothing here is estimated.
*/

// ---------------------------------------------------------------------------
// Brand tokens (values read off the live site)
// ---------------------------------------------------------------------------
const PINK = "#FF1177";
const PINK_BLOCK = "#F41177";
const YELLOW = "#FFD800";
const BLUE = "#0185B6";
const CYAN = "#00EAFF";
const INK = "#333333";
const PAGE_BG = "#F7F7F7";
const WHITE = "#FFFFFF";
const PINK_WASH = "#FFF1F7";
// The live site ships two gradient variants. This is the one where pink reaches full
// saturation by 46%, which keeps white button labels legible. The variant that holds
// yellow to 75% fails contrast under the text.
const GRAD = `linear-gradient(315deg, ${YELLOW}, ${PINK} 46%)`;

// TIA's own Webflow CDN. All imagery below is TIA's live, hosted asset.
const CDN = "https://cdn.prod.website-files.com/6322067826f43f0806c08b96/";
const asset = (f) => CDN + f;

const TIA_LOGO = asset("63dae34511c039c22bbdaa7d_Frame.svg");

// ---------------------------------------------------------------------------
// FORM / TRACKING CONFIG — verified against the live site on 2026-09-17
// ---------------------------------------------------------------------------
// Lead notifications go to sales@theinfluenceagency.com. Where that address is
// actually configured depends on how this page ships:
//   - Webflow native form  -> Webflow Site Settings > Forms (site-wide default),
//                             or the per-form notification setting. NOT in markup.
//   - Custom endpoint      -> set FORM_ENDPOINT below and have the handler send to it.
// The address is recorded here so it is not lost in handoff, but setting this
// constant alone does NOT deliver email. See README.md.
const FORM_RECIPIENT = "sales@theinfluenceagency.com";
const FORM_ENDPOINT = ""; // e.g. "/api/seo-lp-lead". Empty = no backend wired yet.

// The live Google Ads account (customer 9139882964) counts its lead conversions with
// WEBPAGE-type conversion actions, which fire on a destination URL, not on a JS event:
//   - "Google ads Lead Form Thank You - Request a Quote"  (primary goal)
//   - "Google ads Lead Form Thank You Page"               (primary goal)
// An inline success state has no URL change, so those existing conversions would never
// fire. Redirecting to a real thank-you page reuses the tracking that already works.
// Leave empty to fall back to the inline success state (and rely on the dataLayer event).
// Slug matches TIA's existing LP convention: the influencer LP pairs /influencer-marketing-lp
// with /influencer-marketing-lp-thank-you, both at the site root. Not a nested path.
const THANK_YOU_URL = "/seo-lp-thank-you";

// Lead Legend is installed site-wide but its snippet binds to specific form IDs only
// (currently wf-form-Contact-Form and wf-form-Get-a-Quote-Form-2). This form uses its
// own ID so it does not pollute those forms' reporting, which means the Lead Legend
// snippet MUST be updated to include this ID or submissions will not be tracked.
const FORM_ID = "wf-form-SEO-LP-Quote-Form";
// Options written into the Webflow <select name="Tier"> at mount (the Data API cannot set them).
const TIER_OPTIONS = [
  { value: "", label: "Select one", placeholder: true },
  { value: "not-sure", label: "Not sure yet" },
  { value: "starter", label: "Starter, $3,500/mo" },
  { value: "growth", label: "Growth, $5,500/mo" },
  { value: "enterprise", label: "Enterprise, $7,500/mo" },
];

// Field `name` attributes match what the site-wide Lead Legend snippet looks for
// (Full-Name, Email, Phone-Number, Business-name), so leads arrive there with the contact
// name, email, phone and company mapped instead of "Missing Input". The Webflow submission
// table uses the `label` written to data-name, not these. The site's honeypot is called
// middle_name, so this uses the same name.
const FIELD_NAMES = {
  website: "Website_URL",
  name: "Full-Name",
  email: "Email",
  phone: "Phone-Number",
  company: "Business-name",
  tier: "Tier",
  message: "Message",
  company_website: "middle_name",
};

// Client logos, matched to the influencer marketing LP so both pages show the same roster
const CLIENT_LOGOS = [
  { name: "Staples", file: "6a3aa3d8f75ed713fdd275d4_staples_2x.webp", w: 262, h: 154 },
  { name: "Universal Music", file: "6a3aa3fc2fc13f019bf0836b_universal_2x.webp", w: 366, h: 154 },
  { name: "Jamieson", file: "6a3aa439f8b6926af7312d76_jamieson_2x.webp", w: 292, h: 154 },
  { name: "Shake Shack", file: "6a3aa471af8383830832f8a3_shake_shack_2x.webp", w: 338, h: 154 },
  { name: "barBURRITO", file: "6a3aa4918cfc969c3dbb4b0b_barburito_2x.webp", w: 298, h: 154 },
  { name: "The Salvation Army", file: "6a3aa4d28743c69a69010060_the_salvaion_2x.webp", w: 149, h: 154 },
];

// Real partner badges
const PARTNERS = [
  { name: "Google Premier Partner", file: "69cd21065a9d66ff18cde17d_unnamed.png", w: 583, h: 556, lead: true },
  { name: "Meta Business Partner", file: "6600cf0b63fee3efca4f6d86_meta%20business%20partner.avif", w: 200, h: 86 },
  { name: "Shopify Partners", file: "679aa016033edab644930b6e_ShopPartners%201.avif", w: 618, h: 104 },
  { name: "Webflow Certified Partner", file: "679a9d318a32099a67a0159f_WebflowCertified.avif", w: 2847, h: 513 },
  { name: "Mailchimp Partner", file: "681a64264054a5c7a7f3c333_Mailchimp_Partner_Badge_2024.svg", w: 932, h: 313 },
];

// Accreditation and award marks, the same scrolling set the influencer marketing LP runs
const ACCREDITATIONS = [
  { name: "Globe and Mail, Report on Business 2023", file: "65a841fd12c86cd1fe0176e0_Globe%2BMail_Winners_Logo_Color.svg" },
  { name: "Canada's Top Growing Companies 2022", file: "675cba9049d95fc1b99cf276_Globe2022.avif" },
  { name: "AdCann Award Winner 2023", file: "65a8424fc659540061be7c14_ADCANN_Color.avif" },
  { name: "Notable Award Winner", file: "65a843cf1db1f0d4ff396330_Notable.avif" },
  { name: "InfluenceTHIS Award Winner", file: "69f271e0290b059918a797c7_AA-Canada-%20(1)-p-1080.webp" },
  { name: "Advertising Club of Toronto", file: "6600cf12e2ebce24aa9d6425_advertising-club-toronto-logo%201.webp" },
  { name: "Ad Standards", file: "6600cf0a351a0e5dfaff5fef_ad%20standards.avif" },
  { name: "Webflow Certified Partner", file: "679a9d318a32099a67a0159f_WebflowCertified.avif" },
  { name: "Career Directory, Canada's Best Employers 2025", file: "67a512cf70c05d5e00f55a84_CareerDirectory2025%20Small.avif" },
  { name: "Career Directory, Canada's Best Employers 2024", file: "65f338bcc69e167cdb7e394f_2024_17_en.avif" },
  { name: "New World Report 2022 Awards", file: "6600cf0b545588445526fdf5_software%20and%20technology.avif" },
  { name: "We Run On EOS", file: "69cd25894e4a2a002aa96db1_eos.avif" },
];

// Real SEO reporting visuals from TIA's SEO service page, used as the hero collage.
// `ar` is each asset's true aspect ratio so nothing gets cropped or upscaled.
const HERO_VISUALS = [
  { alt: "Organic website traffic growth", file: "64d2a46acc3d8580f096ff91_image%203.avif", ar: "979 / 601", mobile: true },
  { alt: "Google Search Console performance", file: "64d28e23d05cbc50ec2849be_Google%20Search%20Console.avif", ar: "1000 / 480", mobile: false },
  { alt: "Featured keyword rankings", file: "64e4f4cf9f6bdfb58413e4db_Keyword%20Ranking.avif", ar: "413 / 789", mobile: true },
  { alt: "Google Trends demand data", file: "64d28ece51352c47eaf0b82c_GoogleTrends1.avif", ar: "935 / 755", mobile: false },
];

// Team photo, updated Sept 2026. Inlined as a data URI so this file renders standalone.
// ON BUILD: upload assets/tia-team-2026.jpg to the Webflow asset library and replace the
// value below with its hosted CDN URL. Nothing else needs to change.
// Team photo, hosted with the bundle. ASSET_BASE is set per build (see vite.config.js).
const TEAM_PHOTO = `${ASSET_BASE}assets/tia-team-2026.jpg`;

const CSS = `
@import url('https://use.typekit.net/mfz5gdk.css');
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;900&display=swap');

.tia-seo, .tia-seo *, .tia-seo *::before, .tia-seo *::after { box-sizing: border-box; margin: 0; padding: 0; }
.tia-seo, .tia-seo * {
  font-family: 'sofia-pro', 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.tia-seo { color: ${INK}; font-size: 16px; line-height: 1.5; background: ${PAGE_BG}; overflow-x: hidden; }
.tia-seo a { color: inherit; text-decoration: none; }
/* height:auto is required alongside the width/height attributes on images, otherwise the
   intrinsic attributes fight max-width and the image distorts. */
.tia-seo img { max-width: 100%; height: auto; display: block; }

.tia-seo .lp-container { max-width: 1440px; margin: 0 auto; padding: 0 32px; width: 100%; }
.tia-seo .lp-section { padding: 64px 0; }

/* ---------- TYPE ---------- */
.tia-seo .h-xl { font-size: 64px; font-weight: 900; line-height: 1.1; }
.tia-seo .h-lg { font-size: 40px; font-weight: 900; line-height: 1.1; }
.tia-seo .h-md { font-size: 32px; font-weight: 900; line-height: 1.1; }
.tia-seo .h-sm { font-size: 24px; font-weight: 900; line-height: 1.15; }
.tia-seo .lede { font-size: 18px; line-height: 1.55; }
.tia-seo .muted { color: rgba(51,51,51,0.78); }
.tia-seo .on-color { color: ${PAGE_BG}; }
.tia-seo .on-color-muted { color: rgba(247,247,247,0.9); }
.tia-seo .center { text-align: center; }

.tia-seo .hl {
  background-image: linear-gradient(transparent, ${YELLOW});
  background-size: 100% 44%;
  background-position: 0 86%;
  background-repeat: no-repeat;
}
.tia-seo .hl-cyan { background-image: linear-gradient(transparent, ${CYAN}); }

/* ---------- BUTTONS ---------- */
.tia-seo .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-family: inherit; font-size: 16px; font-weight: 400; line-height: 1.4;
  border-radius: 500px; padding: 12px 26px; border: 0; cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  text-align: center; white-space: nowrap; min-height: 46px;
}
.tia-seo .btn-grad { background-image: ${GRAD}; color: ${WHITE}; }
.tia-seo .btn-grad:hover { transform: translateY(-2px); box-shadow: 0 16px 25px 0 rgba(255,17,119,0.25); }
.tia-seo .btn-ghost { background: transparent; color: ${INK}; border: 1px solid ${INK}; }
.tia-seo .btn-ghost:hover { background: ${INK}; color: ${PAGE_BG}; }
.tia-seo .btn-ghost-light { background: transparent; color: ${PAGE_BG}; border: 1px solid ${PAGE_BG}; }
.tia-seo .btn-ghost-light:hover { background: ${PAGE_BG}; color: ${INK}; }
.tia-seo .btn-white { background: ${PAGE_BG}; color: ${INK}; }
.tia-seo .btn-white:hover { transform: translateY(-2px); box-shadow: 0 16px 16px -8px rgba(0,0,0,0.2); }
.tia-seo .btn-full { width: 100%; }
.tia-seo .btn-arrow { font-size: 18px; line-height: 1; }

/* ---------- PILL LABEL ---------- */
.tia-seo .pill {
  display: inline-block; border: 1px solid ${INK}; border-radius: 500px;
  padding: 5px 14px; font-size: 15px; color: ${INK}; background: transparent;
}

/* ---------- NAV ---------- */
.tia-seo section[id], .tia-seo .form-card[id] { scroll-margin-top: 90px; }
.tia-seo .nav { background: ${PAGE_BG}; padding: 18px 0; position: sticky; top: 0; z-index: 200; }
.tia-seo .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.tia-seo .lp-nav-logo { height: 40px; width: auto; }

/* ---------- HERO ---------- */
.tia-seo .lp-hero {
  /* Class names here must not exist in the site's global stylesheet. The old name
     "hero-wrap" collided with a site class (display:flex, max-width:1920px, margin auto)
     that left the gradient off-centre on wide screens. */
  display: block;
  width: calc(100% - 32px);
  max-width: 1920px;
  background-image: radial-gradient(circle at 50% -20%, ${PINK}, ${PINK_WASH} 42%);
  border-radius: 64px;
  margin: 0 auto;
  padding: 56px 32px 72px;
  position: relative;
  overflow: hidden;
}
.tia-seo .hero-grid {
  display: grid; grid-template-columns: 1fr 1.08fr 0.92fr;
  gap: 44px; align-items: center; max-width: 1520px; margin: 0 auto; width: 100%;
}
.tia-seo .hero-copy { text-align: center; }
.tia-seo .hero-copy .pill { margin-bottom: 20px; }
.tia-seo .hero-copy h1 { font-size: 40px; font-weight: 900; line-height: 1.1; margin-bottom: 18px; color: ${INK}; }
.tia-seo .hero-sub { font-size: 17px; line-height: 1.55; color: rgba(51,51,51,0.85); margin: 0 auto 26px; max-width: 460px; }
.tia-seo .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 18px; }
.tia-seo .hero-note { font-size: 14px; color: rgba(51,51,51,0.8); }
.tia-seo .hero-qualifier { font-size: 14px; color: rgba(51,51,51,0.72); margin-top: 8px; max-width: 430px; margin-left: auto; margin-right: auto; }

/* tilted reporting-screenshot collage. Each shot keeps its own aspect ratio. */
.tia-seo .collage { position: relative; height: 600px; }
.tia-seo .collage-item {
  position: absolute; border-radius: 16px; overflow: hidden;
  background: ${WHITE}; padding: 7px;
  box-shadow: 0 16px 16px -8px rgba(0,0,0,0.2);
}
.tia-seo .collage-item img { border-radius: 11px; width: 100%; height: auto; display: block; }
.tia-seo .collage-1 { width: 80%; left: 0; top: 0; transform: rotate(-6deg); }
.tia-seo .collage-2 { width: 74%; left: 26%; top: 20%; transform: rotate(5deg); z-index: 2; }
.tia-seo .collage-3 { width: 44%; left: 0; top: 38%; transform: rotate(3deg); z-index: 3; }
.tia-seo .collage-4 { width: 55%; left: 45%; top: 50%; transform: rotate(-5deg); z-index: 4; }

/* mobile keeps a reduced two-shot version rather than hiding the proof entirely */
.tia-seo .collage-mobile { display: none; }

/* ---------- FORM ---------- */
.tia-seo .form-card { background: ${WHITE}; border-radius: 16px; padding: 28px; box-shadow: 0 10px 30px 0 rgba(0,0,0,0.08); }
.tia-seo .form-card h3 { font-size: 22px; font-weight: 900; line-height: 1.2; margin-bottom: 6px; }
.tia-seo .form-card .form-intro { font-size: 14px; color: rgba(51,51,51,0.75); margin-bottom: 18px; }
.tia-seo .form-field { margin-bottom: 10px; }
.tia-seo .form-field label { display: block; font-size: 14px; font-weight: 500; color: ${INK}; margin-bottom: 4px; }
.tia-seo .form-field .opt { color: rgba(51,51,51,0.6); font-weight: 400; }
.tia-seo .form-field input, .tia-seo .form-field select, .tia-seo .form-field textarea {
  width: 100%; font-family: inherit; font-size: 16px; padding: 11px 14px;
  border: 1px solid #E0E0E0; border-radius: 12px; background: ${PAGE_BG}; color: ${INK};
  transition: border-color 0.15s ease, background 0.15s ease;
}
.tia-seo .form-field input:focus, .tia-seo .form-field select:focus, .tia-seo .form-field textarea:focus {
  outline: none; border-color: ${PINK}; background: ${WHITE};
}
.tia-seo .form-field.invalid input, .tia-seo .form-field.invalid select, .tia-seo .form-field.invalid textarea { border-color: #D92D20; background: #FFFBFA; }
.tia-seo .field-error { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #B42318; margin-top: 4px; }
.tia-seo .form-field textarea { resize: vertical; min-height: 68px; }
.tia-seo .form-note { font-size: 13px; color: rgba(51,51,51,0.75); margin-top: 10px; text-align: center; }
.tia-seo .form-success { background: #ECFDF3; border: 1px solid #B8E0CB; color: #1A6A40; padding: 16px; border-radius: 12px; font-size: 15px; }
.tia-seo .hp-field { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

/* ---------- ADOPTED WEBFLOW FORM ----------
   Webflow renders its own markup (.w-form > form > label + .w-input / .w-select + .w-button).
   These rules make it look exactly like the designed form once it is moved into the card. */
.tia-seo .form-card .w-form { margin: 0; }
.tia-seo .form-card .w-form form { display: block; }
.tia-seo .form-card .w-form label {
  display: block; font-size: 14px; font-weight: 500; color: ${INK}; margin-bottom: 4px; margin-top: 10px;
}
.tia-seo .form-card .w-form label:first-child { margin-top: 0; }
.tia-seo .form-card .w-input, .tia-seo .form-card .w-select, .tia-seo .form-card textarea.w-input {
  width: 100%; height: auto; min-height: 0; font-family: inherit; font-size: 16px; line-height: 1.4;
  padding: 11px 14px; margin: 0; border: 1px solid #E0E0E0; border-radius: 12px;
  background: ${PAGE_BG}; color: ${INK}; box-shadow: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.tia-seo .form-card .w-select { -webkit-appearance: none; appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' fill='none' stroke='%23333' stroke-width='1.5'/></svg>");
  background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
.tia-seo .form-card textarea.w-input { resize: vertical; min-height: 68px; }
.tia-seo .form-card .w-input:focus, .tia-seo .form-card .w-select:focus, .tia-seo .form-card textarea.w-input:focus {
  outline: none; border-color: ${PINK}; background: ${WHITE};
}
.tia-seo .form-card .w-input::placeholder { color: rgba(51,51,51,0.45); }
.tia-seo .form-card .w-button, .tia-seo .form-card input[type="submit"] {
  display: inline-flex; align-items: center; justify-content: center; width: 100%;
  font-family: inherit; font-size: 16px; font-weight: 400; line-height: 1.4;
  border-radius: 500px; padding: 12px 26px; margin-top: 14px; border: 0; cursor: pointer; min-height: 46px;
  background-image: ${GRAD}; background-color: ${PINK}; color: ${WHITE};
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.tia-seo .form-card .w-button:hover { transform: translateY(-2px); box-shadow: 0 16px 25px 0 rgba(255,17,119,0.25); }
/* honeypot: Webflow field named middle_name, hidden with its label */
.tia-seo .form-card .w-form .wf-hp, .tia-seo .form-card .w-form [name="middle_name"],
.tia-seo .form-card .w-form label[for="middle_name"] {
  position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;
}
.tia-seo .form-card .w-form-done {
  display: none; background: #ECFDF3; border: 1px solid #B8E0CB; color: #1A6A40;
  padding: 16px; border-radius: 12px; font-size: 15px; text-align: left; margin-top: 8px;
}
.tia-seo .form-card .w-form-fail {
  display: none; background: #FFFBFA; border: 1px solid #F1B5AD; color: #B42318;
  padding: 12px 14px; border-radius: 12px; font-size: 14px; margin-top: 10px;
}
.tia-seo .form-card .wf-slot[data-state="pending"] { min-height: 420px; }

/* ---------- LOGO BAR ---------- */
.tia-seo .logos { padding: 56px 0 8px; }
.tia-seo .logos-row { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 28px 56px; margin-top: 36px; }
.tia-seo .logos-row img { height: 68px; width: auto; max-width: 190px; object-fit: contain; }

/* ---------- YELLOW ACHIEVEMENT STRIP ---------- */
.tia-seo .ach { background: ${YELLOW}; border-radius: 20px; padding: 40px 32px; margin: 48px 16px 0; }
.tia-seo .ach-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 24px; max-width: 1376px; margin: 0 auto; }
.tia-seo .ach-icon {
  width: 44px; height: 44px; border-radius: 50%; background: ${WHITE};
  display: flex; align-items: center; justify-content: center; color: ${INK}; margin-bottom: 16px;
}
.tia-seo .ach-num { font-size: 22px; font-weight: 900; line-height: 1.15; margin-bottom: 8px; color: ${INK}; }
.tia-seo .ach-label { font-size: 15px; line-height: 1.45; color: rgba(51,51,51,0.88); }

/* ---------- PRICING ---------- */
.tia-seo .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
.tia-seo .price-card { background: ${WHITE}; border-radius: 16px; padding: 32px; display: flex; flex-direction: column; }
.tia-seo .price-card.featured { background: ${PINK}; color: ${PAGE_BG}; box-shadow: 0 4px 0 0 ${INK}; }
.tia-seo .price-tag { align-self: flex-start; background: ${YELLOW}; color: ${INK}; font-size: 13px; font-weight: 700; border-radius: 500px; padding: 4px 12px; margin-bottom: 14px; }
.tia-seo .price-name { font-size: 20px; font-weight: 900; margin-bottom: 4px; }
.tia-seo .price-for { font-size: 14px; opacity: 0.8; margin-bottom: 14px; min-height: 40px; }
.tia-seo .price-amount { font-size: 40px; font-weight: 900; line-height: 1.05; }
.tia-seo .price-amount span { font-size: 15px; font-weight: 400; }
.tia-seo .price-min { font-size: 14px; opacity: 0.8; margin: 6px 0 20px; }
.tia-seo .price-features { list-style: none; margin-bottom: 26px; flex: 1; }
.tia-seo .price-features li { display: flex; gap: 10px; align-items: flex-start; font-size: 15px; line-height: 1.5; margin-bottom: 10px; }
.tia-seo .price-features li svg { flex-shrink: 0; margin-top: 3px; }
.tia-seo .price-foot { font-size: 14px; text-align: center; margin-top: 28px; color: rgba(51,51,51,0.8); }

/* ---------- COLOUR BLOCKS ---------- */
.tia-seo .block-pink { background: ${PINK_BLOCK}; border-radius: 64px; margin: 64px 16px; padding: 64px 32px; color: ${PAGE_BG}; }
.tia-seo .block-grad { background-image: ${GRAD}; border-radius: 64px; margin: 64px 16px; padding: 64px 32px; color: ${WHITE}; }

/* ---------- PILLARS ---------- */
.tia-seo .pillars-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 40px; }
.tia-seo .pillar-card { background: rgba(247,247,247,0.12); border: 1px solid rgba(247,247,247,0.25); border-radius: 16px; padding: 32px; }
.tia-seo .pillar-icon {
  width: 48px; height: 48px; border-radius: 50%; background: ${PAGE_BG}; color: ${PINK};
  display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
}
.tia-seo .pillar-card h4 { font-size: 20px; font-weight: 900; margin-bottom: 10px; line-height: 1.2; }
.tia-seo .pillar-card p { font-size: 15px; line-height: 1.55; color: rgba(247,247,247,0.9); }

/* ---------- CASE STUDIES ---------- */
.tia-seo .cases { display: grid; gap: 24px; margin-top: 40px; }
.tia-seo .case-card { background: ${WHITE}; border-radius: 16px; padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
.tia-seo .case-card.reverse .case-visual { order: -1; }
.tia-seo .case-stats { display: flex; flex-wrap: wrap; gap: 36px; margin: 10px 0 4px; }
.tia-seo .case-stat { font-size: 46px; font-weight: 900; line-height: 1; color: ${PINK}; }
.tia-seo .case-stat-label { font-size: 15px; color: rgba(51,51,51,0.8); margin-top: 6px; max-width: 190px; }
.tia-seo .case-name { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
.tia-seo .case-kicker { font-size: 15px; color: rgba(51,51,51,0.75); margin-bottom: 16px; }
.tia-seo .case-body { font-size: 16px; line-height: 1.6; margin-bottom: 8px; }
.tia-seo .case-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.tia-seo .case-visual { border-radius: 16px; overflow: hidden; background: ${PAGE_BG}; padding: 8px; box-shadow: 0 16px 16px -8px rgba(51,51,51,0.15); }
.tia-seo .case-visual img { border-radius: 12px; }
.tia-seo .case-callout {
  display: flex; gap: 10px; align-items: flex-start; background: ${PAGE_BG};
  border-left: 4px solid ${YELLOW}; border-radius: 12px; padding: 14px 16px; margin-top: 20px;
  font-size: 15px; line-height: 1.5;
}

.tia-seo .verticals-heading { font-size: 24px; font-weight: 900; line-height: 1.2; color: ${INK}; margin-top: 56px; }
.tia-seo .verticals-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.tia-seo .vertical-pill { background: ${WHITE}; border-radius: 500px; padding: 9px 18px; font-size: 15px; color: ${INK}; }
.tia-seo .vertical-pill.more { background: transparent; border: 1px solid ${PINK}; color: ${PINK}; font-weight: 600; }

/* ---------- PARTNERS ---------- */
.tia-seo .partners-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr; gap: 20px; margin-top: 40px; align-items: stretch; }
.tia-seo .partner-card {
  background: ${WHITE}; border-radius: 16px; padding: 24px; min-height: 180px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center;
}
.tia-seo .partner-card img { height: 56px; width: auto; max-width: 100%; object-fit: contain; }
.tia-seo .partner-card span { font-size: 14px; font-weight: 500; line-height: 1.3; color: rgba(51,51,51,0.85); }
.tia-seo .partner-card.lead img { height: 122px; }

/* ---------- ACCREDITATION MARQUEE ---------- */
.tia-seo .accred { padding: 8px 0 56px; overflow: hidden; }
.tia-seo .accred-mask {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
.tia-seo .accred-track { display: flex; align-items: center; gap: 56px; width: max-content; animation: accred-scroll 48s linear infinite; }
.tia-seo .accred-item { flex: 0 0 auto; width: 130px; height: 56px; display: flex; align-items: center; justify-content: center; }
.tia-seo .accred-item img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
.tia-seo .accred-mask:hover .accred-track { animation-play-state: paused; }
@keyframes accred-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ---------- TEAM ---------- */
.tia-seo .team-card { background: ${WHITE}; border-radius: 16px; overflow: hidden; display: grid; grid-template-columns: 1fr 1fr; gap: 0; align-items: stretch; margin-top: 40px; }
.tia-seo .team-copy { padding: 40px; align-self: center; }
.tia-seo .team-copy h3 { font-size: 28px; font-weight: 900; line-height: 1.15; margin-bottom: 14px; }
.tia-seo .team-copy p { font-size: 16px; line-height: 1.6; color: rgba(51,51,51,0.85); margin-bottom: 12px; }
.tia-seo .team-photo img { width: 100%; height: 100%; object-fit: cover; }

/* ---------- STEPS ---------- */
.tia-seo .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 40px; }
.tia-seo .step-card { background: ${WHITE}; border-radius: 16px; padding: 28px; }
.tia-seo .step-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%; background-image: ${GRAD};
  color: ${WHITE}; font-size: 17px; font-weight: 900; margin-bottom: 16px;
}
.tia-seo .step-card h4 { font-size: 19px; font-weight: 900; margin-bottom: 8px; line-height: 1.2; }
.tia-seo .step-card p { font-size: 15px; line-height: 1.55; color: rgba(51,51,51,0.8); }

/* ---------- TESTIMONIAL ---------- */
.tia-seo .quote { font-size: 24px; font-weight: 900; line-height: 1.35; max-width: 900px; margin: 28px auto 22px; }
.tia-seo .quote-name { font-size: 17px; font-weight: 700; }
.tia-seo .quote-meta { font-size: 15px; opacity: 0.9; }

/* ---------- FAQ ---------- */
.tia-seo .faq-list { max-width: 900px; margin: 40px auto 0; display: grid; gap: 12px; }
.tia-seo .faq-item { background: ${WHITE}; border-radius: 16px; padding: 24px 28px; }
.tia-seo .faq-q { font-size: 18px; font-weight: 900; margin-bottom: 8px; line-height: 1.25; }
.tia-seo .faq-a { font-size: 15px; line-height: 1.6; color: rgba(51,51,51,0.82); }

/* ---------- BOTTOM CTA ---------- */
.tia-seo .cta-inner { text-align: center; max-width: 820px; margin: 0 auto; }
.tia-seo .cta-inner p { margin: 16px auto 28px; font-size: 18px; }
.tia-seo .cta-note { font-size: 14px; margin-top: 18px; opacity: 0.9; }

/* ---------- STICKY MOBILE CTA ---------- */
.tia-seo .sticky-cta { display: none; }

/* ---------- FOOTER ---------- */
.tia-seo .footer { background: ${INK}; color: rgba(247,247,247,0.8); padding: 28px 0; }
.tia-seo .footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.tia-seo .footer img { height: 34px; width: auto; filter: brightness(0) invert(1); opacity: 0.9; }
.tia-seo .footer-links { display: flex; gap: 24px; font-size: 14px; }
.tia-seo .footer-links a:hover { color: ${PAGE_BG}; }
.tia-seo .footer-copy { font-size: 14px; }

/* ---------- MOBILE ---------- */
@media (max-width: 768px) {
  .tia-seo .lp-container { padding: 0 20px; }
  .tia-seo .lp-section { padding: 44px 0; }
  .tia-seo .lp-hero { border-radius: 32px; width: calc(100% - 16px); padding: 36px 20px 44px; }
  .tia-seo .hero-grid { grid-template-columns: 1fr; gap: 28px; }
  .tia-seo .collage { display: none; }
  .tia-seo .collage-mobile { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 12px; align-items: start; }
  .tia-seo .collage-mobile .collage-item { position: static; transform: none; width: 100%; box-shadow: 0 10px 16px -8px rgba(0,0,0,0.2); }
  .tia-seo .hero-copy h1 { font-size: 30px; }
  .tia-seo .hero-sub { font-size: 16px; }
  .tia-seo .hero-ctas .btn { flex: 1; min-width: 150px; }
  .tia-seo .h-xl { font-size: 34px; }
  .tia-seo .h-lg { font-size: 28px; }
  .tia-seo .h-md { font-size: 24px; }
  .tia-seo .form-card { padding: 22px; }
  .tia-seo .logos-row { gap: 20px 32px; }
  .tia-seo .logos-row img { height: 44px; max-width: 130px; }
  .tia-seo .ach { border-radius: 20px; margin: 36px 8px 0; padding: 28px 20px; }
  .tia-seo .ach-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
  .tia-seo .pricing-grid { grid-template-columns: 1fr; }
  .tia-seo .price-for { min-height: 0; }
  .tia-seo .block-pink, .tia-seo .block-grad { border-radius: 32px; margin: 44px 8px; padding: 44px 20px; }
  .tia-seo .pillars-grid { grid-template-columns: 1fr; }
  .tia-seo .case-card { grid-template-columns: 1fr; padding: 22px; }
  .tia-seo .case-card.reverse .case-visual { order: 0; }
  .tia-seo .case-stats { gap: 24px; }
  .tia-seo .case-stat { font-size: 38px; }
  .tia-seo .case-stat-label { font-size: 14px; }
  .tia-seo .verticals-heading { font-size: 20px; margin-top: 36px; }
  .tia-seo .partners-grid { grid-template-columns: 1fr 1fr; }
  .tia-seo .partner-card { min-height: 150px; }
  .tia-seo .partner-card.lead { grid-column: span 2; }
  .tia-seo .partner-card.lead img { height: 130px; }
  .tia-seo .accred { padding: 4px 0 36px; }
  .tia-seo .accred-track { gap: 36px; animation-duration: 34s; }
  .tia-seo .accred-item { width: 96px; height: 44px; }
  .tia-seo .team-card { grid-template-columns: 1fr; }
  .tia-seo .team-copy { padding: 26px; }
  .tia-seo .team-photo { order: -1; max-height: 240px; overflow: hidden; }
  .tia-seo .steps-grid { grid-template-columns: 1fr; gap: 16px; }
  .tia-seo .quote { font-size: 19px; }
  .tia-seo .footer-inner { flex-direction: column; text-align: center; }

  /* persistent CTA once the hero form has scrolled away */
  .tia-seo .sticky-cta {
    display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 300;
    background: ${PAGE_BG}; border-top: 1px solid #E4E4E4; padding: 10px 16px;
    box-shadow: 0 -6px 18px rgba(0,0,0,0.08);
    transform: translateY(110%); transition: transform 0.25s ease;
  }
  .tia-seo .sticky-cta.show { transform: translateY(0); }
  .tia-seo .sticky-cta .btn { width: 100%; }
  .tia-seo { padding-bottom: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .tia-seo *, .tia-seo *::before, .tia-seo *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  .tia-seo .accred-track { animation: none !important; width: auto; flex-wrap: wrap; justify-content: center; gap: 32px; }
  .tia-seo .accred-mask { -webkit-mask-image: none; mask-image: none; }
  .tia-seo .sticky-cta { transition: none; }
}
`;


export default function TIASEOLandingPage() {
  const [formData, setFormData] = useState({
    website: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    tier: "",
    message: "",
    company_website: "", // honeypot, must stay empty
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keys off `id`, not `name`. The name attributes carry the live site's Webflow field
  // names (Full-Name, Business-name, middle_name) for Lead Legend compatibility, while
  // the ids stay as the readable state keys.
  const handleChange = (e) => {
    const key = e.target.id;
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!formData.website.trim()) next.website = "Enter your website so we can take a look.";
    if (!formData.name.trim()) next.name = "Enter your name.";
    if (!formData.email.trim()) next.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) next.email = "That email doesn't look right.";
    if (!formData.company.trim()) next.company = "Enter your business name.";
    if (!formData.phone.trim()) next.phone = "Enter a phone number.";
    if (!formData.tier) next.tier = "Pick the tier closest to your goals.";
    if (!formData.message.trim()) next.message = "Tell us a little about what you need.";
    return next;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (formData.company_website) return; // bot
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = document.getElementById(Object.keys(next)[0]);
      if (first) first.focus();
      return;
    }

    trackConversion("seo_lp_quote_request", { form_location: "hero", tier: formData.tier || "not_specified" });

    // Redirect to the thank-you page so the existing WEBPAGE-type Google Ads conversion
    // actions fire. Falls back to the inline success state if no URL is configured.
    if (THANK_YOU_URL) {
      setSubmitted(true);
      window.setTimeout(() => {
        window.location.assign(THANK_YOU_URL);
      }, 150);
      return;
    }
    setSubmitted(true);
  };

  const achievements = [
    { icon: <Search size={20} strokeWidth={2} />, num: "93%", label: "Of online experiences begin with a search engine" },
    { icon: <Sparkles size={20} strokeWidth={2} />, num: "116%", label: "More often AI overviews now appear in search results since Google's March Core Update" },
    { icon: <Award size={20} strokeWidth={2} />, num: "Google Premier Partner", label: "Top-tier status, not standard Partner. Certified across our paid and organic teams" },
    { icon: <BarChart3 size={20} strokeWidth={2} />, num: "100-200", label: "Keywords researched and tracked per engagement" },
    { icon: <Users size={20} strokeWidth={2} />, num: "7+ years", label: "Typical length of our longest client partnerships" },
  ];

  const tiers = [
    {
      name: "Starter",
      forWho: "Single-location businesses building an organic base.",
      price: "$3,500",
      features: [
        "Full technical audit and setup",
        "100-200 keywords researched and mapped",
        "1 Google Business Profile location",
        "1 guest blog placement per quarter",
        "5 pages CTR tested per quarter",
        "Quarterly reporting with a dedicated CSM",
      ],
    },
    {
      name: "Growth",
      forWho: "Multi-location or competitive categories that need volume.",
      price: "$5,500",
      featured: true,
      features: [
        "Everything in Starter",
        "Up to 3 Google Business Profile locations",
        "3 guest blog placements per quarter",
        "10 pages CTR tested per quarter",
        "Content audits via Surfer SEO",
        "Competitor conquest reporting",
      ],
    },
    {
      name: "Enterprise",
      forWho: "National reach, large catalogues, or aggressive targets.",
      price: "$7,500",
      features: [
        "Everything in Growth",
        "Up to 5 Google Business Profile locations",
        "6 guest blog placements per quarter",
        "15 pages CTR tested per quarter",
        "Priority technical and CRO support",
        "Conversion rate optimization recommendations",
      ],
    },
  ];

  const pillars = [
    {
      icon: <Search size={22} strokeWidth={2} />,
      title: "Technical foundation",
      body: "Full technical audit, schema markup, Core Web Vitals and crawl error monitoring, XML sitemaps and robots.txt. Done right before anything else starts.",
    },
    {
      icon: <FileText size={22} strokeWidth={2} />,
      title: "Content and authority",
      body: "Keyword research and mapping, guest blog outreach, content audits with Surfer SEO, and internal link optimization that compounds over time.",
    },
    {
      icon: <MapPin size={22} strokeWidth={2} />,
      title: "Local and reporting",
      body: "Google Business Profile management, citation building, and quarterly reporting with a dedicated Client Success Manager who actually knows your account.",
    },
    {
      icon: <Sparkles size={22} strokeWidth={2} />,
      title: "Answer engine optimization",
      body: "Traditional SEO alone is no longer enough. We structure your content for voice search, featured snippets, and AI overviews so you get picked as the answer across Google, ChatGPT, and Perplexity.",
    },
  ];

  // Both case studies are sourced from TIA's own published case study pages.
  const cases = [
    {
      client: "LG Home Comfort",
      kicker: "Content and backlink strategy for a national HVAC brand",
      body:
        "Their content was pulling in visitors who were never going to buy. We rebuilt the topic coverage around real purchase intent and backed it with a backlink strategy from day one. By the end of 2024 organic had overtaken a $30,000 a month paid program to become their number one lead source.",
      stats: [
        { num: "816%", label: "Organic lead growth year over year" },
        { num: "433%", label: "Increase in organic traffic" },
      ],
      callout: "Measurable results inside 3 months, well ahead of the usual curve.",
      tags: ["Content Strategy", "Link Building", "Technical SEO"],
      visual: "69b1a850ddd215ab1cdaa956_lghc.avif",
      alt: "LG Home Comfort website",
    },
    {
      client: "Compass Health Center",
      kicker: "Website rebuild, content strategy, and technical SEO",
      body:
        "We rebuilt Compass Health's site with a full content rewrite and on-page SEO, built around how patients actually search. Sessions were the headline, but the leads are the real story.",
      stats: [
        { num: "1,590%", label: "Increase in SEO leads" },
        { num: "2,700%", label: "Increase in SEO-driven sessions" },
      ],
      callout: "Blog traffic up 500%, earning featured snippets and AI overviews. That's the SEO and AEO blend working together.",
      tags: ["Technical SEO", "Content Strategy", "Web Development"],
      visual: "68d5a80a6754c87e5d8febef_performance-study-compass.avif",
      alt: "Compass Health Center website",
      reverse: true,
    },
  ];

  const steps = [
    { num: "01", title: "Discovery call", body: "We review your goals, current visibility, and where organic search fits into the rest of your marketing." },
    { num: "02", title: "Audit and assessment", body: "A full technical, content, and local presence audit. We show you what's holding rankings back before we propose anything." },
    { num: "03", title: "Custom strategy", body: "Built around what the audit actually found, not a templated package. Keyword priorities, content gaps, and technical fixes, sequenced." },
    { num: "04", title: "Setup phase", body: "Four to six weeks. Technical fixes, keyword mapping across 100-200 terms, schema, GA4 and Search Console, Google Business Profile." },
    { num: "05", title: "Quarterly execution", body: "Guest blog outreach, content audits, internal linking, CTR testing, and citation management on a quarterly cycle." },
    { num: "06", title: "Reporting and adaptation", body: "Quarterly reporting plus agile response to algorithm shifts and competitor moves. You always know what changed and why." },
  ];

  const faqs = [
    {
      q: "How long before I see results?",
      a: "SEO is a slow burn. Realistically it takes three to six months to produce tangible results, and we would rather tell you that upfront than sell you a timeline we can't hit. That said, it can move faster: LG Home Comfort saw measurable results within three months because we ran content and backlinks together from day one. Your dedicated Client Success Manager reports on progress the whole way through, so you are never guessing.",
    },
    {
      q: "How is pricing structured?",
      a: "Three monthly retainer tiers: $3,500, $5,500, and $7,500. Which tier fits depends on how competitive your category is, how much content you need, and how many locations you're optimizing for. We'll tell you which one your situation actually calls for rather than pushing you up a tier.",
    },
    {
      q: "Do you handle AEO, or just traditional SEO?",
      a: "Both, and they run together rather than as a bolt-on. AI-driven search has changed how people find answers, so alongside classic ranking work we structure content for voice search, featured snippets, AI overviews, and generative engines like ChatGPT and Perplexity. Combined SEO and AEO is how you own the zero-click space instead of losing it.",
    },
    {
      q: "What happens in the first six weeks?",
      a: "A full technical audit, keyword research and mapping across 100-200 terms, title tags, meta descriptions and schema implementation, Google Analytics 4 and Search Console setup, Google Business Profile configuration, and sitemap and robots.txt optimization.",
    },
    {
      q: "What do you actually do every quarter?",
      a: "Guest blog outreach, content audits using Surfer SEO, internal link optimization, CTR testing on a set number of pages, Core Web Vitals and crawl error monitoring, citation management for local SEO, competitor conquest reporting, and conversion rate optimization recommendations.",
    },
    {
      q: "Do you work with agencies, not just direct brands?",
      a: "Yes. We work with in-house marketing managers and business owners directly, and with design agencies who want a white-label SEO partner behind the scenes.",
    },
    {
      q: "What tools do you use?",
      a: "Surfer SEO for content, Google Search Console and Analytics 4 for tracking, Google Business Profile for local, Lead Legend for call and form tracking, and our own keyword rank tracking dashboard.",
    },
  ];

  const verticals = [
    "Cannabis",
    "Consumer Packaged Goods",
    "E-commerce",
    "Education",
    "Events",
    "Financial Services",
    "Food & Beverage",
    "Gaming",
    "Health & Wellness",
    "Home Services",
    "Hospitality",
    "Insurance",
    "Legal",
    "Music",
    "Real Estate Development",
    "Retail",
    "SaaS",
    "Travel & Tourism",
  ];

  const field = (id, label, type, opts) => {
    const o = opts || {};
    return (
      <div className={`form-field${errors[id] ? " invalid" : ""}`}>
        <label htmlFor={id}>
          {label} {o.optional && <span className="opt">(optional)</span>}
        </label>
        {type === "textarea" ? (
          <textarea
            id={id}
            name={FIELD_NAMES[id] || id}
            rows={3}
            value={formData[id]}
            onChange={handleChange}
            aria-invalid={errors[id] ? "true" : "false"}
            aria-describedby={errors[id] ? `${id}-error` : undefined}
          />
        ) : (
          <input
            id={id}
            name={FIELD_NAMES[id] || id}
            type={type}
            value={formData[id]}
            onChange={handleChange}
            autoComplete={o.autoComplete}
            aria-invalid={errors[id] ? "true" : "false"}
            aria-describedby={errors[id] ? `${id}-error` : undefined}
          />
        )}
        {errors[id] && (
          <div className="field-error" id={`${id}-error`} role="alert">
            <AlertCircle size={14} strokeWidth={2.5} />
            {errors[id]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tia-seo">
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="lp-container nav-inner">
          <img className="lp-nav-logo" src={TIA_LOGO} alt="The Influence Agency" width="136" height="40" />
          <a href="#quote-form" className="btn btn-grad">
            Request a quote <span className="btn-arrow">&rarr;</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="hero-grid">
          <div className="collage">
            {HERO_VISUALS.map((v, i) => (
              <div key={v.file} className={`collage-item collage-${i + 1}`}>
                <img src={asset(v.file)} alt={v.alt} style={{ aspectRatio: v.ar }} />
              </div>
            ))}
          </div>

          <div className="hero-copy">
            <span className="pill">Full-service SEO. Technical, content, local and AEO.</span>
            <h1>
              Organic search that becomes your <span className="hl">best lead source</span>
            </h1>
            <p className="hero-sub">
              Long-term visibility without the perpetual ad spend. Technical audits, content strategy, local SEO, and
              answer engine optimization so you get picked by AI search too. One team, reported on every quarter.
            </p>
            <div className="hero-ctas">
              <a href="#quote-form" className="btn btn-grad">
                Request a quote <span className="btn-arrow">&rarr;</span>
              </a>
              <a href="#results" className="btn btn-ghost">See our results</a>
            </div>
            <p className="hero-note">Plans start at $3,500/month</p>
            <p className="hero-qualifier">
              Built for businesses ready to invest in organic growth. Not a fit for one-off audits or link building on its own.
            </p>

            {/* mobile keeps two of the four reporting shots so the proof survives the breakpoint */}
            <div className="collage-mobile" style={{ marginTop: 28 }}>
              {HERO_VISUALS.filter((v) => v.mobile).map((v) => (
                <div key={v.file} className="collage-item">
                  <img src={asset(v.file)} alt={v.alt} style={{ aspectRatio: v.ar }} />
                </div>
              ))}
            </div>
          </div>

          <div className="form-card" id="quote-form">
            {/* The live form is a native Webflow Form Block, adopted into this card at mount so
                submissions, notifications, the thank-you redirect and Lead Legend keep working.
                The markup below only renders in local preview, when no Webflow form is present. */}
            <h3>Boost my rankings</h3>
            <p className="form-intro">Tell us where you are now and we'll come back with a plan and a price.</p>
            <WebflowFormSlot
              formName="SEO LP Quote Form"
              fields={{
                "Website-URL": { name: FIELD_NAMES.website, label: "Website URL", placeholder: "https://", required: true },
                Name: { name: FIELD_NAMES.name, label: "Name", placeholder: "", required: true },
                Email: { name: FIELD_NAMES.email, label: "Email", placeholder: "", required: true },
                "Business-Name": { name: FIELD_NAMES.company, label: "Business Name", placeholder: "", required: true },
                Phone: { name: FIELD_NAMES.phone, label: "Phone", labelText: "Phone", placeholder: "", required: true },
                Tier: { name: FIELD_NAMES.tier, label: "Tier", labelText: "Which tier fits your goals?", required: true },
                Message: { name: FIELD_NAMES.message, label: "Message", labelText: "Anything we should know?", placeholder: "", required: true },
                middle_name: { name: FIELD_NAMES.company_website, label: "middle_name", placeholder: "", hidden: true },
              }}
              selectOptions={{ Tier: TIER_OPTIONS }}
              onSubmit={(form) => {
                const tier = form.querySelector(`select[name="${FIELD_NAMES.tier}"]`);
                trackConversion("seo_lp_quote_request", { form_location: "hero", tier: (tier && tier.value) || "not_specified" });
              }}
              renderFallback={() => (
                <>
                {submitted ? (
                  <>
                    <h3>Thanks, we'll be in touch.</h3>
                    <div className="form-success">
                      Your request is in. A TIA strategist will reach out within 1 business day.
                    </div>
                  </>
                ) : (
                  <form id={FORM_ID} name={FORM_ID} data-recipient={FORM_RECIPIENT} action={FORM_ENDPOINT || undefined} method="post" onSubmit={handleSubmit} noValidate>

                    {field("website", "Website URL", "text", { autoComplete: "url" })}
                    {field("name", "Name", "text", { autoComplete: "name" })}
                    {field("email", "Work email", "email", { autoComplete: "email" })}
                    {field("company", "Business name", "text", { autoComplete: "organization" })}
                    {field("phone", "Phone", "tel", { autoComplete: "tel" })}

                    <div className="form-field">
                      <label htmlFor="tier">
                        Which tier fits your goals?
                      </label>
                      <select id="tier" name={FIELD_NAMES.tier} value={formData.tier} onChange={handleChange} required>
                        {TIER_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value} disabled={!!o.placeholder}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    {field("message", "Anything we should know?", "textarea")}

                    {/* honeypot, hidden from humans */}
                    <div className="hp-field" aria-hidden="true">
                      <label htmlFor="company_website">Leave this blank</label>
                      <input
                        id="company_website"
                        name={FIELD_NAMES.company_website}
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.company_website}
                        onChange={handleChange}
                      />
                    </div>

                    <button type="submit" className="btn btn-grad btn-full">
                      Get my proposal <span className="btn-arrow">&rarr;</span>
                    </button>
                  </form>
                )}
                </>
              )}
            />
            <p className="form-note">No commitment required. We typically respond within 1 business day.</p>
          </div>
        </div>
      </section>

      {/* CLIENT LOGOS */}
      <section className="logos">
        <div className="lp-container">
          <h2 className="h-md center">Trusted by leading brands</h2>
          <div className="logos-row">
            {CLIENT_LOGOS.map((l) => (
              <img key={l.file} src={asset(l.file)} alt={`${l.name} logo`} width={l.w} height={l.h} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* YELLOW ACHIEVEMENT STRIP */}
      <section className="ach">
        <div className="ach-grid">
          {achievements.map((a) => (
            <div key={a.num} className="ach-card">
              <div className="ach-icon">{a.icon}</div>
              <div className="ach-num">{a.num}</div>
              <div className="ach-label">{a.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section" id="pricing">
        <div className="lp-container">
          <h2 className="h-lg center">
            Pricing that's <span className="hl">transparent</span> from the first call.
          </h2>
          <div className="pricing-grid">
            {tiers.map((t) => (
              <div key={t.name} className={`price-card${t.featured ? " featured" : ""}`}>
                {t.featured && <span className="price-tag">Most popular</span>}
                <div className="price-name">{t.name}</div>
                <div className="price-for">{t.forWho}</div>
                <div className="price-amount">
                  {t.price}
                  <span> /month</span>
                </div>
                <div className="price-min">Billed monthly</div>
                <ul className="price-features">
                  {t.features.map((f) => (
                    <li key={f}>
                      <Check size={17} strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#quote-form" className={`btn ${t.featured ? "btn-white" : "btn-grad"} btn-full`}>
                  Request a quote <span className="btn-arrow">&rarr;</span>
                </a>
              </div>
            ))}
          </div>
          <p className="price-foot">
            Not sure which tier fits? Tell us your situation and we'll recommend one, including if that's the cheapest.
          </p>
        </div>
      </section>

      {/* PILLARS, PINK BLOCK */}
      <section className="block-pink">
        <div className="lp-container">
          <h2 className="h-lg on-color center">Technical, content, local, and AEO, all under one roof.</h2>
          <div className="pillars-grid">
            {pillars.map((p) => (
              <div key={p.title} className="pillar-card">
                <div className="pillar-icon">{p.icon}</div>
                <h4>{p.title}</h4>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="lp-section" id="results">
        <div className="lp-container">
          <h2 className="h-lg center">
            Rankings that show up in the <span className="hl-cyan">pipeline</span>, not just the report.
          </h2>

          <div className="cases">
            {cases.map((c) => (
              <div key={c.client} className={`case-card${c.reverse ? " reverse" : ""}`}>
                <div>
                  <div className="case-name">{c.client}</div>
                  <div className="case-kicker">{c.kicker}</div>
                  <p className="case-body">{c.body}</p>
                  <div className="case-stats">
                    {c.stats.map((s) => (
                      <div key={s.label}>
                        <div className="case-stat">{s.num}</div>
                        <div className="case-stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="case-callout">
                    <Sparkles size={18} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{c.callout}</span>
                  </div>
                  <div className="case-tags">
                    {c.tags.map((t) => (
                      <span key={t} className="pill">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="case-visual">
                  <img src={asset(c.visual)} alt={c.alt} width="2880" height="1620" loading="lazy" />
                </div>
              </div>
            ))}
          </div>

          <h3 className="verticals-heading">A long track record of success and experience in:</h3>
          <div className="verticals-row">
            {verticals.map((v) => (
              <span key={v} className="vertical-pill">{v}</span>
            ))}
            <span className="vertical-pill more">+ many more</span>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="lp-section">
        <div className="lp-container">
          <h2 className="h-lg center">The credentials that back up the work.</h2>
          <div className="partners-grid">
            {PARTNERS.map((p) => (
              <div key={p.file} className={`partner-card${p.lead ? " lead" : ""}`}>
                <img src={asset(p.file)} alt={`${p.name} badge`} width={p.w} height={p.h} loading="lazy" />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCREDITATION MARQUEE */}
      <section className="accred">
        <div className="accred-mask">
          <div className="accred-track">
            {ACCREDITATIONS.concat(ACCREDITATIONS).map((a, i) => (
              <div className="accred-item" key={`${a.file}-${i}`} aria-hidden={i >= ACCREDITATIONS.length}>
                <img src={asset(a.file)} alt={i < ACCREDITATIONS.length ? a.name : ""} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section" id="process">
        <div className="lp-container">
          <h2 className="h-lg center">From audit to authority, our six-step process.</h2>
          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="lp-section" id="team">
        <div className="lp-container">
          <h2 className="h-lg center">You get a team, not a ticket queue.</h2>
          <div className="team-card">
            <div className="team-copy">
              <h3>A dedicated Client Success Manager who knows your account.</h3>
              <p>
                Every engagement is run by a named Client Success Manager backed by our in-house technical, content, and
                local SEO specialists. Same team, start to finish, so you never re-explain your business to somebody new.
              </p>
              <p>
                They report on progress quarterly, flag algorithm shifts as they happen, and tell you what changed and
                why in plain language.
              </p>
            </div>
            <div className="team-photo">
              <img src={TEAM_PHOTO} alt="The Influence Agency team" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL, GRADIENT BLOCK */}
      <section className="block-grad">
        <div className="lp-container center">
          <h2 className="h-xl on-color">12 years and counting</h2>
          <p className="quote on-color">
            "We've been leveraging their expertise for over 12 years, and couldn't be happier to have them on our side."
          </p>
          <div className="quote-name on-color">Vito Mastrorillo</div>
          <div className="quote-meta on-color-muted">President, Clera Windows + Doors</div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section" id="faq">
        <div className="lp-container">
          <h2 className="h-lg center">Common questions.</h2>
          <div className="faq-list">
            {faqs.map((f) => (
              <div key={f.q} className="faq-item">
                <div className="faq-q">{f.q}</div>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="block-pink">
        <div className="lp-container cta-inner">
          <h2 className="h-lg on-color">
            Ready to stop <span className="hl">renting</span> your traffic?
          </h2>
          <p className="on-color-muted">Talk to a strategist. No commitment required.</p>
          <a href="#quote-form" className="btn btn-white">
            Boost my rankings <span className="btn-arrow">&rarr;</span>
          </a>
          <p className="cta-note on-color-muted">Plans from $3,500/month.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="lp-container footer-inner">
          <img src={TIA_LOGO} alt="The Influence Agency" width="136" height="40" />
          <div className="footer-copy">&copy; 2026 The Influence Agency. All rights reserved.</div>
          <div className="footer-links">
            <a href="https://theinfluenceagency.com/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            <a href="https://theinfluenceagency.com/terms-of-service" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className={`sticky-cta${showSticky && !submitted ? " show" : ""}`}>
        <a href="#quote-form" className="btn btn-grad">
          Request a quote <span className="btn-arrow">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
