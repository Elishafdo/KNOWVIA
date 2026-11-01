"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import KnowviaLogo from "@/components/KnowviaLogo";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
      setStatus("error");
      setErrorMsg("Please enter both your email/username and password.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Authentication failed.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setStatus("error");
      setErrorMsg("Connection error. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-white">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <KnowviaLogo size="lg" inverted={true} href="/" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-serif pt-2">
            Editorial CMS Access
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to create, edit, and publish KNOWVIA articles.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin@knowvia.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-950/50 p-3 text-xs text-rose-300 border border-rose-900/50">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus:outline-none disabled:opacity-60 transition-colors"
          >
            {status === "loading" ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-center text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300">Default Admin Credentials:</span>
          <div className="mt-1 flex items-center justify-center gap-3 text-[11px] font-mono text-sky-400">
            <span>admin@knowvia.com</span>
            <span>·</span>
            <span>admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
