# Campus Event Platform

Welcome to the **Campus Event Platform** team project repository. This project is structured as a monorepo containing both the frontend client and the backend server. We use React, Node.js/Express, TypeScript, and Tailwind CSS.

---

## Tech Stack Overview

- **Frontend:** React, Vite (Build tool), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Package Management & Workspaces:** npm Workspaces

---

## Directory Structure

Here is how the project is organized. Please make sure to follow this structure when adding new code.

```text
campus-event-platform/
├── client/                     # React frontend (Vite + TS + Tailwind)
│   ├── public/                 # Static assets (favicons, manifest.json)
│   ├── src/
│   │   ├── assets/             # Project assets (images, logos, SVGs)
│   │   ├── components/         # Reusable global UI components
│   │   │   ├── common/         # Buttons, Inputs, Modals, Badges, Loaders
│   │   │   └── layout/         # Navbar, Footer, Sidebar, Page containers
│   │   ├── features/           # Feature-based folders (self-contained modules)
│   │   │   ├── auth/           # Login, Register, Profile
│   │   │   ├── events/         # Event List, Details, Creation Form
│   │   │   ├── booking/        # Ticket RSVP, confirmations
│   │   │   └── admin/          # Admin controls, dashboards
│   │   ├── context/            # Global state context providers (AuthContext)
│   │   ├── hooks/              # Custom React hooks (useAuth, useFetch)
│   │   ├── services/           # API request layer (axios instances, endpoints)
│   │   ├── types/              # TypeScript declarations and types
│   │   ├── utils/              # Client utility functions (formatting dates, storage helpers)
│   │   ├── App.tsx             # Routing configuration and global wraps
│   │   ├── main.tsx            # App entry point
│   │   └── index.css           # Styling and Tailwind imports
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
│
├── server/                     # Node.js backend (Express + TS)
│   ├── src/
│   │   ├── config/             # DB configurations, environment setup, constants
│   │   ├── controllers/        # Request handling and logic coordination (MVC)
│   │   ├── middleware/         # Security, authentication checks, global error handling
│   │   ├── models/             # Schema definitions and data models
│   │   ├── routes/             # API routing (authRoutes, eventRoutes)
│   │   ├── services/           # Heavy business logic (email, payments, calculations)
│   │   ├── types/              # Backend TypeScript definitions
│   │   ├── utils/              # Helper utilities (token generation, input check)
│   │   └── app.ts              # Express application configuration & entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── .gitignore
├── README.md
└── package.json                # Root workspaces definition
```

---

## Development Setup

To get the application running locally, follow these steps:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Install Dependencies

Install all dependencies for both the frontend (`client`) and backend (`server`) simultaneously from the root directory:

```bash
npm run install:all
```

### 2. Configure Environment Variables

1. Go to the `server` directory.
2. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp server/.env.example server/.env
   ```
3. Edit the `.env` file with your local configurations (port, database connections, secret keys, etc.).

### 3. Run Development Servers

You can start both the client and server development servers concurrently from the root directory:

```bash
npm run dev
```

Alternatively, you can run them individually:

- **Run Frontend Client only:**
  ```bash
  npm run dev:client
  ```
- **Run Backend Server only:**
  ```bash
  npm run dev:server
  ```

---

## Git Conventions & Workflow

To keep the repository clean and avoid code conflicts:

1. **Branch Naming:**
   - Feature branch: `feature/feature-name` (e.g., `feature/login-ui`)
   - Bugfix branch: `bugfix/issue-name` (e.g., `bugfix/event-card-alignment`)
   - Hotfix branch: `hotfix/critical-issue`

2. **Commits:**
   - Write clear, descriptive commit messages (e.g., `feat(auth): add login form validation`).

3. **Pull Requests:**
   - Always create a PR to merge into `main`.
   - Ensure your code compiles without TypeScript errors (`npm run build`) before making a PR.
