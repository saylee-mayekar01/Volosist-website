
"use client";

import { motion, Variants } from "framer-motion";
import { Circle, MoveRight, PhoneCall, ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-black/[0.05]", 
                        "shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

// Fixed: Added onAction prop to match App.tsx usage
function HeroGeometric({ onAction }: { onAction?: () => void }) {
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

    // Fix: Cast ease to a tuple [number, number, number, number] to match Framer Motion expectations
    const fadeUpVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
            },
        }),
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 30, 0],
                        x: [0, 50, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -top-[20%] -left-[15%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-blue-200/40 via-indigo-200/40 to-cyan-200/40 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -30, 0],
                        x: [0, -30, 0],
                    }}
                    transition={{
                        duration: 22,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute top-[5%] -right-[25%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-bl from-purple-200/40 via-fuchsia-200/40 to-pink-200/40 blur-[120px]"
                />
            </div>

            <div className="absolute inset-0 overflow-hidden">
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-indigo-500/[0.15]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                />
                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-rose-500/[0.15]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                />
                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-violet-500/[0.15]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 pt-20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center justify-center mb-8"
                    >
                         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-indigo-100 shadow-sm text-indigo-700 text-sm font-semibold transition-transform hover:scale-105 cursor-pointer">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                            </span>
                            Future of Work is Here
                        </div>
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                         <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gray-900 leading-[1.1]">
                            Automate your <br />
                             <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.2em]">
                                {titles.map((title, index) => (
                                <motion.span
                                    key={index}
                                    className="absolute font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 pb-2"
                                    initial={{ opacity: 0, y: "100%" }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                    animate={
                                    titleNumber === index
                                        ? {
                                            y: 0,
                                            opacity: 1,
                                        }
                                        : {
                                            y: titleNumber > index ? "-100%" : "100%",
                                            opacity: 0,
                                        }
                                    }
                                >
                                    {title}
                                </motion.span>
                                ))}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
                            We bridge the gap between complex AI technology and business value. 
                            Transform your operations with our enterprise-grade automation solutions.
                        </p>
                    </motion.div>

                    <motion.div
                        custom={3}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button onClick={onAction} size="lg" className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-indigo-200/50 transition-all hover:-translate-y-1">
                            Book Consultation <PhoneCall className="w-4 h-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2 rounded-full border-slate-200 text-slate-700 hover:bg-white/80 bg-white/40 backdrop-blur-sm transition-all hover:-translate-y-1">
                            View Solutions <ArrowRight className="w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
        </div>
    );
}

export { HeroGeometric }
