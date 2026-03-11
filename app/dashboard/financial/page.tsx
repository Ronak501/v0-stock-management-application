'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinancialSummary {
  cashIn: number;
  cashOut: number;
  profit: number;
  totalQuantitySold: number;
  totalQuantityPurchased: number;
}

interface DailyData {
  date: string;
  sales: number;
  purchases: number;
  profit: number;
}

export default function FinancialPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState('monthly');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/financial?period=${period}`);
        if (!response.ok) throw new Error('Failed to fetch financial data');

        const data = await response.json();
        setSummary(data.data.summary);
        setDailyData(data.data.dailyData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load financial data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [period, toast]);

  if (loading) {
    return <div className="text-center py-12">Loading financial data...</div>;
  }

  if (!summary) {
    return <div className="text-center py-12">Failed to load financial data</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-600">Track your business financials</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash In</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{summary.cashIn.toFixed(0)}</div>
            <p className="text-xs text-slate-600">From sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{summary.cashOut.toFixed(0)}</div>
            <p className="text-xs text-slate-600">From purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{summary.profit.toFixed(0)}
            </div>
            <p className="text-xs text-slate-600">Income - Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.cashIn > 0 ? ((summary.profit / summary.cashIn) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-slate-600">Profit / Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
            <CardDescription>Units and counts for this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-600">Total Quantity Sold</span>
                <span className="font-semibold">{summary.totalQuantitySold} units</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-600">Total Quantity Purchased</span>
                <span className="font-semibold">{summary.totalQuantityPurchased} units</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-slate-600">Average Sale Price</span>
                <span className="font-semibold">
                  ৳{summary.totalQuantitySold > 0 ? (summary.cashIn / summary.totalQuantitySold).toFixed(0) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Average Cost Price</span>
                <span className="font-semibold">
                  ৳{summary.totalQuantityPurchased > 0 ? (summary.cashOut / summary.totalQuantityPurchased).toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Analysis</CardTitle>
            <CardDescription>Breakdown of your earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">৳{summary.cashIn.toFixed(0)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-red-600">৳{summary.cashOut.toFixed(0)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Net Profit</p>
                <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ৳{summary.profit.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Financial Trend</CardTitle>
          <CardDescription>Cash flow over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Cash In (৳)" />
              <Line type="monotone" dataKey="purchases" stroke="#ef4444" strokeWidth={2} name="Cash Out (৳)" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit (৳)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit vs Cost Comparison</CardTitle>
          <CardDescription>Daily comparison of revenue and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#10b981" name="Cash In (৳)" />
              <Bar dataKey="purchases" fill="#ef4444" name="Cash Out (৳)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
