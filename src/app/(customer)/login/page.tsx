'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2, AlertTriangle, LogIn, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loginCustomer } from '@/lib/actions'; // Placeholder action

// Inline SVG for Google icon
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2.18 12.19,2.18C6.42,2.18 2.03,6.8 2.03,12C2.03,17.05 6.16,21.82 12.19,21.82C18.05,21.82 22,17.5 22,11.94C22,11.5 21.35,11.1 21.35,11.1V11.1Z" />
  </svg>
);

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        // Simulate login action
        // const result = await loginCustomer(formData);
        // For demonstration:
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const result = { success: "Logged in successfully!", redirect: "/products" }; // Mock success

        if (result.success && result.redirect) {
          toast({ title: "Login Successful", description: "Welcome back!" });
          router.push(result.redirect);
        } else {
          // @ts-ignore
          setError(result.error || "Invalid email or password.");
          // @ts-ignore
          toast({ title: "Login Failed", description: result.error || "Invalid email or password.", variant: "destructive" });
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        toast({ title: "Login Error", description: "An unexpected error occurred.", variant: "destructive" });
      }
    });
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth logic
    // This would typically redirect to Google's OAuth consent screen
    toast({ title: "Google Login", description: "Google OAuth not implemented in this demo." });
    console.log("Attempting Google Login...");
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <Link href="/" className="inline-block mx-auto mb-4">
            <Package className="h-12 w-12 text-primary" />
          </Link>
          <CardTitle className="text-2xl font-bold">Customer Login</CardTitle>
          <CardDescription>Access your account to view orders and manage your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
              <div className="text-right">
                <Link href="/forgot-password" passHref className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              Login
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isPending}>
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="w-full">
            Don't have an account?{' '}
            <Link href="/register" passHref className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
