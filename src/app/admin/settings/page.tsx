"use client";

import React, { useEffect, useState } from "react";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import { Save, CheckCircle, AlertTriangle, Settings, Globe, Share2, Search } from "lucide-react";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    siteName: "KNOWVIA",
    tagline: "Discover. Learn. Understand.",
    description: "",
    logoUrl: "",
    faviconUrl: "",
    socialX: "",
    socialLinkedIn: "",
    socialFacebook: "",
    socialInstagram: "",
    socialYouTube: "",
    defaultSeoTitle: "",
    defaultMetaDescription: "",
    defaultSocialImage: "",
    themeAccent: "#0284c7",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setForm((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update settings");
      } else {
        setMsg("Website settings successfully saved.");
        setTimeout(() => setMsg(""), 4000);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif">
            Website Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Configure global website identity, default metadata, and social channels.
          </p>
        </div>

        {msg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs sm:text-sm font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4" />
            <span>{msg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs sm:text-sm font-semibold text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">Loading settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Identity */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Globe className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  General Identity
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.siteName}
                    onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    required
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Website Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Custom Logo URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.logoUrl || ""}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="/logo.svg or https://..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Favicon URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.faviconUrl || ""}
                    onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                    placeholder="/favicon.ico or https://..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Share2 className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Social Channels
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    X (Twitter)
                  </label>
                  <input
                    type="text"
                    value={form.socialX || ""}
                    onChange={(e) => setForm({ ...form, socialX: e.target.value })}
                    placeholder="https://x.com/knowvia"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={form.socialLinkedIn || ""}
                    onChange={(e) => setForm({ ...form, socialLinkedIn: e.target.value })}
                    placeholder="https://linkedin.com/company/knowvia"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={form.socialFacebook || ""}
                    onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={form.socialInstagram || ""}
                    onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Default SEO */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Search className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Default SEO & Social Open Graph
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Default SEO Title
                </label>
                <input
                  type="text"
                  value={form.defaultSeoTitle || ""}
                  onChange={(e) => setForm({ ...form, defaultSeoTitle: e.target.value })}
                  placeholder="KNOWVIA — Discover. Learn. Understand."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={form.defaultMetaDescription || ""}
                  onChange={(e) => setForm({ ...form, defaultMetaDescription: e.target.value })}
                  placeholder="Default description for site pages and search snippets..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white leading-relaxed"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-500 focus:outline-none disabled:opacity-60 transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving Changes..." : "Save Website Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayoutShell>
  );
}
