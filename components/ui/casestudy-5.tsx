import { MoveRight } from "lucide-react";
import React from "react";

interface CasestudyItem {
  logo: string;
  company: string;
  tags: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
}

interface Casestudy5Props {
  featuredCasestudy?: CasestudyItem;
  casestudies?: CasestudyItem[];
}

const defaultFeaturedCasestudy: CasestudyItem = {
  logo: "https://shadcnblocks.com/images/block/block-1.svg",
  company: "Acme",
  tags: "ARTIFICIAL INTELLIGENCE / ENTERPRISE SOLUTIONS",
  title: "Workflow Automation for the Digital Age.",
  subtitle: "How to automate your workflow with AI.",
  image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200",
  link: "#",
};

const defaultCasestudies: CasestudyItem[] = [
  {
    logo: "https://shadcnblocks.com/images/block/block-2.svg",
    company: "Super",
    tags: "DATA MIGRATION / SOFTWARE SOLUTIONS",
    title: "Enhance data migration with AI.",
    subtitle: "A data migration platform toward a data-driven future.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    link: "#",
  },
  {
    logo: "https://shadcnblocks.com/images/block/block-3.svg",
    company: "Advent",
    tags: "ARTIFICIAL INTELLIGENCE / DATA SOLUTIONS",
    title: "Strategic AI for a future-proof business.",
    subtitle: "Mastering AI for more efficient operations.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    link: "#",
  },
];

export const Casestudy5 = ({
  featuredCasestudy = defaultFeaturedCasestudy,
  casestudies = defaultCasestudies,
}: Casestudy5Props) => {
  return (
    <section className="py-16 lg:py-20 relative">
      <div className="container mx-auto px-6">
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <a
            href={featuredCasestudy.link || "#"}
            className="group grid gap-4 overflow-hidden px-6 transition-colors duration-500 ease-out hover:bg-slate-50/50 lg:grid-cols-2 xl:px-28"
          >
            <div className="flex flex-col justify-between gap-4 pt-8 md:pt-16 lg:pb-16">
              <div className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                <img src={featuredCasestudy.logo} alt="logo" className="h-9 opacity-80" />
                {featuredCasestudy.company}
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {featuredCasestudy.tags}
                </span>
                <h2 className="mt-4 mb-5 text-2xl font-bold text-slate-900 sm:text-4xl sm:leading-tight">
                  {featuredCasestudy.title}
                  <span className="font-medium text-slate-400 transition-colors duration-500 ease-out group-hover:text-slate-600">
                    {" "}
                    {featuredCasestudy.subtitle}
                  </span>
                </h2>
                <div className="flex items-center gap-2 font-bold text-blue-600 uppercase tracking-widest text-[10px]">
                  Read case study
                  <MoveRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1" />
                </div>
              </div>
            </div>
            <div className="relative isolate py-16">
              <div className="relative isolate h-full border border-slate-200 bg-white p-2 rounded-xl">
                <div className="h-full overflow-hidden rounded-lg">
                  <img
                    src={featuredCasestudy.image}
                    alt="placeholder"
                    className="aspect-[14/9] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </a>
          <div className="flex border-t border-slate-200">
            <div className="hidden w-28 shrink-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:10px_10px] opacity-20 xl:block"></div>
            <div className="grid lg:grid-cols-2 w-full">
              {casestudies.map((item, idx) => (
                <a
                  key={item.company}
                  href={item.link || "#"}
                  className={`group flex flex-col justify-between gap-12 border-slate-200 bg-white px-6 py-8 transition-colors duration-500 ease-out hover:bg-slate-50/50 md:py-16 lg:pb-16 xl:gap-16 ${
                    idx === 0
                      ? "xl:border-l xl:pl-8"
                      : "border-t lg:border-t-0 lg:border-l xl:border-r xl:pl-8"
                  }`}
                >
                  <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                    <img src={item.logo} alt="logo" className="h-9 opacity-80" />
                    {item.company}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      {item.tags}
                    </span>
                    <h2 className="mt-4 mb-5 text-2xl font-bold text-slate-900 sm:text-3xl sm:leading-tight">
                      {item.title}
                      <span className="font-medium text-slate-400 transition-colors duration-500 ease-out group-hover:text-slate-600">
                        {" "}
                        {item.subtitle}
                      </span>
                    </h2>
                    <div className="flex items-center gap-2 font-bold text-blue-600 uppercase tracking-widest text-[10px]">
                      Read case study
                      <MoveRight className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="hidden w-28 shrink-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:10px_10px] opacity-20 xl:block"></div>
          </div>
        </div>
      </div>
    </section>
  );
};