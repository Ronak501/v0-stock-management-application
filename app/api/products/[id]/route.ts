import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
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
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    console.error('Get product error:', error);
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
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
    }

    const { name, category, sku, costPrice, sellingPrice, currentStock, supplier } =
      await request.json();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if SKU is being changed and if new SKU already exists
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return NextResponse.json(
          { success: false, message: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    if (name) product.name = name;
    if (category) product.category = category;
    if (sku) product.sku = sku;
    if (costPrice !== undefined) product.costPrice = costPrice;
    if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
    if (currentStock !== undefined) product.currentStock = currentStock;
    if (supplier) product.supplier = supplier;

    await product.save();

    return NextResponse.json(
      { success: true, message: 'Product updated successfully', data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
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
      return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
