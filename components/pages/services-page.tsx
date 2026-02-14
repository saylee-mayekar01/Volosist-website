import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Phone, 
  TrendingUp, 
  Briefcase, 
  Megaphone,
  Mail,
  MessageSquare,
  Bot,
  Calendar,
  FileText,
  Headphones,
  BarChart3,
  Globe,
  Palette,
  ShoppingCart,
  Building2,
  Stethoscope,
  ClipboardList,
  Play,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

// Service 1: Sales & Lead Automation - Hero Style Left/Right
function SalesAutomationSection() {
  const navigate = useNavigate();
  const features = [
    { icon: <Mail className="size-5" />, title: "Automated Follow-ups", desc: "Email, WhatsApp & calling sequences" },
    { icon: <Bot className="size-5" />, title: "AI Lead Capture", desc: "Intelligent qualification & scoring" },
    { icon: <BarChart3 className="size-5" />, title: "CRM Automation", desc: "Seamless sync with your existing tools" },
    { icon: <FileText className="size-5" />, title: "AI Quote Generation", desc: "Instant proposals & pricing" },
    { icon: <Phone className="size-5" />, title: "Outbound Calling", desc: "AI-powered sales calls at scale" },
    { icon: <Calendar className="size-5" />, title: "Appointment Scheduling", desc: "Automated booking & reminders" },
    { icon: <MessageSquare className="size-5" />, title: "Sales Chatbot", desc: "24/7 lead engagement" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUpVariants} custom={0}>
              <Badge className="bg-blue-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
                Sales & Leads
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeUpVariants} 
              custom={1}
              className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900"
            >
              Sales & Lead<br />
              <span className="text-blue-600">Automation</span>
            </motion.h2>
            <motion.p 
              variants={fadeUpVariants} 
              custom={2}
              className="text-lg text-slate-600 mb-8 max-w-lg"
            >
              Scale your revenue engine with AI-powered lead capture, qualification, CRM automation, and precision outbound flows. From automated follow-ups to AI proposal generation.
            </motion.p>
            <motion.div variants={fadeUpVariants} custom={3} className="flex gap-4">
              <Button 
                onClick={() => navigate('/contact')}
                className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[10px] gap-2"
              >
                <Play className="size-4" /> Live Demo
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="h-12 px-8 rounded-lg border-slate-300 font-bold uppercase tracking-widest text-[10px] gap-2"
              >
                Get Started <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Feature Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeUpVariants}
                custom={idx * 0.5}
                className={`p-5 rounded-2xl bg-white shadow-lg border border-slate-100 hover:shadow-xl transition-shadow ${idx === 6 ? 'col-span-2' : ''}`}
              >
                <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Service 2: AI Voice & Calling - Card Grid Style
