import React from "react";

interface ArticleRendererProps {
  content: string;
}

export default function ArticleRenderer({ content }: ArticleRendererProps) {
  if (!content) return null;

  return (
    <div
      className="knowvia-article-prose article-body-charter prose prose-xl dark:prose-invert max-w-none 
        text-zinc-900 dark:text-zinc-100
        prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-950 dark:prose-headings:text-white
        prose-h2:text-2xl sm:prose-h2:3xl md:prose-h2:4xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:leading-tight
        prose-h3:text-xl sm:prose-h3:2xl md:prose-h3:3xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:leading-snug
        prose-p:my-6 prose-p:text-[1.125rem] sm:prose-p:text-[1.2rem] md:prose-p:text-[1.28rem] prose-p:leading-[1.85] sm:prose-p:leading-[1.95] md:prose-p:leading-[2.0]
        prose-a:text-sky-600 prose-a:font-medium prose-a:underline hover:prose-a:text-sky-700
        prose-blockquote:border-l-4 prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50/50 dark:prose-blockquote:bg-sky-950/20 prose-blockquote:py-4 prose-blockquote:px-7 prose-blockquote:rounded-r-2xl prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-lg sm:prose-blockquote:text-xl md:prose-blockquote:text-[1.32rem] prose-blockquote:leading-relaxed prose-blockquote:text-zinc-800 dark:prose-blockquote:text-zinc-200
        prose-ul:list-disc prose-ul:my-6 prose-ul:pl-7
        prose-ol:list-decimal prose-ol:my-6 prose-ol:pl-7
        prose-li:my-2.5 prose-li:text-[1.08rem] sm:prose-li:text-[1.18rem] md:prose-li:text-[1.24rem] prose-li:leading-relaxed
        prose-img:rounded-2xl prose-img:shadow-md prose-img:my-10 prose-img:w-full
        prose-hr:my-12 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800
        prose-code:rounded prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-2 prose-code:py-0.5 prose-code:text-[0.95em] prose-code:font-mono prose-code:text-sky-700 dark:prose-code:text-sky-300
        prose-pre:rounded-2xl prose-pre:bg-zinc-900 prose-pre:p-6 prose-pre:text-zinc-100 prose-pre:border prose-pre:border-zinc-800
        prose-table:w-full prose-table:my-8 prose-table:border-collapse prose-table:text-base sm:prose-table:text-lg
        prose-th:border-b-2 prose-th:border-zinc-300 dark:prose-th:border-zinc-700 prose-th:p-3.5 prose-th:text-left prose-th:font-semibold
        prose-td:border-b prose-td:border-zinc-200 dark:prose-td:border-zinc-800 prose-td:p-3.5"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
