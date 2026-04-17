"use client";

import { useEffect } from "react";

export function CoffeeButton() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "preplypulse");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-emoji", "");
    script.setAttribute("data-font", "Bree");
    script.setAttribute("data-text", "Buy me an espresso");
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#ffffff");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      const btn = document.getElementById("bmc-wbtn");
      if (btn) btn.remove();
    };
  }, []);

  return null;
}
