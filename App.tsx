import React, { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { HeroGeometric } from './components/ui/shape-landing-hero';
import { Navbar1 } from './components/ui/shadcnblocks-com-navbar1';
import { Footer7 } from './components/ui/footer-7';
import { CTA } from './components/ui/call-to-action';
import { SignInPage } from './components/ui/travel-connect-signin-1';
import { SignUpPage } from './components/ui/sign-up-block';
import { ServiceShowcase } from './components/ui/service-showcase';
import { Feature108 } from './components/ui/shadcnblocks-com-feature108';
import { Philosophy } from './components/ui/philosophy';

/**
 * App Component
 * 
 * Volosist AI Consultancy.
 * Layout: Navbar -> Hero -> Service Showcase -> Detailed Features -> Philosophy -> CTA -> Footer
 * Includes navigation logic for Sign In and Register views.
 */
export default function App() {
    const [view, setView] = useState<'landing' | 'signin' | 'signup'>('landing');

    // Initialize smooth scrolling only on landing page
    useEffect(() => {
        if (view !== 'landing') return;

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, [view]);

    // View Routing
    if (view === 'signin') {
      return (
        <SignInPage 
          onSignIn={() => setView('landing')} 
          onGoToSignUp={() => setView('signup')} 
          onBack={() => setView('landing')} 
        />
      );
    }

    if (view === 'signup') {
      return (
        <SignUpPage 
          onGoToSignIn={() => setView('signin')} 
        />
      );
    }

    return (
        <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-blue-500/30 selection:text-blue-900 overflow-x-hidden">
            {/* Background Grid Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]" 
                 style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '30px 30px' }} 
                 aria-hidden="true" 
            />

            {/* Navigation Header */}
            <Navbar1 
              onLoginClick={() => setView('signin')} 
              onSignupClick={() => setView('signup')}
            />

            <main className="relative z-10">
                {/* Visual Entry Section */}
                <HeroGeometric onAction={() => setView('signup')} />

                {/* Interactive Service Showcase - Expand on Hover */}
                <ServiceShowcase />

                {/* Detailed Features & Services Tabs */}
                <Feature108 />

                {/* Philosophy & Process Steps Section */}
                <Philosophy />
                
                {/* Closing Call to Action */}
                <section id="cta-section">
                  <CTA onSignUp={() => setView('signup')} />
                </section>
            </main>
            
            {/* Global Footer */}
            <Footer7 onSignUpClick={() => setView('signup')} />
        </div>
    );
}