
import React from "react";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { cn } from "../../lib/utils";

interface Footer7Props {
  onNavigate: (view: any) => void;
  onSignUpClick?: () => void;
}

const VolosistLogo = ({ className }: { className?: string }) => (
    <img 
        src="/public/favicon.ico" 
        alt="Volosist Logo" 
        className={cn("w-11 h-11 object-contain", className)} 
    />
);

export const Footer7 = ({
  onNavigate,
  onSignUpClick,
}: Footer7Props) => {
  const sections = [
    {
      title: "SOLUTIONS",
      links: [
        { name: "AI Workflows", view: "workflows" },
        { name: "Infrastructure", view: "infrastructure" },
        { name: "Audits", view: "audits" },
        { name: "Pricing Plans", view: "pricing" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { name: "About Us", view: "about" },
        { name: "Our Process", view: "process" },
        { name: "Case Studies", view: "cases" },
        { name: "Careers", view: "careers" },
      ],
    },
    {
      title: "RESOURCES",
      links: [
        { name: "Blog", view: "blog" },
        { name: "Documentation", view: "docs" },
        { name: "Help Center", view: "help" },
        { name: "Community", view: "community" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <Instagram className="size-5" />, href: "#", label: "Instagram" },
    { icon: <Facebook className="size-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="size-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="size-5" />, href: "#", label: "LinkedIn" },
  ];

  const legalLinks = [
    { name: "TERMS AND CONDITIONS", view: "terms" },
    { name: "PRIVACY POLICY", view: "privacy" },
  ];

  return (
    <section className="py-24 bg-white border-t border-slate-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex w-full flex-col justify-between gap-16 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-8 lg:items-start lg:max-w-md">
            <div className="flex flex-col gap-8">
              <button onClick={() => onNavigate('landing')} className="flex items-center gap-3">
                <VolosistLogo />
                <h2 className="text-xl font-bold tracking-tight text-slate-900">VOLOSIST</h2>
              </button>
              <p className="text-sm leading-relaxed text-slate-500 font-medium max-w-[320px]">
                Engineering high-performance AI automation systems for visionary enterprises. We scale intelligence with precision and speed.
              </p>
              <ul className="flex items-center space-x-6 text-slate-400">
                {socialLinks.map((social, idx) => (
                  <li key={idx} className="transition-colors hover:text-blue-600">
                    <a href={social.href} aria-label={social.label}>
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-10 md:grid-cols-3 lg:gap-24">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-8 text-sm font-bold uppercase tracking-widest text-slate-900">{section.title}</h3>
                <ul className="space-y-4 text-sm font-medium text-slate-500">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <button 
                        onClick={() => onNavigate(link.view)}
                        className="transition-colors hover:text-blue-600"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 flex flex-col justify-between gap-6 border-t border-slate-50 pt-10 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            <p>© 2025 VOLOSIST SYSTEMS. ALL RIGHTS RESERVED.</p>
          </div>
          <ul className="flex flex-col gap-4 md:flex-row md:gap-10">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-blue-600 transition-colors">
                <button onClick={() => onNavigate(link.view)}>{link.name}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
