"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FollicleFlowLogo } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, authError, setAuthError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setAuthError(null);
    const user = await signUp(email, password);
    setIsSubmitting(false);
    if (user) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 overflow-hidden relative">
      
      {/* Left Background Section */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/780abc4f-0345-440f-872d-565d386e16cb.png')" }}
        ></div>
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>

        <div className="relative z-10 max-w-md text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-textGlow drop-shadow-xl">
            Join the Platform of Elite Surgeons
          </h1>
          <p className="text-gray-200 drop-shadow">
            Showcase your expertise, manage your patients, and build trust.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-20">
        <div className="w-full max-w-md">
          <Card className="bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <CardHeader className="text-center">
              <div className="mb-4">
                <FollicleFlowLogo className="h-12 w-auto mx-auto" />
              </div>
              <CardTitle className="text-2xl text-white">Create Your Account</CardTitle>
              <CardDescription className="text-gray-400">
                Start managing your practice with FollicleFlow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {authError && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                    <AlertDescription className="text-red-200">{authError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center text-sm">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-300 hover:underline">
                  Log In
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes textGlow {
          0% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
          100% { opacity: 0.85; transform: scale(1); }
        }
        .animate-textGlow {
          animation: textGlow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
