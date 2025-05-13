import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, AlertCircle, ArrowRight, FileDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DownloadSectionProps {
  demoMode: boolean;
  language: string;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ demoMode, language }) => {
  const [selectedVersion, setSelectedVersion] = useState("1.2.5");
  const [downloading, setDownloading] = useState(false);
  
  const translations = {
    'en': {
      title: 'Download Aim Track',
      subtitle: 'Get the latest version of our software',
      latestVersion: 'Latest Version',
      downloadNow: 'Download Now',
      downloading: 'Downloading...',
      systemRequirements: 'System Requirements',
      windows: 'Windows 10/11 (64-bit)',
      processor: 'Intel Core i5 or equivalent',
      memory: '8GB RAM',
      storage: '500MB available space',
      graphics: 'DirectX 11 compatible',
      releaseNotes: 'Release Notes',
      version: 'Version',
      selectVersion: 'Select Version',
      downloadHistory: 'Download History',
      downloaded: 'Downloaded',
      never: 'Never',
      downloadCount: 'Download count',
      times: 'times',
      downloadStarted: 'Download started! Your file will be ready shortly.',
      demoMode: 'Download functionality is limited in demo mode.'
    },
    'pt-BR': {
      title: 'Baixar Aim Track',
      subtitle: 'Obtenha a versão mais recente do nosso software',
      latestVersion: 'Última Versão',
      downloadNow: 'Baixar Agora',
      downloading: 'Baixando...',
      systemRequirements: 'Requisitos do Sistema',
      windows: 'Windows 10/11 (64-bit)',
      processor: 'Intel Core i5 ou equivalente',
      memory: '8GB RAM',
      storage: '500MB de espaço disponível',
      graphics: 'Compatível com DirectX 11',
      releaseNotes: 'Notas da Versão',
      version: 'Versão',
      selectVersion: 'Selecionar Versão',
      downloadHistory: 'Histórico de Downloads',
      downloaded: 'Baixado',
      never: 'Nunca',
      downloadCount: 'Quantidade de downloads',
      times: 'vezes',
      downloadStarted: 'Download iniciado! Seu arquivo estará pronto em breve.',
      demoMode: 'A funcionalidade de download é limitada no modo demo.'
    }
  };

  const t = translations[language as keyof typeof translations] || translations['en'];
  
  const versions = [
    { version: "1.2.5", date: "2025-05-15", size: "125MB" },
    { version: "1.2.4", date: "2025-04-02", size: "124MB" },
    { version: "1.2.3", date: "2025-03-10", size: "122MB" },
  ];
  
  const releaseNotes = {
    "1.2.5": [
      "Added new premium features",
      "Improved performance by 30%",
      "Fixed critical security issues",
      "Updated user interface"
    ],
    "1.2.4": [
      "Bug fixes and stability improvements",
      "Added dark mode support",
      "New configuration options"
    ],
    "1.2.3": [
      "Initial premium release",
      "Core functionality implemented"
    ]
  };
  
  const handleDownload = () => {
    setDownloading(true);
    
    // Simulate download process
    setTimeout(() => {
      setDownloading(false);
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = t.downloadStarted;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 500);
      }, 3000);
      
    }, 2000);
  };
  
  const selectedVersionData = versions.find(v => v.version === selectedVersion);
  const selectedReleaseNotes = releaseNotes[selectedVersion as keyof typeof releaseNotes] || [];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-background/50 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Download size={32} className="text-primary" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-1">Aim Track Installer</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {t.latestVersion}: v{versions[0].version}
              </p>
              
              <div className="flex justify-center mb-4">
                <Select
                  value={selectedVersion}
                  onValueChange={setSelectedVersion}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t.selectVersion} />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.version} value={v.version}>
                        v{v.version} ({v.size})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedVersionData && (
                <div className="text-sm mb-4">
                  <p>{new Date(selectedVersionData.date).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}</p>
                  <p>{selectedVersionData.size}</p>
                </div>
              )}
              
              <Button
                onClick={handleDownload}
                disabled={downloading || demoMode}
                className="w-full bg-gradient-to-r from-primary to-blue-400 hover:from-primary/90 hover:to-blue-500 text-white"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full mr-2"></div>
                    {t.downloading}
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    {t.downloadNow}
                  </>
                )}
              </Button>
              
              {demoMode && (
                <p className="text-amber-400 text-xs mt-2">
                  {t.demoMode}
                </p>
              )}
            </div>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t.downloaded}:</span>
                <span>{demoMode ? t.never : '2025-05-10'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t.downloadCount}:</span>
                <span>{demoMode ? '0' : '3'} {t.times}</span>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="space-y-6">
          <Card className="p-4 bg-background/50 backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-3">{t.systemRequirements}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t.windows}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t.processor}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t.memory}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t.storage}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>{t.graphics}</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-4 bg-background/50 backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-3">
              {t.releaseNotes} - v{selectedVersion}
            </h3>
            <ul className="space-y-2">
              {selectedReleaseNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight size={16} className="text-primary mt-1" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DownloadSection;
