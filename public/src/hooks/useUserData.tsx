
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, paymentApi, hwidApi, resetApi } from "../services/api";

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

interface DiscordData {
  discordId: string;
  discordUsername: string | null;
  discordCreateDate: string | null;
  discordAvatar: string | null;
  discordBanner: string | null;
}
function useUserData(token: string | null, isDemoMode: boolean) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const discordId = urlParams.get("discordId");

    if (discordId) {
      const discordData: DiscordData = {
        discordId,
        discordUsername: urlParams.get("discordUsername"),
        discordCreateDate: urlParams.get("discordCreateDate"),
        discordAvatar: urlParams.get("discordAvatar"),
        discordBanner: urlParams.get("discordBanner"),
      };

      localStorage.setItem("discord_data", JSON.stringify(discordData));
      console.log("Discord data saved to localStorage:", discordData);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isDemoMode) {
          const demoUser = JSON.parse(localStorage.getItem("demo_user") || "{}");
          const userData = {
            ...demoUser,
            profilePicture: "https://ui-avatars.com/api/?name=Demo+User&background=6ea6d3&color=fff&size=128",
            banner: "https://images.unsplash.com/photo-1639628735078-ed2f038a193e?q=80&w=1000",
            discordId: "123456789012345678",
            discordUsername: "demo_user#1234",
            discordCreateDate: "2022-01-01T00:00:00Z",
            discordAvatar: "https://cdn.discordapp.com/avatars/123456789012345678/abcdef.png",
            hwid: "icycl8-mamn-swnc-ksxm", // This accesses the HWID generator function
            resetsAvailable: 2
          };
          setUser(userData);
          setIsLoading(false);
          return;
        }

        let discordInfo: Partial<DiscordData> = {};
        const discordData = localStorage.getItem("discord_data");

        if (discordData) {
          try {
            discordInfo = JSON.parse(discordData);
            console.log("Discord data loaded from localStorage:", discordInfo);
          } catch (e) {
            console.error("Error parsing Discord data:", e);
          }
        }

        try {
           const fetchHwid = async () => {
      try {
        const res = await hwidApi.get("/hwid");
        const hwid = res.data.hwid;
        localStorage.setItem("hwid", hwid); // Armazena o HWID no localStorage
        console.log("HWID from API:", hwid);
        return hwid;
      } catch (error) {
        console.error("Error fetching HWID:", error);
        // Se não for possível pegar o HWID, usa um valor default
        const fallbackHwid = localStorage.getItem("hwid") || "default-hwid";
        localStorage.setItem("hwid", fallbackHwid);
        return fallbackHwid;
      }
    };


          const response = await axios.get("/api/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data?.user) {
            const userData = response.data.user;
            const hwid = await fetchHwid();
            if (!userData.expiryDate && userData.expiry) {
              userData.expiryDate = userData.expiry;
            } else if (!userData.expiryDate) {
              const expiryDate = new Date();
              expiryDate.setMonth(expiryDate.getMonth() + 6);
              userData.expiryDate = expiryDate.toISOString();
            }
              if (userData.resetsAvailable === undefined) {
              userData.resetsAvailable = 2;
            }
             if (!userData.hwid) {
            userData.hwid = hwid;
            }
            const mergedUser = {
              ...userData,
              discordId: userData.discordId || discordInfo.discordId,
              discordUsername: userData.discordUsername || discordInfo.discordUsername,
              discordCreateDate: userData.discordCreateDate || discordInfo.discordCreateDate,
              discordAvatar: userData.discordAvatar || discordInfo.discordAvatar
            };

            console.log("Merged user data:", mergedUser);
            setUser(mergedUser);
          }
        } catch (apiError) {
          console.error("API error:", apiError);

          if (discordInfo.discordId) {
            setUser({
              username: discordInfo.discordUsername || "Discord User",
              email: `${discordInfo.discordId}@discord.temp`,
              discordId: discordInfo.discordId,
              discordUsername: discordInfo.discordUsername || undefined,
              discordCreateDate: discordInfo.discordCreateDate || undefined,
              discordAvatar: discordInfo.discordAvatar || undefined
            });
          } else {
            throw apiError;
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.error || "Failed to load profile";
          setError(errorMessage);
          toast.error(errorMessage);
          localStorage.removeItem("token");
        } else {
          setError("An unexpected error occurred");
          toast.error("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
      navigate("/login");
    }
  }, [token, navigate, isDemoMode]);

  const handleProfileUpdate = async (formData: FormData) => {
    try {
      if (isDemoMode) {
        toast.success("Profile updated successfully (Demo Mode)");
        return Promise.resolve();
      }

      const response = await axios.post("/api/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.user) {
        const updatedUser = {
          ...user,
          ...response.data.user
        };
        setUser(updatedUser);
        toast.success("Profile updated successfully");
      }

      return Promise.resolve();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.error || "Failed to update profile";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
      return Promise.reject(err);
    }
  };

  return {
    user,
    isLoading,
    error,
    handleProfileUpdate
  };
}

export { useUserData };
