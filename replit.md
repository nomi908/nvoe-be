# NVOE Backend API

## Overview
This is a Node.js Express backend API for the NVOE application. It provides authentication, product management, messaging, and payment processing features.

## Technology Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js 5
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Authentication**: JWT tokens

## Project Structure
```
src/
├── config/          # Configuration files (Supabase, Stripe, points)
├── controllers/     # Route handlers
├── middlewares/     # Auth and upload middleware
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Helper functions
└── server.js        # Application entry point
```

## API Endpoints
- `/api/v1/auth` - Authentication (login, register, password reset)
- `/api/v1/categories` - Category management
- `/api/v1/products` - Product CRUD operations
- `/api/v1/points` - Points system with Stripe payments
- `/api/v1/users` - User management
- `/api/v1/messages` - Messaging system
- `/api/v1/conversations` - Conversation management

## Required Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `JWT_SECRET` - Secret for JWT token signing
- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASS` - Email password or app password

## Running the Application
- Development: `npm run dev`
- Production: `npm start`

The server runs on port 5000.
