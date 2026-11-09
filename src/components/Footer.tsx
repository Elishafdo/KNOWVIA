import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import KnowviaLogo from "./KnowviaLogo";
import { getSiteSettings } from "@/lib/settings";

export default async function Footer() {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      take: 8,
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }).catch(() => []),
    getSiteSettings(),
  ]);

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <KnowviaLogo size="md" showTagline={true} />
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {settings.description}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                Editorial Knowledge Publication
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-sky-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-sky-600 transition-colors">
                  All Articles
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-sky-600 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-sky-600 transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-600 transition-colors">
                  About KNOWVIA
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sky-600 transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Topics / Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Explore Topics
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-sky-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categories"
                  className="font-medium text-sky-600 hover:text-sky-700 transition-colors"
                >
                  View all topics &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Connect
            </h3>
            <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
              Discover stories, deep-dives, and insights published directly from our editorial desk.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {settings.socialX && (
                <a
                  href={settings.socialX}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  X (Twitter)
                </a>
              )}
              {settings.socialLinkedIn && (
                <a
                  href={settings.socialLinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  LinkedIn
                </a>
              )}
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  Facebook
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:flex sm:items-center sm:justify-between text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} KNOWVIA. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 italic font-serif">
            Discover. Learn. Understand.
          </p>
        </div>
      </div>
    </footer>
  );
}
