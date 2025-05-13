import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Handle Discord redirect with token in query string
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // If token exists in URL, save it to localStorage
    if (token) {
      localStorage.setItem("token", token);
      
      // Store the Discord data in localStorage to persist it
      const discordId = urlParams.get('discordId');
      if (discordId) {
        const discordData = {
          discordId: discordId,
          discordUsername: urlParams.get('discordUsername'),
          discordCreateDate: urlParams.get('discordCreateDate'),
          discordAvatar: urlParams.get('discordAvatar'),
          discordBanner: urlParams.get('discordBanner')
        };
        
        localStorage.setItem("discord_data", JSON.stringify(discordData));
        
        // Show success notification
        toast.success("Discord account linked successfully!");
      }
      
      // Clean up URL after extracting parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    
    // Check if this is a demo login
    if (storedToken === "demo-token-12345") {
      setIsDemoMode(true);
    }
    
    setIsAuthenticated(!!storedToken);
  }, [location]);
  
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Dashboard isDemoMode={isDemoMode} />;
};

export default Index;