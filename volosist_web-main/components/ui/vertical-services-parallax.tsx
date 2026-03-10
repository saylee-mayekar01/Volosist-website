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
    bgColor: 'bg-gradient-to-br from-slate-100/80 via-blue-50/60 to-indigo-50/40',
    images: [
      'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
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
    bgColor: 'bg-gradient-to-br from-slate-100/80 via-teal-50/50 to-emerald-50/40',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
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
    bgColor: 'bg-gradient-to-br from-slate-100/80 via-violet-50/50 to-purple-50/40',
    images: [
      'https://images.unsplash.com/photo-1626785774625-0c6f52c0d0b5?w=600&q=80',
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&q=80',
      'https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&q=80',
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
    bgColor: 'bg-gradient-to-br from-slate-100/80 via-amber-50/50 to-orange-50/40',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
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
}> = ({ images }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], [160, -160]);

  return (
    <motion.div
      ref={containerRef}
      className="relative h-[320px] sm:h-[360px] lg:h-[420px] overflow-hidden rounded-3xl"
    >
      <motion.div
        style={{ x }}
        className="absolute inset-0 flex items-center gap-6"
      >
        {images.slice(0, 1).map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="shrink-0 w-[500px] h-[350px] sm:w-[600px] sm:h-[400px] lg:w-[700px] lg:h-[450px] rounded-2xl overflow-hidden"
          >
            <img
              src={src}
              alt="Service"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
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
            <HorizontalImageGallery images={service.images} />
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

export function VerticalServicesParallax() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-slate-100/50 to-blue-50/30">
      {SERVICES.map((service, index) => (
        <ServiceSectionComponent
          key={service.id}
          service={service}
          index={index}
        />
      ))}
    </div>
  );
}
