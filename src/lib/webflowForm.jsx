import React, { useEffect, useRef, useState } from "react";

/*
  Adopts a native Webflow form into a React-rendered slot.

  Why: the page layout is rendered by React, but submissions must stay Webflow's so the
  submission table, email notifications, the thank-you redirect and Lead Legend all keep
  working with zero new plumbing. Webflow binds its submit handler to the <form> element,
  and DOM listeners survive appendChild, so moving the whole `.w-form` wrapper into our
  slot keeps everything wired.

  The Webflow page must contain, outside the React root:

    <div id="tia-form-shell" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden">
      <!-- Webflow Form Block, with the form's ID set to the page's FORM_ID -->
    </div>

  `selectOptions` fills a <select> by field name, because Webflow's Data API cannot write
  select options. `onSubmit` fires a dataLayer event before Webflow's own handler runs.
*/
export default function WebflowFormSlot({
  shellId = "tia-form-shell",
  selectOptions = {},
  onSubmit,
  renderFallback,
  className = "",
}) {
  const slotRef = useRef(null);
  const [state, setState] = useState("pending"); // pending | adopted | missing

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    const shell = document.getElementById(shellId);
    const wrapper = shell && (shell.querySelector(".w-form") || shell.firstElementChild);
    if (!wrapper) {
      setState("missing");
      return;
    }

    // Move, don't clone. Cloning would drop Webflow's handlers.
    slot.appendChild(wrapper);
    shell.removeAttribute("style");
    shell.setAttribute("data-tia-form-adopted", "true");

    const form = wrapper.querySelector("form");

    Object.entries(selectOptions).forEach(([name, options]) => {
      const select = wrapper.querySelector(`select[name="${name}"]`);
      if (!select) return;
      select.innerHTML = "";
      options.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        select.appendChild(opt);
      });
    });

    let handler;
    if (form && onSubmit) {
      handler = () => onSubmit(form);
      form.addEventListener("submit", handler);
    }

    setState("adopted");
    return () => {
      if (form && handler) form.removeEventListener("submit", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={slotRef} className={`wf-slot ${className}`} data-state={state}>
      {state === "missing" && renderFallback ? renderFallback() : null}
    </div>
  );
}

/* Pushes a dataLayer event so GTM can fire the Google Ads conversion and the GA4 event. */
export function trackConversion(name, payload) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...payload });
}
