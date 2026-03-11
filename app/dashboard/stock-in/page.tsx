'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StockInForm from '@/components/stock/stock-in-form';

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

export default function StockInPage() {
  const { toast } = useToast();
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStockIn, setEditingStockIn] = useState<StockIn | null>(null);
  const [page, setPage] = useState(1);

  const fetchStockIns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      const response = await fetch(`/api/stock-in?${params}`);
      if (!response.ok) throw new Error('Failed to fetch stock in records');

      const data = await response.json();
      setStockIns(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load stock in records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockIns();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`/api/stock-in/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete record');

      toast({
        title: 'Success',
        description: 'Stock in record deleted successfully',
      });
      fetchStockIns();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete record',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stock In</h1>
          <p className="text-slate-600">Record product purchases and inventory additions</p>
        </div>
        <Button
          onClick={() => {
            setEditingStockIn(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Stock In
        </Button>
      </div>

      {showForm && (
        <StockInForm
          stockIn={editingStockIn}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchStockIns();
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock In Records</CardTitle>
          <CardDescription>All purchases and inventory additions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : stockIns.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No stock in records found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockIns.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.product.name}</TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell>৳{record.purchasePrice.toFixed(0)}</TableCell>
                      <TableCell className="font-semibold">৳{(record.quantity * record.purchasePrice).toFixed(0)}</TableCell>
                      <TableCell>{record.supplier}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingStockIn(record);
                              setShowForm(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(record._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