function VoiceAutomationSection() {
  const navigate = useNavigate();
  const features = [
    { icon: <Phone className="size-6" />, title: "Inbound Call Handling", desc: "AI answers and routes calls intelligently" },
    { icon: <MessageSquare className="size-6" />, title: "Outbound Follow-ups", desc: "Automated callback sequences" },
    { icon: <Calendar className="size-6" />, title: "Appointment Reminders", desc: "Reduce no-shows with smart calls" },
    { icon: <FileText className="size-6" />, title: "Payment Reminders", desc: "Gentle automated collection calls" },
    { icon: <BarChart3 className="size-6" />, title: "Feedback & Survey Calls", desc: "Gather insights automatically" },
    { icon: <Headphones className="size-6" />, title: "Call Routing & Handoff", desc: "Seamless transfer to humans" },
    { icon: <Bot className="size-6" />, title: "Transcription & Analysis", desc: "Real-time sentiment insights" },
    { icon: <ClipboardList className="size-6" />, title: "Ticket Creation", desc: "Auto-create support tickets" },
    { icon: <Headphones className="size-6" />, title: "Support Automation", desc: "24/7 customer assistance" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUpVariants} custom={0}>
            <Badge className="bg-emerald-500 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
              Voice Automation
            </Badge>
          </motion.div>
          <motion.h2 
            variants={fadeUpVariants} 
            custom={1}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white"
          >
            AI Voice & <span className="text-emerald-400">Calling</span>
          </motion.h2>
          <motion.p 
            variants={fadeUpVariants} 
            custom={2}
            className="text-lg text-emerald-100/70 max-w-2xl mx-auto"
          >
            Deploy intelligent voice automation for inbound/outbound calls, appointment reminders, payment follow-ups, customer support, and seamless human handoff when needed.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeUpVariants}
              custom={idx * 0.3}
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-emerald-500/20 hover:bg-white/15 transition-colors group"
            >
              <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/30 transition-colors">
                {feature.icon}
              </div>
              <h4 className="font-bold text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-emerald-100/60">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={fadeUpVariants} 
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex justify-center gap-4"
        >
          <Button 
            onClick={() => navigate('/contact')}
            className="h-12 px-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <Play className="size-4" /> Live Demo
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/contact')}
            className="h-12 px-8 rounded-lg border-emerald-500/50 text-white hover:bg-emerald-500/20 font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            Contact Sales <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// Service 3: Marketing & Content - Alternating Layout
function MarketingContentSection() {
  const navigate = useNavigate();
  const services = [
    { 
      icon: <Bot className="size-8" />, 
      title: "AI Content Generation", 
      desc: "Generate blog posts, social content, ad copy, and more with AI that understands your brand voice.",
      color: "purple"
    },
    { 
      icon: <MessageSquare className="size-8" />, 
      title: "Social Media Automation", 
      desc: "Schedule, post, and engage across all platforms automatically. Never miss a trending moment.",
      color: "pink"
    },
    { 
      icon: <BarChart3 className="size-8" />, 
      title: "Google & Meta Ads", 
      desc: "AI-optimized ad campaigns that continuously improve. Maximize ROI with smart bidding.",
      color: "blue"
    },
    { 
      icon: <Globe className="size-8" />, 
      title: "SEO Automation", 
      desc: "Technical SEO, keyword optimization, and content strategy powered by AI insights.",
      color: "green"
    },
    { 
      icon: <Palette className="size-8" />, 
      title: "Content Creation", 
      desc: "Professional graphics, videos, and creative assets produced at scale.",
      color: "orange"
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
    pink: { bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-200" },
    blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
    green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUpVariants} custom={0}>
            <Badge className="bg-purple-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
              Marketing Module
            </Badge>
          </motion.div>
          <motion.h2 
            variants={fadeUpVariants} 
            custom={1}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900"
          >
            Marketing & <span className="text-purple-600">Content</span>
          </motion.h2>
          <motion.p 
            variants={fadeUpVariants} 
            custom={2}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Supercharge your marketing with AI content generation, social media automation, Google & Meta ads optimization, and SEO automation.
          </motion.p>
        </motion.div>

        <div className="space-y-6 mb-12">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUpVariants}
              custom={idx * 0.2}
              className={`flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-white shadow-lg border ${colorMap[service.color].border} ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className={`size-20 rounded-2xl ${colorMap[service.color].bg} flex items-center justify-center ${colorMap[service.color].text} shrink-0`}>
                {service.icon}
              </div>
              <div className={`flex-1 ${idx % 2 === 1 ? 'text-right' : ''}`}>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600">{service.desc}</p>
              </div>
              <Button 
                variant="ghost"
                className={`${colorMap[service.color].text} font-bold uppercase tracking-widest text-[10px] gap-2`}
              >
                Learn More <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={fadeUpVariants} 
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex justify-center gap-4"
        >
          <Button 
            onClick={() => navigate('/contact')}
            className="h-12 px-8 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <Play className="size-4" /> Live Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// Service 4: Business Solutions - Icon Grid with Categories
function BusinessSolutionsSection() {
  const navigate = useNavigate();
  const categories = [
    {
      title: "Digital Presence",
      services: [
        { icon: <Globe className="size-5" />, name: "Website Development" },
        { icon: <Palette className="size-5" />, name: "Logo & Graphic Design" },
      ]
    },
    {
      title: "E-Commerce",
      services: [
        { icon: <ShoppingCart className="size-5" />, name: "Ecommerce Virtual Assistant" },
        { icon: <ClipboardList className="size-5" />, name: "Product Listing" },
      ]
    },
    {
      title: "Industry Solutions",
      services: [
        { icon: <Building2 className="size-5" />, name: "Real Estate Solutions" },
        { icon: <Stethoscope className="size-5" />, name: "Medical Virtual Assistant" },
      ]
    },
    {
      title: "Admin Support",
      services: [
        { icon: <Briefcase className="size-5" />, name: "Administrative VA" },
        { icon: <Calendar className="size-5" />, name: "Meeting Scheduling" },
      ]
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Title & CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:sticky lg:top-32"
          >
            <motion.div variants={fadeUpVariants} custom={0}>
              <Badge className="bg-orange-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
                Business Solutions
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeUpVariants} 
              custom={1}
              className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900"
            >
              End-to-End<br />
              <span className="text-orange-600">Solutions</span>
            </motion.h2>
            <motion.p 
              variants={fadeUpVariants} 
              custom={2}
              className="text-lg text-slate-600 mb-8"
            >
              Complete business solutions including website development, design services, ecommerce support, industry-specific virtual assistants, and administrative automation.
            </motion.p>
            <motion.div variants={fadeUpVariants} custom={3} className="flex gap-4">
              <Button 
                onClick={() => navigate('/contact')}
                className="h-12 px-8 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest text-[10px] gap-2"
              >
                <Play className="size-4" /> Live Demo
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="h-12 px-8 rounded-lg border-orange-300 text-orange-600 hover:bg-orange-50 font-bold uppercase tracking-widest text-[10px] gap-2"
              >
                Get Quote <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Category Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            {categories.map((category, idx) => (
              <motion.div
                key={idx}
                variants={fadeUpVariants}
                custom={idx * 0.3}
                className="p-6 rounded-2xl bg-white shadow-lg border border-orange-100"
              >
                <h3 className="text-sm font-black uppercase tracking-widest text-orange-600 mb-4">{category.title}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {category.services.map((service, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                      <div className="size-10 rounded-lg bg-white flex items-center justify-center text-orange-600 shadow-sm">
                        {service.icon}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{service.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Main Services Page
export function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#fefbfa]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-blue-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
              Our Solutions
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6"
          >
            AI-Powered <span className="text-blue-400">Automation</span><br />
            For Your Business
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            From sales automation to voice AI, marketing to complete business solutions. 
            We provide end-to-end B2B automation services that scale with your growth.
          </motion.p>
        </div>
      </section>

      {/* Service Sections */}
      <SalesAutomationSection />
      <VoiceAutomationSection />
      <MarketingContentSection />
      <BusinessSolutionsSection />
    </div>
  );
}
