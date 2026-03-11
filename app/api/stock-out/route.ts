import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import StockOut from '@/lib/db/models/StockOut';
import Product from '@/lib/db/models/Product';
import { verifyToken, getTokenFromCookies } from '@/lib/auth/jwt';
import { Types } from 'mongoose';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const stockOuts = await StockOut.find()
      .populate('product')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await StockOut.countDocuments();

    return NextResponse.json(
      {
        success: true,
        data: stockOuts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get stock out error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { productId, quantity, sellingPrice, customer, date, notes } = await request.json();

    if (!productId || !quantity || !sellingPrice || !customer) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
    }

    // Verify product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.currentStock < quantity) {
      return NextResponse.json(
        { success: false, message: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Create stock out record
    const stockOut = new StockOut({
      product: productId,
      quantity,
      sellingPrice,
      customer,
      date: date || new Date(),
      notes,
    });

    await stockOut.save();

    // Update product stock
    product.currentStock -= quantity;
    await product.save();

    return NextResponse.json(
      { success: true, message: 'Stock out recorded successfully', data: stockOut },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create stock out error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
