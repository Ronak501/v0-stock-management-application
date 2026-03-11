# Stock Management System - Setup Guide

A complete stock management system for lift business operations built with Next.js, MongoDB, and React.

## Features

- **Dashboard**: Real-time overview of your business with KPIs, charts, and alerts
- **Product Management**: Full CRUD operations for managing your product inventory
- **Stock In/Out**: Record purchases and sales with automatic inventory tracking
- **Financial Tracking**: Monitor cash flow, profit margins, and revenue
- **Reports**: Generate and export sales and purchase reports
- **Authentication**: Secure login system with role-based access
- **Low Stock Alerts**: Get notified when products fall below threshold

## Prerequisites

- Node.js 18+ and npm or pnpm
- MongoDB database (local or cloud)
- Environment variables setup

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/stock-management
# or use MongoDB Atlas: mongodb+srv://user:password@cluster.mongodb.net/stock-management

JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Create Demo User

The system comes with a demo admin account. You can use it to log in:

**Email**: `admin@example.com`  
**Password**: `password123`

To create this user in your database, you need to set up the demo data. After connecting to MongoDB, the login page will show these credentials.

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and you'll be redirected to the login page.

## Architecture

### Frontend
- **Next.js 16** with App Router
- **React 19** with Hooks
- **TailwindCSS** for styling
- **Recharts** for charts and analytics
- **shadcn/ui** for UI components

### Backend
- **Next.js API Routes** for REST endpoints
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Database Models

```
User
├── email (unique)
├── password (hashed)
├── role (admin/staff)
└── createdAt

Product
├── name
├── category
├── sku (unique)
├── costPrice
├── sellingPrice
├── currentStock
├── supplier
└── timestamps

StockIn
├── product (ref: Product)
├── quantity
├── purchasePrice
├── supplier
├── date
├── notes
└── timestamps

StockOut
├── product (ref: Product)
├── quantity
├── sellingPrice
├── customer
├── date
├── notes
└── timestamps
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List products with pagination
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Stock In
- `GET /api/stock-in` - List stock in records
- `POST /api/stock-in` - Record stock in
- `PUT /api/stock-in/[id]` - Update stock in
- `DELETE /api/stock-in/[id]` - Delete stock in

### Stock Out
- `GET /api/stock-out` - List stock out records
- `POST /api/stock-out` - Record stock out
- `PUT /api/stock-out/[id]` - Update stock out
- `DELETE /api/stock-out/[id]` - Delete stock out

### Dashboard
- `GET /api/dashboard` - Get dashboard summary data

### Financial
- `GET /api/financial` - Get financial data by period

## Project Structure

```
app/
├── api/                    # Backend API routes
│   ├── auth/              # Authentication endpoints
│   ├── products/          # Product management
│   ├── stock-in/          # Stock in management
│   ├── stock-out/         # Stock out management
│   ├── dashboard/         # Dashboard data
│   └── financial/         # Financial data
├── dashboard/             # Protected dashboard pages
│   ├── page.tsx          # Main dashboard
│   ├── products/         # Product pages
│   ├── stock-in/         # Stock in pages
│   ├── stock-out/        # Stock out pages
│   ├── financial/        # Financial pages
│   ├── reports/          # Reports pages
│   └── settings/         # Settings page
├── login/                # Login page
└── page.tsx             # Root page (redirects)

components/
├── shared/              # Shared components
│   └── sidebar.tsx     # Navigation sidebar
├── products/           # Product components
├── stock/             # Stock management components
└── ui/                # shadcn/ui components

lib/
├── db/                 # Database connection & models
├── auth/              # JWT utilities
└── context/           # React contexts
```

## Key Features Implementation

### Real-time Stock Updates
When you record stock in or stock out, the product's current stock is automatically updated.

### Automatic Profit Calculation
Financial data is calculated on-the-fly from your transactions:
- Cash In = Sum of (quantity × sellingPrice) from all sales
- Cash Out = Sum of (quantity × purchasePrice) from all purchases
- Profit = Cash In - Cash Out

### Low Stock Alerts
The dashboard automatically shows products with stock below 10 units, helping you manage inventory proactively.

### Financial Reporting
View financial data by period (daily, monthly, yearly) with detailed breakdowns and visual charts.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy!

### Other Platforms

1. Set environment variables
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start: `npm start`

## Troubleshooting

### MongoDB Connection Error
- Ensure `MONGODB_URI` is correctly set
- Check MongoDB is running (if local)
- Verify network access (if cloud database)

### Authentication Issues
- Clear browser cookies and localStorage
- Verify `JWT_SECRET` is set
- Check token expiration (7 days)

### Stock Quantity Mismatch
- Ensure all stock movements are recorded
- Check for deleted transactions
- Verify database integrity

## Development Tips

- Use the demo credentials to test all features
- Check browser console for API errors
- Use the Dashboard to monitor data in real-time
- Export reports to verify data accuracy

## Support

For issues or questions, check:
1. Browser console for JavaScript errors
2. Network tab for API response status
3. Database for data integrity
4. Environment variables configuration

## License

Built with Next.js and MongoDB. Customizable for any business needs.
