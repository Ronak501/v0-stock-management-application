import mongoose from 'mongoose';

interface IProduct extends mongoose.Document {
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    sku: {
      type: String,
      required: [true, 'Please provide a SKU'],
      unique: true,
    },
    costPrice: {
      type: Number,
      required: [true, 'Please provide a cost price'],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please provide a selling price'],
      min: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: {
      type: String,
      required: [true, 'Please provide a supplier'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
