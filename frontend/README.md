# Healthcare Management System - Frontend

This is the frontend application for the Healthcare Management System, built with React.js and Vite.

## Features

- Modern React.js application with Vite for fast development
- Supabase integration for real-time database operations
- Tailwind CSS for responsive and modern UI design
- shadcn/ui components for consistent design system
- Lucide icons for beautiful iconography

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions and configurations
│   └── supabaseClient.js # Supabase client configuration
├── assets/             # Static assets
├── App.jsx             # Main application component
├── App.css             # Application styles
├── index.css           # Global styles
└── main.jsx            # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

This application is configured for deployment on Vercel. The `vercel.json` configuration file in the root directory handles the deployment settings.

To deploy:

1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel`

## Technologies Used

- **React.js** - Frontend framework
- **Vite** - Build tool and development server
- **Supabase** - Backend as a Service (BaaS)
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
