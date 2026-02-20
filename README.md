
# FoodTrek

A full-stack food discovery platform built as a Turborepo monorepo.

## Tech Stack

**Monorepo:** Turborepo + npm workspaces

**Backend (`apps/api`)** — Express 5, TypeScript, MongoDB (Mongoose), JWT auth, Google OAuth,
Multer (file uploads), Zod, bcrypt

**Frontend (`apps/client`)** — React 19, Vite, TypeScript, Material UI, TanStack Query v5, React Hook Form + Zod,
React Router v7, Axios, Google OAuth

**Shared packages:**
- `@food-trek/schemas` — shared Zod validation schemas
- `@food-trek/utils` — shared utilities
- `@food-trek/eslint-config`, `@food-trek/typescript-config`, `@food-trek/tsup-config` — shared tooling configs

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 11
- A running MongoDB instance

### Installation

```bash
git clone https://github.com/its-elad/food-trek.git
cd food-trek
npm install
```

### Environment Variables

Copy the example env files and fill in your values:

```bash
cp apps/api/example.env apps/api/.env
cp apps/client/example.env apps/client/.env
```

### Running the Application

```bash
# Run both api and client in dev mode
npm run dev

# Build all packages
npm run build
```

## Project Structure

```
food-trek/
├── apps/
│   ├── api/          # Express backend (port 3000)
│   └── client/       # React frontend (port 8080)
└── packages/
    ├── schemas/       # Shared Zod schemas
    ├── utils/         # Shared utilities
    └── config/        # ESLint, TypeScript, tsup configs
```

## License

MIT
