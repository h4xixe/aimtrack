import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Shield, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api, paymentApi, hwidApi, resetApi } from "../services/api";
import axios from "axios";

interface HWIDResetSectionProps {
  isDemoMode: boolean;
  language: string;
  hwid: string;
  resetsAccount: number;
}


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

const HWIDResetSection: React.FC<HWIDResetSectionProps> = ({ 
  isDemoMode, 
  language, 
  hwid,
  resetsAccount
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixAmount, setPixAmount] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [resetsAvailable, setResetsAvailable] = useState(resetsAccount); 

 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
       const response = await axios.get("/api/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
      console.log('Dados do usuário:', response.data.user);  // Verifica os dados retornados
      setUser(response.data.user);  // Atualiza o estado com os dados do usuário
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  fetchUserData();
}, []);

  const translations = {
    'en': {
      title: 'HWID Reset',
      subtitle: 'Reset your hardware ID when changing computers',
      currentHWID: 'Current HWID',
      resetsAvailable: 'Resets Available',
      resetButton: 'Reset HWID',
      purchaseButton: 'Purchase HWID Reset',
      resetPrice: 'Price: R$ 5,00',
      resetSuccess: 'HWID reset successfully!',
      resetFailed: 'Failed to reset HWID',
      purchaseSuccess: 'Payment generated successfully!',
      purchaseFailed: 'Failed to generate payment',
      processing: 'Processing...',
      pixCode: 'PIX Code',
      copyButton: 'Copy Code',
      copiedButton: 'Copied!',
      scanToPay: 'Scan QR Code to pay',
      amount: 'Amount',
    },
    'pt-BR': {
      title: 'Reset de HWID',
      subtitle: 'Resete seu ID de hardware quando trocar de computador',
      currentHWID: 'HWID Atual',
      resetsAvailable: 'Resets Disponíveis',
      resetButton: 'Resetar HWID',
      purchaseButton: 'Comprar Reset de HWID',
      resetPrice: 'Preço: R$ 5,00',
      resetSuccess: 'HWID resetado com sucesso!',
      resetFailed: 'Falha ao resetar HWID',
      purchaseSuccess: 'Pagamento gerado com sucesso!',
      purchaseFailed: 'Falha ao gerar pagamento',
      processing: 'Processando...',
      pixCode: 'Código PIX',
      copyButton: 'Copiar Código',
      copiedButton: 'Copiado!',
      scanToPay: 'Escaneie o QR Code para pagar',
      amount: 'Valor',
    }
  };

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setResetsAvailable(resetsAccount);
  }, [resetsAccount]);

const handleReset = async () => {
  if (user?.resetsAvailable <= 0) {
    toast.error(language === 'pt-BR' ? 'Você não tem resets disponíveis!' : 'You have no resets available!');
    return;
  }

    
    setIsResetting(true);
    try {
      if (isDemoMode) {
        // Simulate reset in demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(t.resetSuccess);
      } else {
        // Real API call
        const response = await resetApi.post('/resethwid');
        if (response.data?.success === true) {
          const updatedResets = response.data.resetsRemaining;
           console.log("Resets restantes após o reset:", updatedResets);
           setUser(prevUser => {
          if (!prevUser) return prevUser; // Se não houver usuário, retorne o estado anterior
          return {
            ...prevUser,
            resetsAvailable: updatedResets, // Atualizando o número de resets
          };
        });
  toast.success(t.resetSuccess);
  window.location.reload();
} else {
  throw new Error(response.data?.error || 'Reset failed');
}
      }
    } catch (error) {
      console.error('HWID reset error:', error);
      toast.error(t.resetFailed);
    } finally {
      setIsResetting(false);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      if (isDemoMode) {
        // Simulate purchase in demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174400');
        setPixAmount(5);
        toast.success(t.purchaseSuccess);
      } else {
        // Real API call using your implementation
        const response = await paymentApi.post('/payments/generate', {
          amount: 5.00, // Fixed price for HWID reset
          payment: { method: 'pix', expiresAt: 48 },
          metadata: { type: 'hwid_reset' }
        });
        
        if (response.data && response.data.pixCode) {
          setPixCode(response.data.pixCode);
          setPixAmount(response.data.amount || 5);
          toast.success(t.purchaseSuccess);
        } else {
          throw new Error(response.data.error || 'Payment generation failed');
        }
      }
    } catch (error) {
      console.error('HWID purchase error:', error);
      toast.error(t.purchaseFailed);
    } finally {
      setIsPurchasing(false);
    }
  };

  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold gradient-text mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* HWID Information */}
        <Card className="p-6 bg-background/50 backdrop-blur-sm shadow-xl">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Key size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {t.currentHWID}:
                    </span>
                    <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20 truncate max-w-[200px]">
                      {user ? user.hwid : "Carregando..."} 
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/40 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {t.resetsAvailable}:
                    </span>
                       <Badge className={resetsAvailable > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                    {resetsAvailable}
                  </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleReset}
              disabled={isResetting || resetsAvailable <= 0}
              className="w-full shadow-lg"
            >
              {isResetting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full mr-2"></div>
                  {t.processing}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2" size={18} />
                  {t.resetButton}
                </>
              )}
            </Button>
          </div>
        </Card>
        
        {/* Purchase HWID Reset */}
        <Card className="p-6 bg-background/50 backdrop-blur-sm shadow-xl">
          {!pixCode ? (
            <div className="space-y-6 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">{t.purchaseButton}</h3>
                <p className="text-muted-foreground mb-2">{t.resetPrice}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'pt-BR' 
                    ? 'Compre resets adicionais quando precisar trocar de computador mais vezes.'
                    : 'Purchase additional resets when you need to change computers more times.'}
                </p>
              </div>
              
              <Button 
                onClick={handlePurchase}
                disabled={isPurchasing}
                variant="outline" 
                className="w-full border-primary/30 shadow-lg"
              >
                {isPurchasing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary/50 border-t-primary rounded-full mr-2"></div>
                    {t.processing}
                  </>
                ) : (
                  t.purchaseButton
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">{t.scanToPay}</h3>
                <div className="flex justify-center mb-4">
                  {/* This would be a real QR code in production */}
                  <div className="w-40 h-40 bg-white p-2 rounded-lg">
                    <div className="w-full h-full border-2 border-black rounded flex items-center justify-center">
                      <span className="text-black text-xs">PIX QR Code</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 text-left">
                  <p className="text-sm font-semibold">
                    {t.amount}: <span className="text-primary">R$ {pixAmount?.toFixed(2) || "5.00"}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-background/40 p-3 rounded-lg">
                <p className="text-sm mb-2 font-medium">{t.pixCode}:</p>
                <div className="flex">
                  <div className="bg-background/80 p-2 rounded-l-md flex-1 border border-r-0 border-gray-700 truncate font-mono text-xs">
                    {pixCode}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard(pixCode)}
                    className="rounded-l-none"
                  >
                    {copied ? t.copiedButton : t.copyButton}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HWIDResetSection;