'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardSummary {
  totalProducts: number;
  totalStock: number;
  totalStockValue: number;
  totalPurchases: number;
  totalSales: number;
  cashIn: number;
  cashOut: number;
  profit: number;
}

interface MonthlySalesData {
  month: string;
  sales: number;
  quantity: number;
}

interface TopProduct {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
  product: Array<{
    name: string;
  }>;
}

interface LowStockProduct {
  _id: string;
  name: string;
  currentStock: number;
  costPrice: number;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const data = await response.json();
        setSummary(data.data.summary);
        setMonthlyData(data.data.monthlySalesData);
        setTopProducts(data.data.topProducts);
        setLowStockProducts(data.data.lowStockProducts);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  if (!summary) {
    return <div className="text-center py-12">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your business overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-slate-600">Products in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStock}</div>
            <p className="text-xs text-slate-600">Units in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash In</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{summary.cashIn.toFixed(0)}</div>
            <p className="text-xs text-slate-600">From sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ৳{summary.profit.toFixed(0)}
            </div>
            <p className="text-xs text-slate-600">Net profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
            <CardDescription>Sales amount over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales (৳)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Movement</CardTitle>
            <CardDescription>Quantity sold vs purchased</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#10b981" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Your best-performing products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div>
                      <p className="font-medium text-slate-900">{product.product[0]?.name || 'Unknown'}</p>
                      <p className="text-sm text-slate-600">{product.totalQuantity} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">৳{product.totalRevenue.toFixed(0)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-sm">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products with stock below 10 units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-red-600">{product.currentStock} units remaining</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">৳{product.costPrice.toFixed(0)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-sm">All products have adequate stock</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
