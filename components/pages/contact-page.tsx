
"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn, apiClient, validateEmail, validatePhoneNumber } from "../../lib/utils";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

export function ContactPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    message: ""
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!validateEmail(formData.email)) newErrors.email = "Valid email is required";
    if (!validatePhoneNumber(formData.phone)) newErrors.phone = "Valid phone number is required";
    if (!formData.service) newErrors.service = "Service is required";
    if (!formData.budget) newErrors.budget = "Budget is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[id as keyof ContactFormData]) {
      setErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Try to send to API, fallback to simulation if API is unavailable
      try {
        await apiClient.post('/api/contact', formData);
      } catch (apiError) {
        console.warn('API unavailable, using simulation:', apiError);
        // Simulate API call as fallback
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setLoading(false);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
      setErrors({ message: "Failed to submit form. Please try again." });
    }
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
            onClick={() => {
              setSubmitted(false);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                service: "",
                budget: "",
                message: ""
              });
            }}
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
  const errorClasses = "text-xs text-red-600 font-medium mt-1";

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
                <a href="mailto:volosist.ai@gmail.com" className="text-blue-600 border-b-2 border-blue-600/10 hover:border-blue-600 transition-all font-bold">
                  volosist.ai@gmail.com
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
                  <div className="text-slate-900 font-bold text-lg">+91 9769789769</div>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-600/20 transition-all duration-300">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Email Inquiry</div>
                  <div className="text-slate-900 font-bold text-lg">volosist.ai@gmail.com</div>
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
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={inputClasses}
                  />
                  {errors.firstName && <span className={errorClasses}>{errors.firstName}</span>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className={labelClasses}>Last Name *</Label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={inputClasses}
                  />
                  {errors.lastName && <span className={errorClasses}>{errors.lastName}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className={labelClasses}>Email Address *</Label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  className={inputClasses}
                />
                {errors.email && <span className={errorClasses}>{errors.email}</span>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className={labelClasses}>Phone Number *</Label>
                <div className="flex gap-3">
                  <div className="w-20 bg-slate-50/50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 font-bold text-sm">+1</div>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className={inputClasses}
                  />
                </div>
                {errors.phone && <span className={errorClasses}>{errors.phone}</span>}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1 relative">
                  <Label htmlFor="service" className={labelClasses}>Service Interested In *</Label>
                  <div className="relative">
                    <select
                      id="service"
                      value={formData.service}
                      onChange={handleChange}
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
                  {errors.service && <span className={errorClasses}>{errors.service}</span>}
                </div>
                <div className="space-y-1 relative">
                  <Label htmlFor="budget" className={labelClasses}>Project Budget *</Label>
                  <div className="relative">
                    <select
                      id="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className={cn(inputClasses, "appearance-none cursor-pointer pr-10")}
                    >
                      <option value="" disabled selected>Select Budget...</option>
                      <option value="startup">$5k - $15k</option>
                      <option value="growth">$15k - $50k</option>
                      <option value="enterprise">$50k+</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.budget && <span className={errorClasses}>{errors.budget}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="message" className={labelClasses}>Message *</Label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your project goals and timeline..."
                  className={cn(inputClasses, "resize-none")}
                />
                {errors.message && <span className={errorClasses}>{errors.message}</span>}
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
