# Admin Dashboard

A React-based dashboard application for managing users and sessions. Built with React, Vite, Tailwind CSS, and shadcn/ui.

## Features

- Authentication with Clerk
- User management
- Session management
- Password management
- User statistics
- Responsive design with Tailwind CSS
- Form validation with Zod
- UI components from shadcn/ui

## Prerequisites

- Node.js 18+
- pnpm
- Clerk account (for authentication)

## Getting Started

1. Clone the repository
2. Create a Clerk account and get your publishable key
3. Update the `.env.local` file with your Clerk publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_PUBLISHABLE_KEY
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. Start the development server:
   ```bash
   pnpm run dev
   ```
6. Open your browser at `http://localhost:5173`

## Project Structure

```
src/
├── api/          # API client
├── components/   # UI components
├── context/      # React contexts
├── layouts/      # Page layouts
├── pages/        # Application pages
├── types/        # TypeScript types
├── App.tsx       # Main application component
└── main.tsx      # Application entry point
```

## API Integration

This dashboard consumes the API from the backend service. The API client is configured to handle authentication and data fetching.

## Authentication

Authentication is handled by Clerk. The application uses a combination of Clerk's authentication and cookie-based sessions maintained by the backend API.

## Development

To run the development server:

```bash
pnpm run dev
```

To build for production:

```bash
pnpm run build
```

To preview the production build:

```bash
pnpm run preview
```
