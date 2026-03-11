'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StockOut {
  _id: string;
  product: {
    name: string;
  };
  quantity: number;
  sellingPrice: number;
  customer: string;
  date: string;
}

interface StockIn {
  _id: string;
  product: {
    name: string;
  };
  quantity: number;
  purchasePrice: number;
  supplier: string;
  date: string;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<StockOut[]>([]);
  const [purchaseData, setPurchaseData] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [salesRes, purchaseRes] = await Promise.all([
          fetch('/api/stock-out?limit=100'),
          fetch('/api/stock-in?limit=100'),
        ]);

        if (!salesRes.ok || !purchaseRes.ok) throw new Error('Failed to fetch report data');

        const salesResult = await salesRes.json();
        const purchaseResult = await purchaseRes.json();

        setSalesData(salesResult.data);
        setPurchaseData(purchaseResult.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load report data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [toast]);

  const exportAsCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'Error',
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value && typeof value === 'object') {
              return `"${value.name || value._id || ''}"`;
            }
            return `"${value || ''}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: `${filename} exported successfully`,
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading reports...</div>;
  }

  const totalSalesValue = salesData.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const totalPurchaseValue = purchaseData.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600">View and export your business reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{totalSalesValue.toFixed(0)}</div>
            <p className="text-xs text-slate-600">{salesData.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">৳{totalPurchaseValue.toFixed(0)}</div>
            <p className="text-xs text-slate-600">{purchaseData.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">৳{(totalSalesValue - totalPurchaseValue).toFixed(0)}</div>
            <p className="text-xs text-slate-600">Sales - Purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales Report</CardTitle>
            <CardDescription>All sales transactions</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAsCSV(salesData, 'sales-report.csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {salesData.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No sales data available</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price per Unit</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell>{sale.product.name}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>৳{sale.sellingPrice.toFixed(0)}</TableCell>
                      <TableCell className="font-semibold">৳{(sale.quantity * sale.sellingPrice).toFixed(0)}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Purchase Report</CardTitle>
            <CardDescription>All purchase transactions</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAsCSV(purchaseData, 'purchase-report.csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {purchaseData.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No purchase data available</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost per Unit</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseData.map((purchase) => (
                    <TableRow key={purchase._id}>
                      <TableCell>{purchase.product.name}</TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>৳{purchase.purchasePrice.toFixed(0)}</TableCell>
                      <TableCell className="font-semibold">৳{(purchase.quantity * purchase.purchasePrice).toFixed(0)}</TableCell>
                      <TableCell>{purchase.supplier}</TableCell>
                      <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
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
