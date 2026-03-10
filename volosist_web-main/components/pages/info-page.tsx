
import React from 'react';
import { motion } from 'framer-motion';

interface InfoPageProps {
  title: string;
  content: string;
}

export function InfoPage({ title, content }: InfoPageProps) {
  return (
    <div className="min-h-[70vh] py-32 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-12 uppercase">
            {title}
          </h1>
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-8">
              {content}
            </p>
            <p className="text-slate-400 font-medium leading-relaxed">
              At Volosist Systems, we are redefining the boundary between human intent and autonomous execution. Our mission is to democratize complex AI orchestration for the world's most innovative organizations.
            </p>
            <div className="mt-20 pt-12 border-t border-slate-100">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { l: "Founded", v: "2025" },
                    { l: "Nodes", v: "140+" },
                    { l: "Clients", v: "Global" },
                    { l: "Status", v: "Active" }
                  ].map((s, i) => (
                    <div key={i}>
                       <div className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">{s.l}</div>
                       <div className="text-lg font-bold text-slate-900">{s.v}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
