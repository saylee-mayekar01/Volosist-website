import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  MessageSquare,
  Bot,
  Calendar,
  FileText,
  Phone,
  BarChart3,
  Headphones,
  Play,
  ArrowRight,
  Megaphone,
  Globe,
  Palette,
  ShoppingCart,
  ClipboardList,
  Building2,
  Briefcase,
  Users,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface SubService {
  icon: React.ReactNode;
  title: string;
}

interface ServiceSection {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  subServices: SubService[];
  accentColor: string;
  bgColor: string;
  images: string[];
}

const SERVICES: ServiceSection[] = [
  {
    id: 'sales-automation',
    badge: 'THE CATALYST',
    title: 'We believe in',
    highlight: 'acceleration.',
    subtitle: 'Sales & Lead Automation',
    description:
      'In a world of manual processes, we design intelligent flows. Every automation is a decision to multiply your impact.',
    accentColor: 'blue',
    bgColor: 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-white',
    images: [
      'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
    ],
    subServices: [
      { icon: <Mail className="size-4" />, title: 'Automated Follow-ups' },
      { icon: <Bot className="size-4" />, title: 'AI Lead Capture' },
      { icon: <BarChart3 className="size-4" />, title: 'CRM Automation' },
      { icon: <FileText className="size-4" />, title: 'AI Quote Generation' },
      { icon: <Phone className="size-4" />, title: 'Outbound Calling' },
      { icon: <Calendar className="size-4" />, title: 'Appointment Scheduling' },
      { icon: <MessageSquare className="size-4" />, title: 'Sales Chatbot' },
    ],
  },
  {
    id: 'voice-automation',
    badge: 'THE VOICE',
    title: 'We believe in',
    highlight: 'conversation.',
    subtitle: 'AI Voice & Calling',
    description:
      'In a world of silence, we design engagement. Every call is a bridge between you and your customer.',
    accentColor: 'emerald',
    bgColor: 'bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
      'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=600&q=80',
    ],
    subServices: [
      { icon: <Phone className="size-4" />, title: 'Inbound Call Handling' },
      { icon: <MessageSquare className="size-4" />, title: 'Outbound Follow-ups' },
      { icon: <Calendar className="size-4" />, title: 'Appointment Reminders' },
      { icon: <FileText className="size-4" />, title: 'Payment Reminders' },
      { icon: <BarChart3 className="size-4" />, title: 'Feedback & Surveys' },
      { icon: <Headphones className="size-4" />, title: 'Call Routing' },
      { icon: <Bot className="size-4" />, title: 'Transcription & Analysis' },
    ],
  },
  {
    id: 'marketing-content',
    badge: 'THE AMPLIFIER',
    title: 'We believe in',
    highlight: 'resonance.',
    subtitle: 'Marketing & Content',
    description:
      'In a world of noise, we design clarity. Every message is crafted to cut through and connect.',
    accentColor: 'purple',
    bgColor: 'bg-gradient-to-br from-slate-50 via-purple-50/30 to-white',
    images: [
      'https://images.unsplash.com/photo-1626785774625-0c6f52c0d0b5?w=600&q=80',
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&q=80',
      'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&q=80',
      'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&q=80',
    ],
    subServices: [
      { icon: <Megaphone className="size-4" />, title: 'Social Media Automation' },
      { icon: <Globe className="size-4" />, title: 'SEO Optimization' },
      { icon: <Palette className="size-4" />, title: 'Content Generation' },
      { icon: <BarChart3 className="size-4" />, title: 'Campaign Analytics' },
      { icon: <Mail className="size-4" />, title: 'Email Marketing' },
      { icon: <ShoppingCart className="size-4" />, title: 'E-commerce Marketing' },
    ],
  },
  {
    id: 'business-solutions',
    badge: 'THE FOUNDATION',
    title: 'We believe in',
    highlight: 'transformation.',
    subtitle: 'Complete Business Solutions',
    description:
      'In a world of complexity, we design simplicity. Every system is built to empower your entire operation.',
    accentColor: 'amber',
    bgColor: 'bg-gradient-to-br from-slate-50 via-amber-50/30 to-white',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80',
    ],
    subServices: [
      { icon: <Building2 className="size-4" />, title: 'Custom AI Agents' },
      { icon: <Briefcase className="size-4" />, title: 'Workflow Automation' },
      { icon: <Users className="size-4" />, title: 'HR & Recruitment' },
      { icon: <ClipboardList className="size-4" />, title: 'Operations Management' },
      { icon: <BarChart3 className="size-4" />, title: 'Business Intelligence' },
      { icon: <Headphones className="size-4" />, title: 'Customer Success' },
    ],
  },
];

const accentColors: Record<
  string,
  { text: string; bg: string; border: string; button: string }
> = {
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-600',
    border: 'border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  emerald: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-600',
    border: 'border-emerald-200',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
  purple: {
    text: 'text-purple-600',
    bg: 'bg-purple-600',
    border: 'border-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700',
  },
  amber: {
    text: 'text-amber-600',
    bg: 'bg-amber-600',
    border: 'border-amber-200',
    button: 'bg-amber-600 hover:bg-amber-700',
  },
};

