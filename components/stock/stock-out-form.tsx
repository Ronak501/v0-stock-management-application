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
  currentStock: number;
}

interface StockOut {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  sellingPrice: number;
  customer: string;
  date: string;
  notes?: string;
}

interface StockOutFormProps {
  stockOut: StockOut | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockOutForm({ stockOut, onClose, onSuccess }: StockOutFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductStock, setSelectedProductStock] = useState(0);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    sellingPrice: '',
    customer: '',
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

    if (stockOut) {
      setFormData({
        productId: stockOut.product._id,
        quantity: stockOut.quantity.toString(),
        sellingPrice: stockOut.sellingPrice.toString(),
        customer: stockOut.customer,
        date: new Date(stockOut.date).toISOString().split('T')[0],
        notes: stockOut.notes || '',
      });
      
      const product = products.find(p => p._id === stockOut.product._id);
      if (product) {
        setSelectedProductStock(product.currentStock);
      }
    }
  }, [stockOut, toast]);

  const handleProductChange = (productId: string) => {
    setFormData({ ...formData, productId });
    const product = products.find(p => p._id === productId);
    setSelectedProductStock(product?.currentStock || 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const quantity = parseInt(formData.quantity);
    if (quantity > selectedProductStock) {
      toast({
        title: 'Error',
        description: `Cannot sell more than available stock (${selectedProductStock} units)`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const url = stockOut ? `/api/stock-out/${stockOut._id}` : '/api/stock-out';
      const method = stockOut ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: quantity,
          sellingPrice: parseFloat(formData.sellingPrice),
          customer: formData.customer,
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
        description: stockOut ? 'Stock out updated successfully' : 'Stock out recorded successfully',
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
        <CardTitle>{stockOut ? 'Edit Stock Out' : 'Record Stock Out'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Product</label>
            <Select value={formData.productId} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name} ({product.currentStock} in stock)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProductStock > 0 && (
              <p className="text-xs text-slate-600 mt-1">Available: {selectedProductStock} units</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Quantity</label>
            <Input
              type="number"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              max={selectedProductStock}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Selling Price (৳)</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Customer</label>
            <Input
              type="text"
              placeholder="e.g., ABC Construction"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
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
              {loading ? 'Saving...' : stockOut ? 'Update Record' : 'Record Stock Out'}
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
