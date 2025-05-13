
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import ProfileBanner from "./ProfileBanner";
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardTabs from "./dashboard/DashboardTabs";
import { useUserData } from "../hooks/useUserData";
import { toast } from "sonner";

interface DashboardProps {
  isDemoMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isDemoMode = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  
  const { user, isLoading, error, handleProfileUpdate } = useUserData(token, isDemoMode);

 const handleLogout = async () => {
  const token = localStorage.getItem("token");

  try {
    await fetch("http://85.31.61.15:3000/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Erro ao fazer logout no backend:", error);
  }
   toast.success("Logout successful!");
  // Limpa localStorage e redireciona mesmo que a requisição falhe
  localStorage.removeItem("token");
  localStorage.removeItem("demo_user");
  navigate("/");
};

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
        <div className="max-w-md w-full p-8 glass-effect rounded-xl shadow-2xl text-center">
          <h1 className="text-3xl font-bold mb-6 text-red-500">Error</h1>
          <p className="text-red-400 mb-8">{error}</p>
          <button 
            onClick={() => navigate("/login")}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This should never happen due to our loading and error states
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-6xl w-full p-6 z-10 animate-fade-in my-8">
        <div className="glass-effect shadow-2xl border-gray-800/50 rounded-xl overflow-hidden">
          <DashboardHeader 
            isDemoMode={isDemoMode} 
            onLogout={handleLogout} 
            language={language}
          />
          
          <ProfileBanner 
            bannerUrl={user.banner || "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb"} 
            profileUrl={user.profilePicture} 
            username={user.username}
          />
          
          <div className="p-6 mt-8">
            <DashboardTabs 
              user={user} 
              handleProfileUpdate={handleProfileUpdate}
              isDemoMode={isDemoMode}
              language={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
