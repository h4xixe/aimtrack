
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Menu, X } from "lucide-react";

const HomeNav: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const navItems = ["Demo", "Recursos", "Preços", "FAQ"];

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${
        scrolled ? 'bg-background/80 backdrop-blur-lg shadow-lg border-b border-primary/20' : 'bg-transparent'
      }`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="text-2xl font-bold text-primary flex items-center">
              <Sparkles size={20} className="mr-2 text-primary" />
              AimBoost
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground transition-colors hover:text-primary relative group"
                variants={itemVariants}
                custom={index}
              >
                {item}
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full w-0 group-hover:w-full transition-all duration-300"
                  layoutId="underline"
                />
              </motion.a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <motion.div variants={itemVariants}>
              <Button 
                variant="outline" 
                className="gap-2 bg-background/30 border-primary/30 backdrop-blur-sm hidden sm:flex hover:bg-primary/10 hover:border-primary/50"
                onClick={() => navigate("/login")}
              >
                <MessageCircle size={18} />
                Suporte
              </Button>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                onClick={() => navigate("/register")}
              >
                COMPRAR AGORA
              </Button>
            </motion.div>

            <motion.button
              variants={itemVariants}
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-background/95 backdrop-blur-lg mt-4 rounded-lg border border-primary/20 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="py-4 px-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block py-2 px-4 text-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {item}
                </motion.a>
              ))}
              <motion.a
                href="#suporte"
                className="block py-2 px-4 text-primary hover:bg-primary/10 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <MessageCircle size={16} className="inline mr-2" />
                Suporte
              </motion.a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default HomeNav;