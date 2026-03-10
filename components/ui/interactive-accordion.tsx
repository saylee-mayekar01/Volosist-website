
"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface AccordionItem {
  id: string
  number: string
  title: string
  content: string
}

interface UniqueAccordionProps {
  items: AccordionItem[];
}

export function UniqueAccordion({ items }: UniqueAccordionProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id || null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="w-full">
      <div className="space-y-0">
        {items.map((item, index) => {
          const isActive = activeId === item.id
          const isHovered = hoveredId === item.id

          return (
            <div key={item.id} className="border-b border-slate-100 last:border-0">
              <motion.button
                onClick={() => setActiveId(isActive ? null : item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="w-full group relative text-left"
                initial={false}
              >
                <div className="flex items-center gap-6 py-6 px-2">
                  {/* Number with animated circle */}
                  <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-600"
                      initial={false}
                      animate={{
                        scale: isActive ? 1 : isHovered ? 0.85 : 0,
                        opacity: isActive ? 1 : isHovered ? 0.1 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    />
                    <motion.span
                      className="relative z-10 text-[10px] font-bold tracking-widest"
                      animate={{
                        color: isActive ? "#ffffff" : "#94a3b8",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.number}
                    </motion.span>
                  </div>

                  {/* Title */}
                  <motion.h3
                    className="text-xl md:text-2xl font-black tracking-tighter uppercase"
                    animate={{
                      x: isActive || isHovered ? 4 : 0,
                      color: isActive
                        ? "#0f172a"
                        : isHovered
                          ? "#2563eb"
                          : "#94a3b8",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  >
                    {item.title}
                  </motion.h3>

                  {/* Animated indicator */}
                  <div className="ml-auto flex items-center gap-3">
                    <motion.div
                      className="flex items-center justify-center w-8 h-8"
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <motion.svg
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={isActive ? "text-blue-600" : "text-slate-300"}
                        animate={{
                          opacity: isActive || isHovered ? 1 : 0.4,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.path
                          d="M8 1V15M1 8H15"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          initial={false}
                        />
                      </motion.svg>
                    </motion.div>
                  </div>
                </div>

                {/* Animated underline focus effect */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-600 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: isActive ? 1 : isHovered ? 0.2 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              </motion.button>

              {/* Content */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transition: {
                        height: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2, delay: 0.1 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.1 },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      className="pl-16 pr-12 pb-8 text-sm text-slate-500 font-medium leading-relaxed max-w-xl"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: -10 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    >
                      {item.content}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
