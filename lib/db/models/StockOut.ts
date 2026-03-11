import mongoose from 'mongoose';

interface IStockOut extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  quantity: number;
  sellingPrice: number;
  customer: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockOutSchema = new mongoose.Schema<IStockOut>(
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
    sellingPrice: {
      type: Number,
      required: [true, 'Please provide selling price'],
      min: 0,
    },
    customer: {
      type: String,
      required: [true, 'Please provide customer name'],
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

export default mongoose.models.StockOut || mongoose.model<IStockOut>('StockOut', StockOutSchema);
