
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

export function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="size-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
            <Send className="text-white size-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Inquiry Received</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            A solutions architect has been notified of your request. Expect a briefing within 24 business hours.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="rounded-full px-8 h-12 uppercase tracking-widest text-[10px] font-bold"
          >
            Back to form
          </Button>
        </motion.div>
      </div>
    );
  }

  const inputClasses = "w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium";
  const labelClasses = "uppercase tracking-widest text-[10px] font-black text-slate-500 mb-2 block";

  return (
    <div className="min-h-screen bg-white py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-32">
          
          {/* Left Column: Let's Connect */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col space-y-12"
          >
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] uppercase">
                Let's<br />
                <span className="text-blue-600">Connect.</span>
              </h1>
              <p className="text-lg text-slate-600 font-medium max-w-md leading-relaxed">
                Let's talk about your next big idea. Use the form to tell us more, or simply drop us an email at{" "}
                <a href="mailto:atom@volosist.ai" className="text-blue-600 border-b-2 border-blue-600/10 hover:border-blue-600 transition-all font-bold">
                  atom@volosist.ai
                </a>
              </p>
            </div>

            <div className="space-y-8 pt-4">
              <div className="flex items-center gap-6 group">
                <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-600/20 transition-all duration-300">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Global Support</div>
                  <div className="text-slate-900 font-bold text-lg">+1 (555) 000-VOLO</div>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-600/20 transition-all duration-300">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Email Inquiry</div>
                  <div className="text-slate-900 font-bold text-lg">atom@volosist.ai</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className={labelClasses}>First Name *</Label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    placeholder="John"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className={labelClasses}>Last Name *</Label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Doe"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className={labelClasses}>Email Address *</Label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="john@company.com"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className={labelClasses}>Phone Number *</Label>
                <div className="flex gap-3">
                  <div className="w-20 bg-slate-50/50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 font-bold text-sm">+1</div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1 relative">
                  <Label htmlFor="service" className={labelClasses}>Service Interested In *</Label>
                  <div className="relative">
                    <select
                      id="service"
                      required
                      className={cn(inputClasses, "appearance-none cursor-pointer pr-10")}
                    >
                      <option value="" disabled selected>Select Service...</option>
                      <option value="workflows">AI Workflows</option>
                      <option value="infrastructure">Neural Infrastructure</option>
                      <option value="audit">System Audit</option>
                      <option value="custom">Custom Development</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1 relative">
                  <Label htmlFor="budget" className={labelClasses}>Project Budget *</Label>
                  <div className="relative">
                    <select
                      id="budget"
                      required
                      className={cn(inputClasses, "appearance-none cursor-pointer pr-10")}
                    >
                      <option value="" disabled selected>Select Budget...</option>
                      <option value="startup">$5k - $15k</option>
                      <option value="growth">$15k - $50k</option>
                      <option value="enterprise">$50k+</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="message" className={labelClasses}>Message *</Label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="Tell us more about your project goals and timeline..."
                  className={cn(inputClasses, "resize-none")}
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full h-16 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 gap-3 mt-4"
              >
                Send Inquiry <ArrowRight size={18} />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
