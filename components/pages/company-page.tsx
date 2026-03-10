import React, { useEffect, useState } from "react";
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
  Heart,
  Phone,
  ExternalLink
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { supabase } from "../../lib/supabase";

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
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <Badge className="bg-blue-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase">
                About Us
              </Badge>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]"
            >
              Empowering Businesses<br />
              <span className="text-blue-600">Through AI</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-slate-600 mb-6 leading-relaxed"
            >
              We are a team of AI automation specialists and software engineers dedicated to helping B2B companies scale their operations through intelligent automation.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-slate-600 mb-8 leading-relaxed"
            >
              From sales and lead generation to voice automation and complete business solutions, we deliver measurable results that transform how businesses operate.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Button
                asChild
                className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest rounded-full text-sm"
              >
                <a href="mailto:volosist.ai@gmail.com">Contact Us</a>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-200"
            >
              {[
                { value: "150+", label: "Clients Served" },
                { value: "1M+", label: "Leads Managed" },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-black text-blue-600">{stat.value}</div>
                  <div className="text-sm text-slate-600 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
              alt="Volosist Team"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Section 1.5: Values & Stats Section
function ValuesSection() {
  const values = [
    { icon: <Lightbulb className="size-6" />, title: "Innovation First", desc: "We push boundaries with cutting-edge AI solutions" },
    { icon: <Shield className="size-6" />, title: "Trust & Reliability", desc: "Your data and success are our top priorities" },
    { icon: <Zap className="size-6" />, title: "Speed to Value", desc: "Rapid deployment with measurable results" },
    { icon: <Heart className="size-6" />, title: "Client-Centric", desc: "Your growth is the measure of our success" },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Top Stats Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
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
              custom={idx * 0.2}
              className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-center hover:border-blue-500/50 transition-all"
            >
              <div className="text-3xl md:text-4xl font-black text-blue-400 mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Values Grid */}
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
              className="p-8 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-center hover:bg-slate-700/50 transition-all"
            >
              <div className="size-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
                {value.icon}
              </div>
              <h4 className="font-bold text-white mb-2 text-lg">{value.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{value.desc}</p>
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
// ─── Address Section ────────────────────────────────────────────────────────
function AddressSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Left – address card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <Badge className="bg-blue-600 text-white border-0 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6 w-fit">
              Visit Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
              Visit Our <span className="text-blue-600">Innovation Studio</span>
            </h2>

            <p className="text-slate-600 mb-6 leading-relaxed">
              Meet our AI automation consultants, discuss your transformation roadmap, and explore tailored enterprise automation strategies at our office.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="size-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">Address</p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Statica The modern arts,<br />
                    Badlapur (W), Thane,<br />
                    Maharashtra 421503,<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="size-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 mb-1">Email</p>
                  <a href="mailto:volosist.ai@gmail.com" className="text-blue-600 hover:underline text-sm">
                    volosist.ai@gmail.com
                  </a>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/place/Statica+The+modern+arts/@19.1748121,73.2371486,17z"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="mt-2 h-11 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest gap-2">
                  <ExternalLink className="size-4" /> Open in Google Maps
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right – embedded map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 min-h-[400px]"
          >
            <iframe
              title="Volosist Office Location"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d120590.93133013733!2d73.237149!3d19.174812!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be793ccb7bfe09f%3A0x1d3e141fe42b59a5!2sStatica%20The%20modern%20arts!5e0!3m2!1sen!2sus!4v1771782096944!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ minHeight: 400, border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Careers Section ─────────────────────────────────────────────────────────
interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  short_description: string;
  description: string;
  is_active: boolean;
}

function CareersSection() {
  const LOCAL_JOB_POSITIONS_KEY = 'volosist_job_positions';
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const perks = [
    { icon: <MapPin className="size-5" />, title: "Remote First", desc: "Work from anywhere" },
    { icon: <Clock className="size-5" />, title: "Flexible Hours", desc: "Own your schedule" },
    { icon: <TrendingUp className="size-5" />, title: "Growth", desc: "Career development" },
    { icon: <Award className="size-5" />, title: "Competitive Pay", desc: "Top market rates" },
  ];

  useEffect(() => {
    const readLocalPositions = (): JobPosition[] => {
      if (typeof window === 'undefined') return [];
      try {
        const raw = window.localStorage.getItem(LOCAL_JOB_POSITIONS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const fetchPositions = async () => {
      try {
        const { data, error } = await supabase
          .from('job_positions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setPositions(data ?? []);
      } catch (fetchError) {
        console.error('[careers] Failed to fetch positions:', fetchError);
        const localPositions = readLocalPositions().filter((position) => position.is_active);
        setPositions(localPositions);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();

    const channel = supabase
      .channel('job_positions_live_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_positions' },
        fetchPositions
      )
      .subscribe();

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_JOB_POSITIONS_KEY) {
        fetchPositions();
      }
    };

    window.addEventListener('storage', onStorageChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  const handleApply = (title: string) => {
    const subject = encodeURIComponent(`Application for ${title}`);
    const body = encodeURIComponent(`Hi Volosist Team,\n\nI am interested in the ${title} position.\n\nPlease find my details below:\n\nName:\nPhone:\nLinkedIn/Portfolio:\n\nBest regards,`);
    window.location.href = `mailto:volosist.ai@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left – heading & perks */}
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

            <motion.div variants={fadeUpVariants} custom={3} className="grid grid-cols-2 gap-4">
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
          </motion.div>

          {/* Right – open positions */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Open Positions</h3>

            {loading && (
              <div className="text-slate-400 text-sm py-8 text-center">Loading positions…</div>
            )}

            {!loading && positions.length === 0 && (
              <div className="p-8 rounded-2xl bg-white border border-slate-100 text-center">
                <Briefcase className="size-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No open positions right now.</p>
                <p className="text-slate-400 text-sm mt-1">Check back soon or send us your resume!</p>
                <Button
                  onClick={() => handleApply('General Application')}
                  className="mt-4 h-10 px-6 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest gap-2"
                >
                  <Mail className="size-3.5" /> Send Resume
                </Button>
              </div>
            )}

            {positions.map((position, idx) => (
              <motion.div
                key={position.id}
                variants={fadeUpVariants}
                custom={idx * 0.15}
                className="p-6 rounded-2xl bg-white shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="mb-3">
                  <h4 className="text-lg font-bold text-slate-900">{position.title}</h4>
                  <p className="text-sm text-orange-600 font-medium">{position.department}</p>
                </div>

                {/* Short description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{position.short_description}</p>

                {/* Full description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-5 border-t border-slate-100 pt-4">{position.description}</p>

                {/* Meta + Apply */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <MapPin className="size-3" /> {position.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock className="size-3" /> {position.type}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleApply(position.title)}
                    className="h-9 px-5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-widest gap-1.5"
                  >
                    <Mail className="size-3.5" /> Apply Now
                  </Button>
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
      <AddressSection />
    </div>
  );
}
