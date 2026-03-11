import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Product from '@/lib/db/models/Product';
import StockIn from '@/lib/db/models/StockIn';
import StockOut from '@/lib/db/models/StockOut';
import { verifyToken, getTokenFromCookies } from '@/lib/auth/jwt';

async function verifyAuth() {
  const token = await getTokenFromCookies();
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total stock quantity
    const products = await Product.find();
    const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);

    // Get total stock value
    const totalStockValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);

    // Get total purchases
    const totalPurchases = await StockIn.countDocuments();

    // Get total sales
    const totalSales = await StockOut.countDocuments();

    // Calculate cash in (from sales)
    const stockOuts = await StockOut.find();
    const cashIn = stockOuts.reduce((sum, s) => sum + s.quantity * s.sellingPrice, 0);

    // Calculate cash out (from purchases)
    const stockIns = await StockIn.find();
    const cashOut = stockIns.reduce((sum, s) => sum + s.quantity * s.purchasePrice, 0);

    // Calculate profit
    const profit = cashIn - cashOut;

    // Get monthly sales data (last 12 months)
    const monthlySalesData = [];
    for (let i = 11; i >= 0; i--) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const sales = await StockOut.find({
        date: { $gte: monthStart, $lte: monthEnd },
      });

      const monthSales = sales.reduce((sum, s) => sum + s.quantity * s.sellingPrice, 0);

      monthlySalesData.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        sales: monthSales,
        quantity: sales.reduce((sum, s) => sum + s.quantity, 0),
      });
    }

    // Get top selling products
    const topProducts = await StockOut.aggregate([
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
    ]);

    // Get low stock products (less than 10 units)
    const lowStockProducts = await Product.find({ currentStock: { $lt: 10 } }).select(
      'name currentStock costPrice'
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            totalProducts,
            totalStock,
            totalStockValue,
            totalPurchases,
            totalSales,
            cashIn,
            cashOut,
            profit,
          },
          monthlySalesData,
          topProducts,
          lowStockProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
