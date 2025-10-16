# Database Setup Scripts

This folder contains SQL scripts for setting up the Product Catalog database and related services.

## Scripts Overview

### 1. `database-schema.sql`
- **Purpose**: Creates the main database schema
- **Tables**: `products`, `bundle_products`, `cart_items`
- **Features**: Row Level Security (RLS) policies, foreign key constraints
- **Usage**: Run this first to set up the core database structure

### 2. `sample-data.sql`
- **Purpose**: Populates the database with initial product data
- **Content**: Sample products, bundles, and relationships
- **Usage**: Run after `database-schema.sql` to add test data

### 3. `admin-schema.sql`
- **Purpose**: Sets up admin authentication system
- **Tables**: `admin_users`
- **Features**: Admin user creation, RLS policies, password hashing
- **Usage**: Run to enable admin dashboard functionality

### 4. `supabase-storage-setup.sql`
- **Purpose**: Configures Supabase Storage for product images
- **Features**: Storage bucket creation, RLS policies for file operations
- **Usage**: Run to enable image upload functionality in admin dashboard

## Setup Order

Run the scripts in this order:

1. `database-schema.sql` - Core database structure
2. `sample-data.sql` - Initial data
3. `admin-schema.sql` - Admin authentication
4. `supabase-storage-setup.sql` - File storage

## Environment Variables Required

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

## Default Admin Credentials

After running `admin-schema.sql`, you can login with:
- **Email**: `wiley@gmail.com`
- **Password**: `wiley123`
