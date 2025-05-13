import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  CheckCircle, 
  ChevronRight,
  Globe,
  MessageCircle,
  ArrowRight,
  Star,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ChevronLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import HomeNav from "../components/home/HomeNav";

// Animated button component
const AnimatedButton = ({
  children,
  onClick = () => {},
  className = "",
  variant = "default"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline";
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        onClick={onClick} 
        variant={variant}
        className={`relative overflow-hidden ${className}`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5 }}
        />
        <span className="relative z-10 flex items-center">{children}</span>
      </Button>
    </motion.div>
  );
};

// Feature card component with hover effects
const FeatureCard = ({ icon, title, description, features }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[];
}) => {
  return (
    <motion.div
      className="bg-card/50 backdrop-blur-sm border border-primary/30 shadow-lg hover:shadow-primary/20 rounded-xl p-6"
      whileHover={{ y: -8 }}
      transition={{ type: "tween", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="w-14 h-14 rounded-lg bg-primary/15 flex items-center justify-center mb-6 glow-effect"
        whileHover={{
          boxShadow: "0 0 20px rgba(110, 166, 211, 0.4)"
        }}
        animate={{
          y: [0, -5, 0]
        }}
        transition={{ 
          y: { duration: 2, repeat: Infinity, repeatType: "reverse" } 
        }}
      >
        {icon}
      </motion.div>

      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            viewport={{ once: true }}
          >
            <CheckCircle size={18} className="text-primary" />
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

// Game card component with hover effects
const GameCard = ({ image, name }: { image: string; name: string }) => {
  return (
    <motion.div
      className="aspect-square glass-effect border border-primary/20 rounded-lg flex flex-col items-center justify-center p-6 hover:border-primary/40"
      whileHover={{ 
        y: -8, 
        scale: 1.05,
        borderColor: "rgba(110, 166, 211, 0.4)" 
      }}
      transition={{ type: "tween", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
      >
        <motion.img 
          src={image} 
          alt={name} 
          className="max-w-full max-h-full object-contain"
          animate={{ 
            y: [0, -5, 0] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        />
      </motion.div>
      <div className="font-bold text-center text-lg mt-3">{name}</div>
    </motion.div>
  );
};

// Testimonial card component with fancy animations
const TestimonialCard = ({ name, game, comment, stars }: { 
  name: string; 
  game: string; 
  comment: string; 
  stars: number;
}) => {
  return (
    <Card className="bg-background/50 backdrop-blur-lg border-primary/20 shadow-lg hover:shadow-primary/15 h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-bold text-lg">{name}</h4>
            <p className="text-sm text-muted-foreground">{game}</p>
          </div>
          <div className="flex">
            {[...Array(stars)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  delay: i * 0.2
                }}
              >
                <Star key={i} size={16} className="text-primary fill-primary" />
              </motion.div>
            ))}
          </div>
        </div>
        <p className="italic text-muted-foreground">{comment}</p>
      </CardContent>
    </Card>
  );
};

// FAQ item component with smooth animations
const FaqItem = ({ question, answer, isActive, onToggle }: { 
  question: string; 
  answer: string; 
  isActive: boolean; 
  onToggle: () => void;
}) => {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center bg-card/50 backdrop-blur-sm p-5 rounded-xl text-left focus:outline-none border border-primary/20 hover:border-primary/40"
      >
        <span className="font-medium">{question}</span>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-primary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-card/30 p-5 rounded-b-xl border-x border-b border-primary/20">
              <p className="text-muted-foreground">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main component
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [isInView, setIsInView] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      Object.entries(sectionRefs.current).forEach(([key, section]) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
            setIsInView(prev => ({ ...prev, [key]: true }));
          }
        }
      });
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger on initial load
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleQuestion = (index: number) => {
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(index);
    }
  };

  const features = [
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "Buff de Aim Assist",
      description: "Melhore sua precisão instantaneamente com nossa tecnologia exclusiva.",
      features: ["Ajuste de sensibilidade personalizado", "Suporte para múltiplos jogos", "Integração com periféricos"]
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Zero Recoil",
      description: "Sistema avançado de controle de recuo para tiros mais precisos.",
      features: ["Ajuste de recuo personalizado", "Recuo personalizado para cada arma", "Suporte para múltiplos jogos"]
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Auto Ping",
      description: "Detecte inimigos automaticamente e mantenha sua equipe informada.",
      features: ["Inimigos marcados automaticamente", "Suporte para múltiplos jogos", "Detecção avançada de movimento"]
    }
  ];
  
  const games = [
    { name: "Call of Duty", image: "https://aimboost.pro/_next/image?url=%2Fgames%2Fcod-logo.png&w=256&q=75" },
    { name: "Warzone", image: "https://aimboost.pro/_next/image?url=%2Fgames%2Fwarzone-logo.png&w=256&q=75" },
    { name: "Fortnite", image: "https://aimboost.pro/_next/image?url=%2Fgames%2Ffortnite-logo.png&w=256&q=75" },
    { name: "The Finals", image: "https://aimboost.pro/_next/image?url=%2Fgames%2Ffinals-logo.png&w=256&q=75" },
    { name: "Marvel Rivals", image: "https://aimboost.pro/_next/image?url=%2Fgames%2Frivals-logo.png&w=256&q=75" }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      game: "Warzone",
      comment: "Minha KD aumentou 1.5 pontos em apenas uma semana usando o Aim Track. Recomendo demais!",
      stars: 5
    },
    {
      name: "Rafael Costa",
      game: "Fortnite",
      comment: "O melhor software que já usei. A diferença é nítida desde o primeiro uso, e o suporte é excelente.",
      stars: 5
    },
    {
      name: "Mariana Rocha",
      game: "Apex Legends",
      comment: "Incrível como minha precisão melhorou. Estou chegando ao Predator graças ao Aim Track!",
      stars: 5
    }
  ];

  const faqs = [
    {
      question: "O software é seguro?",
      answer: "Sim, o Aim Track utiliza tecnologia avançada de emulação que é indetectável pelos sistemas anti-cheat. Nosso software é constantemente atualizado para garantir sua segurança."
    },
    {
      question: "Como funciona o Aim Assist?",
      answer: "Nossa tecnologia exclusiva analisa o movimento do seu cursor e aplica micro-ajustes para melhorar sua precisão, tornando mais fácil acertar alvos em movimento."
    },
    {
      question: "Funciona em todos os jogos?",
      answer: "O Aim Track é compatível com os jogos mais populares do momento, incluindo Call of Duty, Warzone, Fortnite, The Finals e Marvel Rivals. Atualizamos semanalmente para garantir compatibilidade."
    },
    {
      question: "Como funciona a garantia?",
      answer: "Oferecemos 7 dias de garantia de satisfação. Se você não estiver satisfeito com o produto, pode solicitar reembolso total dentro deste período."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <HomeNav />
      
      {/* Hero Section with Parallax Effect */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
        {/* Background effects */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 2 }}
        />
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              className="lg:w-1/2 mb-12 lg:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-block px-6 py-2 mb-6 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium backdrop-blur-sm"
              >
                <Target size={16} className="inline-block mr-2" />
                MIRA PROFISSIONAL PARA JOGOS FPS
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Melhore sua mira no{" "}
                <motion.span 
                  className="text-primary"
                  animate={{ 
                    textShadow: [
                      "0 0 0px rgba(110, 166, 211, 0.0)",
                      "0 0 10px rgba(110, 166, 211, 0.8)",
                      "0 0 0px rgba(110, 166, 211, 0.0)"
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Warzone
                </motion.span>{" "}
                em minutos!
              </motion.h1>
              
              <motion.p 
                className="text-lg text-muted-foreground mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Buff de aim assist, no recoil e auto ping em um só aplicativo!
                Aprimore sua mira e alcance o próximo nível.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <AnimatedButton 
                  className="text-lg py-6 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-primary/25"
                  onClick={() => navigate("/register")}
                >
                  COMEÇAR POR R$47/MÊS 
                  <motion.div 
                    className="ml-1"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <ChevronRight />
                  </motion.div>
                </AnimatedButton>
                
                <AnimatedButton
                  variant="outline"
                  className="text-lg py-6 px-8 bg-background/30 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => navigate("/dashboard")}
                >
                  ACESSAR DASHBOARD
                  <motion.div 
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                  >
                    <ArrowRight />
                  </motion.div>
                </AnimatedButton>
                
                <div className="flex items-center gap-2 text-muted-foreground mt-2 md:mt-0">
                  <CheckCircle size={16} className="text-primary" />
                  <span>7 dias de garantia</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div 
                className="glass-effect rounded-2xl border-primary/20 shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="	https://aimboost.pro/_next/image?url=%2Fdemo-preview.jpeg&w=1920&q=75" 
                  alt="Aim Tracks" 
                  className="w-full h-auto object-cover rounded-lg opacity-90"
                />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-white/20"
                    >
                      <Sparkles className="mr-2" size={18} /> Ver Demo
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Floating elements for visual interest */}
              <motion.div
                className="absolute -right-10 top-1/3 glass-effect p-2 rounded-lg hidden md:block"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs">Aim Assist Ativo</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section 
        className="py-20 relative" 
        ref={(el: HTMLDivElement | null) => {sectionRefs.current.features = el}}
      >
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              RECURSOS <span className="text-primary">EXCLUSIVOS</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Tecnologia avançada para melhorar sua performance em jogos FPS
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="flex justify-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button 
              className="bg-background border border-primary/30 hover:bg-primary/10 text-primary"
              variant="outline"
            >
              <ShieldCheck className="mr-2" /> Software 100% seguro e atualizado
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Compatible Games */}
      <section 
        className="py-20 relative" 
        ref={(el: HTMLDivElement | null) => {sectionRefs.current.games = el}}
      >
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              COMPATÍVEL COM <span className="text-primary">SEUS JOGOS</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Software otimizado para os jogos mais populares do momento
            </motion.p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GameCard {...game} />
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/15 border border-primary/30 text-primary backdrop-blur-sm animate-pulse-slow">
              <Zap size={16} className="mr-2" /> Compatibilidade atualizada semanalmente
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials / Feedback Section */}
      <section 
        className="py-20 relative"
        ref={(el: HTMLDivElement | null) => {sectionRefs.current.testimonials = el}}
      >
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              FEEDBACK DOS <span className="text-primary">USUÁRIOS</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Veja o que nossos clientes estão falando sobre o Aim Track
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 relative">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              PERGUNTAS <span className="text-primary">FREQUENTES</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Tudo o que você precisa saber sobre o Aim Track
            </motion.p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <FaqItem
                  question={faq.question}
                  answer={faq.answer}
                  isActive={activeQuestion === index}
                  onToggle={() => toggleQuestion(index)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section 
        className="py-20 relative"
        ref={(el: HTMLDivElement | null) => {sectionRefs.current.pricing = el}}
      >
        <motion.div 
          className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              MIRA <span className="text-primary">PROFISSIONAL</span>
            </motion.h2>
            <motion.p 
              className="text-primary text-2xl font-bold uppercase"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              O MELHOR AIM ASSIST DO MERCADO
            </motion.p>
          </div>
          
          <motion.div 
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="glass-effect border-primary/20 shadow-2xl overflow-hidden transform hover:shadow-primary/15">
              <CardContent className="p-8">
                <motion.div 
                  className="flex justify-between items-center mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-gray-400 line-through">R$197</div>
                  <motion.div 
                    className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 rgba(110, 166, 211, 0)",
                        "0 0 10px rgba(110, 166, 211, 0.5)",
                        "0 0 0 rgba(110, 166, 211, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    -76% OFF
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="text-primary text-7xl font-bold text-center mb-8 drop-shadow-md"
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: "tween" }}
                  animate={{
                    textShadow: [
                      "0 0 0 rgba(110, 166, 211, 0)",
                      "0 0 15px rgba(110, 166, 211, 0.7)",
                      "0 0 0 rgba(110, 166, 211, 0)"
                    ]
                  }}
                  
                >
                  R$47
                  <span className="text-xl text-muted-foreground">/mês</span>
                </motion.div>
                
                <motion.div 
                  className="bg-background/70 backdrop-blur-sm p-6 rounded-lg mb-8 border border-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="text-xl font-bold mb-4 text-center">O que você vai receber:</h4>
                  <ul className="space-y-3">
                    {[
                      "Software Completo e Atualizado",
                      "Suporte Premium 24/7",
                      "Configurações Otimizadas",
                      "Updates Automáticos",
                      "Garantia de 7 Dias",
                      "Acesso ao Discord VIP"
                    ].map((item, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + (i * 0.1) }}
                      >
                        <CheckCircle size={20} className="text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="w-full py-7 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-primary/25"
                    onClick={() => navigate("/register")}
                  >
                    <Sparkles className="mr-2" size={20} />
                    ATIVAR AGORA
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <h5 className="text-primary font-semibold">Garantia de Satisfação:</h5>
                  <p className="text-sm text-muted-foreground">7 dias para testar ou seu dinheiro de volta!</p>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col gap-2 mt-6 items-center text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} /> Pagamento 100% seguro
                  </div>
                  <div className="flex items-center gap-2">
                    Em até 12x sem juros
                  </div>
                  <motion.div 
                    className="mt-4 text-primary font-semibold"
                    animate={{ 
                      opacity: [0.7, 1, 0.7] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap size={14} className="inline mr-1" /> ÚLTIMA CHANCE NESTE PREÇO!
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-primary/20 backdrop-blur-sm">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="mb-4 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-2xl font-bold text-primary mb-2">Aim Track</div>
              <p className="text-sm text-muted-foreground">© 2025 Aim Track. Todos os direitos reservados.</p>
            </motion.div>
            <motion.div 
              className="flex gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <Globe size={16} className="mr-1" /> Termos
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <ShieldCheck size={16} className="mr-1" /> Privacidade
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <MessageCircle size={16} className="mr-1" /> Suporte
              </Button>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;