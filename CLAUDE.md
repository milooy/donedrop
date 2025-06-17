# CLAUDE.md

Always answer in Korean.
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "donedrop" - a todo list application with analog sensibility, designed to mimic placing sticky notes on a memo board. When tasks are completed, they are crumpled and thrown into a glass jar with satisfying animations and sound effects. The app features a badge system for achievements and an inbox concept for upcoming tasks.

## Development Commands

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint code quality checks

## Architecture

### Tech Stack

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4, Radix UI components
- **Database**: Supabase with SSR support
- **Analytics**: Vercel Analytics

### Project Structure

```
src/
├── app/        # Next.js App Router pages and API routes
├── components/ # Reusable UI components (includes shadcn/ui components)
├── contexts/   # React Context providers (AuthContext for Supabase auth)
└── lib/        # Utilities and configurations (auth, supabase, bookmarks, folders, tags)
```

### Key Features & Concepts

- **Analog UI**: Wood background memo board with colorful sticky notes
- **Interactive Animations**: Drag to complete tasks, crumple animation, throwing into glass jar
- **Badge System**: Achievements when jar fills up with completed tasks
- **Inbox System**: Queue of upcoming tasks that can be dragged to main board
- **Sound Effects**: ASMR-style audio for crumpling and throwing actions

### Authentication & Data

- Uses Supabase auth with Google OAuth
- AuthContext provides user state management
- Auth callback handled at `/auth/callback` route
- User data separated by authentication state

### UI Components

- Built with Radix UI primitives and shadcn/ui patterns
- Uses Tailwind CSS for styling with custom design tokens
- Implements Geist font family (sans and mono variants)
- Korean language support (html lang="ko")

## Environment Setup

The project requires Supabase environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copy from `env.example` to `.env.local` for local development.

## Development Notes

- Components should follow the established patterns in `/components/ui/`
- Authentication state is managed through AuthContext
- All Supabase interactions go through the configured client in `lib/supabase.ts`
- The app uses Korean language by default
- Focus on analog/tactile UI interactions with animations and sound
