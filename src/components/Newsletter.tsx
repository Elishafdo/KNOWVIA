"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      } else {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing to KNOWVIA!");
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-zinc-900 py-12 px-6 text-white sm:px-12 lg:py-16 dark:bg-zinc-900/90 border border-zinc-800">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full bg-sky-950/60 px-3 py-1 text-xs font-semibold tracking-wider text-sky-400 uppercase mb-3 border border-sky-800/40">
          Weekly Editorial Dispatch
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">
          Stay Curious
        </h2>
        <p className="mt-3 text-base text-zinc-300 sm:text-lg leading-relaxed">
          Get interesting ideas, breakthrough discoveries, and thoughtful articles from KNOWVIA delivered directly to your inbox.
        </p>

        {status === "success" ? (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-sky-950/70 p-4 text-sky-300 border border-sky-800/50">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-full border border-zinc-700 bg-zinc-800/80 pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60 transition-all sm:w-auto"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4" />
            <span>{message}</span>
          </div>
        )}

        <p className="mt-4 text-xs text-zinc-500">
          No spam, ever. Unsubscribe at any time with a single click.
        </p>
      </div>
    </section>
  );
}
