
"use client";

import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import React, { useState } from "react";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

export function SignUpPage({ onGoToSignIn }: { onGoToSignIn: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError("You must accept the terms and conditions.");
      return;
    }
    
    setLoading(true);
    setError(null);

    // Auth temporarily bypassed for development
    // TODO: Restore Supabase auth when credentials are renewed
    // const { error: signUpError } = await supabase.auth.signUp({
    //   email: formData.email,
    //   password: formData.password,
    //   options: {
    //     data: {
    //       first_name: formData.firstName,
    //       last_name: formData.lastName,
    //     },
    //   },
    // });
    //
    // if (signUpError) {
    //   setError(signUpError.message);
    //   setLoading(false);
    // } else {
    //   setSuccess(true);
    //   setLoading(false);
    // }
    
    // Bypass - simulate success
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 500);
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-8 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600 mb-2">Success!</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Your Volosist workspace registration is complete. Please check your email for a verification link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <Button onClick={onGoToSignIn} className="w-full font-bold uppercase tracking-widest">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <button onClick={onGoToSignIn} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Sign In
        </button>
        
        <Card className="shadow-2xl border border-slate-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</CardTitle>
            <CardDescription className="font-medium">Scale your enterprise with Volosist Systems</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    leftIcon={<User />}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    leftIcon={<User />}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@company.com" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  leftIcon={<Mail />}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  leftIcon={<Lock />}
                />
              </div>

              <div className="pt-2">
                <Checkbox 
                  id="terms" 
                  label="Accept Terms & Conditions" 
                  description="Required for system access"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({...formData, acceptTerms: !!checked})}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button type="submit" loading={loading} className="w-full h-11 font-bold uppercase tracking-widest text-sm">
                Register Workspace
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
