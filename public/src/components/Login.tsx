
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Key, LogIn, Lock, UserCircle2, ShieldCheck, Laptop } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface User {
  username: string;
  email: string;
  licenseKey?: string;
  discordId?: string;
  discordUsername?: string;
  discordCreateDate?: string;
  discordAvatar?: string;
  profilePicture?: string;
  banner?: string;
  expiryDate?: string;
  hwid?: string;
  resetsAvailable?: number;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  
  // Pre-generated license key for demo
  const demoHwid = "94922e0f1d";
  const demoLicense = "WYZ-AB12-CD34-EF56";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const storedHwid = localStorage.getItem("hwid") || demoHwid;
    try {
      const response = await AuthService.login({
        user: username,
        pass: password,
        hwid: storedHwid
      });
       localStorage.setItem("token", response.token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLicenseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await AuthService.loginWithLicense({
        license: licenseKey,
         hwid: demoHwid
      });

      localStorage.setItem("token", response.token);
      toast.success("License key verified successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("License login error:", error);
      toast.error(error.response?.data?.error || "Invalid license key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Create a mock response similar to what the API would return
      const mockResponse = {
        token: "demo-token-12345",
        user: {
          username: "DemoUser",
          email: "demo@example.com",
          licenseKey: demoLicense
        }
      };
      
      // Store the demo token in localStorage
      localStorage.setItem("token", mockResponse.token);
      
      // Also store some mock user data for the dashboard to use
      localStorage.setItem("demo_user", JSON.stringify({
        username: "DemoUser",
        email: "demo@example.com",
        licenseKey: demoLicense,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        discordId: null
      }));
      
      toast.success("Demo login successful!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-md w-full p-6 z-10 animate-fade-in">
        <Card className="glass-effect shadow-2xl border-gray-800/50 p-8">
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex justify-center items-center mb-4">
              <UserCircle2 size={40} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue to your dashboard
            </p>
          </div>

          <Tabs defaultValue="credentials" className="w-full animate-slide-up" style={{animationDelay: '0.1s'}}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
              <TabsTrigger value="credentials" className="flex gap-2 items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User size={16} /> Credentials
              </TabsTrigger>
              <TabsTrigger value="license" className="flex gap-2 items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Key size={16} /> License Key
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credentials">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="group">
                  <div className="relative">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                      required
                    />
                    <User size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
                
                <div className="group">
                  <div className="relative">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                      required
                    />
                    <Lock size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg hover:shadow-primary/25 hover-scale"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <LogIn className="mr-2" size={16} />
                      Login
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="license">
              <form onSubmit={handleLicenseLogin} className="space-y-4">
                <div className="group">
                  <div className="relative">
                    <Input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="License Key (WYZ-XXXX-XXXX-XXXX)"
                      className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                      required
                    />
                    <ShieldCheck size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg hover:shadow-primary/25 hover-scale"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Key className="mr-2" size={16} />
                      Activate License
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full bg-secondary/20 text-primary border-primary/20 hover:bg-primary/20 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Laptop className="mr-2" size={16} />
                  Demo Login ({demoLicense})
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground animate-slide-up" style={{animationDelay: '0.2s'}}>
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 text-primary hover:text-primary/80"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
