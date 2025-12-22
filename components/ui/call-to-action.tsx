import { MoveRight, PhoneCall } from "lucide-react";
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col text-center bg-slate-50 border border-slate-100 rounded-3xl p-8 lg:p-20 gap-8 items-center shadow-sm relative overflow-hidden"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

          <div className="relative z-10">
            <Badge variant="blue">Scale Today</Badge>
          </div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <h3 className="text-3xl md:text-5xl tracking-tighter max-w-2xl font-bold text-slate-900 leading-tight">
              Ready to automate your enterprise intelligence?
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-slate-500 max-w-xl mx-auto font-medium">
              Join the forward-thinking organizations using Volosist to bridge the gap between complex AI and tangible business value.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="h-12 px-8 rounded-full border-slate-200 font-bold uppercase tracking-widest text-xs gap-3"
            >
              Book Strategy Call <PhoneCall className="w-4 h-4" />
            </Button>
            <Button 
              onClick={onSignUp}
              className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest text-xs gap-3 shadow-lg shadow-blue-100"
            >
              Get Started <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export { CTA };