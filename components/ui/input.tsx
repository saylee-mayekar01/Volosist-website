import * as React from "react"
import { cn } from "../../lib/utils"
import { Eye, EyeOff, X } from "lucide-react"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", leftIcon, rightIcon, error, clearable, onClear, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 [&_svg]:size-4">
            {leftIcon}
          </div>
        )}
        <input
          type={actualType}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
            error ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200",
            leftIcon && "pl-10",
            (rightIcon || isPassword) && "pr-10",
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          {clearable && value && (
            <button type="button" onClick={onClear} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          )}
          {isPassword && (
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {rightIcon && !isPassword && <div className="text-slate-400 [&_svg]:size-4">{rightIcon}</div>}
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }