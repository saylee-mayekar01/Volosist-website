
"use client";

import React from "react";
import { Check, Minus, MoveRight, PhoneCall } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { motion } from "framer-motion";

interface PricingTier {
  name: string;
  description: string;
  price: string;
  buttonText: string;
  buttonVariant: "default" | "outline";
  icon: React.ReactNode;
}

const tiers: PricingTier[] = [
  {
    name: "Startup",
    description: "Streamlined intelligence for emerging enterprises looking to build their first AI core.",
    price: "$490",
    buttonText: "Start Audit",
    buttonVariant: "outline",
    icon: <MoveRight className="w-4 h-4" />,
  },
  {
    name: "Growth",
    description: "High-performance orchestration for scaling organizations with complex multi-agent needs.",
    price: "$1,490",
    buttonText: "Join Scale",
    buttonVariant: "default",
    icon: <MoveRight className="w-4 h-4" />,
  },
  {
    name: "Enterprise",
    description: "Custom-built neural infrastructure with dedicated solutions engineering and 24/7 oversight.",
    price: "Custom",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    icon: <PhoneCall className="w-4 h-4" />,
  },
];

const features = [
  { name: "Single Sign-On (SSO)", startup: true, growth: true, enterprise: true },
  { name: "AI Orchestration Node", startup: true, growth: true, enterprise: true },
  { name: "Custom LLM Fine-tuning", startup: false, growth: true, enterprise: true },
  { name: "Autonomous Agent Swarms", startup: false, growth: true, enterprise: true },
  { name: "Multi-Cloud Integration", startup: false, growth: false, enterprise: true },
  { name: "Dedicated Solutions Engineer", startup: false, growth: false, enterprise: true },
  { name: "Workspace Members", startup: "Up to 5", growth: "Up to 25", enterprise: "Unlimited" },
  { name: "Model Retention", startup: "30 Days", growth: "90 Days", enterprise: "Perpetual" },
];

export function PricingComparison() {
  return (
    <section className="w-full py-32 lg:py-48 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-blue-50/30 overflow-hidden">
      <div className="container mx-auto px-6 max-w-[1440px]">
        <div className="flex text-center justify-center items-center gap-8 flex-col mb-24">
          <Badge variant="blue" className="px-6 py-2 rounded-full">Engagement Tiers</Badge>
          <div className="flex gap-6 flex-col max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-center text-slate-900 uppercase leading-[0.95]">
              Strategic <br/><span className="text-blue-600">Investment.</span>
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-slate-500 font-medium max-w-xl mx-auto">
              Transparent, value-driven engagement models built for organizations ready to lead in the autonomous era.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="grid text-left w-full grid-cols-1 lg:grid-cols-4 pt-10 border-t border-slate-100">
            {/* Legend / Spacer */}
            <div className="hidden lg:block py-12 pr-8 border-r border-slate-100">
               <div className="sticky top-32">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Core Focus</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">Compare our frameworks to find the right entry point for your infrastructure.</p>
               </div>
            </div>

            {/* Pricing Tiers Header */}
            {tiers.map((tier, idx) => (
              <div key={idx} className={`px-8 py-12 flex flex-col border-slate-100 ${idx !== 2 ? 'lg:border-r' : ''}`}>
                <div className="mb-auto">
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{tier.name}</p>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                    {tier.description}
                  </p>
                </div>
                
                <div className="mt-8">
                  <p className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black text-blue-600 tracking-tighter">{tier.price}</span>
                    {tier.price !== "Custom" && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ monthly</span>}
                  </p>
                  <Button variant={tier.buttonVariant} className="w-full h-14 rounded-full font-black uppercase tracking-[0.2em] text-[10px] gap-4 transition-all hover:-translate-y-1 shadow-lg">
                    {tier.buttonText} {tier.icon}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Matrix */}
          <div className="mt-8 border border-slate-100 rounded-[3rem] overflow-hidden bg-slate-50/30 backdrop-blur-sm shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-4">
              <div className="bg-slate-100/50 px-10 py-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Capabilities Matrix</span>
              </div>
              <div className="hidden lg:block"></div>
              <div className="hidden lg:block"></div>
              <div className="hidden lg:block"></div>
            </div>

            {features.map((feature, idx) => (
              <div key={idx} className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-100 group hover:bg-white transition-colors">
                <div className="col-span-1 px-10 py-6 flex items-center">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{feature.name}</span>
                </div>
                
                {/* Startup Cell */}
                <div className="px-10 py-6 flex justify-center items-center border-l border-slate-100">
                  <span className="lg:hidden text-[9px] font-bold uppercase tracking-widest text-slate-400 mr-2">Startup:</span>
                  {typeof feature.startup === 'boolean' ? (
                    feature.startup ? <Check className="w-4 h-4 text-blue-600" /> : <Minus className="w-4 h-4 text-slate-200" />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">{feature.startup}</span>
                  )}
                </div>

                {/* Growth Cell */}
                <div className="hidden lg:flex px-10 py-6 justify-center items-center border-l border-slate-100 bg-blue-50/10">
                   {typeof feature.growth === 'boolean' ? (
                    feature.growth ? <Check className="w-4 h-4 text-blue-600" /> : <Minus className="w-4 h-4 text-slate-200" />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">{feature.growth}</span>
                  )}
                </div>

                {/* Enterprise Cell */}
                <div className="hidden lg:flex px-10 py-6 justify-center items-center border-l border-slate-100">
                   {typeof feature.enterprise === 'boolean' ? (
                    feature.enterprise ? <Check className="w-4 h-4 text-blue-600" /> : <Minus className="w-4 h-4 text-slate-200" />
                  ) : (
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">{feature.enterprise}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
