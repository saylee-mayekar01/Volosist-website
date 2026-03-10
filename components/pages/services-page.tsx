import React from "react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { VerticalServicesParallax } from "../ui/vertical-services-parallax";
import { Play, ArrowRight, CheckCircle2, Zap, Bot, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Main Services Page
export function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-blue-50/30">
      {/* Hero Section — light professional gradient */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

        {/* Subtle blob accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        {/* Animated floating dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-1 bg-blue-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left Content ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-5"
              >
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200 px-4 py-1.5 text-[11px] font-black tracking-widest uppercase">
                  Now in Public Beta
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-5xl md:text-6xl lg:text-[4.5rem] font-black tracking-tight mb-5 text-slate-900 leading-[1.08]"
              >
                AI-Powered<br />
                <span className="text-blue-600">Automation</span><br />
                For Your Business
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg"
              >
                From sales automation to voice AI, marketing to complete business solutions.
                End-to-end B2B automation that scales with your growth.
              </motion.p>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32 }}
                className="flex flex-wrap gap-2 mb-8"
              >
                {["Sales Automation", "Voice AI", "Marketing", "Workflows"].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
                    <CheckCircle2 className="size-3 text-blue-500" />{f}
                  </span>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.38 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  onClick={() => navigate('/contact')}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest rounded-full text-sm shadow-lg shadow-blue-200"
                >
                  Start Building <ArrowRight className="size-4 ml-1" />
                </Button>
                <Button
                  onClick={() => navigate('/contact')}
                  variant="outline"
                  className="h-12 px-8 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold uppercase tracking-widest rounded-full text-sm gap-2"
                >
                  <Play className="size-4 fill-slate-600" /> Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* ── Right — compact dashboard mockup ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative flex justify-center"
            >
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-blue-100 border border-slate-100 p-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Dashboard</p>
                    <p className="text-sm font-bold text-slate-800">Overview</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[10px] font-bold text-green-600">
                    <span className="size-1.5 rounded-full bg-green-500 inline-block" /> Live
                  </span>
                </div>

                {/* Stat row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Tasks", value: "1,284", icon: <Zap className="size-3" />, color: "text-blue-600 bg-blue-50" },
                    { label: "Leads", value: "342", icon: <Bot className="size-3" />, color: "text-purple-600 bg-purple-50" },
                    { label: "ROI", value: "+34%", icon: <BarChart3 className="size-3" />, color: "text-emerald-600 bg-emerald-50" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-center">
                      <div className={`inline-flex items-center justify-center size-6 rounded-lg mb-1.5 ${s.color}`}>{s.icon}</div>
                      <div className="text-sm font-black text-slate-800">{s.value}</div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini bar chart */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-slate-500">Performance</span>
                    <span className="text-[10px] text-slate-400">Last 7 days</span>
                  </div>
                  <div className="flex items-end gap-1 h-10">
                    {[40, 65, 35, 75, 55, 85, 60].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07 }}
                        className="flex-1 rounded bg-gradient-to-t from-blue-500 to-blue-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    animate={{ width: ["30%", "82%", "30%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-400">Processing workflows</span>
                  <span className="text-[9px] font-bold text-blue-600">82%</span>
                </div>
              </motion.div>

              {/* Floating status chip */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-100 p-3 min-w-[160px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700">Workflow active</span>
                </div>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Data ingestion</span><span className="text-green-500 font-bold">✓</span></div>
                  <div className="flex justify-between"><span>Processing</span>
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-amber-500 font-bold">⚙</motion.span>
                  </div>
                  <div className="flex justify-between"><span>Output</span><span className="text-slate-300">•••</span></div>
                </div>
              </motion.div>

              {/* Floating metric chip */}
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
                className="absolute -bottom-4 -left-4 bg-blue-600 rounded-xl shadow-lg px-4 py-2.5"
              >
                <div className="text-xl font-black text-white">+34%</div>
                <div className="text-[9px] text-blue-200 uppercase tracking-wider">Efficiency</div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Vertical Service Sections with Parallax */}
      <VerticalServicesParallax />
    </div>
  );
}
