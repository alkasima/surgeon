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
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { logIn, authError, setAuthError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    const user = await logIn(email, password);
    setIsSubmitting(false);
    if (user) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 overflow-hidden relative">
      
      {/* Left Side - Full Background Image with Text Overlay */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: "url('/780abc4f-0345-440f-872d-565d386e16cb.png')",
          }}
        ></div>

        {/* Softer overlay for better image visibility */}
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>

        {/* Centered Text Overlay */}
        <div className="relative z-10 max-w-md text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4 animate-textGlow drop-shadow-xl">
            SURGEONS • CARE • PRECISION
          </h1>
          <p className="text-gray-200 drop-shadow">
            Join the premier platform for hair transplant professionals.
            Manage your practice with precision and care.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-20">
        <div className="w-full max-w-md">
          <Card className="bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <CardHeader className="text-center">
              <div className="mb-4">
                <FollicleFlowLogo className="h-12 w-auto mx-auto" />
              </div>
              <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
              <CardDescription className="text-gray-400">Access your surgeon dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {authError && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                    <AlertDescription className="text-red-200">{authError}</AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center text-sm">
              <p className="text-gray-300">
                New to FollicleFlow?{' '}
                <Link href="/signup" className="text-purple-300 hover:underline">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Animation Styles */}
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
