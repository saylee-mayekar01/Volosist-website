import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, ArrowRight } from "lucide-react";
import { Button } from "./button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Intelligence", "Workflows", "Growth", "Future", "Sales", "Support"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="relative w-full overflow-hidden pt-32 pb-20">
      {/* Gradient Background Element */}
      <div 
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-transparent opacity-70 -z-10"
      />

      <div className="container mx-auto px-6">
        <div className="flex gap-8 py-10 lg:py-20 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 font-semibold shadow-sm px-4 h-9">
              <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Future of Work is Here <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col items-center">
            <h1 className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-bold text-gray-900 leading-[1.1]">
              <span className="text-gray-900">Automate your</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 min-h-[80px] sm:min-h-[100px]">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-xl leading-relaxed tracking-tight text-gray-500 max-w-2xl text-center">
              We bridge the gap between complex AI technology and business value. 
              Transform your operations with our enterprise-grade automation solutions.
            </p>
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <Button size="lg" className="gap-2 rounded-full bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200">
              Book Consultation <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50">
              View Solutions <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };