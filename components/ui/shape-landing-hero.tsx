
"use client";

import { motion, Variants } from "framer-motion";
import { PhoneCall, ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "./button";

export function HeroGeometric({
    onBookCall,
    onViewSolutions,
}: {
    onBookCall?: () => void;
    onViewSolutions?: () => void;
}) {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["Workflows", "Intelligence", "Operations", "Systems", "Future"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setTitleNumber((prev) => (prev + 1) % titles.length);
        }, 3000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    const fadeUpVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.2 + i * 0.1,
                ease: [0.21, 0.45, 0.32, 1],
            },
        }),
    };

    return (
        <div className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden">
            <div className="relative z-10 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-8">
                         <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#2960ea]/10 text-[#2960ea] text-[10px] font-black tracking-widest shadow-sm uppercase">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ecc33c] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ecc33c]"></span>
                            </span>
                            Future of Work
                        </div>
                    </motion.div>

                    {/* Headline - Using solid #2960EA for "Automate your" */}
                    <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
                         <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.1] uppercase">
                            <span className="text-[#2960ea]">Automate your</span> <br />
                             <span className="relative inline-flex h-[1.1em] w-full items-center justify-center overflow-hidden">
                                {titles.map((title, index) => (
                                <motion.span
                                    key={index}
                                    className="absolute font-black text-[#ecc33c] pb-2"
                                    initial={{ opacity: 0, y: "100%" }}
                                    animate={
                                    titleNumber === index
                                        ? { y: 0, opacity: 1 }
                                        : { y: titleNumber > index ? "-100%" : "100%", opacity: 0 }
                                    }
                                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                                >
                                    {title}
                                </motion.span>
                                ))}
                            </span>
                        </h1>
                    </motion.div>

                    {/* Description - Balanced Text Size using specific Dark Blue hex #0F223E */}
                    <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
                        <p className="text-sm md:text-base text-[#0F223E] max-w-lg mx-auto leading-relaxed mb-12 font-semibold">
                            Volosist bridges the gap between high-level AI research and actionable business intelligence. 
                            Deploy precision-engineered automation to lead your industry.
                        </p>
                    </motion.div>

                    {/* Actions - Using Brand Blue Color for Buttons */}
                    <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                            onClick={onBookCall} 
                            size="lg" 
                            className="rounded-full bg-[#2960ea] hover:bg-[#1a4dc9] text-white font-black uppercase tracking-widest text-[9px] px-10 h-14 shadow-xl shadow-[#2960ea]/10 gap-3 transition-all hover:-translate-y-0.5"
                        >
                            Book Consultation <PhoneCall className="size-4" />
                        </Button>
                        <Button 
                            onClick={onViewSolutions}
                            size="lg" 
                            variant="outline" 
                            className="rounded-full font-black uppercase tracking-widest text-[9px] px-10 h-14 border-[#2960ea]/30 text-[#0F223E] bg-white/50 backdrop-blur-md gap-3 transition-all hover:bg-white hover:-translate-y-0.5"
                        >
                            View Solutions <ArrowRight className="size-4" />
                        </Button>
                    </motion.div>
                </div>
            </div>

        </div>
    );
}
