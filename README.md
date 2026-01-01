# Wardrobe E-commerce App

A modern e-commerce application for wardrobe and fashion items built with Next.js 15, TypeScript, and Prisma.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
  - [Linting](#linting)
- [Database](#database)
  - [Prisma Setup](#prisma-setup)
- [Components](#components)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Learn More](#learn-more)

## Features

- 🛍️ Complete e-commerce functionality (products, cart, checkout)
- 👤 User authentication and profiles
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 📱 Responsive design for all devices
- 🌙 Dark mode support
- 🖼️ Image management with Cloudinary
- 📧 Email services with Resend
- 📊 Analytics and reporting
- 🔍 Advanced product search and filtering
- 🛡️ Form validation with Zod and React Hook Form
- 🎯 Drag and drop functionality with Dnd-kit

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: shadcn/ui, Lucide React Icons
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: Better Auth
- **Image Management**: Cloudinary
- **Email**: Resend
- **Validation**: Zod, React Hook Form
- **State Management**: React Context API
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Logging**: Pino

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: latest LTS version)
- npm, yarn, or pnpm
- PostgreSQL database (local or cloud instance)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd wardrobe-ecommerce-app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wardrobe_db?schema=public"

# Authentication
BETTER_AUTH_SECRET="your-auth-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (for emails)
RESEND_API_KEY="your-resend-api-key"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project Structure

```
wardrobe-ecommerce-app/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and libraries
├── prisma/              # Prisma schema and migrations
├── providers/           # React context providers
├── public/              # Static assets
├── types/               # TypeScript types
├── middleware.ts        # Next.js middleware
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Development

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Linting

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## Database

This project uses Prisma ORM with PostgreSQL.

### Prisma Setup

1. Initialize Prisma (if not already done):

   ```bash
   npx prisma init
   ```

2. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

3. Run migrations:

   ```bash
   npx prisma migrate dev
   ```

4. View database schema:
   ```bash
   npx prisma studio
   ```

## Components

The project uses a component-driven architecture with:

- shadcn/ui for accessible, customizable components
- Tailwind CSS for styling
- Custom component variants with `class-variance-authority`
- Reusable hooks for component logic

## Authentication

Authentication is handled by Better Auth, which provides:

- User registration and login
- Session management
- Password reset functionality
- Social login integration

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
