
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, Brain, ShieldCheck, Zap, MessageSquare, ArrowRight, Share2, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";

interface NodeProps {
  icon: React.ReactNode;
  label: string;
  status: "active" | "waiting" | "success";
  className?: string;
  delay?: number;
}

const Node = ({ icon, label, status, className, delay = 0 }: NodeProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className={cn(
      "relative z-10 flex flex-col items-center justify-center p-4 rounded-2xl border bg-white shadow-xl min-w-[120px]",
      status === "active" ? "border-blue-500 shadow-blue-500/10" : "border-slate-100 shadow-slate-200/50",
      className
    )}
  >
    <div className={cn(
      "size-12 rounded-xl flex items-center justify-center mb-3",
      status === "active" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"
    )}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</span>
    {status === "active" && (
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
      </span>
    )}
  </motion.div>
);

const Connection = ({ d, active = false }: { d: string; active?: boolean }) => (
  <g>
    <path
      d={d}
      fill="none"
      stroke="#e2e8f0"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {active && (
      <motion.path
        d={d}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="10, 20"
        animate={{ strokeDashoffset: [-60, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    )}
  </g>
);

export function WorkflowVisualizer() {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-20 px-4 bg-slate-50/50 rounded-[3rem] border border-slate-100 overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0 h-auto md:h-[400px]">
        {/* SVG Connections for Desktop */}
        <svg className="absolute inset-0 w-full h-full hidden md:block pointer-events-none" preserveAspectRatio="none">
          {/* Paths from Data to Brain */}
          <Connection d="M150 200 C 250 200, 250 200, 350 200" active />
          {/* Paths from Brain to Specialists */}
          <Connection d="M450 180 C 500 100, 550 100, 650 100" active />
          <Connection d="M450 200 C 550 200, 550 200, 650 200" active />
          <Connection d="M450 220 C 500 300, 550 300, 650 300" />
          {/* Final Output */}
          <Connection d="M770 200 C 820 200, 850 200, 900 200" active />
        </svg>

        {/* Step 1: Data Source */}
        <div className="flex flex-col gap-4">
          <Node icon={<Database />} label="Data Lake" status="success" delay={0.1} />
          <Node icon={<Terminal />} label="Webhooks" status="active" delay={0.2} />
        </div>

        {/* Step 2: Orchestration Hub */}
        <div className="relative">
          <div className="absolute -inset-10 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
          <Node 
            icon={<Brain />} 
            label="Neural Core" 
            status="active" 
            className="size-32 scale-125 border-blue-200" 
            delay={0.4} 
          />
        </div>

        {/* Step 3: Specialist Agents */}
        <div className="flex flex-col gap-6">
          <Node icon={<ShieldCheck />} label="Compliance" status="success" delay={0.6} />
          <Node icon={<Share2 />} label="API Router" status="active" delay={0.7} />
          <Node icon={<Zap />} label="Refiner" status="waiting" delay={0.8} />
        </div>

        {/* Step 4: Enterprise Delivery */}
        <div className="flex flex-col items-center text-center">
          <Node icon={<MessageSquare />} label="Output" status="active" delay={1.0} />
          <div className="mt-4 text-[9px] font-bold text-blue-600 animate-pulse tracking-tighter uppercase">
            Transmitting...
          </div>
        </div>
      </div>

      <div className="mt-12 text-center max-w-lg mx-auto">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-2">Real-time Orchestration Preview</h4>
        <p className="text-xs text-slate-500 font-medium">This model visualizes the Volosist 2.5 Logic-Flow, where recursive reasoning agents process asynchronous data events in isolated VPC environments.</p>
      </div>
    </div>
  );
}
