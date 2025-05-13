import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CircleDollarSign, CreditCard, QrCode, Copy, Check, Calendar } from "lucide-react";
import QRCodePlaceholder from "./QRCodePlaceholder";
import { api, paymentApi } from "../services/api";

interface RenewalSectionProps {
  demoMode: boolean;
  language: string;
  userId?: string; 
}

const RenewalSection: React.FC<RenewalSectionProps> = ({ demoMode, language, userId  }) => {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixAmount, setPixAmount] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  const translations = {
    'en': {
      title: 'Choose Your Plan',
      subtitle: 'Renew your subscription to continue enjoying all features',
      monthly: 'Monthly',
      yearly: 'Yearly',
      selected: 'Selected',
      bestValue: 'Best Value',
      billedMonthly: 'Billed monthly',
      billedAnnually: 'Billed annually',
      fullAccess30: 'Full access for 30 days',
      fullAccess365: 'Full access for 365 days',
      savings: '71% savings',
      selectPlan: 'Select Your Plan',
      paymentMethod: 'Payment Method',
      scanQR: 'Scan QR Code to Pay',
      selectedPlan: 'Selected Plan',
      nameOnCard: 'Name on Card',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date',
      cvc: 'CVC',
      pay: 'Pay',
      generatePayment: 'Generate Payment',
      processing: 'Processing...',
      termsAgreement: 'By renewing your subscription, you agree to our Terms of Service and Privacy Policy.',
      copyCode: 'Copy Code',
      copied: 'Copied!'
    },
    'pt-BR': {
      title: 'Escolha Seu Plano',
      subtitle: 'Renove sua assinatura para continuar aproveitando todos os recursos',
      monthly: 'Mensal',
      yearly: 'Anual',
      selected: 'Selecionado',
      bestValue: 'Melhor Valor',
      billedMonthly: 'Cobrado mensalmente',
      billedAnnually: 'Cobrado anualmente',
      fullAccess30: 'Acesso completo por 30 dias',
      fullAccess365: 'Acesso completo por 365 dias',
      savings: '71% de economia',
      selectPlan: 'Selecione Seu Plano',
      paymentMethod: 'Método de Pagamento',
      scanQR: 'Escaneie o QR Code para Pagar',
      selectedPlan: 'Plano Selecionado',
      nameOnCard: 'Nome no Cartão',
      cardNumber: 'Número do Cartão',
      expiryDate: 'Data de Validade',
      cvc: 'CVC',
      pay: 'Pagar',
      generatePayment: 'Gerar Pagamento',
      processing: 'Processando...',
      termsAgreement: 'Ao renovar sua assinatura, você concorda com nossos Termos de Serviço e Política de Privacidade.',
      copyCode: 'Copiar Código',
      copied: 'Copiado!'
    }
  };

  const t = translations[language as keyof typeof translations] || translations['en'];
  
   useEffect(() => {
    
    if (!paymentId || demoMode) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/payments/${paymentId}`);
        if (response.data.object.status !== paymentStatus) {
          setPaymentStatus(response.data.object.status);
          if (response.data.object.status === 'paid') {
            toast.success(language === 'pt-BR' 
              ? 'Pagamento confirmado! Sua licença foi renovada.' 
              : 'Payment confirmed! Your license has been renewed.');
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 15000); // Verificar a cada 15 segundos

    return () => clearInterval(interval);
  }, [paymentId, paymentStatus, demoMode, language]);

const PAYMENT_TOKEN = '7d06f4e56d3646f6f039af95598351f7a78fa52736536c645d3a62a9fd1710b5';

  const plans = {
    monthly: {
      name: t.monthly,
      price: "R$ 35,00",
      value: 35,
      feature: t.fullAccess30
    },
    yearly: {
      name: t.yearly,
      price: "R$ 100,00",
      value: 100,
      feature: t.fullAccess365
    }
  };
  
  const handleGeneratePayment = async () => {
    setIsSubmitting(true);
    try {
      if (demoMode) {
        // Modo demo - simular geração de pagamento
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPixCode('00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174400');
        setPixAmount(plans[plan].value);
        setPaymentId('demo-payment-id');
        toast.success(language === 'pt-BR' ? 'Pagamento de demonstração gerado!' : 'Demo payment generated!');
      } else {
        // Chamada real para a API
        const jwtToken = "d4f4f126a4e582fae47ac9b01b2cead823eea69e4d6d38a429f528ee35459af8";//d4f4f126a4e582fae47ac9b01b2cead823eea69e4d6d38a429f528ee35459af8
        const response = await api.post('/payments/generate', {
           headers: {
     Authorization: `Bearer ${jwtToken}`
  },
          amount: plans[plan].value,
          payment: { 
            method: 'pix', 
            expiresAt: 48 // Expira em 48 horas
          },
          metadata: { 
            type: 'subscription', 
            plan,
            userId // Inclui o ID do usuário nos metadados
          }
        });
        
        if (response.data?.object?.pix?.qrCode) {
          setPixCode(response.data.object.pix.qrCode);
          setPixAmount(response.data.object.amount);
          setPaymentId(response.data.object.id);
          setPaymentStatus('pending');
          toast.success(language === 'pt-BR' ? 'Pagamento PIX gerado com sucesso!' : 'PIX payment generated successfully!');
        } else {
          throw new Error(response.data?.error || 'Failed to generate payment');
        }
      }
    } catch (error) {
      console.error('Payment generation error:', error);
      toast.error(language === 'pt-BR' 
        ? 'Falha ao gerar pagamento' 
        : 'Failed to generate payment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCopyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(language === 'pt-BR' ? 'Código PIX copiado!' : 'PIX code copied!');
    }
  };
  
  const handleSubmitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (demoMode) {
        // Simular processamento de cartão no modo demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success(language === 'pt-BR' 
          ? "Pagamento com cartão simulado com sucesso!" 
          : "Card payment simulated successfully!");
      } else {
        // Implementação real para pagamento com cartão
        // (Você pode adicionar isso posteriormente)
        toast.error(language === 'pt-BR' 
          ? "Pagamento com cartão não implementado ainda" 
          : "Card payment not implemented yet");
      }
    } catch (error) {
      console.error('Card payment error:', error);
      toast.error(language === 'pt-BR' 
        ? "Erro ao processar pagamento com cartão" 
        : "Error processing card payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adicione esta função para renderizar o status do pagamento
  const renderPaymentStatus = () => {
    if (!paymentId || paymentStatus === 'pending') return null;
    
    const statusMessages = {
      'paid': {
        'en': 'Payment confirmed!',
        'pt-BR': 'Pagamento confirmado!'
      },
      'failed': {
        'en': 'Payment failed',
        'pt-BR': 'Pagamento falhou'
      },
      'expired': {
        'en': 'Payment expired',
        'pt-BR': 'Pagamento expirado'
      }
    };
    
    const statusColor = {
      'paid': 'bg-green-500',
      'failed': 'bg-red-500',
      'expired': 'bg-yellow-500'
    };
    
    return (
      <div className={`mt-4 p-2 rounded-md text-white text-center ${statusColor[paymentStatus as keyof typeof statusColor]}`}>
        {statusMessages[paymentStatus as keyof typeof statusMessages][language as 'en' | 'pt-BR']}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold gradient-text mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan selection */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            {t.selectPlan}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`p-4 cursor-pointer hover-scale transition-all border-2 ${plan === "monthly" ? "border-primary" : "border-transparent"} bg-background/50 backdrop-blur-sm`}
              onClick={() => setPlan("monthly")}
            >
              <div className="flex justify-between items-start mb-4">
                <CircleDollarSign size={24} className="text-primary" />
                {plan === "monthly" && <span className="bg-primary text-xs rounded-full px-2 py-0.5 text-white font-medium">{t.selected}</span>}
              </div>
              
              <h4 className="font-bold text-lg">{t.monthly}</h4>
              <p className="text-2xl font-bold text-primary mb-1">R$ 35,00</p>
              <p className="text-sm text-muted-foreground">{t.billedMonthly}</p>
              <div className="mt-4 text-sm">
                <p>• {t.fullAccess30}</p>
              </div>
            </Card>
            
            <Card 
              className={`p-4 cursor-pointer hover-scale transition-all border-2 ${plan === "yearly" ? "border-primary" : "border-transparent"} bg-background/50 backdrop-blur-sm`}
              onClick={() => setPlan("yearly")}
            >
              <div className="flex justify-between items-start mb-4">
                <CircleDollarSign size={24} className="text-primary" />
                <span className="bg-green-500 text-xs rounded-full px-2 py-0.5 text-white font-medium">{t.bestValue}</span>
              </div>
              
              <h4 className="font-bold text-lg">{t.yearly}</h4>
              <p className="text-2xl font-bold text-primary mb-1">R$ 100,00</p>
              <p className="text-sm text-muted-foreground">{t.billedAnnually}</p>
              <div className="mt-4 text-sm">
                <p>• {t.fullAccess365}</p>
                <p className="text-green-500">• {t.savings}</p>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Payment method */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-primary" />
            {t.paymentMethod}
          </h3>
          
          <Tabs defaultValue="pix" onValueChange={(value) => setPaymentMethod(value as "pix" | "card")}>
            <TabsList className="grid grid-cols-2 mb-6 glass-effect">
              <TabsTrigger value="pix" className="flex items-center gap-2">
                <QrCode size={16} />
                <span>PIX</span>
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard size={16} />
                <span>{language === 'pt-BR' ? 'Cartão' : 'Card'}</span>
              </TabsTrigger>
            </TabsList>
            
              <TabsContent value="pix" className="space-y-4">
              <Card className="p-6 bg-background/50 backdrop-blur-sm text-center">
                {!pixCode ? (
                  <>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {language === 'pt-BR' 
                        ? `Plano selecionado: ${plans[plan].name} (${plans[plan].price})` 
                        : `Selected plan: ${plans[plan].name} (${plans[plan].price})`}
                    </p>
                    <Button
                      onClick={handleGeneratePayment}
                      disabled={isSubmitting}
                      className="w-full shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full mr-2"></div>
                          {t.processing}
                        </>
                      ) : (
                        t.generatePayment
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <h4 className="font-medium mb-4">{t.scanQR}</h4>
                    <div className="flex justify-center">
                      <QRCodePlaceholder price={plans[plan].value} />
                    </div>
                    <div className="mt-4">
                      <p className="text-sm mb-2">{t.selectedPlan}: {plans[plan].name} ({plans[plan].price})</p>
                      <div className="flex items-center gap-2 bg-background/50 p-2 rounded-md">
                        <Input 
                          value={pixCode}
                          readOnly
                          className="font-mono text-xs bg-transparent border-none"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={handleCopyPixCode}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? t.copied : t.copyCode}
                        </Button>
                      </div>
                      {renderPaymentStatus()}
                      <p className="text-xs text-muted-foreground mt-2">
                        {language === 'pt-BR' 
                          ? 'Este PIX expira em 48 horas' 
                          : 'This PIX expires in 48 hours'}
                      </p>
                    </div>
                  </>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="card">
              <Card className="p-6 bg-background/50 backdrop-blur-sm">
                <form onSubmit={handleSubmitCard} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-name">{t.nameOnCard}</Label>
                    <Input id="card-name" placeholder="John Doe" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="card-number">{t.cardNumber}</Label>
                    <Input id="card-number" placeholder="0000 0000 0000 0000" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry">{t.expiryDate}</Label>
                      <Input id="card-expiry" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvc">{t.cvc}</Label>
                      <Input id="card-cvc" placeholder="123" required />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm mb-4">{t.selectedPlan}: {plans[plan].name} ({plans[plan].price})</p>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full mr-2"></div>
                          {t.processing}
                        </>
                      ) : (
                        <>{t.pay} {plans[plan].price}</>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-muted-foreground">
        <p className="text-center">{t.termsAgreement}</p>
      </div>
    </div>
  );
};

export default RenewalSection;
