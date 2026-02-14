import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Target,
  Lightbulb,
  Rocket,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Quote,
  Briefcase,
  MapPin,
  Clock,
  Mail,
  Building2,
  Zap,
  Shield,
  Heart
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

// Section 1: About Us - Vision & Mission
function AboutUsSection() {
  const values = [
    { icon: <Lightbulb className="size-6" />, title: "Innovation First", desc: "We push boundaries with cutting-edge AI solutions" },
    { icon: <Shield className="size-6" />, title: "Trust & Reliability", desc: "Your data and success are our top priorities" },
    { icon: <Zap className="size-6" />, title: "Speed to Value", desc: "Rapid deployment with measurable results" },
    { icon: <Heart className="size-6" />, title: "Client-Centric", desc: "Your growth is the measure of our success" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUpVariants} custom={0}>
              <Badge className="bg-blue-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
                About Us
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeUpVariants} 
              custom={1}
              className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white"
            >
              Empowering Businesses<br />
              <span className="text-blue-400">Through AI</span>
            </motion.h2>
            <motion.p 
              variants={fadeUpVariants} 
              custom={2}
              className="text-lg text-slate-400 mb-6"
            >
              We are a team of AI automation specialists and software engineers dedicated to helping B2B companies scale their operations through intelligent automation.
            </motion.p>
            <motion.p 
              variants={fadeUpVariants} 
              custom={3}
              className="text-slate-400"
            >
              From sales and lead generation to voice automation and complete business solutions, we deliver measurable results that transform how businesses operate.
            </motion.p>
          </motion.div>

          {/* Right - Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { value: "500+", label: "Clients Served" },
              { value: "50M+", label: "Leads Generated" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeUpVariants}
                custom={idx * 0.3}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center"
              >
                <div className="text-4xl font-black text-blue-400 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              variants={fadeUpVariants}
              custom={idx * 0.2}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:bg-white/10 transition-colors"
            >
              <div className="size-14 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
                {value.icon}
              </div>
              <h4 className="font-bold text-white mb-2">{value.title}</h4>
              <p className="text-sm text-slate-400">{value.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Section 2: Our Process - Timeline Style
function OurProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Discovery & Audit",
      desc: "We perform an exhaustive analysis of your current systems, workflows, and pain points to identify the highest-impact automation opportunities.",
      icon: <Target className="size-6" />
    },
    {
      number: "02",
      title: "Strategy & Design",
      desc: "Custom solution architecture tailored to your business needs. We design systems that integrate seamlessly with your existing tech stack.",
      icon: <Lightbulb className="size-6" />
    },
    {
      number: "03",
      title: "Build & Deploy",
      desc: "Our engineers build and deploy your automation solutions with zero downtime, ensuring immediate accessibility for your team.",
      icon: <Rocket className="size-6" />
    },
    {
      number: "04",
      title: "Optimize & Scale",
      desc: "Post-deployment, we continuously monitor and optimize your systems, ensuring they scale as your business grows.",
      icon: <TrendingUp className="size-6" />
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUpVariants} custom={0}>
            <Badge className="bg-emerald-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
              Our Process
            </Badge>
          </motion.div>
          <motion.h2 
            variants={fadeUpVariants} 
            custom={1}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900"
          >
            How We <span className="text-emerald-600">Work</span>
          </motion.h2>
          <motion.p 
            variants={fadeUpVariants} 
            custom={2}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            A proven methodology that ensures successful implementation and measurable ROI for every project.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-200" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUpVariants}
                custom={idx * 0.2}
                className={`flex flex-col lg:flex-row items-center gap-8 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`flex-1 ${idx % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className={`p-8 rounded-2xl bg-white shadow-lg border border-slate-100 ${idx % 2 === 0 ? 'lg:mr-12' : 'lg:ml-12'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        {step.icon}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Step {step.number}</span>
                        <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-600">{step.desc}</p>
                  </div>
                </div>

                {/* Center Circle */}
                <div className="hidden lg:flex size-16 rounded-full bg-emerald-600 text-white items-center justify-center font-black text-xl shrink-0 shadow-lg z-10">
                  {step.number}
                </div>

                {/* Spacer */}
                <div className="hidden lg:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 3: Case Studies
function CaseStudiesSection() {
  const caseStudies = [
    {
      industry: "E-Commerce",
      title: "300% Increase in Lead Conversion",
      desc: "Implemented AI-powered sales automation for a mid-size e-commerce company, resulting in 3x lead conversion and 50% reduction in response time.",
      stats: [
        { value: "300%", label: "Conversion Increase" },
        { value: "50%", label: "Faster Response" },
      ],
      color: "blue"
    },
    {
      industry: "Healthcare",
      title: "24/7 Patient Support Automation",
      desc: "Deployed voice AI for a healthcare network handling appointment scheduling, reminders, and patient inquiries around the clock.",
      stats: [
        { value: "10K+", label: "Calls/Month" },
        { value: "95%", label: "Satisfaction" },
      ],
      color: "emerald"
    },
    {
      industry: "Real Estate",
      title: "Automated Lead Qualification",
      desc: "Built an AI-powered lead qualification system that pre-screens and qualifies leads before agent handoff, saving 40 hours per week.",
      stats: [
        { value: "40hrs", label: "Saved Weekly" },
        { value: "2x", label: "More Deals" },
      ],
      color: "purple"
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; gradient: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-50 to-white" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", gradient: "from-emerald-50 to-white" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-50 to-white" },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUpVariants} custom={0}>
            <Badge className="bg-purple-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
              Case Studies
            </Badge>
          </motion.div>
          <motion.h2 
            variants={fadeUpVariants} 
            custom={1}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900"
          >
            Real <span className="text-purple-600">Results</span>
          </motion.h2>
          <motion.p 
            variants={fadeUpVariants} 
            custom={2}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            See how businesses like yours have achieved remarkable results with our AI automation solutions.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUpVariants}
              custom={idx * 0.2}
              className={`p-8 rounded-2xl bg-gradient-to-b ${colorMap[study.color].gradient} border border-slate-100 shadow-lg hover:shadow-xl transition-shadow`}
            >
              <span className={`inline-block px-3 py-1 rounded-full ${colorMap[study.color].bg} ${colorMap[study.color].text} text-xs font-bold uppercase tracking-widest mb-4`}>
                {study.industry}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{study.title}</h3>
              <p className="text-slate-600 mb-6">{study.desc}</p>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                {study.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="text-center">
                    <div className={`text-2xl font-black ${colorMap[study.color].text}`}>{stat.value}</div>
                    <div className="text-xs font-medium text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 4: Careers
function CareersSection() {
  const navigate = useNavigate();
  const openPositions = [
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Sales Development Rep",
      department: "Sales",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Customer Success Manager",
      department: "Operations",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
  ];

  const perks = [
    { icon: <MapPin className="size-5" />, title: "Remote First", desc: "Work from anywhere" },
    { icon: <Clock className="size-5" />, title: "Flexible Hours", desc: "Own your schedule" },
    { icon: <TrendingUp className="size-5" />, title: "Growth", desc: "Career development" },
    { icon: <Award className="size-5" />, title: "Competitive Pay", desc: "Top market rates" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Title & Perks */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUpVariants} custom={0}>
              <Badge className="bg-orange-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
                Careers
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeUpVariants} 
              custom={1}
              className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900"
            >
              Join Our <span className="text-orange-600">Team</span>
            </motion.h2>
            <motion.p 
              variants={fadeUpVariants} 
              custom={2}
              className="text-lg text-slate-600 mb-8"
            >
              We're always looking for talented individuals passionate about AI and automation. Join us in building the future of business automation.
            </motion.p>

            {/* Perks Grid */}
            <motion.div 
              variants={fadeUpVariants} 
              custom={3}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {perks.map((perk, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm border border-orange-100">
                  <div className="size-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    {perk.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{perk.title}</div>
                    <div className="text-xs text-slate-500">{perk.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUpVariants} custom={4}>
              <Button 
                onClick={() => navigate('/contact')}
                className="h-12 px-8 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest text-[10px] gap-2"
              >
                <Mail className="size-4" /> Get In Touch
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Open Positions */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Open Positions</h3>
            {openPositions.map((position, idx) => (
              <motion.div
                key={idx}
                variants={fadeUpVariants}
                custom={idx * 0.2}
                className="p-6 rounded-2xl bg-white shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{position.title}</h4>
                    <p className="text-sm text-slate-500">{position.department}</p>
                  </div>
                  <ArrowRight className="size-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <MapPin className="size-3" /> {position.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Clock className="size-3" /> {position.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Main Company Page
export function CompanyPage() {
  return (
    <div className="min-h-screen bg-[#fefbfa]">
      <AboutUsSection />
      <OurProcessSection />
      <CaseStudiesSection />
      <CareersSection />
    </div>
  );
}
