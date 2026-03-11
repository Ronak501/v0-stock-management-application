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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid stock out ID' }, { status: 400 });
    }

    const stockOut = await StockOut.findById(id).populate('product');

    if (!stockOut) {
      return NextResponse.json(
        { success: false, message: 'Stock out record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: stockOut }, { status: 200 });
  } catch (error) {
    console.error('Get stock out error:', error);
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
      return NextResponse.json({ success: false, message: 'Invalid stock out ID' }, { status: 400 });
    }

    const { quantity, sellingPrice, customer, date, notes } = await request.json();

    const stockOut = await StockOut.findById(id);

    if (!stockOut) {
      return NextResponse.json(
        { success: false, message: 'Stock out record not found' },
        { status: 404 }
      );
    }

    // If quantity changed, update product stock
    if (quantity !== undefined && quantity !== stockOut.quantity) {
      const product = await Product.findById(stockOut.product);
      if (product) {
        const difference = stockOut.quantity - quantity;
        product.currentStock += difference;

        if (product.currentStock < 0) {
          return NextResponse.json(
            { success: false, message: 'Insufficient stock for this quantity' },
            { status: 400 }
          );
        }

        await product.save();
      }
    }

    if (quantity !== undefined) stockOut.quantity = quantity;
    if (sellingPrice !== undefined) stockOut.sellingPrice = sellingPrice;
    if (customer) stockOut.customer = customer;
    if (date) stockOut.date = new Date(date);
    if (notes !== undefined) stockOut.notes = notes;

    await stockOut.save();

    return NextResponse.json(
      { success: true, message: 'Stock out updated successfully', data: stockOut },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update stock out error:', error);
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
      return NextResponse.json({ success: false, message: 'Invalid stock out ID' }, { status: 400 });
    }

    const stockOut = await StockOut.findById(id);

    if (!stockOut) {
      return NextResponse.json(
        { success: false, message: 'Stock out record not found' },
        { status: 404 }
      );
    }

    // Update product stock
    const product = await Product.findById(stockOut.product);
    if (product) {
      product.currentStock += stockOut.quantity;
      await product.save();
    }

    await StockOut.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Stock out deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete stock out error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
