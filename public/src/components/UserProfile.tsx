
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, FileCode, Package, Calendar, MessagesSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

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

interface UserProfileProps {
  user: User;
  language: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, language }) => {
  const translations = {
    'en': {
      password: 'Password',
      license: 'License',
      noLicense: 'No License',
      activeProduct: 'Active Product',
      expiryDate: 'Expiry Date',
      expires: 'Expires',
      notAvailable: 'Not Available',
      discord: 'Discord',
      linked: 'Linked',
      notLinked: 'Not Linked',
      linkDiscord: 'Link Discord'
    },
    'pt-BR': {
      password: 'Senha',
      license: 'Licença',
      noLicense: 'Sem Licença',
      activeProduct: 'Produto Ativo',
      expiryDate: 'Data de Expiração',
      expires: 'Expira',
      notAvailable: 'Não Disponível',
      discord: 'Discord',
      linked: 'Vinculado',
      notLinked: 'Não Vinculado',
      linkDiscord: 'Vincular Discord'
    }
  };

  const t = translations[language as keyof typeof translations] || translations['en'];
  const dateLocale = language === 'pt-BR' ? ptBR : enUS;

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm shadow-xl animate-fade-in">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold gradient-text">{user.username}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {t.password}:
                </span>
                <div className="font-mono bg-background/30 px-3 py-1 rounded blur-sm select-none">
                  ••••••••••••••
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileCode size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {t.license}:
                </span>
                {user.licenseKey ? (
                  <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">
                    {user.licenseKey}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    {t.noLicense}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {t.activeProduct}:
                </span>
                <Badge className="bg-green-500/80 text-white">
                    Aim Track Pro
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {t.expiryDate}:
                </span>
                {user.expiryDate ? (
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">
                      {new Date(user.expiryDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.expires} {formatDistanceToNow(new Date(user.expiryDate), { addSuffix: true, locale: dateLocale })}
                    </span>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    {t.notAvailable}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Card>
  );
};

export default UserProfile;
