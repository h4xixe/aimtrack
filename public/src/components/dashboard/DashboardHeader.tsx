import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, LogOut, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  isDemoMode: boolean;
  onLogout: () => void;
  language: string;
  onLanguageChange?: (language: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  isDemoMode, 
  onLogout, 
  language,
  onLanguageChange 
}) => {
  return (
    <div className="px-6 pt-6">
      {isDemoMode && (
        <motion.div 
          className="mb-4 px-4 py-3 bg-primary/20 border border-primary/30 rounded-lg text-primary text-center backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            animate={{ 
              opacity: [0.7, 1, 0.7] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={16} className="inline-block mr-2" />
            {language === 'pt-BR' ? 'Modo Demo - Esta é uma prévia com dados simulados' : 'Demo Mode - This is a preview with simulated data'}
          </motion.div>
        </motion.div>
      )}
      
      <div className="flex justify-between gap-3 mb-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="bg-background/30 backdrop-blur-sm hover:bg-background/40 border-primary/30 transition-all shadow-lg hover:shadow-primary/25 flex gap-2 group"
            onClick={() => onLanguageChange && onLanguageChange(language === 'pt-BR' ? 'en' : 'pt-BR')}
          >
            <Globe size={16} className="group-hover:text-primary transition-colors" />
            {language === 'pt-BR' ? 'EN' : 'PT-BR'}
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="bg-background/30 backdrop-blur-sm hover:bg-background/40 border-primary/30 transition-all shadow-lg hover:shadow-primary/25 flex gap-2 group"
          >
            <LogOut size={18} className="group-hover:text-primary transition-colors" />
            {language === 'pt-BR' ? 'Sair' : 'Log out'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHeader;