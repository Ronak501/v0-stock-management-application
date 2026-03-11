'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  category: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  supplier: string;
}

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    supplier: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        sku: product.sku,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        currentStock: product.currentStock.toString(),
        supplier: product.supplier,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          costPrice: parseFloat(formData.costPrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          currentStock: parseInt(formData.currentStock),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      toast({
        title: 'Success',
        description: product ? 'Product updated successfully' : 'Product created successfully',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Product Name</label>
            <Input
              type="text"
              placeholder="e.g., Elevator Door Lock"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Category</label>
            <Input
              type="text"
              placeholder="e.g., Safety Components"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">SKU</label>
            <Input
              type="text"
              placeholder="e.g., SKU-001"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
              disabled={!!product}
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
            <label className="block text-sm font-medium mb-1 text-slate-700">Cost Price (৳)</label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              required
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
            <label className="block text-sm font-medium mb-1 text-slate-700">Current Stock</label>
            <Input
              type="number"
              placeholder="0"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              required
              disabled={!!product}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 flex-1">
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
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
