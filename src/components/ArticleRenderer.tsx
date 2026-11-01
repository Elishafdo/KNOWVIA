import React from "react";

interface ArticleRendererProps {
  content: string;
}

export default function ArticleRenderer({ content }: ArticleRendererProps) {
  if (!content) return null;

  return (
    <div
      className="knowvia-article-prose prose prose-lg dark:prose-invert max-w-none 
        leading-relaxed text-zinc-800 dark:text-zinc-200
        prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-950 dark:prose-headings:text-white
        prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:my-5 prose-p:leading-8 prose-p:text-base sm:prose-p:text-lg
        prose-a:text-sky-600 prose-a:font-medium prose-a:underline hover:prose-a:text-sky-700
        prose-blockquote:border-l-4 prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50/50 dark:prose-blockquote:bg-sky-950/20 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300
        prose-ul:list-disc prose-ul:my-5 prose-ul:pl-6
        prose-ol:list-decimal prose-ol:my-5 prose-ol:pl-6
        prose-li:my-2 prose-li:leading-7
        prose-img:rounded-2xl prose-img:shadow-md prose-img:my-8 prose-img:w-full
        prose-hr:my-10 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800
        prose-code:rounded prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-sky-700 dark:prose-code:text-sky-300
        prose-pre:rounded-2xl prose-pre:bg-zinc-900 prose-pre:p-5 prose-pre:text-zinc-100 prose-pre:border prose-pre:border-zinc-800
        prose-table:w-full prose-table:my-6 prose-table:border-collapse prose-table:text-sm
        prose-th:border-b-2 prose-th:border-zinc-300 dark:prose-th:border-zinc-700 prose-th:p-3 prose-th:text-left prose-th:font-semibold
        prose-td:border-b prose-td:border-zinc-200 dark:prose-td:border-zinc-800 prose-td:p-3"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
