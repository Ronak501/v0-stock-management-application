import mongoose from 'mongoose';

interface IStockIn extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  quantity: number;
  purchasePrice: number;
  supplier: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockInSchema = new mongoose.Schema<IStockIn>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide a product'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: 1,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Please provide purchase price'],
      min: 0,
    },
    supplier: {
      type: String,
      required: [true, 'Please provide supplier name'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.StockIn || mongoose.model<IStockIn>('StockIn', StockInSchema);
