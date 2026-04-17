# PickIT — Print Request Platform

## Overview

PickIT is a full-stack SaaS web app for print-shop management. Students scan QR codes to connect to their campus print shop, upload files, and track orders. Shop owners manage incoming orders, configure pricing, and view analytics.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + shadcn/ui
- **Backend**: Express 5 (API Server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **QR codes**: qrcode.react
- **Charts**: Recharts
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## User Roles

1. **Shop Owner** — registers a shop, gets a UUID shopCode & QR code, manages orders, configures pricing, views analytics
2. **Student** — scans QR code to join a shop, uploads print files, tracks order status

## QR Connect Flow

1. Shop owner registers → backend generates UUID shopCode
2. QR code is displayed on `/owner/qr` — value: `{domain}/join/{shopCode}`
3. Student scans QR → lands on `/join/:shopCode` → prompted to login/register
4. After auth → student's `shopId` is linked to the shop
5. Student can now upload orders to that shop

## Key Pages

- `/` — Landing page with animated hero
- `/auth/register` — Register as student or shop owner
- `/auth/login` — Login
- `/join/:shopCode` — QR landing page (links student to shop)
- `/owner/overview` — Analytics stats overview
- `/owner/orders` — Manage incoming orders + status updates
- `/owner/qr` — Display/download QR code
- `/owner/pricing` — Configure per-page prices (B&W, Color)
- `/owner/analytics` — Charts (orders/day, revenue trend)
- `/owner/settings` — Shop settings
- `/student/upload` — Upload print file + configure options
- `/student/orders` — Active orders with status
- `/student/history` — Completed orders

## Database Schema

- `users` — id, name, email, password, role (student|owner), shopId
- `shops` — id, ownerId, name, shopCode (UUID), address, isOpen
- `orders` — id, studentId, shopId, fileUrl, fileName, pages, colorMode, copies, status, price, note, createdAt
- `pricing_config` — id, shopId, bwPerPage, colorPerPage, minimumOrder

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/pickit run dev` — run frontend locally

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `SESSION_SECRET` — JWT signing secret

## Important Notes

- After running `pnpm --filter @workspace/api-spec run codegen`, manually fix `lib/api-zod/src/index.ts` to only export from `./generated/api` (not `./generated/types` to avoid duplicate export errors)
- The frontend is a static artifact built with Vite, served at path `/`
- The API server is served at `/api`
- JWT tokens are stored in `localStorage` as `"pickit_token"`
