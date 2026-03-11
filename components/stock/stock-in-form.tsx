'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
}

interface StockIn {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  purchasePrice: number;
  supplier: string;
  date: string;
  notes?: string;
}

interface StockInFormProps {
  stockIn: StockIn | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockInForm({ stockIn, onClose, onSuccess }: StockInFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    purchasePrice: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=100');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
      }
    };

    fetchProducts();

    if (stockIn) {
      setFormData({
        productId: stockIn.product._id,
        quantity: stockIn.quantity.toString(),
        purchasePrice: stockIn.purchasePrice.toString(),
        supplier: stockIn.supplier,
        date: new Date(stockIn.date).toISOString().split('T')[0],
        notes: stockIn.notes || '',
      });
    }
  }, [stockIn, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = stockIn ? `/api/stock-in/${stockIn._id}` : '/api/stock-in';
      const method = stockIn ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          purchasePrice: parseFloat(formData.purchasePrice),
          supplier: formData.supplier,
          date: formData.date,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      toast({
        title: 'Success',
        description: stockIn ? 'Stock in updated successfully' : 'Stock in recorded successfully',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save record',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{stockIn ? 'Edit Stock In' : 'Record Stock In'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Product</label>
            <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Quantity</label>
            <Input
              type="number"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Purchase Price (৳)</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Supplier</label>
            <Input
              type="text"
              placeholder="e.g., ABC Suppliers"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Notes</label>
            <Input
              type="text"
              placeholder="Optional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex gap-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 flex-1">
              {loading ? 'Saving...' : stockIn ? 'Update Record' : 'Record Stock In'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
