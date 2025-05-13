
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Upload, X, CheckCircle } from "lucide-react";

interface ProfileFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  demoMode?: boolean;
  language?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, demoMode = false, language = 'en' }) => {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const translations = {
    'en': {
      updateProfile: 'Update Your Profile',
      profilePicture: 'Profile Picture',
      bannerImage: 'Banner Image',
      chooseFile: 'Choose File',
      clear: 'Clear',
      update: 'Update Profile',
      updating: 'Updating...',
      selectFiles: 'Please select at least one file to upload',
      updateSuccess: 'Profile updated successfully',
      updateSuccessDemo: 'Profile updated successfully (Demo mode)',
      updateFailed: 'Failed to update profile'
    },
    'pt-BR': {
      updateProfile: 'Atualize Seu Perfil',
      profilePicture: 'Foto do Perfil',
      bannerImage: 'Imagem do Banner',
      chooseFile: 'Escolher Arquivo',
      clear: 'Limpar',
      update: 'Atualizar Perfil',
      updating: 'Atualizando...',
      selectFiles: 'Por favor, selecione pelo menos um arquivo para enviar',
      updateSuccess: 'Perfil atualizado com sucesso',
      updateSuccessDemo: 'Perfil atualizado com sucesso (Modo demo)',
      updateFailed: 'Falha ao atualizar perfil'
    }
  };

  const t = translations[language as keyof typeof translations] || translations['en'];
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBanner(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profilePicture && !banner) {
      toast.error(t.selectFiles);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (profilePicture) formData.append("profilePicture", profilePicture);
      if (banner) formData.append("banner", banner);
      
      await onSubmit(formData);
      
      toast.success(demoMode ? t.updateSuccessDemo : t.updateSuccess);
      setProfilePicture(null);
      setBanner(null);
      
      // Reset file inputs
      const profileInput = document.getElementById("profile-picture") as HTMLInputElement;
      const bannerInput = document.getElementById("banner") as HTMLInputElement;
      if (profileInput) profileInput.value = "";
      if (bannerInput) bannerInput.value = "";
    } catch (error) {
      toast.error(t.updateFailed);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm shadow-xl">
      <h2 className="text-xl font-bold mb-4 gradient-text">{t.updateProfile}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5 bg-background/30 hover:bg-background/40 transition-colors">
            <label htmlFor="profile-picture" className="block text-sm font-medium mb-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload size={16} className="text-primary" />
              </div>
              <span>{t.profilePicture}</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("profile-picture")?.click()}
                className="w-full relative overflow-hidden"
              >
                {profilePicture ? (
                  <>
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                    <span className="truncate max-w-[200px]">{profilePicture.name}</span>
                  </>
                ) : (
                  <>{t.chooseFile}</>
                )}
              </Button>
              {profilePicture && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setProfilePicture(null)}
                  className="text-red-500"
                  size="sm"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
          
          <div className="rounded-lg border border-border p-5 bg-background/30 hover:bg-background/40 transition-colors">
            <label htmlFor="banner" className="block text-sm font-medium mb-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload size={16} className="text-primary" />
              </div>
              <span>{t.bannerImage}</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="banner"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("banner")?.click()}
                className="w-full relative overflow-hidden"
              >
                {banner ? (
                  <>
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                    <span className="truncate max-w-[200px]">{banner.name}</span>
                  </>
                ) : (
                  <>{t.chooseFile}</>
                )}
              </Button>
              {banner && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setBanner(null)}
                  className="text-red-500"
                  size="sm"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-blue-400 hover:from-primary/90 hover:to-blue-500"
            disabled={isSubmitting || (!profilePicture && !banner)}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full mr-2"></div>
                {t.updating}
              </>
            ) : (
              <>{t.update}</>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileForm;
