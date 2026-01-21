
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { ArrowUpRight, Cpu, Network, Zap } from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  topics: string;
  color: string;
  icon: React.ReactNode;
}

const services: ServiceItem[] = [
  {
    id: "strategy",
    title: "AI Strategy",
    subtitle: "Architecture",
    description: "Designing the high-throughput blueprint for enterprise-wide intelligence scaling.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    topics: "50+ SOLUTIONS",
    color: "from-blue-600",
    icon: <Cpu className="size-5" />,
  },
  {
    id: "automation",
    title: "Neural Lab",
    subtitle: "R&D",
    description: "Testing autonomous agent workflows in hyper-simulated, high-load environments.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800",
    topics: "100+ NODES",
    color: "from-emerald-600",
    icon: <Zap className="size-5" />,
  },
  {
    id: "infrastructure",
    title: "Cloud Core",
    subtitle: "Engineering",
    description: "Robust data backbones built to handle petabytes of AI-processed real-time data.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    topics: "24/7 UPTIME",
    color: "from-purple-600",
    icon: <Network className="size-5" />,
  },
];

export function ServiceShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);

  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden relative border-y border-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
          
          <div className="w-full lg:w-1/3 flex flex-col justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Watch.<br />
                Learn.<br />
                Grow.
              </h2>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative flex items-center max-w-md w-full"
            >
              <div className="flex-1 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-lg h-24 flex items-center px-8 text-lg font-medium text-slate-400">
                Find your solution
              </div>
              <button className="absolute right-0 h-24 w-24 bg-blue-600 hover:bg-blue-700 transition-colors rounded-r-lg flex items-center justify-center group">
                <span className="text-xl font-bold text-white group-hover:scale-110 transition-transform">Go</span>
              </button>
            </motion.div>
          </div>

          <div className="w-full lg:w-2/3 h-[500px] lg:h-[600px] flex gap-4">
            {services.map((service, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <motion.div
                  key={service.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xl",
                    isHovered ? "flex-[4]" : "flex-1"
                  )}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-transform duration-1000",
                        isHovered ? "scale-100" : "scale-110 brightness-50"
                    )}
                  />
                  
                  {/* Vibrant background gradients maintained for the "pop" factor */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-700 bg-gradient-to-t via-transparent to-transparent opacity-80",
                    service.color
                  )} />

                  <AnimatePresence>
                    {!isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-2xl md:text-3xl font-bold text-white tracking-[0.2em] uppercase [writing-mode:vertical-lr] rotate-180 opacity-60">
                          {service.title}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={cn(
                    "absolute inset-0 p-8 lg:p-12 flex flex-col justify-end text-white transition-all duration-500",
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                  )}>
                    <div className="flex items-end justify-between gap-6">
                      <div className="max-w-xs">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/60 mb-2 block">
                          {service.subtitle}
                        </span>
                        <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 leading-none uppercase">
                          {service.title}
                        </h3>
                        <p className="text-white/80 font-medium text-sm leading-relaxed mb-6">
                          {service.description}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                           Explore <ArrowUpRight size={14} />
                        </div>
                      </div>
                      <div className="hidden xl:block text-right pb-2">
                        <span className="text-5xl font-black block leading-none tracking-tighter">
                          {service.topics.split(' ')[0]}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                          {service.topics.split(' ')[1]}
                        </span>
                      </div>
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
