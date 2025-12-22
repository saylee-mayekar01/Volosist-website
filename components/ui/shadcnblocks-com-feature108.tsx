import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Layout, Pointer, Zap, Briefcase, Database, MessageSquare, ArrowRight } from "lucide-react";

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
      icon: <Briefcase className="h-auto w-4 shrink-0" />,
      label: "Strategy & Insights",
      content: {
        badge: "Consulting & Strategy",
        title: "Architecture and Change Management.",
        description:
          "We identify automation opportunities and design AI architectures tailored to your goals. Our data-driven approach uses machine learning for predictive analytics and real-time forecasting.",
        buttonText: "Request Audit",
        imageSrc:
          "https://images.unsplash.com/photo-1551288049-bbda38a8f1ad?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "AI Strategy and Insights",
      },
    },
    {
      value: "tab-2",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Process Automation",
      content: {
        badge: "BPA & CRM",
        title: "Streamline Repetitive Workflow Tasks.",
        description:
          "Automate data extraction, document processing, and lead scoring. We integrate Sales Automation to handle data entry and customer segmentation, allowing your team to focus on high-value work.",
        buttonText: "See Workflows",
        imageSrc:
          "https://images.unsplash.com/photo-1518186239717-2e9b13670404?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "Workflow Automation Systems",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "Custom Solutions",
      content: {
        badge: "IT & Apps",
        title: "AI Chatbots and Custom App Development.",
        description:
          "Building custom AI-powered apps from support tools to AR. We deploy intelligent chatbots for ticket analysis and security insights, ensuring a seamless digital experience for your users.",
        buttonText: "View Case Studies",
        imageSrc:
          "https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=1200",
        imageAlt: "AI Application Development",
      },
    },
  ],
}: Feature108Props) => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline" className="rounded-full px-4 border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {badge}
          </Badge>
          <h2 className="max-w-2xl text-4xl font-bold md:text-5xl tracking-tight text-slate-900 leading-tight">
            {heading}
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-xl">{description}</p>
        </div>
        
        <Tabs defaultValue={tabs[0].value} className="mt-12">
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10 bg-transparent h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-slate-400 data-[state=active]:bg-slate-100 data-[state=active]:text-blue-600 border border-transparent data-[state=active]:border-slate-200 transition-all"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mx-auto mt-12 max-w-screen-xl rounded-[2.5rem] bg-slate-50/80 p-6 lg:p-16 border border-slate-100 shadow-inner">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-12 lg:grid-cols-2 lg:gap-20 outline-none"
              >
                <div className="flex flex-col gap-6">
                  <Badge variant="outline" className="w-fit bg-white border-blue-100 text-blue-600 font-bold">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-3xl font-bold lg:text-5xl text-slate-900 tracking-tight leading-tight">
                    {tab.content.title}
                  </h3>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    {tab.content.description}
                  </p>
                  <Button className="mt-4 w-fit gap-3 rounded-full h-12 px-8 font-bold uppercase tracking-widest text-[10px]" size="lg">
                    {tab.content.buttonText} <ArrowRight className="size-4" />
                  </Button>
                </div>
                <div className="relative group w-full aspect-video lg:aspect-square">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-2xl scale-105 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <img
                        src={tab.content.imageSrc}
                        alt={tab.content.imageAlt}
                        className="relative rounded-3xl w-full h-full object-cover shadow-2xl border border-white transition-transform duration-700 group-hover:scale-[1.01]"
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