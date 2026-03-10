
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ParallaxSectionProps {
  title: string;
  description: string;
  image: string;
}

const sections: ParallaxSectionProps[] = [
  {
    title: "Global Intelligence",
    description: "Our nodes span across 4 continents, providing low-latency inference for local markets.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600",
  },
  {
    title: "Neural Synergy",
    description: "Proprietary agent-to-agent communication protocols that ensure 100% data consistency.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1600",
  }
];

export function ParallaxJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress to avoid "stuck" or jittery feelings
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-slate-950">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {sections.map((section, i) => {
          const start = i / sections.length;
          const end = (i + 1) / sections.length;
          
          // Improved opacity ranges:
          // Section 1: starts visible, fades out
          // Section 2: fades in, stays visible
          const opacityRange = i === 0 
            ? [1, 1, 0.2, 0] 
            : [0, 0.2, 1, 1];
          
          const opacity = useTransform(smoothProgress, [start, start + 0.1, end - 0.1, end], opacityRange);
          const scale = useTransform(smoothProgress, [start, end], [1.1, 1]);
          const y = useTransform(smoothProgress, [start, end], [80, -80]);

          return (
            <motion.div
              key={i}
              style={{ opacity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Background Image with Parallax Scale */}
              <motion.div 
                style={{ scale }}
                className="absolute inset-0 z-0"
              >
                <img 
                  src={section.image} 
                  alt={section.title} 
                  className="w-full h-full object-cover brightness-[0.3]"
                />
              </motion.div>

              {/* Content Overlay */}
              <div className="relative z-10 container mx-auto px-6 text-center">
                <motion.div
                   style={{ y }}
                   className="flex flex-col items-center gap-6"
                >
                  {/* Phase labels removed as requested */}
                  <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
                    {section.title}
                  </h2>
                  <p className="text-slate-400 max-w-xl text-lg md:text-xl font-medium leading-relaxed">
                    {section.description}
                  </p>
                </motion.div>
              </div>

              {/* Decorative Frame */}
              <div className="absolute inset-0 pointer-events-none border-[20px] md:border-[60px] border-slate-950/20" />
            </motion.div>
          );
        })}

        {/* Minimal Scroll Progress Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {sections.map((_, i) => {
            const start = i / sections.length;
            const end = (i + 1) / sections.length;
            const dotOpacity = useTransform(smoothProgress, [start, start + 0.1, end - 0.1, end], [0.3, 1, 1, 0.3]);
            
            return (
              <motion.div
                key={i}
                style={{ opacity: dotOpacity }}
                className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
