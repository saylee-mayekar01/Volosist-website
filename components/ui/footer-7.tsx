
import React from "react";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import { cn } from "../../lib/utils";

interface Footer7Props {
  logo?: {
    url: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
  // Fixed: Added onSignUpClick to satisfy App.tsx usage
  onSignUpClick?: () => void;
}

const VolosistLogo = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 100 100" 
        className={cn("w-8 h-8", className)} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" className="text-blue-600 opacity-20" />
        <path 
            d="M30 45C30 45 40 75 50 75C60 75 85 25 85 25" 
            stroke="currentColor" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-blue-600"
        />
        <path 
            d="M15 65C15 65 25 85 50 85C75 85 85 65 85 65" 
            stroke="currentColor" 
            strokeWidth="6" 
            strokeLinecap="round" 
            className="text-blue-500 opacity-40"
        />
    </svg>
);

const defaultSections = [
  {
    title: "Solutions",
    links: [
      { name: "AI Workflows", href: "#" },
      { name: "Enterprise Systems", href: "#" },
      { name: "Competitor Audits", href: "#" },
      { name: "Data Infrastructure", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "Our Process", href: "#process" },
      { name: "Case Studies", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "#" },
      { name: "Help Center", href: "#" },
      { name: "Community", href: "#" },
      { name: "Free Audit", href: "#audit" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <Instagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <Facebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <Twitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <Linkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer7 = ({
  logo = {
    url: "#",
    title: "VOLOSIST",
  },
  sections = defaultSections,
  description = "Engineering high-performance AI automation systems for visionary enterprises. We scale intelligence with precision and speed.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 Volosist Systems. All rights reserved.",
  legalLinks = defaultLegalLinks,
  onSignUpClick,
}: Footer7Props) => {
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex w-full flex-col justify-between gap-12 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-8 lg:items-start lg:max-w-md">
            {/* Logo Area */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <a href={logo.url} className="flex items-center gap-3">
                  <VolosistLogo />
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">{logo.title}</h2>
                </a>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 font-medium">
                {description}
              </p>
              <ul className="flex items-center space-x-5 text-slate-400">
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

          {/* Links Grid */}
          <div className="grid w-full grid-cols-2 gap-10 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900">{section.title}</h3>
                <ul className="space-y-4 text-sm font-medium text-slate-500">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="transition-colors hover:text-blue-600"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col justify-between gap-6 border-t border-slate-50 pt-10 text-[11px] font-bold uppercase tracking-widest text-slate-400 md:flex-row md:items-center">
          <div className="flex items-center gap-3 order-2 md:order-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <p>{copyright}</p>
          </div>
          <ul className="flex flex-col gap-4 md:flex-row md:gap-8 order-1 md:order-2">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-blue-600 transition-colors">
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
