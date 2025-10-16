# Product Catalog & Cart System

A modern, full-stack e-commerce application built with Next.js, React, TypeScript, and Supabase. Features a complete product catalog with bundle support, shopping cart functionality, and real-time database integration.

## 🚀 Features

### Core Functionality
- **Product Catalog**: Browse individual products and product bundles
- **Shopping Cart**: Add, remove, and manage cart items with persistent storage
- **Bundle Support**: Create and manage product bundles with child products
- **Quantity Management**: Proportional scaling for bundle quantities
- **Real-time Updates**: Live cart updates with Supabase integration

### Technical Features
- **Modern UI**: Clean, responsive design with shadcn/ui components
- **Type Safety**: Full TypeScript implementation
- **Database Integration**: Supabase PostgreSQL with Row Level Security
- **Session Management**: Guest cart persistence with session IDs
- **Image Optimization**: Next.js Image component with Unsplash integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready for implementation)
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-catalog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL scripts in order:
     ```bash
   # 1. Create database schema
   psql -h your-db-host -U postgres -d postgres -f database-schema.sql
   
   # 2. Insert sample data
   psql -h your-db-host -U postgres -d postgres -f sample-data.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

### Products Table
- Individual products and bundles
- Supports images, pricing, and inventory tracking
- Bundle flag for product grouping

### Bundle Products Table
- Links bundles to their child products
- Quantity ratios for proportional scaling
- Flexible bundle composition

### Cart Items Table
- Session-based cart storage
- Supports both individual and bundle items
- Guest user support with session IDs

## 🎯 Usage

### Adding Products to Cart
- Click "Add to Cart" on any product card
- Use the product detail dialog for quantity selection
- Bundle items automatically include child products

### Managing Cart
- View cart via the cart button in the header
- Update quantities with +/- buttons
- Remove items or clear entire cart
- Bundle quantities scale child products proportionally

### Bundle Functionality
- Bundles show individual item breakdown
- Displays bundle savings vs individual pricing
- Expandable view to see included items

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── cart/           # Cart-related components
│   ├── products/       # Product display components
│   └── ui/             # shadcn/ui components
├── context/            # React context providers
└── lib/                # Utility functions and types
    ├── database.ts     # Supabase database functions
    ├── supabase.ts     # Supabase client configuration
    ├── types.ts        # TypeScript type definitions
    └── utils.ts        # Helper functions
```

### Key Components
- **CartContext**: Manages cart state and operations
- **ProductGrid**: Displays product catalog
- **BundleCard**: Specialized bundle product display
- **CartSidebar**: Shopping cart interface

### Database Functions
- `getProducts()`: Fetch all products
- `getBundleProducts()`: Get bundle child products
- `addToCart()`: Add items to cart with quantity handling
- `updateCartItemQuantity()`: Update item quantities
- `getCartItems()`: Retrieve user's cart items

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📝 API Reference

### Cart Operations
- `addToCart(product, quantity)`: Add product to cart
- `removeFromCart(productId)`: Remove product from cart
- `updateQuantity(productId, quantity)`: Update product quantity
- `clearCart()`: Clear all cart items

### Product Operations
- `getProducts()`: Fetch all products
- `getProductById(id)`: Get specific product
- `getBundleProducts(bundleId)`: Get bundle contents

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling