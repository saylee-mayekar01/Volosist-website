import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Play, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface ServiceFeature {
  text: string;
}

interface ServiceDetailPageProps {
  badge: string;
  badgeColor?: string;
  titleLine1: string;
  titleLine2: string;
  titleLine2Color?: string;
  description: string;
  features: ServiceFeature[];
  imageSrc: string;
  imageAlt: string;
  icon?: React.ReactNode;
}

export function ServiceDetailPage({
  badge,
  badgeColor = "bg-[#2960ea]",
  titleLine1,
  titleLine2,
  titleLine2Color = "text-[#2960ea]",
  description,
  features,
  imageSrc,
  imageAlt,
  icon
}: ServiceDetailPageProps) {
  const navigate = useNavigate();

  // Split features into two columns
  const midPoint = Math.ceil(features.length / 2);
  const leftFeatures = features.slice(0, midPoint);
  const rightFeatures = features.slice(midPoint);

  return (
    <div className="min-h-screen bg-[#fefbfa] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2960ea]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ecc33c]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="container mx-auto px-6 pt-8 pb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <Badge className={`${badgeColor} text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-8`}>
                {badge}
              </Badge>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] uppercase">
                <span className="text-slate-900">{titleLine1}</span>
                <br />
                <span className={titleLine2Color}>{titleLine2}</span>
              </h1>

              {/* Description */}
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
                {description}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-10">
                <div className="space-y-4">
                  {leftFeatures.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="size-5 rounded-full border border-[#2960ea]/50 flex items-center justify-center">
                        <div className="size-1.5 rounded-full bg-[#2960ea]" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-4">
                  {rightFeatures.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (midPoint + idx) * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="size-5 rounded-full border border-[#2960ea]/50 flex items-center justify-center">
                        <div className="size-1.5 rounded-full bg-[#2960ea]" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/contact')}
                  className="h-12 px-8 rounded-lg bg-[#2960ea] hover:bg-[#1d4ed8] text-white font-bold uppercase tracking-widest text-[10px] gap-2"
                >
                  <Play className="size-4" /> Live Demo
                </Button>
                <Button 
                  variant="outline"
                  className="h-12 px-8 rounded-lg border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold uppercase tracking-widest text-[10px] gap-2"
                >
                  <FileText className="size-4" /> Technical Specs
                </Button>
              </div>
            </motion.div>

            {/* Right - Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                {/* Gradient overlay frame */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-100/30 to-slate-200/50 z-10 pointer-events-none" />
                <img 
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                />
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="size-12 rounded-xl bg-[#2960ea] flex items-center justify-center shadow-lg">
                    {icon}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
