import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function CoreServicesHero() {
  const scrollToServices = () => {
    const element = document.getElementById("service-showcase");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-12 lg:py-16 flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* System Online badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2960ea] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2960ea]"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2960ea]">
            System Online
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4 uppercase"
        >
          Core Services
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm md:text-base text-slate-500 font-medium mb-6"
        >
          Select a domain to explore our autonomous capabilities.
        </motion.p>

        {/* Animated scroll arrows */}
        <motion.button
          onClick={scrollToServices}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center cursor-pointer group mx-auto"
          aria-label="Scroll to services"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-[#2960ea] group-hover:text-[#1d4ed8] transition-colors" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.12 }}
          >
            <ChevronDown className="w-6 h-6 text-[#2960ea]/70 group-hover:text-[#2960ea] transition-colors -mt-3" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.24 }}
          >
            <ChevronDown className="w-6 h-6 text-[#2960ea]/40 group-hover:text-[#2960ea]/70 transition-colors -mt-3" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
