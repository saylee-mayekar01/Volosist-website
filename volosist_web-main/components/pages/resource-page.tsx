
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { TestimonialsV2 } from '../ui/testimonial-v2';
import { UniqueAccordion, AccordionItem } from '../ui/interactive-accordion';

interface ResourcePageProps {
  title: string;
  subtitle: string;
  content?: string;
  showTestimonials?: boolean;
  accordionItems?: AccordionItem[];
  imageSrc?: string;
}

export function ResourcePage({ 
  title, 
  subtitle, 
  content, 
  showTestimonials = false,
  accordionItems,
  imageSrc = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200"
}: ResourcePageProps) {
  return (
    <div className="min-h-[80vh] py-32 bg-white">
      <div className="container mx-auto px-6 max-w-[1440px]">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-12">
                <Badge variant="blue" className="mb-6 px-6 py-2 rounded-full uppercase tracking-[0.2em]">{subtitle}</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-8 uppercase leading-[1.1]">
                {title}
                </h1>
                {content && (
                    <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
                    {content}
                    </p>
                )}
            </div>
            
            {accordionItems ? (
              <UniqueAccordion items={accordionItems} />
            ) : (
                <div className="flex flex-col gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-8 items-start p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                     <div className="text-4xl font-black text-slate-200 tracking-tighter">0{i}</div>
                     <div>
                       <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight text-lg">Phase Strategy</h4>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">Detailed protocols for enterprise integration at scale. We ensure every node of your automation stack is optimized for maximum efficiency.</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-32"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-slate-50">
                <img 
                  src={imageSrc} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating UI element for visual depth */}
                <div className="absolute bottom-12 left-12 right-12 bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/50 shadow-xl">
                   <div className="flex items-center gap-6">
                      <div className="size-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">V</div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-1">Status Report</div>
                        <div className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">Intelligence Online</div>
                      </div>
                   </div>
                </div>
            </div>
          </motion.div>
        </div>

        {showTestimonials && (
          <div className="pt-32 border-t border-slate-50">
            <TestimonialsV2 />
          </div>
        )}
      </div>
    </div>
  );
}
