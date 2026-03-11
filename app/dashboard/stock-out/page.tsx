'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import StockOutForm from '@/components/stock/stock-out-form';

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

export default function StockOutPage() {
  const { toast } = useToast();
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStockOut, setEditingStockOut] = useState<StockOut | null>(null);
  const [page, setPage] = useState(1);

  const fetchStockOuts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      const response = await fetch(`/api/stock-out?${params}`);
      if (!response.ok) throw new Error('Failed to fetch stock out records');

      const data = await response.json();
      setStockOuts(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load stock out records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockOuts();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`/api/stock-out/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete record');

      toast({
        title: 'Success',
        description: 'Stock out record deleted successfully',
      });
      fetchStockOuts();
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
          <h1 className="text-3xl font-bold text-slate-900">Stock Out</h1>
          <p className="text-slate-600">Record product sales and inventory deductions</p>
        </div>
        <Button
          onClick={() => {
            setEditingStockOut(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Stock Out
        </Button>
      </div>

      {showForm && (
        <StockOutForm
          stockOut={editingStockOut}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchStockOuts();
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stock Out Records</CardTitle>
          <CardDescription>All sales and inventory deductions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : stockOuts.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No stock out records found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockOuts.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.product.name}</TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell>৳{record.sellingPrice.toFixed(0)}</TableCell>
                      <TableCell className="font-semibold">৳{(record.quantity * record.sellingPrice).toFixed(0)}</TableCell>
                      <TableCell>{record.customer}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingStockOut(record);
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
