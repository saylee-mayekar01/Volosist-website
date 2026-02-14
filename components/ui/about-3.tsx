
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface About3Props {
  onAction?: () => void;
  mainImage?: {
    src: string;
    alt: string;
  };
  secondaryImage?: {
    src: string;
    alt: string;
  };
  breakout?: {
    src?: string;
    alt?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  companiesTitle?: string;
  companies?: Array<{
    src: string;
    alt: string;
  }>;
}

const VolosistLogo = ({ className }: { className?: string }) => (
  <img
    src="/favicon.ico"
    alt="Volosist Logo"
    className={cn("w-11 h-11 object-contain", className)}
  />
);

const defaultCompanies = [
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-1.svg",
    alt: "Arc",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-2.svg",
    alt: "Descript",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-3.svg",
    alt: "Mercury",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-4.svg",
    alt: "Ramp",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-5.svg",
    alt: "Retool",
  },
  {
    src: "https://shadcnblocks.com/images/block/logos/company/fictional-company-logo-6.svg",
    alt: "Watershed",
  },
];

export const About3 = ({
  onAction,
  mainImage = {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    alt: "Neural Processing Core",
  },
  secondaryImage = {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    alt: "System Architecture",
  },
  breakout = {
    title: "Global Intelligence Frameworks",
    description:
      "Providing enterprises with the core infrastructure needed to optimize workflows and scale at exponential rates.",
    buttonText: "Our Process",
  },
  companiesTitle = "Powering industry leaders worldwide",
  companies = defaultCompanies,
}: About3Props = {}) => {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid gap-7 lg:grid-cols-3">
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="w-full h-[400px] lg:h-full max-h-[620px] rounded-3xl object-cover lg:col-span-2 shadow-xl shadow-slate-200/50"
          />
          <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
            <div className="flex flex-col justify-between gap-6 rounded-3xl bg-slate-50 border border-slate-100 p-8 md:w-1/2 lg:w-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
              <VolosistLogo className="h-10 w-10 relative z-10" />
              <div className="relative z-10">
                <p className="mb-2 text-xl font-bold text-slate-900">{breakout.title}</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{breakout.description}</p>
              </div>
              <Button onClick={onAction} variant="outline" className="mr-auto rounded-full font-bold uppercase tracking-widest text-[10px] h-9 px-6 relative z-10">
                {breakout.buttonText}
              </Button>
            </div>
            <img
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              className="grow basis-0 rounded-3xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto shadow-xl shadow-slate-200/50"
            />
          </div>
        </div>
        <div className="pt-24 pb-12">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{companiesTitle} </p>
          <div className="mt-10 flex flex-wrap justify-center gap-10 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {companies.map((company, idx) => (
              <div className="flex items-center gap-3" key={company.src + idx}>
                <img
                  src={company.src}
                  alt={company.alt}
                  className="h-6 w-auto md:h-8"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
