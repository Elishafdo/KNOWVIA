"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Table as TableIcon,
  Video,
  CheckCircle,
  AlertTriangle,
  Upload,
  Calendar,
  Eye,
  Save,
  Send,
  X,
  Plus,
  Layers,
  Sparkles,
  Compass,
} from "lucide-react";
import { slugify, calculateReadingTime } from "@/lib/utils";
import ArticleRenderer from "../ArticleRenderer";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleEditorProps {
  initialArticle?: {
    id?: string;
    title?: string;
    subtitle?: string;
    slug?: string;
    content?: string;
    coverImage?: string;
    coverImageAlt?: string;
    coverImageCaption?: string;
    categoryId?: string;
    status?: string;
    publishedAt?: string;
    scheduledAt?: string;
    seoTitle?: string;
    metaDescription?: string;
    isFeatured?: boolean;
    isDiscover?: boolean;
    keyTakeaways?: string;
    tags?: { tag: { id: string; name: string } }[];
  };
  isNew?: boolean;
}

export default function ArticleEditor({ initialArticle, isNew = false }: ArticleEditorProps) {
  const router = useRouter();

  // Basic info
  const [articleId, setArticleId] = useState(initialArticle?.id || "");
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || "");
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || "");
  const [coverImageAlt, setCoverImageAlt] = useState(initialArticle?.coverImageAlt || "");
  const [coverImageCaption, setCoverImageCaption] = useState(initialArticle?.coverImageCaption || "");
  const [categoryId, setCategoryId] = useState(initialArticle?.categoryId || "");
  const [content, setContent] = useState(initialArticle?.content || "");
  const [isFeatured, setIsFeatured] = useState(Boolean(initialArticle?.isFeatured));
  const [isDiscover, setIsDiscover] = useState(Boolean(initialArticle?.isDiscover));

  // Tags
  const [tags, setTags] = useState<string[]>(
    initialArticle?.tags?.map((t) => t.tag.name) || []
  );
  const [tagInput, setTagInput] = useState("");

  // Key takeaways
  const [takeaways, setTakeaways] = useState<string[]>(() => {
    if (!initialArticle?.keyTakeaways) return [];
    try {
      const parsed = JSON.parse(initialArticle.keyTakeaways);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return initialArticle.keyTakeaways.split("\n").filter(Boolean);
    }
  });
  const [newTakeaway, setNewTakeaway] = useState("");

  // SEO
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialArticle?.slug));
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialArticle?.metaDescription || "");

  // Status & Scheduling
  const [status, setStatus] = useState(initialArticle?.status || "DRAFT");
  const [scheduledAt, setScheduledAt] = useState(
    initialArticle?.scheduledAt ? new Date(initialArticle.scheduledAt).toISOString().slice(0, 16) : ""
  );

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);

  // UI state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "unsaved">("idle");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState<{ id: string; url: string; filename: string; altText: string }[]>([]);
  const [mediaSearch, setMediaSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Rich text editor ref
  const editorRef = useRef<HTMLDivElement>(null);

  // Load categories and media
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (isNew && data.categories?.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      })
      .catch(console.error);

    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data) => setMediaList(data.media || []))
      .catch(console.error);
  }, [isNew, categoryId]);

  // Sync content into editable div on initial load
  useEffect(() => {
    if (editorRef.current && initialArticle?.content) {
      if (editorRef.current.innerHTML !== initialArticle.content) {
        editorRef.current.innerHTML = initialArticle.content;
      }
    }
  }, [initialArticle]);

  // Auto-slugify when title changes (if not manually edited)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newTitle));
    }
    if (!seoTitle) {
      setSeoTitle(newTitle);
    }
    setSaveStatus("unsaved");
  };

  // Editor command handler
  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setSaveStatus("unsaved");
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleInsertImageDirectly = () => {
    const url = prompt("Enter image URL:", "https://");
    if (url) {
      executeCommand("insertImage", url);
    }
  };

  const handleInsertVideo = () => {
    const url = prompt("Enter YouTube / Video Embed URL (e.g. https://www.youtube.com/embed/...):");
    if (url) {
      const iframeHtml = `<div class="aspect-video my-6"><iframe src="${url}" class="w-full h-full rounded-2xl" frameborder="0" allowfullscreen></iframe></div><p></p>`;
      executeCommand("insertHTML", iframeHtml);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="w-full my-6 border-collapse border border-zinc-300 dark:border-zinc-700">
        <thead>
          <tr class="bg-zinc-100 dark:bg-zinc-800">
            <th class="border border-zinc-300 dark:border-zinc-700 p-2 font-bold">Header 1</th>
            <th class="border border-zinc-300 dark:border-zinc-700 p-2 font-bold">Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-zinc-300 dark:border-zinc-700 p-2">Item A</td>
            <td class="border border-zinc-300 dark:border-zinc-700 p-2">Detail 1</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    executeCommand("insertHTML", tableHtml);
  };

  // Upload image handler
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", title || file.name);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.media) {
        setCoverImage(data.media.url);
        setCoverImageAlt(data.media.altText || "");
        setMediaList((prev) => [data.media, ...prev]);
        setSuccessMessage("Image uploaded successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch {
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  // Tag management
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
      setSaveStatus("unsaved");
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setTags(tags.filter((t) => t !== tagName));
    setSaveStatus("unsaved");
  };

  // Takeaways
  const handleAddTakeaway = () => {
    const trimmed = newTakeaway.trim();
    if (trimmed) {
      setTakeaways([...takeaways, trimmed]);
      setNewTakeaway("");
      setSaveStatus("unsaved");
    }
  };

  const handleRemoveTakeaway = (idx: number) => {
    setTakeaways(takeaways.filter((_, i) => i !== idx));
    setSaveStatus("unsaved");
  };

  // Save / Publish / Schedule handler
  const handleSave = async (targetStatus?: "DRAFT" | "PUBLISHED" | "SCHEDULED") => {
    if (!title.trim()) {
      setErrorMessage("Please enter an article title.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Please select a category.");
      return;
    }

    const currentContent = editorRef.current?.innerHTML || content;
    const finalStatus = targetStatus || status;

    if (finalStatus === "SCHEDULED" && !scheduledAt) {
      setErrorMessage("Please select a publication date & time for scheduled publishing.");
      return;
    }

    setSaveStatus("saving");
    setErrorMessage("");

    const payload = {
      title,
      subtitle,
      slug: slug || slugify(title),
      content: currentContent,
      coverImage,
      coverImageAlt,
      coverImageCaption,
      categoryId,
      status: finalStatus,
      scheduledAt: finalStatus === "SCHEDULED" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      seoTitle: seoTitle || title,
      metaDescription: metaDescription || subtitle,
      isFeatured,
      isDiscover,
      keyTakeaways: takeaways,
      tags,
    };

    try {
      const url = articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles";
      const method = articleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveStatus("unsaved");
        setErrorMessage(data.error || "Unable to save article. Please try again.");
      } else {
        setSaveStatus("saved");
        setStatus(finalStatus);
        if (data.article?.id) {
          setArticleId(data.article.id);
        }

        const actionText =
          finalStatus === "PUBLISHED"
            ? "Article published successfully."
            : finalStatus === "SCHEDULED"
            ? "Article scheduled successfully."
            : "Article saved as draft.";

        setSuccessMessage(actionText);
        setTimeout(() => setSuccessMessage(""), 4000);

        if (isNew && data.article?.id) {
          router.replace(`/admin/articles/${data.article.id}/edit`);
        }
      }
    } catch {
      setSaveStatus("unsaved");
      setErrorMessage("Network error while saving. Please try again.");
    }
  };

  // Auto-save debounced effect
  useEffect(() => {
    if (saveStatus !== "unsaved") return;

    const timer = setTimeout(() => {
      // Auto-save silently as draft if title exists
      if (title.trim() && categoryId) {
        handleSave(status as any);
      }
    }, 15000); // 15 seconds debounce

    return () => clearTimeout(timer);
  }, [title, subtitle, content, slug, categoryId, coverImage, tags, takeaways, saveStatus, status]);

  // SEO Checklist items
  const seoChecklist = [
    { label: "SEO Title added", passed: Boolean(seoTitle.trim()) },
    {
      label: "Meta description added",
      passed: Boolean(metaDescription.trim()),
      warning: metaDescription.length > 160 ? "Meta description is too long (> 160 chars)" : undefined,
    },
    { label: "URL slug configured", passed: Boolean(slug.trim()) },
    { label: "Cover image added", passed: Boolean(coverImage) },
    { label: "Cover image alt text added", passed: Boolean(coverImageAlt.trim()) },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top action header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-16 z-20 bg-zinc-100/90 dark:bg-zinc-950/90 backdrop-blur-md py-4 border-b border-zinc-200 dark:border-zinc-800 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900 dark:text-white">
            {isNew ? "Create New Article" : "Edit Article"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            {saveStatus === "saving" && <span className="text-sky-600 font-medium">Saving...</span>}
            {saveStatus === "saved" && <span className="text-emerald-600 font-medium">Saved just now</span>}
            {saveStatus === "unsaved" && <span className="text-amber-600 font-medium">Unsaved changes</span>}
            {saveStatus === "idle" && <span className="text-zinc-400">All changes saved</span>}
            <span>·</span>
            <span className="text-zinc-500">
              Est. {calculateReadingTime(content)} min read
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Save Draft */}
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Save className="h-4 w-4 text-zinc-500" />
            Save Draft
          </button>

          {/* Preview */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Eye className="h-4 w-4 text-zinc-500" />
            Preview
          </button>

          {/* Schedule */}
          <button
            type="button"
            onClick={() => {
              if (!scheduledAt) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(9, 0, 0, 0);
                setScheduledAt(tomorrow.toISOString().slice(0, 16));
              }
              handleSave("SCHEDULED");
            }}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-xs sm:text-sm font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </button>

          {/* Publish */}
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus:outline-none transition-colors"
          >
            <Send className="h-4 w-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column (8 cols): Title, Subtitle, Rich Editor, Key Takeaways */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Subtitle */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter an evocative, intelligent title..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg font-serif font-bold text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Subtitle / Introduction
              </label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={(e) => {
                  setSubtitle(e.target.value);
                  setSaveStatus("unsaved");
                }}
                placeholder="Short subtitle or executive summary introducing the article..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white leading-relaxed"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/50">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Article Content
              </span>
              <span className="text-xs text-zinc-400">
                WYSIWYG Formatting Toolbar
              </span>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 p-2 bg-zinc-50/40 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300">
              {/* Headings */}
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<h1>")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<h2>")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<h3>")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<p>")}
                className="px-2 py-1 text-xs font-bold rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Paragraph"
              >
                ¶
              </button>

              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

              {/* Inlines */}
              <button
                type="button"
                onClick={() => executeCommand("bold")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("italic")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("underline")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("strikeThrough")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

              {/* Lists & Quotes */}
              <button
                type="button"
                onClick={() => executeCommand("insertUnorderedList")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("insertOrderedList")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<blockquote>")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("formatBlock", "<pre>")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Code Block"
              >
                <Code className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

              {/* Links & Inserts */}
              <button
                type="button"
                onClick={handleInsertLink}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertImageDirectly}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Insert Video Embed"
              >
                <Video className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Insert Table"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("insertHorizontalRule")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Horizontal Rule"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1" />

              {/* Undo / Redo */}
              <button
                type="button"
                onClick={() => executeCommand("undo")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand("redo")}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>

            {/* Editable Canvas */}
            <div
              ref={editorRef}
              contentEditable
              onInput={() => {
                if (editorRef.current) {
                  setContent(editorRef.current.innerHTML);
                  setSaveStatus("unsaved");
                }
              }}
              className="min-h-[420px] p-6 text-[1.125rem] sm:text-[1.2rem] md:text-[1.26rem] leading-[1.95] text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none article-body-charter"
              style={{ minHeight: "420px" }}
            />
          </div>

          {/* Key Takeaways Section */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Key Takeaways (Optional)
                </h3>
                <p className="text-xs text-zinc-500">
                  Highlight key bullet points displayed prominently at the bottom of the article.
                </p>
              </div>
            </div>

            {/* Takeaways List */}
            {takeaways.length > 0 && (
              <ul className="space-y-2">
                {takeaways.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-sky-600">•</span>
                      <span>{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTakeaway(idx)}
                      className="text-zinc-400 hover:text-rose-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add Takeaway Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTakeaway}
                onChange={(e) => setNewTakeaway(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTakeaway();
                  }
                }}
                placeholder="Enter a key takeaway and press Add..."
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
              />
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Column (4 cols): Cover Image, Category, Tags, SEO, Publication Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Status & Schedule */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Publication Status
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setSaveStatus("unsaved");
                }}
                aria-label="Publication Status"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
              >
                <option value="DRAFT">Draft (Unpublished)</option>
                <option value="PUBLISHED">Published (Live)</option>
                <option value="SCHEDULED">Scheduled (Future)</option>
              </select>
            </div>

            {status === "SCHEDULED" && (
              <div className="pt-2 space-y-1">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setSaveStatus("unsaved");
                  }}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
                />
                <p className="text-[11px] text-zinc-400">
                  Article will automatically go live when this time arrives.
                </p>
              </div>
            )}

            {/* Editorial Badges */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => {
                    setIsFeatured(e.target.checked);
                    setSaveStatus("unsaved");
                  }}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  Hero Featured Article
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDiscover}
                  onChange={(e) => {
                    setIsDiscover(e.target.checked);
                    setSaveStatus("unsaved");
                  }}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-amber-500" />
                  Interesting / Discover Section
                </span>
              </label>
            </div>
          </div>

          {/* Category Selection */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Category <span className="text-rose-500">*</span>
            </h3>

            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSaveStatus("unsaved");
              }}
              aria-label="Select Category"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
            >
              <option value="" disabled>
                Select Category ▼
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-400">
              Categories are manageable from the CMS Categories page.
            </p>
          </div>

          {/* Cover Image Upload / Picker */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Cover Image
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
              >
                Media Library
              </button>
            </div>

            {coverImage ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={coverImage}
                    alt={coverImageAlt || "Cover"}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage("");
                      setSaveStatus("unsaved");
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={coverImageAlt}
                    onChange={(e) => {
                      setCoverImageAlt(e.target.value);
                      setSaveStatus("unsaved");
                    }}
                    placeholder="Describe image for screen readers"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Image Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={coverImageCaption}
                    onChange={(e) => {
                      setCoverImageCaption(e.target.value);
                      setSaveStatus("unsaved");
                    }}
                    placeholder="Caption displayed below image"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                <ImageIcon className="h-8 w-8 text-zinc-400" />
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Upload an image or paste a URL
                </p>

                <div className="mt-4 flex gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter image URL:");
                      if (url) {
                        setCoverImage(url);
                        setSaveStatus("unsaved");
                      }
                    }}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Image URL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Tags
            </h3>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tags (e.g. AI, Physics)..."
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Add
              </button>
            </div>
          </div>

          {/* SEO Section */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              SEO & Social Metadata
            </h3>

            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setIsSlugManuallyEdited(true);
                  setSaveStatus("unsaved");
                }}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-mono text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
              />
              <p className="mt-1 text-[10px] text-zinc-400">
                /articles/{slug || "slug-preview"}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTitle(e.target.value);
                  setSaveStatus("unsaved");
                }}
                placeholder="Search engine title..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-zinc-500">
                  Meta Description
                </label>
                <span className={`text-[10px] ${metaDescription.length > 160 ? "text-rose-500 font-bold" : "text-zinc-400"}`}>
                  {metaDescription.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => {
                  setMetaDescription(e.target.value);
                  setSaveStatus("unsaved");
                }}
                placeholder="Summary for search results (recommended under 160 characters)..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white leading-relaxed"
              />
            </div>

            {/* SEO Helper Checklist */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                SEO Check
              </span>
              <ul className="space-y-1.5 text-xs">
                {seoChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    {item.passed ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-zinc-300 dark:border-zinc-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={item.passed ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}>
                      {item.label}
                    </span>
                    {item.warning && (
                      <span className="text-amber-500 text-[10px] block">
                        ({item.warning})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-10 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800 mb-6">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                Article Preview Mode
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <article className="space-y-6">
              {categoryId && (
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  {categories.find((c) => c.id === categoryId)?.name || "Category"}
                </span>
              )}

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif text-zinc-900 dark:text-white">
                {title || "Untitled Article"}
              </h1>

              {subtitle && (
                <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
                  {subtitle}
                </p>
              )}

              {coverImage && (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={coverImage}
                    alt={coverImageAlt || title}
                    className="w-full max-h-[460px] object-cover"
                  />
                  {coverImageCaption && (
                    <p className="p-2 text-center text-xs text-zinc-400 italic">
                      {coverImageCaption}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <ArticleRenderer content={editorRef.current?.innerHTML || content} />
              </div>

              {takeaways.length > 0 && (
                <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50/70 p-6 dark:border-sky-900 dark:bg-sky-950/20">
                  <h3 className="font-serif font-bold text-sky-800 dark:text-sky-300 mb-3">
                    Key Takeaways
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {takeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-sky-600">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl bg-zinc-900 px-6 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800 mb-4">
              <h3 className="text-base font-bold font-serif text-zinc-900 dark:text-white">
                Select Cover Image from Media Library
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search media by filename or alt text..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:bg-zinc-800 dark:focus:text-white"
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
              {mediaList
                .filter((m) =>
                  mediaSearch
                    ? m.filename?.toLowerCase().includes(mediaSearch.toLowerCase()) ||
                      m.altText?.toLowerCase().includes(mediaSearch.toLowerCase())
                    : true
                )
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCoverImage(item.url);
                      setCoverImageAlt(item.altText || "");
                      setShowMediaModal(false);
                      setSaveStatus("unsaved");
                    }}
                    className="group relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 hover:border-sky-500 dark:border-zinc-800 dark:bg-zinc-800"
                  >
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                      Select
                    </div>
                  </button>
                ))}
            </div>

            {mediaList.length === 0 && (
              <p className="text-center text-xs text-zinc-400 py-8">
                No uploaded media found yet. Upload images via the Media Library or the upload button.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
