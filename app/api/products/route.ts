import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Product from '@/lib/db/models/Product';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const products = await Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: products,
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
    console.error('Get products error:', error);
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

    const { name, category, sku, costPrice, sellingPrice, currentStock, supplier } =
      await request.json();

    if (!name || !category || !sku || costPrice === undefined || sellingPrice === undefined || !supplier) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: 'SKU already exists' },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      category,
      sku,
      costPrice,
      sellingPrice,
      currentStock: currentStock || 0,
      supplier,
    });

    await product.save();

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
