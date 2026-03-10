import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import { supabase } from './lib/supabase';
import { HeroGeometric } from './components/ui/shape-landing-hero';
import { Navbar1 } from './components/ui/shadcnblocks-com-navbar1';
import { Footer7 } from './components/ui/footer-7';
import { CTA } from './components/ui/call-to-action';
import { SignInPage } from './components/ui/travel-connect-signin-1';
import { SignUpPage } from './components/ui/sign-up-block';
import { ExploreServices } from './components/ui/explore-services';
import { CoreServicesHero } from './components/ui/core-services-hero';
import { FixedBackground } from './components/ui/fixed-background';
import { Feature108 } from './components/ui/shadcnblocks-com-feature108';
import { Philosophy } from './components/ui/philosophy';
import { Casestudy5 } from './components/ui/casestudy-5';
import { About3 } from './components/ui/about-3';
import { PricingSection, Plan } from './components/ui/pricing';
import { FAQ } from './components/ui/faq';
import { SolutionPage } from './components/pages/solution-page';
import { ResourcePage } from './components/pages/resource-page';
import { InfoPage } from './components/pages/info-page';
import { ContactPage } from './components/pages/contact-page';
import { DashboardPage } from './components/pages/dashboard-page';
import { RefundRequestPage } from './components/pages/refund-request-page.tsx';
import { ServicesPage } from './components/pages/services-page';
import { CompanyPage } from './components/pages/company-page';
import { AdminSignIn } from './components/pages/admin-signin';
import { AdminDashboard } from './components/pages/admin-dashboard';
import { CheckoutPage } from './components/pages/checkout-page';
import { PaymentStatusPage } from './components/pages/payment-return-page';
import { TeamInviteAcceptPage } from './components/pages/team-invite-accept-page';

const WHATSAPP_BOOKING_URL = 'https://wa.me/919769789769?text=Hi%20Volosist%2C%20I%20want%20to%20book%20a%20consultancy%20call.';

const COMPANY_PROCESS_STEPS = [
  {
    id: "audit",
    number: "01",
    title: "Deep Audit",
    content: "We perform an exhaustive analysis of your current technical stack, data pipelines, and manual workflows to identify the highest-impact automation targets with guaranteed ROI."
  },
  {
    id: "architecture",
    number: "02",
    title: "Neural Architecture",
    content: "Designing custom agent-to-agent communication protocols and choosing specific model weights that align perfectly with your enterprise security and performance standards."
  },
  {
    id: "integration",
    number: "03",
    title: "Seamless Integration",
    content: "Our engineers deploy low-latency inference nodes into your existing cloud environment, ensuring zero downtime and immediate accessibility for your global team."
  },
  {
    id: "optimization",
    number: "04",
    title: "Recursive Growth",
    content: "Post-deployment, we use real-time performance telemetry to recursively fine-tune your systems, ensuring your AI scales as your business complexity grows."
  }
];


const PLANS: Plan[] = [
  {
    name: 'Basic',
    info: 'Core automation for small teams',
    price: {
      monthly: 490,
      yearly: 4900,
    },
    features: [
      { text: 'Single Agent Workflow', tooltip: 'One autonomous agent for a specific task' },
      { text: 'Basic Lead Capture', tooltip: 'Automated collection from one source' },
      { text: 'Standard Email Support', tooltip: '24-hour response time' },
      { text: 'Monthly Performance Audit', tooltip: 'Detailed report on ROI' },
      { text: 'Infrastructure Setup', tooltip: 'Cloud environment initialization' },
    ],
    btn: {
      text: 'Get Started',
      href: '/signup',
    },
  },
  {
    name: 'Pro',
    info: 'Advanced AI systems for growth',
    highlighted: true,
    price: {
      monthly: 1490,
      yearly: 14900,
    },
    features: [
      { text: 'Multi-Agent Swarms', tooltip: 'Up to 5 agents working in sync' },
      { text: 'Inbound Voice Routing', tooltip: 'AI-handled incoming calls' },
      { text: 'CRM Real-time Sync', tooltip: 'Instant update to your sales pipe' },
      { text: 'Priority Slack Support', tooltip: 'Direct access to our engineers' },
      { text: 'Recursive Fine-tuning', tooltip: 'Weekly model weight optimizations' },
      { text: 'Omnichannel Lead Gen', tooltip: 'Email, LinkedIn, and Web capture' },
    ],
    btn: {
      text: 'Select Pro',
      href: '/signup',
    },
  },
  {
    name: 'Business',
    info: 'Enterprise-grade orchestration',
    price: {
      monthly: 4990,
      yearly: 49900,
    },
    features: [
      { text: 'Unlimited Integration Nodes', tooltip: 'Scale across your entire infra' },
      { text: 'Custom LLM Training', tooltip: 'Fine-tuned on your private data' },
      { text: 'Outbound AI Calling', tooltip: 'Proactive sales & follow-up agents' },
      { text: 'Dedicated Solutions Engineer', tooltip: 'Your personal AI architect' },
      { text: 'Advanced Security Layer', tooltip: 'SOC2 compliant data handling' },
      { text: 'White-label Dashboard', tooltip: 'Custom branding for your portal' },
    ],
    btn: {
      text: 'Go Business',
      href: '/signup',
    },
  },
  {
    name: 'Enterprise',
    info: 'Bespoke Neural Architectures',
    enterprise: true,
    price: {
      monthly: 'Custom',
      yearly: 'Bespoke',
    },
    features: [
      { text: 'Full Source Code Access', tooltip: 'Complete ownership of your AI IP' },
      { text: 'On-Premise Deployment', tooltip: 'Run models on your own servers' },
      { text: '24/7 Incident Response', tooltip: '< 15min response time SLA' },
      { text: 'Neural Strategy Board', tooltip: 'Quarterly architecture reviews' },
      { text: 'Global Scaling Support', tooltip: 'Multi-region low-latency nodes' },
      { text: 'Custom Legal Framework', tooltip: 'Tailored enterprise agreements' },
    ],
    btn: {
      text: 'Contact Sales',
      href: '/contact',
    },
  },
];


