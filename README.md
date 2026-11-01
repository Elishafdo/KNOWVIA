# KNOWVIA
### *Discover. Learn. Understand.*

**KNOWVIA** is a complete, modern, responsive article publishing website and editorial knowledge platform designed for deep-dive publications covering AI, technology, science, psychology, society, culture, environment, and modern discoveries.

Behind the public publication is a user-friendly **Editorial CMS & Admin Dashboard** that allows writing, previewing, scheduling, and publishing rich articles without touching code.

---

## 🌟 Key Features

### Public Website
- **Hero & Featured Story**: High-impact editorial showcase with reading time and category badges.
- **Latest Articles & Filtered Browsing**: Filter by category, sort by latest, popular, or oldest.
- **Individual Article Page (`/articles/[slug]`)**:
  - Distraction-free editorial reading width with typography optimized for long-form reading.
  - Full support for headings, blockquotes, code blocks, images with captions, tables, and embeddable media.
  - Interactive **Key Takeaways** section.
  - **Share Article** buttons (Copy Link, WhatsApp, X / Twitter, LinkedIn, Facebook).
  - Automatically recommended **Related Articles** and Previous / Next article navigation.
  - Real-time silent view counting.
- **Dynamic Category Hubs (`/categories` and `/category/[slug]`)**: Dedicated landing pages for each knowledge domain.
- **Comprehensive Search (`/search`)**: Real-time keyword search across titles, subtitles, content, tags, and categories.
- **About & Editorial Philosophy (`/about`)**: Clear statement of mission and pillars (Discover, Learn, Understand).
- **Contact & Feedback Desk (`/contact`)**: Built-in messaging channel for inquiries and editorial feedback.
- **Weekly Dispatch Newsletter**: Native subscription form on the homepage.
- **Automated SEO & Indexing**: Dynamic `sitemap.xml`, `robots.txt`, and Open Graph / Twitter Card metadata.

### Admin CMS (`/admin`)
- **Secure Single-Editor Authentication**: Protected session using JWT in `httpOnly` secure cookies.
- **Editorial Overview Dashboard**: Real-time metric cards (Total Articles, Published, Drafts, Scheduled, Direct Views) and recent articles audit table.
- **Rich Article Editor**:
  - Full WYSIWYG formatting toolbar: H1/H2/H3, Bold, Italic, Underline, Strikethrough, Lists, Blockquotes, Tables, Code blocks, Links, Embeds.
  - Upload cover images with drag-and-drop or select directly from the Media Library.
  - Tag management with search, addition, and reuse.
  - Custom Key Takeaways bullet builder.
  - Built-in **SEO Checklist Helper** that validates title, meta description length, slug, and alt text.
  - **Auto-Save**: Automatic draft persistence with status indicator (*"Saved just now"*, *"Saving..."*).
  - Status transitions: **Save Draft**, **Preview Mode**, **Publish Immediately**, or **Schedule for Future Publication**.
  - **Strictly single-writer**: No author fields or multi-author clutter.
- **Category Management**: Full CRUD interface to create, update, re-slug, and delete categories (with safety checks preventing deletion of categories with attached articles).
- **Media Library**: Upload, search, inspect dimensions, edit captions/alt text, and copy URLs.
- **Readership Analytics**: View genuine performance metrics without synthetic/fake data, with direct integration hooks ready for Plausible, Umami, or Google Analytics.
- **Site Settings**: Customize website name, tagline, description, social media profiles, and SEO defaults.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router, Turbopack)
- **UI & Styling**: [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), [Lucide React](https://lucide.dev)
- **Database ORM**: [Prisma](https://www.prisma.io)
- **Database Engine**:
  - Local development: SQLite (`dev.db`, zero-configuration)
  - Production deployment: PostgreSQL (Supabase, Neon, or Vercel Postgres)
- **Authentication**: `jose` (JWT) & `bcryptjs`
- **Language**: TypeScript

---

## 🔑 Default Admin Credentials

Access the CMS at:
```
http://localhost:3000/admin/login
```
- **Email / Username**: `admin@knowvia.com` (or `admin`)
- **Password**: `admin123`

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="knowvia-super-secret-jwt-token-key-2026-secure"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live website.

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), import your KNOWVIA repository.
3. Configure your production PostgreSQL database (e.g. from Supabase, Neon, or Vercel Postgres).
4. Set the following Environment Variables in Vercel:
   - `DATABASE_URL`: `postgresql://user:password@host:5432/knowvia?sslmode=require`
   - `JWT_SECRET`: A long random secret string.
   - `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g. `https://knowvia.vercel.app`).
5. In `prisma/schema.prisma`, update the datasource provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
6. Deploy! Vercel will automatically build and optimize your pages.

---

## 📄 License
© KNOWVIA. All rights reserved.
