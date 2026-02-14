import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Search, ArrowRight, Phone, TrendingUp, Briefcase, Globe, Users, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface ServiceCard {
  id: string;
  title: string;
  subtitle: string;
  features: string[];
  image: string;
  icon: React.ReactNode;
  gradient: string;
  path: string;
}

const services: ServiceCard[] = [
  {
    id: "sales",
    title: "SALES AUTOMATION",
    subtitle: "Scale revenue engines",
    features: [
      "AUTOMATED FOLLOW-UPS",
      "LEAD CAPTURE & QUAL.",
      "CRM AUTOMATION",
      "AI QUOTE GEN.",
      "OUTBOUND CALLING",
      "SALES CHATBOT"
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    icon: <Briefcase className="size-5 text-white" />,
    gradient: "from-blue-500/20 to-blue-600/40",
    path: "/services"
  },
  {
    id: "voice",
    title: "AI VOICE AGENTS",
    subtitle: "24/7 intelligent calling",
    features: [
      "INBOUND HANDLING",
      "OUTBOUND FOLLOW-UPS",
      "APPT. REMINDERS",
      "FEEDBACK CALLS",
      "SUPPORT AUTOMATION"
    ],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
    icon: <Phone className="size-5 text-white" />,
    gradient: "from-slate-700/80 to-slate-900/90",
    path: "/services"
  },
  {
    id: "growth",
    title: "GROWTH SOLUTIONS",
    subtitle: "Data-driven scaling",
    features: [
      "AI CONTENT GEN.",
      "SOCIAL AUTOMATION",
      "AD AUTOMATION",
      "SEO & WEB DEV",
      "DESIGN SERVICES"
    ],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
    icon: <TrendingUp className="size-5 text-white" />,
    gradient: "from-slate-600/70 to-slate-800/80",
    path: "/services"
  }
];

const searchablePages = [
  { name: "All Services", path: "/services", keywords: ["services", "solutions", "automation"] },
  { name: "Sales & Lead Automation", path: "/services", keywords: ["sales", "lead", "automation", "crm"] },
  { name: "AI Voice Calling", path: "/services", keywords: ["voice", "calling", "phone", "agent"] },
  { name: "Marketing & Content", path: "/services", keywords: ["marketing", "content", "social", "ads"] },
  { name: "Business Solutions", path: "/services", keywords: ["business", "website", "design", "va"] },
  { name: "Pricing Plans", path: "/pricing", keywords: ["pricing", "plans", "cost", "subscription"] },
  { name: "Company", path: "/company", keywords: ["about", "company", "team", "careers", "process"] },
  { name: "Contact", path: "/contact", keywords: ["contact", "support", "help"] },
];

export function ExploreServices() {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return searchablePages.filter(
      page => 
        page.name.toLowerCase().includes(query) ||
        page.keywords.some(k => k.includes(query))
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(searchResults[0].path);
      setSearchQuery("");
    }
  };

  return (
    <section className="py-16 lg:py-20 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          
          {/* Left Content */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-[#2960ea]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2960ea]">
                  Solutions
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[0.95] uppercase mb-6">
                Explore<br />
                <span className="text-[#2960ea]">Our</span><br />
                Services
              </h2>
              <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md">
                Deploy precision-engineered autonomous modules to scale your operations with zero latency.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative max-w-md w-full"
            >
              <p className="text-xs font-medium text-slate-400 mb-3">
                Find specific services across all categories
              </p>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Search services (e.g. calling, CRM, automation...)"
                    className="w-full h-14 pl-5 pr-14 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2960ea]/20 focus:border-[#2960ea]/30 shadow-lg shadow-slate-100/50 transition-all"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-[#2960ea] hover:bg-[#1d4ed8] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Search className="size-4 text-white" />
                  </button>
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {isSearchFocused && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                    >
                      {searchResults.map((result, idx) => (
                        <button
                          key={result.path + idx}
                          onClick={() => {
                            navigate(result.path);
                            setSearchQuery("");
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <ArrowRight className="size-4 text-[#2960ea]" />
                          <span className="text-sm font-medium text-slate-700">{result.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>

          {/* Right - Service Cards */}
          <div className="w-full lg:w-3/5 h-[500px] lg:h-[550px] flex gap-3">
            {services.map((service, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-[1.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xl",
                    isHovered ? "flex-[3]" : "flex-1"
                  )}
                >
                  {/* Background Image */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover transition-transform duration-1000",
                      isHovered ? "scale-100" : "scale-110"
                    )}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-500 bg-gradient-to-t",
                    service.gradient,
                    isHovered ? "opacity-90" : "opacity-95"
                  )} />

                  {/* Icon Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className={cn(
                      "size-12 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-500",
                      isHovered ? "bg-white/20" : "bg-white/10"
                    )}>
                      {service.icon}
                    </div>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="size-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center"
                      >
                        <ArrowRight className="size-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Collapsed State - Vertical Text */}
                  <AnimatePresence>
                    {!isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-lg font-black text-white tracking-[0.15em] uppercase [writing-mode:vertical-lr] rotate-180">
                          {service.title}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded Content */}
                  <div className={cn(
                    "absolute inset-0 p-6 flex flex-col justify-end text-white transition-all duration-500",
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-1 leading-none uppercase">
                        {service.title}
                      </h3>
                      <p className="text-white/70 font-medium text-sm mb-4">
                        {service.subtitle}
                      </p>
                      
                      {/* Feature List */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
                        {service.features.map((feature, idx) => (
                          <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-2"
                          >
                            <div className="size-4 rounded-full border border-[#ecc33c]/50 flex items-center justify-center flex-shrink-0">
                              <div className="size-1 rounded-full bg-[#ecc33c]" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">
                              {feature}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Explore Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(service.path);
                        }}
                        className="h-10 px-6 rounded-lg bg-[#2960ea] hover:bg-[#1d4ed8] text-white font-bold uppercase tracking-widest text-[9px] gap-2"
                      >
                        Explore <ArrowRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
