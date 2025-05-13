"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimation, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import Link from "next/link"
import {
  Zap,
  Shield,
  Check,
  Lock,
  Clock,
  MessageSquare,
  ChevronDown,
  Flame,
  Menu,
  X,
  Target,
  Gamepad2,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  MousePointer,
} from "lucide-react"

// Animated button component
const AnimatedButton = ({
  children,
  href,
  className = "",
  onClick = () => {},
  primary = true,
}: {
  children: React.ReactNode
  href?: string
  className?: string
  onClick?: () => void
  primary?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const buttonContent = (
    <motion.div
      className={`relative overflow-hidden ${primary ? "bg-primary hover:bg-primary-dark" : "bg-background-light hover:bg-background-lighter"} text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-light/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.5 }}
      />

      <motion.div className="relative z-10 flex items-center justify-center">{children}</motion.div>
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{buttonContent}</Link>
  }

  return buttonContent
}

// Parallax background component
const ParallaxBackground = () => {
  const { scrollY } = useScroll()
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    // Only access window in useEffect (client-side)
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const y1 = useTransform(scrollY, [0, 1000], [0, -150])
  const y2 = useTransform(scrollY, [0, 1000], [0, -100])
  const y3 = useTransform(scrollY, [0, 1000], [0, -50])
  const opacity1 = useTransform(scrollY, [0, 300], [0.6, 0])
  const opacity2 = useTransform(scrollY, [300, 600], [0, 0.3])
  const opacity3 = useTransform(scrollY, [600, 900], [0, 0.2])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Hero section background */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-screen blue-gradient-radial"
        style={{ y: y1, opacity: opacity1 }}
      />

      {/* Middle section background */}
      <motion.div
        className="absolute top-[100vh] left-0 right-0 h-screen blue-gradient-radial"
        style={{ y: y2, opacity: opacity2 }}
      />

      {/* Bottom section background */}
      <motion.div
        className="absolute top-[200vh] left-0 right-0 h-screen blue-gradient-radial"
        style={{ y: y3, opacity: opacity3 }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [null, Math.random() * dimensions.height * 0.8 + dimensions.height * 0.1],
              opacity: [null, Math.random() * 0.3 + 0.1],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              duration: Math.random() * 15 + 15,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Testimonial carousel component
const TestimonialCarousel = ({ testimonials }: { testimonials: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextTestimonial = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  return (
    <div className="relative">
      <div className="overflow-hidden relative">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="testimonial-card rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-start mb-4">
              <div className="bg-primary/20 text-primary h-10 w-10 rounded-full flex items-center justify-center font-bold mr-3 shadow-glow-sm">
                {testimonials[currentIndex].name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium">{testimonials[currentIndex].name}</h4>
                <div className="flex items-center text-sm text-gray-400">
                  <span>{testimonials[currentIndex].plan}</span>
                  <span className="mx-2">•</span>
                  <div className="flex">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-gray-200 relative">
                <svg
                  className="absolute -top-2 -left-3 w-8 h-8 text-primary/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                {testimonials[currentIndex].comment}
              </div>
            </div>

            <div className="text-sm text-gray-400">{testimonials[currentIndex].date}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={prevTestimonial}
          className="p-2 rounded-full bg-background-light hover:bg-background-lighter transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>

        <div className="flex gap-1 items-center">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1)
                setCurrentIndex(i)
              }}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-primary w-4" : "bg-gray-600"}`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextTestimonial}
          className="p-2 rounded-xl bg-background-light hover:bg-background-lighter transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  )
}

// Feature card component with hover effects
const FeatureCard = ({ icon, title, description, features }: any) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="feature-card rounded-lg p-6 shadow-lg relative overflow-hidden group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="absolute inset-0 border border-primary/30 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        <motion.div
          className="bg-background-highlight p-3 rounded-lg inline-block mb-4 shadow-glow-sm"
          animate={{
            y: isHovered ? [0, -5, 0] : 0,
            boxShadow: isHovered ? "0 0 20px rgba(110, 166, 211, 0.4)" : "0 0 10px rgba(110, 166, 211, 0.2)",
          }}
          transition={{ duration: 1, repeat: isHovered ? Number.POSITIVE_INFINITY : 0, repeatType: "loop" }}
        >
          {icon}
        </motion.div>

        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-300 mb-6">{description}</p>

        <ul className="space-y-2">
          {features.map((feature: string, index: number) => (
            <motion.li
              key={index}
              className="flex items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

// Game card component with hover effects
const GameCard = ({ logo, name }: { logo: string; name: string }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="game-card rounded-lg p-6 flex items-center justify-center shadow-lg"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="absolute inset-0 border border-primary/30 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          filter: isHovered ? "drop-shadow(0 0 8px rgba(110, 166, 211, 0.6))" : "none",
        }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={logo || "/placeholder.svg"}
          alt={name}
          width={150}
          height={80}
          className="h-12 md:h-16 w-auto object-contain"
        />
      </motion.div>
    </motion.div>
  )
}

// FAQ item component with smooth animations
const FaqItem = ({ question, answer, isActive, onClick }: any) => {
  return (
    <div className="mb-4 faq-item">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center glass-effect p-5 rounded-xl text-left focus:outline-none border border-gray-800 hover:border-primary/30 transition-colors duration-300"
      >
        <span className="font-medium">{question}</span>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 20 }}
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
            transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="bg-background-card p-5 rounded-b-xl border-x border-b border-gray-800">
              <p className="text-gray-300">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main component
export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  const { scrollY } = useScroll()

  // Update header state based on scroll position
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const toggleQuestion = (index: number) => {
    if (activeQuestion === index) {
      setActiveQuestion(null)
    } else {
      setActiveQuestion(index)
    }
  }

  const faqs = [
    {
      question: "O software é seguro?",
      answer:
        "Sim, o AimTrack utiliza tecnologia avançada de emulação que é indetectável pelos sistemas anti-cheat. Nosso software é constantemente atualizado para garantir sua segurança.",
    },
    {
      question: "Como funciona o Aim Assist?",
      answer:
        "Nossa tecnologia exclusiva analisa o movimento do seu cursor e aplica micro-ajustes para melhorar sua precisão, tornando mais fácil acertar alvos em movimento.",
    },
    {
      question: "Funciona em todos os jogos?",
      answer:
        "O AimTrack é compatível com os jogos mais populares do momento, incluindo Call of Duty, Warzone, Fortnite, The Finals e Marvel Rivals. Atualizamos semanalmente para garantir compatibilidade.",
    },
    {
      question: "Posso usar em torneios?",
      answer:
        "Não recomendamos o uso do AimTrack em torneios oficiais. Nosso software é destinado para uso casual e para melhorar suas habilidades em ambiente não competitivo.",
    },
    {
      question: "Como funciona a garantia?",
      answer:
        "Oferecemos 7 dias de garantia de satisfação. Se você não estiver satisfeito com o produto, pode solicitar reembolso total dentro deste período.",
    },
  ]

  const testimonials = [
    {
      name: "ferraozera4884",
      plan: "Plano 365 dias",
      rating: 5,
      comment: "O atendimento é pica, o cara é atencioso dms, e o app dps q se acostuma impossível jogar sem",
      date: "23/09/2024",
    },
    {
      name: "eoernesto",
      plan: "Plano 365 dias",
      rating: 5,
      comment: "Muito bom, Mira ta grudando igual chiclete 😁",
      date: "17/09/2024",
    },
    {
      name: "_fkzinx",
      plan: "Plano 30 dias",
      rating: 5,
      comment: "Top rapaziadinha dão suporte 100%, pode adquirir!",
      date: "26/09/2024",
    },
    {
      name: "gamerzinho",
      plan: "Plano 90 dias",
      rating: 5,
      comment: "Melhor investimento que já fiz! Minha gameplay melhorou 200%.",
      date: "15/09/2024",
    },
    {
      name: "proplayerbr",
      plan: "Plano 365 dias",
      rating: 5,
      comment: "Suporte excelente e o software é muito fácil de usar. Recomendo!",
      date: "10/09/2024",
    },
  ]

  const features = [
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "Buff de Aim Assist",
      description: "Melhore sua precisão instantaneamente com nossa tecnologia exclusiva.",
      features: ["Ajuste de sensibilidade personalizado", "Suporte para múltiplos jogos", "Integração com periféricos"],
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Zero Recoil",
      description: "Sistema avançado de controle de recuo para tiros mais precisos.",
      features: ["Ajuste de recuo personalizado", "Recuo personalizado para cada arma", "Suporte para múltiplos jogos"],
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Auto Ping",
      description: "Detecte inimigos automaticamente e mantenha sua equipe informada.",
      features: [
        "Inimigos serão marcados automaticamente ao atirar",
        "Suporte para múltiplos jogos",
        "Alertas visuais e sonoros configuráveis",
      ],
    },
  ]

  const games = [
    { name: "Call of Duty", logo: "/images/games/cod-logo.png" },
    { name: "Warzone", logo: "/images/games/warzone-logo.png" },
    { name: "Fortnite", logo: "/images/games/fortnite-logo.png" },
    { name: "The Finals", logo: "/images/games/finals-logo.png" },
    { name: "Marvel Rivals", logo: "/images/games/rivals-logo.png" },
  ]

  return (
    <main className="min-h-screen bg-background text-white overflow-hidden">
      {/* Parallax background */}
      <ParallaxBackground />

      {/* Header/Navbar */}
      <motion.header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "py-2 navbar-glass" : "py-4 bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        style={{
          boxShadow: isScrolled ? "0 4px 20px rgba(110, 166, 211, 0.15)" : "none",
        }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Image src="/images/logo.png" alt="Aim Track Logo" width={150} height={50} className="h-10 w-auto" />
          </motion.div>

          <div className="hidden md:flex space-x-8">
            {["Demonstração", "Recursos", "Preços", "FAQ"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                <Link href={`#${item.toLowerCase()}`} className="relative group">
                  <span className="hover:text-primary transition-colors duration-300">{item}</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Link
                href="#suporte"
                className="hidden md:flex items-center text-primary hover:text-primary-light transition-colors duration-300"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                <span>Suporte</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <AnimatedButton href="#comprar" className="px-4 py-2 text-sm md:text-base">
                COMPRAR AGORA
              </AnimatedButton>
            </motion.div>
          </div>

          <motion.button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden glass-effect border-t border-gray-800"
            >
              <motion.div
                className="px-4 py-2 space-y-3"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {["Demonstração", "Recursos", "Preços", "FAQ", "Suporte"].map((item, i) => (
                  <motion.div
                    key={item}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className={`block py-2 transition-colors duration-300 ${
                        item === "Suporte" ? "text-primary hover:text-primary-light" : "hover:text-primary"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-0 overflow-hidden min-h-screen flex items-center">
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.2,
                      delayChildren: 0.3,
                    },
                  },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                  }}
                  className="inline-block glass-effect px-4 py-2 rounded-full mb-6"
                >
                  <div className="flex items-center">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.2, 1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 3,
                      }}
                    >
                      <Flame className="h-5 w-5 text-primary mr-2" />
                    </motion.div>
                    <span className="text-sm font-medium">TENHA A MIRA DOS STREAMERS</span>
                  </div>
                </motion.div>

                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                  className="text-4xl md:text-6xl font-bold mb-4"
                >
                  Melhore sua mira no{" "}
                  <motion.span
                    className="text-primary relative inline-block"
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(110, 166, 211, 0)",
                        "0 0 10px rgba(110, 166, 211, 0.8)",
                        "0 0 0px rgba(110, 166, 211, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                  >
                    Warzone
                  </motion.span>{" "}
                  em minutos!
                </motion.h1>

                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                  className="text-gray-300 text-lg mb-8"
                >
                  Buff de aim assist, no recoil e auto ping em um só aplicativo! Aprimore sua mira e alcance o próximo
                  nível com o AimTrack.
                </motion.p>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <AnimatedButton href="#comprar" className="px-8 py-4 text-lg">
                    <span>COMEÇAR POR R$47/MÊS</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                      className="ml-2"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </AnimatedButton>

                  <div className="flex items-center text-gray-300">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, 0],
                      }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                    >
                      <Check className="h-5 w-5 text-primary mr-2" />
                    </motion.div>
                    <span>7 dias de garantia</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="md:w-1/2">
              <motion.div
                className="glass-effect rounded-2xl p-4 shadow-lg border border-gray-800 shadow-glow-sm relative z-10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    src="/videos/aim-track-demo.mp4"
                    poster="/placeholder.svg?height=400&width=600"
                    className="w-full rounded-xl"
                    controls
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>

                  <div className="absolute top-4 right-4">
                    <motion.button
                      className="bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-xl flex items-center shadow-glow-sm"
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Ver Demo
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -bottom-10 -right-10 w-40 h-40 blue-gradient-radial opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute -top-10 -left-10 w-40 h-40 blue-gradient-radial opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
              />

              {/* Floating UI elements */}
              <motion.div
                className="absolute -right-10 top-1/4 bg-background-light p-2 rounded-lg shadow-glow-sm border border-gray-800"
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, -10, 0],
                }}
                transition={{
                  delay: 1,
                  duration: 0.5,
                  y: { duration: 3, repeat: Number.POSITIVE_INFINITY },
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs">Aim Assist Ativo</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -left-10 bottom-1/4 bg-background-light p-2 rounded-lg shadow-glow-sm border border-gray-800"
                initial={{ opacity: 0, x: -50 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: [0, 10, 0],
                }}
                transition={{
                  delay: 1.2,
                  duration: 0.5,
                  y: { duration: 4, repeat: Number.POSITIVE_INFINITY },
                }}
              >
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-primary" />
                  <span className="text-xs">Precisão: 98%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 2,
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-400 mb-2">Scroll para descobrir</span>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <motion.div
                className="w-1.5 h-1.5 bg-primary rounded-full mt-1"
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 blue-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-4">
              RECURSOS <span className="text-primary">EXCLUSIVOS</span>
            </motion.h2>
            <motion.p variants={fadeIn} className="text-gray-300 max-w-2xl mx-auto">
              Tecnologia avançada para melhorar sua performance em jogos FPS
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <motion.div
              variants={fadeIn}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center glass-effect px-6 py-3 rounded-full border border-gray-800 shadow-glow-sm"
            >
              <Lock className="h-5 w-5 text-primary mr-2" />
              <span>Software 100% seguro e atualizado</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compatible Games */}
      <section id="jogos" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 blue-gradient-radial opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-4">
              COMPATÍVEL COM <span className="text-primary">SEUS JOGOS</span>
            </motion.h2>
            <motion.p variants={fadeIn} className="text-gray-300 max-w-2xl mx-auto">
              Software otimizado para os jogos mais populares do momento
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <GameCard {...game} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center glass-effect px-6 py-3 rounded-full border border-gray-800 shadow-glow-sm"
            >
              <Gamepad2 className="h-5 w-5 text-primary mr-2" />
              <span>Compatibilidade atualizada semanalmente</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 blue-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-4">
              MIRA <span className="text-primary">PROFISSIONAL</span>
            </motion.h2>
            <motion.h3 variants={fadeIn} className="text-2xl font-bold mb-4 text-primary">
              O MELHOR AIM ASSIST DO MERCADO
            </motion.h3>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              viewport={{ once: true, margin: "-100px" }}
              className="glass-effect rounded-lg overflow-hidden border border-gray-800 shadow-glow-md relative"
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="absolute -inset-[100px] blue-gradient-radial opacity-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>

              <div className="p-8 text-center relative z-10">
                <div className="flex justify-center items-center mb-6">
                  <span className="text-gray-400 line-through text-xl">R$197</span>
                  <motion.span
                    className="ml-3 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium"
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 rgba(110, 166, 211, 0)",
                        "0 0 15px rgba(110, 166, 211, 0.5)",
                        "0 0 0 rgba(110, 166, 211, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    -76% OFF
                  </motion.span>
                </div>

                <motion.div
                  className="text-6xl font-bold text-primary mb-8 relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <motion.span
                    className="relative z-10"
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(110, 166, 211, 0)",
                        "0 0 20px rgba(110, 166, 211, 0.8)",
                        "0 0 0px rgba(110, 166, 211, 0)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  >
                    R$47
                  </motion.span>
                </motion.div>

                <motion.div
                  className="bg-background/80 rounded-lg p-6 mb-8 border border-gray-800"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="text-xl font-medium mb-4">O que você vai receber:</h4>

                  <ul className="space-y-4 text-left">
                    {[
                      "Software Completo e Atualizado",
                      "Suporte Premium 24/7",
                      "Configurações Otimizadas",
                      "Updates Automáticos",
                      "Garantia de 7 Dias",
                      "Acesso ao Discord VIP",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <motion.div whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        </motion.div>
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
                >
                  <AnimatedButton href="#comprar" className="w-full py-4 text-lg">
                    <div className="flex items-center justify-center">
                      <Lock className="h-5 w-5 mr-2" />
                      ATIVAR AGORA
                    </div>
                  </AnimatedButton>
                </motion.div>

                <motion.div
                  className="mt-8 bg-background/80 rounded-lg p-4 border border-gray-800"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <h5 className="text-primary font-medium mb-2">Garantia de Satisfação:</h5>
                  <p>7 dias para testar ou seu dinheiro de volta!</p>
                </motion.div>

                <motion.div
                  className="mt-6 flex flex-col space-y-3 text-sm text-gray-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center justify-center">
                    <Lock className="h-4 w-4 text-primary mr-2" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary mr-2" />
                    <span>Em até 12x sem juros</span>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.1, type: "spring" }}
                >
                  <motion.div
                    className="inline-flex items-center bg-primary/20 px-4 py-2 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(110, 166, 211, 0)",
                        "0 0 15px rgba(110, 166, 211, 0.5)",
                        "0 0 0 rgba(110, 166, 211, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Zap className="h-4 w-4 text-primary mr-2" />
                    <span className="text-primary font-medium">ÚLTIMA CHANCE NESTE PREÇO!</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 blue-gradient-radial opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-4">
              AVALIAÇÕES <span className="text-primary">VERIFICADAS</span>
            </motion.h2>
            <motion.p variants={fadeIn} className="text-gray-300 max-w-2xl mx-auto">
              Veja o que nossos usuários estão dizendo sobre o AimTrack
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <TestimonialCarousel testimonials={testimonials} />
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 blue-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl font-bold mb-4">
              PERGUNTAS <span className="text-primary">FREQUENTES</span>
            </motion.h2>
            <motion.p variants={fadeIn} className="text-gray-300 max-w-2xl mx-auto">
              Tire suas dúvidas sobre o AimTrack
            </motion.p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <FaqItem
                  question={faq.question}
                  answer={faq.answer}
                  isActive={activeQuestion === index}
                  onClick={() => toggleQuestion(index)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="comprar" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 blue-gradient-radial opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring" }}
            viewport={{ once: true, margin: "-100px" }}
            className="glass-effect rounded-3xl p-8 md:p-12 border border-gray-800 text-center shadow-glow-md relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                background: [
                  "linear-gradient(135deg, rgba(110, 166, 211, 0.1) 0%, rgba(0, 0, 0, 0) 100%)",
                  "linear-gradient(135deg, rgba(110, 166, 211, 0.2) 0%, rgba(0, 0, 0, 0) 100%)",
                  "linear-gradient(135deg, rgba(110, 166, 211, 0.1) 0%, rgba(0, 0, 0, 0) 100%)",
                ],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />

            <div className="relative z-10">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Pronto para melhorar sua <span className="text-primary">performance</span>?
              </motion.h2>

              <motion.p
                className="text-gray-300 max-w-2xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Junte-se a milhares de jogadores que já estão dominando seus jogos favoritos com o AimTrack.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <AnimatedButton href="#comprar" className="px-8 py-4 text-lg">
                  COMEÇAR AGORA
                </AnimatedButton>
              </motion.div>

              <motion.p
                className="mt-4 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                7 dias de garantia de satisfação ou seu dinheiro de volta
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background-card border-t border-gray-800 relative">
        <div className="absolute inset-0 blue-gradient opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Image src="/images/logo.png" alt="Aim Track Logo" width={150} height={50} className="h-10 w-auto" />
              </motion.div>
              <p className="text-gray-400 mt-2">© 2025 AimTrack. Todos os direitos reservados.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {["Termos de Uso", "Política de Privacidade", "Suporte", "Contato"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <Link
                    href="#"
                    className="text-gray-300 hover:text-primary transition-colors duration-300 relative group"
                  >
                    <span>{item}</span>
                    <motion.span
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary"
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <p>Desenvolvido com ❤️ para gamers apaixonados</p>
          </motion.div>
        </div>
      </footer>
    </main>
  )
}
