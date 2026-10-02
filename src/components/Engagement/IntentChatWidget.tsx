"use client";

import { useEffect } from "react";

/**
 * IntentChat AI sales-agent widget.
 *
 * Paste the embed <script> tag from the IntentChat dashboard into
 * NEXT_PUBLIC_INTENTCHAT_EMBED, e.g.:
 *   <script src="https://app.intentchat.com/widget.js" data-widget-id="abc123" defer></script>
 * The component extracts the src + attributes and injects the script once.
 * Nothing renders when the env var is unset.
 */
const EMBED = process.env.NEXT_PUBLIC_INTENTCHAT_EMBED || "";

export default function IntentChatWidget() {
  useEffect(() => {
    if (!EMBED) return;

    const match = EMBED.match(/<script\s+([^>]*?)\/?>/i);
    if (!match) return;

    const script = document.createElement("script");
    const attrs = match[1];
    const attrRe = /([\w-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
    let m: RegExpExecArray | null;
    let src = "";
    while ((m = attrRe.exec(attrs))) {
      const name = m[1];
      const value = m[2] ? m[2].replace(/^["']|["']$/g, "") : "";
      if (name === "src") {
        src = value;
      } else {
        script.setAttribute(name, value || "true");
      }
    }
    if (!src) return;

    script.src = src;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return null;
}
