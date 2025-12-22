import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { ArrowRight } from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  topics: string;
}

const services: ServiceItem[] = [
  {
    id: "strategy",
    title: "AI Strategy",
    subtitle: "Architecture",
    description: "Designing the blueprint for enterprise-wide intelligence scaling.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    topics: "50+ SOLUTIONS",
  },
  {
    id: "automation",
    title: "Neural Lab",
    subtitle: "R&D",
    description: "Testing autonomous agent workflows in simulated high-load environments.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
    topics: "100+ NODES",
  },
  {
    id: "infrastructure",
    title: "Cloud Core",
    subtitle: "Engineering",
    description: "Robust backbones built to handle petabytes of AI-processed data.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    topics: "24/7 UPTIME",
  },
];

export function ServiceShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          
          {/* Left Column: Taglines and Search-style CTA */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center min-h-[500px]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.85] uppercase">
                Watch.<br />
                Learn.<br />
                Grow.
              </h2>
            </motion.div>

            {/* Input-style CTA Box */}
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
              <button className="absolute right-0 h-24 w-24 bg-[#A3CC8C] hover:bg-[#92b87d] transition-colors rounded-r-lg flex items-center justify-center group">
                <span className="text-2xl font-bold text-slate-900 group-hover:scale-110 transition-transform">Go</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Interactive Gallery */}
          <div className="w-full lg:w-2/3 h-[600px] flex gap-3 md:gap-4">
            {services.map((service, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <motion.div
                  key={service.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    isHovered ? "flex-[4]" : "flex-1"
                  )}
                >
                  {/* Image Container */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-transform duration-1000",
                        isHovered ? "scale-100" : "scale-110 blur-[2px] brightness-75"
                    )}
                  />
                  
                  {/* Overlays */}
                  <div className={cn(
                    "absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent",
                    isHovered ? "opacity-100" : "opacity-40"
                  )} />

                  {/* Vertical Label for non-hovered items */}
                  <AnimatePresence>
                    {!isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center p-4"
                      >
                        <span className="text-2xl md:text-3xl font-bold text-white tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 opacity-80 whitespace-nowrap">
                          {service.title}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded Content */}
                  <div className={cn(
                    "absolute inset-0 p-10 flex flex-col justify-end text-white transition-opacity duration-300",
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}>
                    <div className="flex items-end justify-between gap-6">
                      <div className="max-w-xs">
                        <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 leading-none">
                          {service.title.split(' ')[0]}<br />
                          {service.title.split(' ')[1] || 'Course'}
                        </h3>
                        <p className="text-slate-300 font-medium text-sm leading-relaxed mb-4">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
                           Explore Workflow <ArrowRight size={14} className="text-[#A3CC8C]" />
                        </div>
                      </div>
                      <div className="text-right border-l border-white/20 pl-6 pb-2">
                        <span className="text-4xl md:text-6xl font-black block leading-none">
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
