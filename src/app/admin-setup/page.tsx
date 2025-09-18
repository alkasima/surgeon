"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

export default function AdminSetupPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async () => {
    const code = `// Add this to src/lib/admin-config.ts in the ADMIN_EMAILS array
'${adminEmail}',`;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code Copied!",
        description: "Paste this into your admin-config.ts file",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Admin Setup Guide</CardTitle>
          <CardDescription className="text-gray-400">
            Configure automatic admin role assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Step 1: Add Your Email</h3>
            <p className="text-gray-300">
              Enter your email address below to generate the code you need to add to your admin configuration.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-gray-300">Admin Email</Label>
              <div className="flex gap-2">
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="your-email@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button 
                  onClick={handleCopyCode}
                  disabled={!adminEmail}
                  className="bg-purple-600 hover:bg-purple-500"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Step 2: Update Configuration</h3>
            <p className="text-gray-300">
              Open <code className="bg-gray-800 px-2 py-1 rounded text-sm">src/lib/admin-config.ts</code> and add your email to the ADMIN_EMAILS array.
            </p>
            
            <div className="bg-gray-900 p-4 rounded-lg">
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`export const ADMIN_EMAILS = [
  'admin@yourdomain.com',
  'superadmin@yourdomain.com',
  // Add your admin emails here
  '${adminEmail || 'your-email@example.com'}',
];`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Step 3: Test Admin Access</h3>
            <div className="space-y-2 text-gray-300">
              <p>1. Sign up with your admin email at <code className="bg-gray-800 px-2 py-1 rounded text-sm">/signup</code></p>
              <p>2. You'll be automatically redirected to the admin dashboard</p>
              <p>3. Or login at <code className="bg-gray-800 px-2 py-1 rounded text-sm">/login</code> and you'll be redirected to admin dashboard</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-300 mb-2">✨ Automatic Features</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Admin role assigned automatically on signup</li>
              <li>• Redirected to admin dashboard after login</li>
              <li>• Access to user management, credit management, and password reset</li>
              <li>• Admin sidebar appears automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
