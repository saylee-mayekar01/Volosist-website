
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Phone, Users, Share2, Globe, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

const tabButtonStyle = `
  .feat-tab-btn {
    position: relative;
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.3);
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 2px;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.9) 100%);
    color: #64748b;
    overflow: hidden;
    box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }
  .feat-tab-btn:hover {
    border-color: rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, rgba(238,242,255,1) 0%, rgba(224,231,255,1) 100%);
    color: #4f46e5;
    box-shadow: 0 8px 25px -5px rgba(99, 102, 241, 0.25);
    transform: translateY(-2px);
  }
  .feat-tab-btn[data-state=active] {
    background: linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.6), 0 0 20px 2px rgba(59, 130, 246, 0.3);
    transform: translateY(-2px);
  }
  .feat-tab-btn[data-state=active]::before,
  .feat-tab-btn:hover::before {
    animation: feat-sh02 0.6s 0s linear;
  }
  .feat-tab-btn::before {
    content: '';
    display: block;
    width: 0px;
    height: 86%;
    position: absolute;
    top: 7%;
    left: 0%;
    opacity: 0;
    background: #fff;
    box-shadow: 0 0 50px 30px #fff;
    transform: skewX(-20deg);
  }
  .feat-tab-btn:active {
    transform: translateY(0);
    box-shadow: 0 4px 15px -3px rgba(99, 102, 241, 0.3);
  }
  @keyframes feat-sh02 {
    from { opacity: 0; left: 0%; }
    50%  { opacity: 1; }
    to   { opacity: 0; left: 100%; }
  }
`;

import { Badge } from "./badge";
import { Button } from "./button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
  gradient: string;
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
        gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
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
        gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
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
        gradient: "from-purple-500/10 via-pink-500/5 to-transparent",
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
        gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
      },
    },
  ],
}: Feature108Props) => {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.value ?? "");

  React.useEffect(() => {
    if (!tabs.some((tab) => tab.value === activeTab)) {
      setActiveTab(tabs[0]?.value ?? "");
    }
  }, [tabs, activeTab]);

  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === activeTab)
  );
  const activeTabData = tabs[activeIndex] ?? tabs[0];

  if (!activeTabData) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 relative bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: tabButtonStyle }} />
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

        <Tabs value={activeTabData.value} onValueChange={setActiveTab} className="mt-12">
          <TabsList className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 bg-transparent h-auto sm:grid-cols-2 lg:grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="feat-tab-btn flex w-full items-center justify-center gap-2 px-4 py-3 shadow-none text-center"
              >
                <span className="inline-flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mx-auto mt-8 max-w-screen-xl relative">
            <TabsContent
              key={activeTabData.value}
              value={activeTabData.value}
              forceMount
              className={cn(
                "grid place-items-center gap-12 lg:grid-cols-2 lg:gap-20 outline-none p-7 md:p-10 lg:p-16 rounded-[2rem] border border-white/30 shadow-2xl backdrop-blur-md bg-gradient-to-br transition-all duration-500",
                activeTabData.content.gradient
              )}
            >
              <div className="flex flex-col gap-6 lg:gap-7">
                <Badge variant="outline" className="w-fit bg-white/60 backdrop-blur-sm border-blue-100 text-blue-600 font-bold px-4 py-1">
                  {activeTabData.content.badge}
                </Badge>

                <h3 className="text-3xl font-black md:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
                  {activeTabData.content.title}
                </h3>
                <p className="text-slate-600 text-base md:text-lg lg:text-xl font-medium leading-relaxed">
                  {activeTabData.content.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button className="w-fit gap-3 rounded-full h-12 px-8 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-500/20" size="lg">
                    {activeTabData.content.buttonText} <ArrowRight className="size-5" />
                  </Button>
                </div>
              </div>

              <div className="relative group w-full aspect-[4/3] lg:aspect-square">
                <div
                  className={cn(
                    "absolute inset-0 rounded-[2rem] scale-105 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br",
                    activeTabData.content.gradient
                  )}
                />
                <img
                  src={activeTabData.content.imageSrc}
                  alt={activeTabData.content.imageAlt}
                  className="relative rounded-[2rem] w-full h-full object-cover shadow-2xl border border-white transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </TabsContent>

            <div className="mt-5 flex justify-center gap-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-label={`Open ${tab.label}`}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === activeIndex ? "w-8 bg-blue-500" : "w-2 bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { Feature108 };