// Home Page Component
function HomePage() {
  const navigate = useNavigate();

  const handleBookConsultation = () => {
    window.open(WHATSAPP_BOOKING_URL, '_blank');
  };

  return (
    <>
      <FixedBackground />
      <main className="relative z-10 pt-20">
        <HeroGeometric
          onBookCall={handleBookConsultation}
          onViewSolutions={() => navigate('/services')}
        />
        <CoreServicesHero />
        <div id="service-showcase">
          <ExploreServices />
        </div>
        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent mx-auto max-w-4xl" />
        <Feature108 heading="Advanced Service Matrix" badge="ENGINEERING" />
        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent mx-auto max-w-4xl" />
        <Philosophy />
        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent mx-auto max-w-4xl" />
        <Casestudy5 />
        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent mx-auto max-w-4xl" />
        <PricingSection
          variant="home-light"
          plans={PLANS}
          heading="Plans for Every Team"
          description="Start free. Scale when ready. Cancel anytime."
        />
        <FAQ />
      </main>
    </>
  );
}

// Layout wrapper with navbar and footer
function Layout({
  children,
  user,
  onSignOut,
}: {
  children: React.ReactNode;
  user: any;
  onSignOut: () => Promise<void> | void;
}) {
  const navigate = useNavigate();

  const handleBookStrategyCall = () => {
    window.open(WHATSAPP_BOOKING_URL, '_blank');
  };

  const handleSignOut = async () => {
    await onSignOut();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans antialiased selection:bg-blue-500/10 selection:text-blue-900 overflow-x-hidden">
      <Navbar1
        onLoginClick={() => navigate('/signin')}
        onSignupClick={() => navigate('/signup')}
        onSignOut={handleSignOut}
        onNavigate={handleNavigate}
        user={user}
      />
      <main className="relative z-10">
        {children}
        <section id="cta-section">
          <CTA
            onSignUp={() => navigate('/signup')}
            onBookStrategyCall={handleBookStrategyCall}
          />
        </section>
      </main>
      <footer className="noise-bg opacity-5 pointer-events-none" />
      <Footer7 onNavigate={handleNavigate} onSignUpClick={() => navigate('/signup')} />
    </div>
  );
}

// Wrapper components for routes that need navigation
const resolveSafeRedirectPath = (value: string | null) => {
  const safeValue = String(value || '').trim();
  if (!safeValue) return null;
  if (!safeValue.startsWith('/')) return null;
  if (safeValue.startsWith('//')) return null;
  return safeValue;
};

