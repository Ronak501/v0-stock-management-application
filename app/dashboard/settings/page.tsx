'use client';

import { useAuth } from '@/lib/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account and system preferences</p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <Input value={user?.email || ''} disabled className="bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Account Role</label>
              <Input value={user?.role || ''} disabled className="bg-slate-100 capitalize" />
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Contact your administrator to change your account role or email address.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your security preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Password</h4>
              <p className="text-sm text-slate-600 mb-4">
                Your password is securely encrypted and cannot be viewed. Contact your administrator if you need to reset it.
              </p>
              <Button variant="outline" disabled>
                Change Password (Disabled)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Low Stock Alerts</h4>
                <p className="text-sm text-slate-600">Get notified when products fall below 10 units</p>
              </div>
              <Button variant="outline" disabled>
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Daily Summary</h4>
                <p className="text-sm text-slate-600">Receive a daily summary of sales and purchases</p>
              </div>
              <Button variant="outline" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Theme</h4>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  Light Mode
                </Button>
                <Button variant="outline" className="flex-1">
                  Dark Mode
                </Button>
                <Button variant="outline" className="flex-1 border-blue-600 bg-blue-50">
                  System Default
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Application and system details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Application Name</span>
              <span className="font-medium">Stock Management System</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-slate-600">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-slate-600">Database</span>
              <span className="font-medium">MongoDB</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-slate-600">Last Updated</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>Get help with using the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              For technical support or questions about using the Stock Management System, please contact your administrator.
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Documentation</Button>
              <Button variant="outline">Contact Support</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
