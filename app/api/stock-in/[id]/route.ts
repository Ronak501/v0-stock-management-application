import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import StockIn from '@/lib/db/models/StockIn';
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid stock in ID' }, { status: 400 });
    }

    const stockIn = await StockIn.findById(id).populate('product');

    if (!stockIn) {
      return NextResponse.json(
        { success: false, message: 'Stock in record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: stockIn }, { status: 200 });
  } catch (error) {
    console.error('Get stock in error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid stock in ID' }, { status: 400 });
    }

    const { quantity, purchasePrice, supplier, date, notes } = await request.json();

    const stockIn = await StockIn.findById(id);

    if (!stockIn) {
      return NextResponse.json(
        { success: false, message: 'Stock in record not found' },
        { status: 404 }
      );
    }

    // If quantity changed, update product stock
    if (quantity !== undefined && quantity !== stockIn.quantity) {
      const product = await Product.findById(stockIn.product);
      if (product) {
        const difference = quantity - stockIn.quantity;
        product.currentStock += difference;
        await product.save();
      }
    }

    if (quantity !== undefined) stockIn.quantity = quantity;
    if (purchasePrice !== undefined) stockIn.purchasePrice = purchasePrice;
    if (supplier) stockIn.supplier = supplier;
    if (date) stockIn.date = new Date(date);
    if (notes !== undefined) stockIn.notes = notes;

    await stockIn.save();

    return NextResponse.json(
      { success: true, message: 'Stock in updated successfully', data: stockIn },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update stock in error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid stock in ID' }, { status: 400 });
    }

    const stockIn = await StockIn.findById(id);

    if (!stockIn) {
      return NextResponse.json(
        { success: false, message: 'Stock in record not found' },
        { status: 404 }
      );
    }

    // Update product stock
    const product = await Product.findById(stockIn.product);
    if (product) {
      product.currentStock -= stockIn.quantity;
      await product.save();
    }

    await StockIn.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Stock in deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete stock in error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
