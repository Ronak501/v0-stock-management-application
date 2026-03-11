'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  PackageIn,
  PackageOut,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Products',
      href: '/products',
      icon: Package,
    },
    {
      title: 'Stock In',
      href: '/stock-in',
      icon: PackageIn,
    },
    {
      title: 'Stock Out',
      href: '/stock-out',
      icon: PackageOut,
    },
    {
      title: 'Financial',
      href: '/financial',
      icon: TrendingUp,
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: BarChart3,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">Stock Manager</h1>
        <p className="text-xs text-slate-400">Lift Business</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.title}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
