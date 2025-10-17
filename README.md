# Product Catalog & Cart System

A modern e-commerce application built with Next.js, React, TypeScript, and Supabase. Features a product catalog with bundle support, shopping cart functionality, and admin dashboard.

## Features

- **Product Catalog**: Browse individual products and bundles
- **Shopping Cart**: Add, remove, and manage cart items
- **Bundle Support**: Create and manage product bundles
- **Admin Dashboard**: Product management with authentication
- **Real-time Updates**: Live cart updates with Supabase

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT for admin
- **Deployment**: Vercel

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd product-catalog
   npm install
   ```

2. **Set up environment**
   ```bash
   cp env.template .env.local
   ```
   
   Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

3. **Set up database**
   
   Run the SQL scripts in `scripts/` folder in order:
   - `database-schema.sql` - Core database structure
   - `sample-data.sql` - Initial data
   - `admin-schema.sql` - Admin authentication
   - `supabase-storage-setup.sql` - File storage

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Admin Access

Default admin credentials:
- **Email**: `wiley@gmail.com`
- **Password**: `wiley123`

Access admin dashboard at `/admin/login`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # UI components
│   ├── cart/             # Cart components
│   ├── products/         # Product components
│   └── ui/               # shadcn/ui components
├── context/              # React Context
├── lib/                  # Utilities
└── middleware.ts         # Route protection
```

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT