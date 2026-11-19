"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail (e.g. insecure context) — fail silently, link still works via href
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group inline-flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-3 font-mono text-sm text-ink transition-colors duration-300 hover:border-accent/50 hover:bg-surface2"
      aria-live="polite"
    >
      <span>{email}</span>
      {copied ? (
        <Check size={16} className="text-accent-soft" />
      ) : (
        <Copy size={16} className="text-muted transition-colors duration-300 group-hover:text-accent-soft" />
      )}
      <span className="sr-only">{copied ? "Email copied to clipboard" : "Copy email to clipboard"}</span>
    </button>
  );
}
