
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileBannerProps {
  bannerUrl?: string;
  profileUrl?: string;
  username: string;
}

const ProfileBanner: React.FC<ProfileBannerProps> = ({
  bannerUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  profileUrl,
  username,
}) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };
      const baseURL = "https://api.aimtrack.pro";
  return (
    <div className="relative w-full mb-24">
      <div className="w-full h-64 overflow-hidden rounded-t-xl">
        <img
          src={`${baseURL}${bannerUrl}?t=${Date.now()}` || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=8B5CF6&color=fff&size=128`}
          alt="Profile Banner"
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="absolute -bottom-16 left-8 flex items-end">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg hover-scale">
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={`${baseURL}${profileUrl}?t=${Date.now()}` || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=8B5CF6&color=fff&size=128`}
                alt={username}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl bg-primary/90 text-white">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-background"></div>
        </div>
        
        <div className="ml-4 pb-4">
          <h1 className="text-2xl font-bold text-white shadow-text">
            {username}
          </h1>
          <div className="flex items-center gap-2">
            <span className="bg-green-500/80 text-white text-xs px-2 py-0.5 rounded-full">
              Online
            </span>
            <span className="text-primary/90 text-sm">Aim Track Member</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;
