"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

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
            "shadow-[0_0_40px_rgba(236,195,60,0.05),0_0_60px_rgba(41,96,234,0.12)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export function FixedBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#fefbfa]">
      {/* Subtle Mesh Gradients using Palette Blue */}
      <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[80%] bg-[#2960ea]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#8d9cbe]/10 blur-[100px] rounded-full" />
      <div className="absolute top-[40%] right-[-20%] w-[50%] h-[50%] bg-[#ecc33c]/5 blur-[100px] rounded-full" />

      {/* Yellow Gradient Capsules with White Mix and Blue Glows */}
      <ElegantShape
        delay={0.2}
        width={800}
        height={200}
        rotate={12}
        className="left-[-10%] top-[10%]"
      />
      <ElegantShape
        delay={0.4}
        width={600}
        height={160}
        rotate={-15}
        gradient="from-white/[0.2] to-[#ecc33c]/[0.1]"
        className="right-[-5%] top-[25%]"
      />
      <ElegantShape
        delay={0.6}
        width={500}
        height={140}
        rotate={20}
        className="left-[5%] top-[45%]"
      />
      <ElegantShape
        delay={0.8}
        width={450}
        height={120}
        rotate={-8}
        gradient="from-[#ecc33c]/[0.1] to-white/[0.15]"
        className="right-[10%] top-[60%]"
      />
      <ElegantShape
        delay={1.0}
        width={550}
        height={150}
        rotate={15}
        gradient="from-white/[0.15] to-[#ecc33c]/[0.08]"
        className="left-[-5%] top-[75%]"
      />
      <ElegantShape
        delay={1.2}
        width={400}
        height={100}
        rotate={-12}
        className="right-[-8%] top-[85%]"
      />
    </div>
  );
}
