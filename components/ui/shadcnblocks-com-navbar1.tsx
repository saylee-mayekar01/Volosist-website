import React from "react";
import { Book, Menu, Sunset, Trees, Zap, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { Button } from "./button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { cn } from "../../lib/utils";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const VolosistLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn("w-8 h-8", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="50"
      cy="50"
      r="45"
      stroke="currentColor"
      strokeWidth="8"
      className="text-blue-600 opacity-20"
    />
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

const Navbar1 = ({
  logo = {
    url: "#",
    alt: "Volosist Logo",
    title: "VOLOSIST",
  },
  menu = [
    { title: "Home", url: "#" },
    {
      title: "Solutions",
      url: "#",
      items: [
        {
          title: "AI Workflows",
          description: "Enterprise-grade automation systems for scale.",
          icon: <Zap className="size-5 shrink-0 text-blue-600" />,
          url: "#",
        },
        {
          title: "Infrastructure",
          description: "Robust data scaling and cloud integration.",
          icon: <Trees className="size-5 shrink-0 text-indigo-600" />,
          url: "#",
        },
        {
          title: "Audits",
          description: "Comprehensive competitive and performance analysis.",
          icon: <Book className="size-5 shrink-0 text-blue-500" />,
          url: "#audit",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Documentation",
          description: "Full guide to our automation deployment frameworks.",
          icon: <Book className="size-5 shrink-0 text-slate-400" />,
          url: "#",
        },
        {
          title: "Process",
          description: "How we deliver enterprise results in 72 hours.",
          icon: <Sunset className="size-5 shrink-0 text-orange-500" />,
          url: "#process",
        },
      ],
    },
    {
      title: "Pricing",
      url: "#solutions",
    },
  ],
  mobileExtraLinks = [
    { name: "About Us", url: "#" },
    { name: "Contact", url: "#contact" },
    { name: "Privacy", url: "#" },
    { name: "Terms", url: "#" },
  ],
  auth = {
    login: { text: "Sign In", url: "#" },
    signup: { text: "Register", url: "#" },
  },
  onLoginClick,
  onSignupClick,
}: Navbar1Props) => {
  return (
    <section className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
      <div className="container mx-auto px-4">
        <nav className="hidden justify-between lg:flex items-center">
          <div className="flex items-center gap-10">
            <a href={logo.url} className="flex items-center gap-3 group">
              <VolosistLogo className="transition-transform group-hover:scale-105 duration-300" />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={onLoginClick}
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              {auth.login.text}
            </button>
            <Button
              onClick={onSignupClick}
              size="sm"
              className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest px-6"
            >
              {auth.signup.text}
            </Button>
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-3">
              <VolosistLogo />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {logo.title}
              </span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-white border-l border-slate-100 p-0">
                <SheetHeader className="p-6 border-b border-slate-50">
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-3">
                      <VolosistLogo />
                      <span className="text-xl font-bold tracking-tight text-slate-900">
                        {logo.title}
                      </span>
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-6 flex flex-col gap-8">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-6"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  
                  <div className="grid grid-cols-2 gap-y-4 border-t border-slate-100 pt-8">
                    {mobileExtraLinks.map((link, idx) => (
                      <a
                        key={idx}
                        className="text-sm font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                        href={link.url}
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="w-full font-bold uppercase tracking-widest h-12"
                      onClick={() => {
                        onLoginClick?.();
                        // Close handled by radix if needed or just trigger
                      }}
                    >
                      {auth.login.text}
                    </Button>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest h-12"
                      onClick={onSignupClick}
                    >
                      {auth.signup.text}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "bg-transparent font-bold text-slate-600 hover:text-blue-600 data-[state=open]:text-blue-600")}>
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-[400px] p-4 bg-white rounded-xl shadow-xl border border-slate-50 grid gap-1">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <a
                    className="flex select-none gap-4 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-blue-50/50 group"
                    href={subItem.url}
                  >
                    <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-blue-100/50 transition-colors">
                      {subItem.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 mb-1">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-xs leading-relaxed text-slate-500 font-medium">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </a>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild>
        <a
          className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-blue-600"
          href={item.url}
        >
          {item.title}
        </a>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-bold text-slate-900 text-lg hover:no-underline hover:text-blue-600 transition-colors">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-4 flex flex-col gap-4 pl-2 border-l-2 border-slate-100">
          {item.items.map((subItem) => (
            <a
              key={subItem.title}
              className="flex select-none gap-4 rounded-lg p-2 leading-none outline-none transition-colors hover:bg-slate-50"
              href={subItem.url}
            >
              <div className="mt-0.5">{subItem.icon}</div>
              <div>
                <div className="text-sm font-bold text-slate-900">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-xs leading-snug text-slate-500 mt-1 font-medium">
                    {subItem.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
      {item.title}
    </a>
  );
};

export { Navbar1 };
