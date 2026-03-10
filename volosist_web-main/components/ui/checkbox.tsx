
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const checkboxVariants = cva(
  "peer shrink-0 rounded-sm border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600 bg-white transition-colors",
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

// Fixed: Use type instead of interface to properly intersect VariantProps and Root component props
export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants> & {
    label?: string;
    description?: string;
    error?: string;
  };

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, label, description, error, id, ...props }, ref) => {
  const checkboxId = id || React.useId();
  const iconSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;

  const checkPath = "M3 6l3 3 6-6";
  const minusPath = "M3 6h8";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(checkboxVariants({ size }), className)}
          {...props}
        >
          <CheckboxPrimitive.Indicator asChild>
            <div className="flex items-center justify-center text-current">
              <AnimatePresence mode="wait">
                {props.checked === "indeterminate" ? (
                  <motion.svg
                    key="indeterminate"
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 14 14"
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.path
                      d={minusPath}
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="check"
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 14 14"
                    fill="none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.path
                      d={checkPath}
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-500">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 ml-6">{error}</p>}
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
