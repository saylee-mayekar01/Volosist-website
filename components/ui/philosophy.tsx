
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface StatProps {
  label: string;
  value: string;
}

const Stat = ({ label, value }: StatProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-4xl font-bold text-blue-600 tracking-tight">{value}</span>
    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</span>
  </div>
);

interface StepProps {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step = ({ number, title, description, isLast }: StepProps) => (
  <div className="relative flex gap-10 pb-12 group">
    {!isLast && (
      <div className="absolute left-[11px] top-8 bottom-0 w-[1px] bg-slate-200 group-hover:bg-blue-300 transition-colors" />
    )}
    <div className="relative z-10 pt-1">
      <div className="flex size-6 items-center justify-center rounded-full border border-blue-600 bg-white group-hover:bg-blue-600 transition-all duration-300">
        <div className="size-1.5 rounded-full bg-blue-600 group-hover:bg-white" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <h4 className="text-xl font-bold text-slate-900 tracking-tight">
        <span className="text-slate-300 mr-2 font-medium">{number}.</span> {title}
      </h4>
      <p className="max-w-md text-slate-500 font-medium leading-relaxed text-sm">
        {description}
      </p>
    </div>
  </div>
);

export function Philosophy() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/50 relative border-y border-slate-100">
      <div className="container mx-auto px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Our Philosophy
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                Precision Meets <br /> Intelligence.
              </h2>
            </div>
            
            <div className="flex flex-col gap-6 text-slate-500 font-medium leading-relaxed text-base max-w-xl">
              <p>
                At Volosist, we view automation as an architectural discipline. We don't just build scripts; 
                we engineer environments that breathe efficiency.
              </p>
            </div>

            <div className="flex gap-16 mt-4">
              <Stat value="250+" label="Systems Deployed" />
              <Stat value="12+" label="Years Expertise" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col pt-2"
          >
            <Step 
              number="01" 
              title="Audit & Strategic Planning" 
              description="We analyze your existing workflows, data integrity, and growth goals to draft a preliminary AI-integration roadmap."
            />
            <Step 
              number="02" 
              title="Architecture Development" 
              description="Creation of custom agent frameworks and selection of LLMs suitable for your specific requirements."
            />
            <Step 
              number="03" 
              title="System Integration" 
              description="API-assisted connectivity, cloud scaling, and autonomous training cycles."
            />
            <Step 
              number="04" 
              title="Recursive Optimization" 
              description="Scheduled fine-tuning and performance monitoring ensuring model longevity."
              isLast
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
