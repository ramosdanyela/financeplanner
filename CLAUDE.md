# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finance Planner is a full-stack financial management application with a React/Vite frontend and Node.js/Express backend. Users can track expenses, categorize transactions, and visualize spending patterns through interactive charts.

## Commands

```bash
# Development (from repo root)
npm run dev:all          # Start both backend (port 4000) and frontend (port 5173)
npm run dev              # Start frontend only
npm run dev:backend      # Start backend only

# Build & Lint
npm run build            # Build frontend for production
npm run lint             # Run ESLint on frontend
npm run preview          # Preview production build
```

## Architecture

### Monorepo Structure
- `frontend/` - React + Vite + Tailwind CSS application
- `backend/express2/` - Node.js + Express API (the official backend; ignore `backend/express/`)

### Frontend (`frontend/src/`)
- **Entry**: `main.jsx` → `App.jsx` (routing with React Router)
- **Auth**: `contexts/authContext.jsx` manages auth state; `components/ProtectedRoute/` guards routes
- **API**: `api/api.js` - Axios instance with JWT interceptor that reads token from `localStorage.loggedInUser`
- **Pages**: `pages/` - HomePage, TransactionsPage, ChartsPage, ProfilePage, LoginPage, SignUpPage
- **Components**: Reusable UI in `components/` (AddTransaction, TransactionBox, ChartsSummary, etc.)

### Backend (`backend/express2/`)
- **Entry**: `index.js` - Express server setup, MongoDB connection
- **Models**: Mongoose schemas in `models/` (user, transaction, category, subcategory)
- **Routes**: REST endpoints in `routes/` - `/user`, `/transaction`, `/category`, `/subcategory`, `/upload-image`
- **Auth**: JWT-based; token validation via middleware

### API Configuration
The frontend auto-selects API URL based on environment:
- Uses `VITE_API_URL` env var if set
- Otherwise: `localhost:4000` (dev) or Railway production URL

### Authentication Flow
1. Login → `POST /user/login` returns JWT token
2. Token stored in `localStorage` as `loggedInUser` object
3. Axios interceptor auto-attaches `Authorization: Bearer <token>` header
4. Backend validates token on protected routes

## Environment Setup

**Backend** (`backend/express2/.env`):
```
PORT=4000
MONGODB_URI=<your-mongodb-uri>
TOKEN_SIGN_SECRET=<jwt-secret>
CLOUDINARY_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_SECRET=<optional>
```

**Frontend** (`frontend/.env` - optional):
```
VITE_API_URL=http://localhost:4000
```

## Key Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js, React Router DOM, Axios
- **Backend**: Express, MongoDB/Mongoose, JWT (jsonwebtoken), bcrypt, Multer, Cloudinary
- **Dev tools**: ESLint (frontend), Nodemon (backend), Concurrently (monorepo)

## Data Models

**Transaction**: bank, date, value, description, macrotype (income/outcome), subtype, category, subcategory, location, notes

**User**: name, email, password (hashed), profileImage
