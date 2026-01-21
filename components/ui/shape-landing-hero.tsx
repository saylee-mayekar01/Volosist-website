
"use client";

import { motion, Variants } from "framer-motion";
import { PhoneCall, ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-[#ecc33c]/[0.15] to-white/[0.1]",
    borderColor = "border-[#ecc33c]/20",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
    borderColor?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -100, rotate: rotate - 10 }}
            animate={{ opacity: 1, y: 0, rotate: rotate }}
            transition={{
                duration: 2,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{ width, height }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[10px] border",
                        borderColor,
                        // Added blueish glow shadow along with original subtle yellow shadow
                        "shadow-[0_0_40px_rgba(236,195,60,0.05),0_0_60px_rgba(41,96,234,0.12)]",
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

export function HeroGeometric({ onAction }: { onAction?: () => void }) {
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
        <div className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[#fefbfa]">
            {/* Background elements with Sky Blue and Bright Yellow tones */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Subtle Mesh Gradients using Palette Blue */}
                <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[80%] bg-[#2960ea]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#8d9cbe]/10 blur-[100px] rounded-full" />
                
                {/* Yellow Gradient Capsules with White Mix and Blue Glows */}
                <ElegantShape
                    delay={0.2}
                    width={800}
                    height={200}
                    rotate={12}
                    className="left-[-10%] top-[15%]"
                />
                <ElegantShape
                    delay={0.4}
                    width={600}
                    height={160}
                    rotate={-15}
                    gradient="from-white/[0.2] to-[#ecc33c]/[0.1]"
                    className="right-[-5%] top-[30%]"
                />
                <ElegantShape
                    delay={0.6}
                    width={500}
                    height={140}
                    rotate={20}
                    className="left-[5%] bottom-[10%]"
                />
            </div>

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
                            onClick={onAction} 
                            size="lg" 
                            className="rounded-full bg-[#2960ea] hover:bg-[#1a4dc9] text-white font-black uppercase tracking-widest text-[9px] px-10 h-14 shadow-xl shadow-[#2960ea]/10 gap-3 transition-all hover:-translate-y-0.5"
                        >
                            Book Consultation <PhoneCall className="size-4" />
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="rounded-full font-black uppercase tracking-widest text-[9px] px-10 h-14 border-[#2960ea]/30 text-[#0F223E] bg-white/50 backdrop-blur-md gap-3 transition-all hover:bg-white hover:-translate-y-0.5"
                        >
                            View Solutions <ArrowRight className="size-4" />
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Subtle Gradient Overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fefbfa] to-transparent pointer-events-none" />
        </div>
    );
}
