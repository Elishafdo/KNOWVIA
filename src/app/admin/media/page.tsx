"use client";

import React, { useEffect, useState, useCallback } from "react";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  X,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  caption: string | null;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
}

export default function AdminMediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/media${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      setMediaList(data.media || []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("altText", file.name);

        await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });
      }

      setMsg("Images uploaded successfully.");
      setTimeout(() => setMsg(""), 3500);
      loadMedia();
    } catch {
      alert("Failed to upload some images");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedMedia(null);
        setMsg("Image deleted.");
        setTimeout(() => setMsg(""), 3000);
        loadMedia();
      }
    } catch {
      alert("Failed to delete media");
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;

    try {
      const res = await fetch(`/api/admin/media/${selectedMedia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          altText: selectedMedia.altText,
          caption: selectedMedia.caption,
        }),
      });

      if (res.ok) {
        setMsg("Media details updated.");
        setTimeout(() => setMsg(""), 3000);
        loadMedia();
      }
    } catch {
      alert("Failed to update media info");
    }
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif">
              Media Library
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Upload, manage, inspect, and reuse editorial images and photography.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors self-start sm:self-auto">
            <Upload className="h-4 w-4" />
            <span>{uploading ? "Uploading..." : "Upload New Files"}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        </div>

        {msg && (
          <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
            {msg}
          </div>
        )}

        {/* Search Bar */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by filename, alt text, or caption..."
              className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
            />
          </div>
        </div>

        {/* Media Grid & Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Grid (8 cols or 12 cols if nothing selected) */}
          <div className={selectedMedia ? "lg:col-span-8" : "lg:col-span-12"}>
            {loading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
                Loading media assets...
              </div>
            ) : mediaList.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-800">
                <ImageIcon className="mx-auto h-12 w-12 text-zinc-400" />
                <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white font-serif">
                  No images uploaded yet
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Upload high-resolution photography for your articles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaList.map((item) => {
                  const isSelected = selectedMedia?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border bg-zinc-100 transition-all ${
                        isSelected
                          ? "border-sky-600 ring-2 ring-sky-500/20 shadow-md"
                          : "border-zinc-200 hover:border-sky-300 dark:border-zinc-800 dark:bg-zinc-800"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.altText || item.filename}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="truncate text-[10px] font-medium">{item.filename}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Inspector Drawer (4 cols) */}
          {selectedMedia && (
            <div className="lg:col-span-4 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <h3 className="text-sm font-bold font-serif text-zinc-900 dark:text-white">
                  Image Details
                </h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Preview */}
              <div className="aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.altText || ""}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Meta details */}
              <div className="space-y-1 text-xs text-zinc-500">
                <p className="truncate font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedMedia.filename}
                </p>
                <p>Uploaded on {formatDate(selectedMedia.createdAt)}</p>
                {selectedMedia.size && (
                  <p>{Math.round(selectedMedia.size / 1024)} KB</p>
                )}
              </div>

              {/* Copy URL */}
              <button
                type="button"
                onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {copiedId === selectedMedia.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Image Link</span>
                  </>
                )}
              </button>

              {/* Edit Alt Text and Caption Form */}
              <form onSubmit={handleUpdateDetails} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Alt Text (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.altText || ""}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, altText: e.target.value })
                    }
                    placeholder="Describe for screen readers..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Editorial Caption
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.caption || ""}
                    onChange={(e) =>
                      setSelectedMedia({ ...selectedMedia, caption: e.target.value })
                    }
                    placeholder="Photo credits or descriptive caption..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedMedia.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}