const HorizontalImageGallery: React.FC<{
  images: string[];
  accentColor: string;
  reverse?: boolean;
}> = ({ images, accentColor, reverse }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const baseOffset = reverse ? 150 : -150;
  const x1 = useTransform(scrollYProgress, [0, 1], [baseOffset, -baseOffset]);
  const x2 = useTransform(scrollYProgress, [0, 1], [
    -baseOffset * 0.7,
    baseOffset * 0.7,
  ]);
  const x3 = useTransform(scrollYProgress, [0, 1], [
    baseOffset * 0.9,
    -baseOffset * 0.9,
  ]);
  const x4 = useTransform(scrollYProgress, [0, 1], [
    -baseOffset * 0.5,
    baseOffset * 0.5,
  ]);

  const colors = accentColors[accentColor];

  return (
    <motion.div
      ref={containerRef}
      className="relative h-[600px] overflow-hidden rounded-3xl"
    >
      <motion.div style={{ x: x1 }} className="absolute inset-0 w-full h-full">
        <img
          src={images[0]}
          alt="Featured"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 z-20">
          <div
            className={cn(
              "bg-black/40 backdrop-blur-md rounded-2xl p-5 border",
              colors.border.replace('border-', 'border-').replace('200', '300/50')
            )}
          >
            <div
              className={cn(
                'text-xs uppercase tracking-widest mb-2 font-black',
                colors.text
              )}
            >
              Featured
            </div>
            <div className="text-white font-bold text-lg">
              Intelligent Async Workflows
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{ x: x2 }}
        className="absolute top-12 right-12 w-[35%] h-[40%] rounded-2xl overflow-hidden shadow-2xl z-30 border-2 border-white/20"
      >
        <img
          src={images[1]}
          alt="Service"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <motion.div
        style={{ x: x3 }}
        className="absolute bottom-12 left-12 w-[40%] h-[35%] rounded-2xl overflow-hidden shadow-2xl z-20 border-2 border-white/10"
      >
        <img
          src={images[2]}
          alt="Service"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <motion.div
        style={{ x: x4 }}
        className="absolute bottom-20 right-24 w-[25%] h-[25%] rounded-xl overflow-hidden shadow-lg z-40 border-2 border-white/30"
      >
        <img
          src={images[3]}
          alt="Service"
          className="w-full h-full object-cover"
        />
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40',
            `${colors.bg} bg-opacity-20`
          )}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </motion.div>
    </motion.div>
  );
};

const ServiceSectionComponent: React.FC<{
  service: ServiceSection;
  index: number;
}> = ({ service, index }) => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const colors = accentColors[service.accentColor];
  const isReverse = index % 2 === 1;
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  return (
    <section
      ref={sectionRef}
      className={cn('relative py-24 lg:py-32 overflow-hidden', service.bgColor)}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-10',
            colors.bg,
            isReverse
              ? 'top-0 left-0 -translate-x-1/2 -translate-y-1/2'
              : 'top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          style={{ opacity, y }}
          className={cn(
            'grid lg:grid-cols-2 gap-12 lg:gap-20 items-center',
            isReverse && 'lg:grid-flow-dense'
          )}
        >
          <div className={cn('max-w-xl', isReverse && 'lg:col-start-2')}>
            <motion.div
              initial={{ opacity: 0, x: isReverse ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span
                className={cn(
                  'text-[11px] font-black tracking-[0.35em] uppercase border-b-2 pb-1',
                  colors.text,
                  colors.border.replace('border-', 'border-b-')
                )}
              >
                {service.badge}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-slate-800 leading-[1.1] mb-4"
            >
              {service.title}
              <br />
              <span className={cn('italic', colors.text)}>
                {service.highlight}
              </span>
            </motion.h2>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl font-bold text-slate-700 mb-4"
            >
              {service.subtitle}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-slate-600 leading-relaxed mb-8"
            >
              {service.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {service.subServices.map((sub, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-white border transition-all hover:shadow-md cursor-pointer',
                    colors.border
                  )}
                >
                  <span className={colors.text}>{sub.icon}</span>
                  {sub.title}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                onClick={() => navigate('/contact')}
                className={cn(
                  'h-12 px-8 rounded-full font-bold uppercase tracking-widest text-[10px] gap-2 text-white',
                  colors.button
                )}
              >
                <Sparkles className="size-4" /> Explore Services
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                className="h-12 px-8 rounded-full border-slate-300 font-bold uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-100"
              >
                <Play className="size-4" /> Watch Demo
              </Button>
            </motion.div>
          </div>

          <div className={cn(isReverse && 'lg:col-start-1 lg:row-start-1')}>
            <HorizontalImageGallery
              images={service.images}
              accentColor={service.accentColor}
              reverse={isReverse}
            />
          </div>
        </motion.div>
      </div>

      {index < SERVICES.length - 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SERVICES.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                idx === index ? `w-8 ${colors.bg}` : 'w-2 bg-slate-200'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          style={{ y }}
          className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-emerald-600/20"
        />
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute size-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Ready to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
              Transform
            </span>{' '}
            Your Business?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join 500+ businesses already using our AI-powered automation to scale
            their operations and accelerate growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="h-14 px-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold uppercase tracking-widest text-xs gap-2"
            >
              Start Free Trial <ArrowRight className="size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
              className="h-14 px-10 rounded-full border-white/30 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs gap-2"
            >
              Schedule Demo <Play className="size-5" />
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-8"
          >
            {[
              { value: '500+', label: 'Active Clients' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '10M+', label: 'Tasks Automated' },
              { value: '4.9 Stars', label: 'Customer Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export function VerticalServicesParallax() {
  return (
    <div className="bg-white">
      {SERVICES.map((service, index) => (
        <ServiceSectionComponent
          key={service.id}
          service={service}
          index={index}
        />
      ))}
      <CTASection />
    </div>
  );
}
