import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaGithub, FaGoogle, FaDiscord } from 'react-icons/fa';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, navigate] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login with redirect
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    
    // In a real app, redirect to OAuth provider
    console.log(`Logging in with ${provider}`);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1b1e] text-white p-4">
      <div className="w-full max-w-md">
        <Card className="bg-[#2b2d31] border-[#1e1f22]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Dev Chat</CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Connect with developers around the world
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1e1f22]">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#3b3d43]">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-[#3b3d43]">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 p-1">
              <CardContent className="pt-4">
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-zinc-300">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="m@example.com" 
                        required 
                        className="bg-[#1e1f22] border-[#3b3d43]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-zinc-300">Password</Label>
                        <Button 
                          variant="link" 
                          className="px-0 text-xs text-zinc-400 hover:text-zinc-200"
                          onClick={() => console.log('Reset password')}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        required 
                        className="bg-[#1e1f22] border-[#3b3d43]"
                      />
                    </div>
                    <Button type="submit" className="bg-[#5865f2] hover:bg-[#4752c4]" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 p-1">
              <CardContent className="pt-4">
                <form onSubmit={handleSignup}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="signup-email" className="text-zinc-300">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="m@example.com" 
                        required 
                        className="bg-[#1e1f22] border-[#3b3d43]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-username" className="text-zinc-300">Username</Label>
                      <Input 
                        id="signup-username" 
                        type="text" 
                        placeholder="devuser" 
                        required 
                        className="bg-[#1e1f22] border-[#3b3d43]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-password" className="text-zinc-300">Password</Label>
                      <Input 
                        id="signup-password" 
                        type="password" 
                        required 
                        className="bg-[#1e1f22] border-[#3b3d43]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-confirm" className="text-zinc-300">Confirm Password</Label>
                      <Input 
                        id="signup-confirm" 
                        type="password" 
                        required 
                        className="bg-[#1e1f22] border-[#3b3d43]"
                      />
                    </div>
                    <Button type="submit" className="bg-[#5865f2] hover:bg-[#4752c4]" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#3b3d43]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#2b2d31] px-2 text-zinc-400">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="bg-[#1e1f22] border-[#3b3d43] hover:bg-[#3b3d43]"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
              >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button 
                variant="outline" 
                className="bg-[#1e1f22] border-[#3b3d43] hover:bg-[#3b3d43]"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button 
                variant="outline" 
                className="bg-[#1e1f22] border-[#3b3d43] hover:bg-[#3b3d43]"
                onClick={() => handleSocialLogin('discord')}
                disabled={isLoading}
              >
                <FaDiscord className="mr-2 h-4 w-4" />
                Discord
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}