
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Phone, Users, Share2, Globe, ArrowRight } from "lucide-react";

import { Badge } from "./badge";
import { Button } from "./button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const Feature108 = ({
  badge = "Our Expertise",
  heading = "Key AI Automation Services Offered",
  description = "Join us to build flawless enterprise-grade AI solutions that drive real-world efficiency.",
  tabs = [
    {
      value: "tab-1",
      icon: <Phone className="h-auto w-4 shrink-0" />,
      label: "AI Voice Calling",
      content: {
        badge: "Voice AI",
        title: "Intelligent Voice Calling Agents.",
        description:
          "Deploy AI-powered voice agents that handle inbound and outbound calls with human-like conversation. Automate appointment scheduling, customer support, and sales calls with natural language understanding and real-time responses.",
        buttonText: "Learn More",
        imageSrc:
          "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "AI Voice Calling Agent",
      },
    },
    {
      value: "tab-2",
      icon: <Users className="h-auto w-4 shrink-0" />,
      label: "Lead Automation",
      content: {
        badge: "Sales AI",
        title: "Automated Lead Generation & Nurturing.",
        description:
          "Transform your sales pipeline with AI-driven lead scoring, qualification, and follow-up automation. Capture leads 24/7, enrich data automatically, and deliver personalized outreach at scale.",
        buttonText: "See Workflows",
        imageSrc:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "AI Lead Automation",
      },
    },
    {
      value: "tab-3",
      icon: <Share2 className="h-auto w-4 shrink-0" />,
      label: "Social Media",
      content: {
        badge: "Social AI",
        title: "Social Media Management on Autopilot.",
        description:
          "Automate content scheduling, engagement tracking, and audience growth across all platforms. Our AI analyzes trends, generates captions, and optimizes posting times for maximum reach and engagement.",
        buttonText: "Get Started",
        imageSrc:
          "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "Social Media Automation",
      },
    },
    {
      value: "tab-4",
      icon: <Globe className="h-auto w-4 shrink-0" />,
      label: "Web Development",
      content: {
        badge: "Digital Solutions",
        title: "Modern Website Development.",
        description:
          "Build stunning, high-performance websites with cutting-edge technology. From landing pages to full-scale web applications, we deliver responsive designs optimized for conversions and user experience.",
        buttonText: "View Portfolio",
        imageSrc:
          "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "Website Development",
      },
    },
  ],
}: Feature108Props) => {
  return (
    <section className="py-16 lg:py-24 relative">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-4 text-center mb-10 lg:mb-16">
          <Badge variant="outline" className="rounded-full px-4 border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {badge}
          </Badge>
          <h2 className="max-w-3xl text-4xl font-bold md:text-6xl tracking-tight text-slate-900 leading-tight">
            {heading}
          </h2>
          <p className="text-slate-500 font-medium text-lg lg:text-xl max-w-2xl">{description}</p>
        </div>
        
        <Tabs defaultValue={tabs[0].value} className="mt-12">
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10 bg-transparent h-auto mb-16">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-3 rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-widest text-slate-400 data-[state=active]:bg-slate-100 data-[state=active]:text-blue-600 border border-transparent data-[state=active]:border-slate-200 transition-all shadow-none hover:text-slate-600"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mx-auto max-w-screen-xl rounded-[3rem] bg-slate-50/80 p-8 lg:p-20 border border-slate-100 shadow-sm">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-16 lg:grid-cols-2 lg:gap-24 outline-none"
              >
                <div className="flex flex-col gap-8">
                  <Badge variant="outline" className="w-fit bg-white border-blue-100 text-blue-600 font-bold px-4 py-1">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-4xl font-bold lg:text-6xl text-slate-900 tracking-tight leading-tight">
                    {tab.content.title}
                  </h3>
                  <p className="text-slate-500 text-lg lg:text-xl font-medium leading-relaxed">
                    {tab.content.description}
                  </p>
                  <Button className="mt-4 w-fit gap-3 rounded-full h-14 px-10 font-bold uppercase tracking-widest text-xs" size="lg">
                    {tab.content.buttonText} <ArrowRight className="size-5" />
                  </Button>
                </div>
                <div className="relative group w-full aspect-[4/3] lg:aspect-square">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-[2rem] scale-105 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <img
                        src={tab.content.imageSrc}
                        alt={tab.content.imageAlt}
                        className="relative rounded-[2rem] w-full h-full object-cover shadow-2xl border border-white transition-transform duration-700 group-hover:scale-[1.01]"
                    />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { Feature108 };
