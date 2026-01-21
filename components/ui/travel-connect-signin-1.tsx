
import React, { useRef, useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

const VolosistLogo = ({ className }: { className?: string }) => (
    <img 
        src="/favicon.ico" 
        alt="Volosist Logo" 
        className={cn("w-15 h-15 object-contain", className)} 
    />
);

const DotMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const updateSize = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      setDimensions({ width: canvas.width, height: canvas.height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const dots: { x: number; y: number; opacity: number }[] = [];
    const gap = 14;

    for (let x = 0; x < dimensions.width; x += gap) {
      for (let y = 0; y < dimensions.height; y += gap) {
        if (Math.random() > 0.6) {
          dots.push({ x, y, opacity: Math.random() * 0.4 + 0.1 });
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${dot.opacity})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />;
};

export function SignInPage({ onSignInSuccess, onGoToSignUp, onBack }: { onSignInSuccess: () => void, onGoToSignUp: () => void, onBack?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      onSignInSuccess();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>

        <div className="w-full overflow-hidden rounded-3xl flex bg-white shadow-2xl border border-slate-100 min-h-[600px]">
          {/* Left Section - Dot Map */}
          <div className="hidden lg:block w-1/2 relative bg-slate-50 border-r border-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />
            <DotMap />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <VolosistLogo className="mb-8" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">
                Scale Your Intelligence
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-slate-500 max-w-sm font-medium leading-relaxed">
                Access your global automation dashboard and connect with enterprise ecosystems worldwide.
              </motion.p>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                <p className="text-slate-500 font-medium">Please enter your credentials to continue</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    required 
                    leftIcon={<Mail />} 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                    <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot?</a>
                  </div>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    leftIcon={<Lock />} 
                  />
                </div>

                <Button type="submit" loading={loading} className="w-full h-12 text-sm font-bold tracking-widest uppercase">
                  Sign In
                </Button>
              </form>

              <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  Don't have an account?{" "}
                  <button onClick={onGoToSignUp} className="text-blue-600 font-bold hover:underline">
                    Create Account
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