function SignInPageWrapper({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectPath = resolveSafeRedirectPath(params.get('redirect'));

  if (currentUser) {
    return <Navigate to={redirectPath || '/dashboard'} replace />;
  }

  return (
    <SignInPage
      onSignInSuccess={() => navigate(redirectPath || '/dashboard')}
      onGoToSignUp={() => navigate(redirectPath ? `/signup?redirect=${encodeURIComponent(redirectPath)}` : '/signup')}
      onBack={() => navigate('/')}
    />
  );
}

function SignUpPageWrapper({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectPath = resolveSafeRedirectPath(params.get('redirect'));

  if (currentUser) {
    return <Navigate to={redirectPath || '/dashboard'} replace />;
  }

  return <SignUpPage onGoToSignIn={() => navigate(redirectPath ? `/signin?redirect=${encodeURIComponent(redirectPath)}` : '/signin')} />;
}

function DashboardPageWrapper({ user, onSignOut }: { user: any; onSignOut: () => Promise<void> | void }) {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await onSignOut();
    navigate('/');
  };

  return <DashboardPage user={user} onNavigate={(path) => navigate(path)} onSignOut={handleSignOut} />;
}

function TeamInviteAcceptRoute({ user }: { user: any }) {
  const location = useLocation();

  if (!user) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/signin?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <TeamInviteAcceptPage user={user} />;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleUserSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('[auth] sign-out failed', error);
    } finally {
      setUser(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="size-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout user={user} onSignOut={handleUserSignOut}><HomePage /></Layout>} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route path="/signin" element={<SignInPageWrapper currentUser={user} />} />
        <Route path="/signup" element={<SignUpPageWrapper currentUser={user} />} />

        {/* Dashboard (Protected) */}
        <Route
          path="/dashboard"
          element={user ? <DashboardPageWrapper user={user} onSignOut={handleUserSignOut} /> : <Navigate to="/signin" replace />}
        />

        <Route
          path="/dashboard/refund"
          element={user ? <RefundRequestPage user={user} /> : <Navigate to="/signin" replace />}
        />

        <Route
          path="/dashboard/team-invite"
          element={<TeamInviteAcceptRoute user={user} />}
        />

        {/* Solution Pages */}
        <Route path="/workflows" element={<Layout user={user} onSignOut={handleUserSignOut}><SolutionPage title="AI Workflows" subtitle="Neural Orchestration" description="Automate complex business logic with autonomous agent swarms." /></Layout>} />
        <Route path="/infrastructure" element={<Layout user={user} onSignOut={handleUserSignOut}><SolutionPage title="Infrastructure" subtitle="Cloud Core" description="Enterprise-grade data backbones built for high-throughput AI inference." /></Layout>} />
        <Route path="/audits" element={<Layout user={user} onSignOut={handleUserSignOut}><SolutionPage title="System Audits" subtitle="Performance Benchmarking" description="Deep-dive analysis into your current technology stack and AI readiness." /></Layout>} />

        {/* Services Page - All Services in One */}
        <Route path="/services" element={<Layout user={user} onSignOut={handleUserSignOut}><ServicesPage /></Layout>} />

        {/* Company Page - About, Process, Case Studies, Careers */}
        <Route path="/company" element={<Layout user={user} onSignOut={handleUserSignOut}><CompanyPage /></Layout>} />

        {/* Info Pages */}
        <Route path="/about" element={<Navigate to="/company" replace />} />
        <Route path="/privacy" element={<Layout user={user} onSignOut={handleUserSignOut}><InfoPage title="Privacy Policy" content="Your data integrity is our highest priority. We operate with zero-retention policies and enterprise-grade encryption standard across all systems." /></Layout>} />
        <Route path="/terms" element={<Layout user={user} onSignOut={handleUserSignOut}><InfoPage title="Terms & Conditions" content="Standard enterprise software agreement terms apply to all Volosist deployments and consultancy engagements." /></Layout>} />
        <Route path="/contact" element={<Layout user={user} onSignOut={handleUserSignOut}><ContactPage /></Layout>} />
        <Route path="/pricing" element={<Layout user={user} onSignOut={handleUserSignOut}><PricingSection isDetailed plans={PLANS} heading="Neural Architecture Plans" description="Select the precision layer required for your enterprise scale." /><FAQ /></Layout>} />

        {/* Blog & Resources */}
        <Route path="/blog" element={<Layout user={user} onSignOut={handleUserSignOut}><InfoPage title="Blog & Insights" content="Stay updated with the latest trends in AI automation, lead generation strategies, and business optimization techniques. Coming soon." /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminSignIn />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Checkout & Payment Routes */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-status" element={<PaymentStatusPage />} />

        {/* Redirect old service routes to main services page */}
        <Route path="/services/*" element={<Navigate to="/services" replace />} />
        <Route path="/careers" element={<Navigate to="/company" replace />} />
        <Route path="/cases" element={<Navigate to="/company" replace />} />
        <Route path="/help" element={<Layout user={user} onSignOut={handleUserSignOut}><InfoPage title="Help Center" content="Need assistance? Our support team is ready to help. Contact us at support@volosist.com for any questions." /></Layout>} />
        <Route path="/community" element={<Layout user={user} onSignOut={handleUserSignOut}><InfoPage title="Community" content="Join our growing community of automation enthusiasts and business owners. Coming soon." /></Layout>} />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
