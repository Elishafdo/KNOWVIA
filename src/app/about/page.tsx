import React from "react";
import Link from "next/link";
import KnowviaLogo from "@/components/KnowviaLogo";
import { Compass, BookOpen, Lightbulb, Globe, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About | KNOWVIA",
  description: "Discover the editorial philosophy and mission behind KNOWVIA — Discover. Learn. Understand.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 space-y-16">
      {/* Hero / Philosophy */}
      <div className="space-y-6 text-center sm:text-left border-b border-zinc-200 pb-12 dark:border-zinc-800">
        <KnowviaLogo size="lg" showTagline={true} />

        <h1 className="mt-6 text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-serif leading-tight">
          A dedicated sanctuary for inquiry, discovery, and clarity.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
          KNOWVIA was created with a clear imperative: in a world overwhelmed by fragmented snippets, sensational soundbites, and fleeting distractions, genuine depth and systematic understanding remain rare treasures.
        </p>
      </div>

      {/* The Pillars */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-white">
          Our Three Guiding Principles
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 mb-4">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white">
              1. Discover
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Uncovering hidden patterns, unexplored historical connections, novel technologies, and remarkable facts across our physical and digital universe.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 mb-4">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white">
              2. Learn
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Synthesizing complex subjects into clear, rigorous, well-reasoned narratives that respect the reader&apos;s intelligence and time.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 mb-4">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white">
              3. Understand
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Moving beyond factual accumulation to achieve real cognitive insight: understanding why things work, how they evolve, and what they mean.
            </p>
          </div>
        </div>
      </section>

      {/* Scope of Topics */}
      <section className="rounded-3xl bg-zinc-50 p-8 sm:p-10 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
        <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-white">
          Breadth of Subjects
        </h2>
        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
          Articles published on KNOWVIA span artificial intelligence, space and terrestrial sciences, cognitive psychology, economic trends, environmental transitions, social dynamics, global history, and thoughtful opinions.
        </p>
        <div className="pt-4 flex flex-wrap gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full">AI & Machine Learning</span>
          <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full">Neuroscience & Mind</span>
          <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full">Earth & Climate</span>
          <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full">History & Archeology</span>
          <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full">Economics & Global Affairs</span>
        </div>
      </section>

      {/* Editorial Contact Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-white">
            Have questions or suggestions?
          </h3>
          <p className="text-sm text-zinc-500">
            We welcome constructive feedback, editorial tips, and interesting inquiries.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors"
        >
          Contact Editorial Desk
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
