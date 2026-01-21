
import { MoveRight, PhoneCall, Zap, ArrowRight } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { motion } from "framer-motion";

interface CTAProps {
  onSignUp?: () => void;
}

function CTA({ onSignUp }: CTAProps) {
  return (
    <div className="w-full py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col text-center bg-white rounded-[2rem] p-12 lg:p-20 gap-8 items-center border border-slate-100 shadow-xl relative overflow-hidden"
        >
          {/* Subtle Background Mesh */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
          
          <div className="relative z-10">
            <Badge variant="outline" className="bg-blue-50/50 text-[#2563EB] border-blue-100/50 px-5 py-2 text-[10px] font-bold tracking-widest rounded-full uppercase">
              Scale Today
            </Badge>
          </div>
          
          <div className="flex flex-col gap-6 relative z-10 max-w-3xl">
            <h3 className="text-3xl md:text-5xl tracking-tight font-bold text-slate-900 leading-[1.2]">
              Ready to automate your enterprise intelligence?
            </h3>
            <p className="text-base md:text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto font-medium">
              Join the forward-thinking organizations using Volosist to bridge the gap 
              between complex AI and tangible business value.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto mt-2">
            <Button 
              variant="outline" 
              className="h-12 px-8 rounded-full border-slate-200 text-slate-900 bg-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-sm hover:bg-slate-50 transition-all"
            >
              Book Strategy Call <PhoneCall className="size-4" />
            </Button>
            <Button 
              onClick={onSignUp}
              className="h-12 px-8 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-lg transition-all hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export { CTA };
