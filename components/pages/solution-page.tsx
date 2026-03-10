
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { CheckCircle2, ArrowRight, Lightbulb, Repeat, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WorkflowVisualizer } from '../ui/workflow-visualizer';

interface SolutionPageProps {
  title: string;
  subtitle: string;
  description: string;
}

interface ServiceCard {
  title: string;
  description: string;
  image: string;
}

const workflowServices: ServiceCard[] = [
  {
    title: "Consulting & Strategy",
    description: "Identifying automation opportunities, designing AI architecture, and change management.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Business Process Automation (BPA)",
    description: "Streamlining repetitive tasks like data extraction, classification, and document processing.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "CRM & Sales Automation",
    description: "Automating lead scoring, data entry, and customer segmentation.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "IT & Support Automation",
    description: "AI chatbots for support, ticket analysis, and security insights.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Data-Driven Automation",
    description: "Using machine learning for predictive analytics, forecasting, and real-time insights.",
    image: "https://images.unsplash.com/photo-1551288049-bbda38a8f1ad?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "App Development",
    description: "Building custom AI-powered apps, from chatbots to AR tools.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
  }
];

export function SolutionPage({ title, subtitle, description }: SolutionPageProps) {
  const isWorkflows = title.toLowerCase().includes("workflows");

  return (
    <div className="min-h-[80vh] py-20 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="max-w-4xl">
            <Badge variant="blue" className="mb-6 px-4 py-1.5">{subtitle}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-8 uppercase leading-tight">
              {title}
            </h1>
            <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed mb-16 max-w-3xl">
              {description}
            </p>
          </div>

          {/* New Workflow Visualizer Hero */}
          {isWorkflows && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-32"
            >
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Neural Orchestration Layer</h2>
                    <p className="text-slate-500 font-medium">How we architect your autonomous data flow.</p>
                </div>
                <WorkflowVisualizer />
            </motion.div>
          )}

          {/* Workflow Templates Section */}
          {isWorkflows && (
            <div className="grid md:grid-cols-3 gap-8 mb-32">
                {[
                    { title: "Support Swarms", desc: "Automate 90% of ticket volume with reasoning-capable agents.", icon: <Settings2 className="text-blue-600" /> },
                    { title: "Outbound Logic", desc: "Dynamic lead generation based on real-time market intent signals.", icon: <Lightbulb className="text-blue-600" /> },
                    { title: "Recursive Audit", desc: "Constant security and compliance checks on high-speed data streams.", icon: <Repeat className="text-blue-600" /> }
                ].map((template, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                            {template.icon}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">{template.title}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{template.desc}</p>
                    </div>
                ))}
            </div>
          )}

          {/* Service Cards Section */}
          {isWorkflows && (
            <div className="mb-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-10 uppercase tracking-tight border-b border-slate-100 pb-4">
                Full Service Matrix:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workflowServices.map((service, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-50">
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                        {service.description}
                      </p>
                      <button className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors group/btn">
                        READ MORE <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities Section */}
          <div className="prose prose-slate max-w-none font-medium text-slate-600 leading-loose">
             <h2 className="text-2xl font-bold text-slate-900 mb-8 uppercase tracking-tight border-b border-slate-100 pb-4">Capabilities</h2>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0 m-0">
                {[
                  "Real-time data stream processing",
                  "Custom LLM fine-tuning and deployment",
                  "Agent-to-agent communication protocols",
                  "Autonomous recursive optimization",
                  "Zero-latency edge inference",
                  "Military-grade security layers"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 m-0 p-0 group">
                    <CheckCircle2 className="size-5 text-blue-600 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="text-base font-medium">{item}</span>
                  </li>
                ))}
             </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
