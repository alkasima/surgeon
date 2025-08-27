"use client";

import { useState } from 'react';
import { ModernLayout } from '@/components/layout/modern-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Key, User, Crown, ArrowLeft } from 'lucide-react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const { userData } = useUser();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to change your password.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed."
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      let errorMessage = "Failed to update password.";
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "New password is too weak.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log back in before changing your password.";
      }
      
      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBuyCredits = () => {
    // Navigate to credits/upgrade page
    window.location.href = '/credits';
  };

  return (
    <ModernLayout>
      <div className="space-y-0">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center gap-3 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-2xl mx-auto">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Display Name</Label>
                  <p className="text-sm">{user?.displayName || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credits Balance
              </CardTitle>
              <CardDescription>
                Your current credit balance and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{userData?.credits || 0} Credits</p>
                    <p className="text-sm text-muted-foreground">Available for AI features and searches</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {userData?.credits || 0}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium">Email Draft</p>
                  <p className="text-muted-foreground">2 credits per email</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium">Surgeon Analysis</p>
                  <p className="text-muted-foreground">3 credits per analysis</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium">Surgeon Search</p>
                  <p className="text-muted-foreground">5 credits per search</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium">Note Summary</p>
                  <p className="text-muted-foreground">Free</p>
                </div>
              </div>
              
              <Button 
                onClick={handleBuyCredits}
                className="w-full gap-2"
                size="lg"
              >
                <Crown className="h-4 w-4" />
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password for security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={isChangingPassword}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={isChangingPassword}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={isChangingPassword}
                />
              </div>
              
              <Button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  );
}