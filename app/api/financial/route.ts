import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // daily, monthly, yearly

    // Calculate date range
    const now = new Date();
    const ranges: { [key: string]: [Date, Date] } = {
      daily: [
        new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      ],
      monthly: [
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 0),
      ],
      yearly: [
        new Date(now.getFullYear(), 0, 1),
        new Date(now.getFullYear() + 1, 0, 0),
      ],
    };

    const [startDate, endDate] = ranges[period] || ranges.monthly;

    // Get sales data
    const stockOuts = await StockOut.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate('product');

    const cashIn = stockOuts.reduce((sum, s) => sum + s.quantity * s.sellingPrice, 0);
    const totalQuantitySold = stockOuts.reduce((sum, s) => sum + s.quantity, 0);

    // Get purchase data
    const stockIns = await StockIn.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate('product');

    const cashOut = stockIns.reduce((sum, s) => sum + s.quantity * s.purchasePrice, 0);
    const totalQuantityPurchased = stockIns.reduce((sum, s) => sum + s.quantity, 0);

    // Calculate profit
    const profit = cashIn - cashOut;

    // Get daily breakdown for the period
    const dailyData: { [key: string]: { sales: number; purchases: number } } = {};

    stockOuts.forEach((so) => {
      const dateKey = so.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { sales: 0, purchases: 0 };
      }
      dailyData[dateKey].sales += so.quantity * so.sellingPrice;
    });

    stockIns.forEach((si) => {
      const dateKey = si.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { sales: 0, purchases: 0 };
      }
      dailyData[dateKey].purchases += si.quantity * si.purchasePrice;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          period,
          summary: {
            cashIn,
            cashOut,
            profit,
            totalQuantitySold,
            totalQuantityPurchased,
          },
          dailyData: Object.entries(dailyData)
            .map(([date, data]) => ({
              date,
              sales: data.sales,
              purchases: data.purchases,
              profit: data.sales - data.purchases,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Financial error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
