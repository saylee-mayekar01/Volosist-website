
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Menu, 
  User as UserIcon, 
  LogOut,
  Phone,
  Megaphone,
  Briefcase,
  TrendingUp,
  Building2,
  Users,
  FileText,
  HelpCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { Button } from "./button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
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
  view?: any;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onSignOut?: () => void;
  onNavigate: (view: any) => void;
  user?: any;
}

const VolosistLogo = ({ className }: { className?: string }) => (
  <img 
    src="/favicon.ico" 
    alt="Volosist Logo" 
    className={cn("w-11 h-11 object-contain", className)}
  />
);

const Navbar1 = ({
  onLoginClick,
  onSignupClick,
  onSignOut,
  onNavigate,
  user,
}: Navbar1Props) => {
  const navigate = useNavigate();

  // Convert view names to route paths
  const getRoute = (view: string): string => {
    const routeMap: Record<string, string> = {
      landing: '/',
      services: '/services',
      company: '/company',
      pricing: '/pricing',
      contact: '/contact',
      blog: '/blog',
      help: '/help',
      signin: '/signin',
      signup: '/signup',
      dashboard: '/dashboard',
    };
    return routeMap[view] || '/';
  };

  const handleNavigate = (view: string) => {
    navigate(getRoute(view));
  };

  const menu: MenuItem[] = [
    { title: "Services", view: "services" },
    { title: "Company", view: "company" },
    { title: "Pricing", view: "pricing" },
    { title: "Contact", view: "contact" },
  ];

  const renderMenuItem = (item: MenuItem) => {
    if (item.items) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "bg-transparent font-bold text-slate-600 hover:text-blue-600 data-[state=open]:text-blue-600 px-2")}>
            {item.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-[400px] p-4 bg-white rounded-xl shadow-xl border border-slate-50 grid gap-1">
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <NavigationMenuLink asChild>
                    <button
                      className="w-full text-left flex select-none gap-4 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-blue-50/50 group"
                      onClick={() => handleNavigate(subItem.view)}
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
                    </button>
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
          <button
            className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-blue-600"
            onClick={() => handleNavigate(item.view)}
          >
            {item.title}
          </button>
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
              <button
                key={subItem.title}
                className="flex text-left select-none gap-4 rounded-lg p-2 leading-none outline-none transition-colors hover:bg-slate-50"
                onClick={() => handleNavigate(subItem.view)}
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
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <button 
        key={item.title} 
        onClick={() => handleNavigate(item.view)} 
        className="text-left text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
      >
        {item.title}
      </button>
    );
  };

  return (
    <section className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 py-4">
      <div className="container mx-auto px-4 md:px-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-12">
            <button onClick={() => handleNavigate('landing')} className="group">
              <img 
                src="/Volosist Logo wo tagL.png" 
                alt="Volosist" 
                className="h-9 transition-transform group-hover:scale-105 duration-300"
              />
            </button>
            <div className="hidden lg:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-8 items-center">
            {user ? (
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:block text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Dashboard
                </button>
                <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-600">
                  <UserIcon size={16} className="text-blue-600" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <Button
                  onClick={() => navigate('/signup')}
                  size="sm"
                  className="rounded-lg bg-[#2563EB] hover:bg-blue-700 font-bold uppercase tracking-widest px-8 h-10"
                >
                  REGISTER
                </Button>
              </>
            )}
            
            <div className="block lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Menu className="size-5 text-slate-900" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-white border-l border-slate-100 p-0">
                    <SheetHeader className="p-6 border-b border-slate-50">
                      <SheetTitle>
                        <button onClick={() => handleNavigate('landing')} className="flex items-center gap-3">
                          <VolosistLogo />
                          <span className="text-xl font-bold tracking-tight text-slate-900">
                            VOLOSIST
                          </span>
                        </button>
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
                      
                      <div className="flex flex-col gap-4 pt-4">
                        {user ? (
                          <>
                            <Button
                              variant="outline"
                              className="w-full font-bold uppercase tracking-widest h-12 text-red-500 border-red-100 hover:bg-red-50"
                              onClick={onSignOut}
                            >
                              Sign Out
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              className="w-full font-bold uppercase tracking-widest h-12"
                              onClick={() => navigate('/signin')}
                            >
                              Sign In
                            </Button>
                            <Button
                              className="w-full bg-[#2563EB] hover:bg-blue-700 font-bold uppercase tracking-widest h-12"
                              onClick={() => navigate('/signup')}
                            >
                              REGISTER
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
            </div>
          </div>
        </nav>
      </div>
    </section>
  );
};

export { Navbar1 };
