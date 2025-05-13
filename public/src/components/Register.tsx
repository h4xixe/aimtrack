
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Mail, Key, UserPlus, Lock, ShieldCheck, UserCircle2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username = "Username must be 3-20 alphanumeric characters";
    }
    
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!licenseKey) {
      newErrors.licenseKey = "License key is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await AuthService.register({
        username,
        password,
        email,
        license: licenseKey
      });

      localStorage.setItem("token", response.token);
      toast.success("Registration successful!");
      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.error || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Sign up to get access to the dashboard
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="group">
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                  required
                />
                <User size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            
            <div className="group">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                  required
                />
                <Mail size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="group">
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                  required
                />
                <Lock size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div className="group">
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                  required
                />
                <Lock size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <div className="group">
              <div className="relative">
                <Input
                  id="licenseKey"
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="License Key (WYZ-XXXX-XXXX-XXXX)"
                  className="pl-10 bg-secondary/30 border-gray-700 hover:border-primary/50 focus:border-primary input-glow"
                  required
                />
                <ShieldCheck size={16} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              {errors.licenseKey && <p className="text-red-500 text-xs mt-1">{errors.licenseKey}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg hover:shadow-primary/25 hover-scale mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <UserPlus className="mr-2" size={16} />
                  Register
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground animate-slide-up" style={{animationDelay: '0.2s'}}>
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 text-primary hover:text-primary/80"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
