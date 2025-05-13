
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfile from "../UserProfile";
import ProfileForm from "../ProfileForm";
import DownloadSection from "../DownloadSection";
import RenewalSection from "../RenewalSection";
import HwidSection from "../HWIDResetSection";
import ConfigsSection from "../ConfigsSection";
import { CreditCard, Download, Calendar, Globe, Settings, MessagesSquare } from "lucide-react";
import HWIDResetSection from "../HWIDResetSection";

interface DashboardTabsProps {
  user: {
    username: string;
    email: string;
    licenseKey?: string;
    discordId?: string;
    profilePicture?: string;
    banner?: string;
    expiry?: string;
    hwid?: string;
    resetsAvailable?: number;
  };
  handleProfileUpdate: (formData: FormData) => Promise<void>;
  isDemoMode: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  user, 
  handleProfileUpdate, 
  isDemoMode,
  language,
  onLanguageChange
}) => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-6 mb-8 glass-effect bg-background/20 backdrop-blur-sm border border-gray-800/30">
        <TabsTrigger 
          value="profile" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <CreditCard size={18} />
          <span>{language === 'pt-BR' ? 'Perfil' : 'Profile'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="download" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Download size={18} />
          <span>{language === 'pt-BR' ? 'Baixar' : 'Download'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="renewal" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Calendar size={18} />
          <span>{language === 'pt-BR' ? 'Renovar' : 'Renewal'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="hwid" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <MessagesSquare size={18} />
          <span>Hardware ID</span>
        </TabsTrigger>
        <TabsTrigger 
          value="configs" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Settings size={18} />
          <span>{language === 'pt-BR' ? 'Configs' : 'Configs'}</span>
        </TabsTrigger>
        <TabsTrigger 
          value="language" 
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Globe size={18} />
          <span>{language === 'pt-BR' ? 'Idioma' : 'Language'}</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <UserProfile user={user} language={language} />
          </div>
          <div>
            <ProfileForm onSubmit={handleProfileUpdate} demoMode={isDemoMode} language={language} />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="download" className="animate-fade-in">
        <DownloadSection demoMode={isDemoMode} language={language} />
      </TabsContent>
      
      <TabsContent value="renewal" className="animate-fade-in">
        <RenewalSection demoMode={isDemoMode} language={language} />
      </TabsContent>
      
     <TabsContent value="hwid" className="animate-fade-in">
        <HWIDResetSection 
          isDemoMode={isDemoMode} 
          language={language} 
          hwid={user.hwid || '00000000-0000-0000-0000-000000000000'} 
          resetsAccount={user.resetsAvailable !== undefined ? user.resetsAvailable : 2}
        />
      </TabsContent>
      
      <TabsContent value="configs" className="animate-fade-in">
        <ConfigsSection user={user} isDemoMode={isDemoMode} language={language} />
      </TabsContent>
      
      <TabsContent value="language" className="animate-fade-in">
        <div className="grid place-items-center py-8">
          <div className="w-full max-w-md p-6 glass-effect rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold gradient-text mb-6 text-center">
              {language === 'pt-BR' ? 'Selecione o Idioma' : 'Select Language'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onLanguageChange('en')}
                className={`p-4 rounded-lg transition-all flex items-center justify-center gap-2 hover:bg-primary/10 
                  ${language === 'en' ? 'bg-primary/20 border-2 border-primary/50' : 'bg-background/30 border border-gray-700/30'}`}
              >
                <span className="font-medium">English</span>
              </button>
              <button 
                onClick={() => onLanguageChange('pt-BR')}
                className={`p-4 rounded-lg transition-all flex items-center justify-center gap-2 hover:bg-primary/10 
                  ${language === 'pt-BR' ? 'bg-primary/20 border-2 border-primary/50' : 'bg-background/30 border border-gray-700/30'}`}
              >
                <span className="font-medium">Português</span>
              </button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
