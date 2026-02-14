import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { ServicesPage } from './components/pages/services-page';
import { CompanyPage } from './components/pages/company-page';
import { AdminSignIn } from './components/pages/admin-signin';
import { AdminDashboard } from './components/pages/admin-dashboard';

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
		info: 'For most individuals',
		price: {
			monthly: 490,
			yearly: Math.round(490 * 12 * (1 - 0.12)),
		},
		features: [
			{ text: 'Single System Audit' },
			{ text: 'Basic Workflow Analysis' },
			{ text: 'Standard Support' },
			{
				text: 'Infrastructure Report',
				tooltip: 'Detailed report on your current AI readiness',
			},
			{
				text: 'Community access',
				tooltip: 'Get answers your questions on our community forum',
			},
			{
				text: 'Strategic suggestions',
				tooltip: 'Get up to 10 identified growth opportunities',
			},
		],
		btn: {
			text: 'Start Free Trial',
			href: '#',
		},
	},
	{
		highlighted: true,
		name: 'Pro',
		info: 'For small businesses',
		price: {
			monthly: 1490,
			yearly: Math.round(1490 * 12 * (1 - 0.12)),
		},
		features: [
			{ text: 'Active Implementation Nodes' },
			{ text: 'Autonomous Agent Swarms' },
			{ text: 'Custom LLM fine-tuning' },
			{
				text: 'Enterprise security layers',
				tooltip: 'Full VPC deployment with isolated data',
			},
			{ text: 'SEO automation tools' },
			{ text: 'Priority support', tooltip: 'Get 24/7 dedicated slack support' },
			{
				text: 'Recursive optimization',
				tooltip: 'Scheduled fine-tuning for maximum model longevity',
			},
		],
		btn: {
			text: 'Get started',
			href: '#',
		},
	},
	{
		name: 'Business',
		info: 'For large organizations',
		price: {
			monthly: 4990,
			yearly: Math.round(4990 * 12 * (1 - 0.15)),
		},
		features: [
			{ text: 'Unlimited Integration Nodes' },
			{ text: 'Full Neural Orchestration' },
			{ text: 'White-label capabilities' },
			{ text: 'Direct Database training' },
			{
				text: 'Custom Security Audits',
				tooltip: 'Advanced military-grade compliance reports',
			},
			{ text: 'Solutions Engineer', tooltip: 'Dedicated engineer on retainer' },
			{
				text: 'Real-time telemetry',
				tooltip: 'Live dashboard of all AI agent performance',
			},
		],
		btn: {
			text: 'Contact team',
			href: '#',
		},
	},
];


// Home Page Component
function HomePage() {
  const navigate = useNavigate();
  
  return (
    <>
      <FixedBackground />
      <main className="relative z-10 pt-20">
        <HeroGeometric onAction={() => navigate('/contact')} />
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
          plans={PLANS}
          heading="Plans that Scale with You"
          description="Whether you're just starting out or growing fast, our flexible pricing has you covered — with no hidden costs."
        />
        <FAQ />
      </main>
    </>
  );
}

// Layout wrapper with navbar and footer
function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Auth temporarily bypassed for development
  // TODO: Restore Supabase auth when credentials are renewed
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setUser(session?.user ?? null);
  //   });
  //
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null);
  //   });
  //
  //   return () => subscription?.unsubscribe();
  // }, []);

  const handleSignOut = async () => {
    // Auth bypassed - just navigate home
    setUser(null);
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
          <CTA onSignUp={() => navigate('/signup')} />
        </section>
      </main>
      <footer className="noise-bg opacity-5 pointer-events-none" />
      <Footer7 onNavigate={handleNavigate} onSignUpClick={() => navigate('/signup')} />
    </div>
  );
}

// Wrapper components for routes that need navigation
function SignInPageWrapper() {
  const navigate = useNavigate();
  return <SignInPage onSignInSuccess={() => navigate('/dashboard')} onGoToSignUp={() => navigate('/signup')} onBack={() => navigate('/')} />;
}

function SignUpPageWrapper() {
  const navigate = useNavigate();
  return <SignUpPage onGoToSignIn={() => navigate('/signin')} />;
}

function DashboardPageWrapper({ user }: { user: any }) {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    // Auth temporarily bypassed - just navigate home
    navigate('/');
  };
  return <DashboardPage user={user} onNavigate={(path) => navigate(path)} onSignOut={handleSignOut} />;
}

export default function App() {
  const [user, setUser] = useState<any>(null);

  // Auth temporarily bypassed for development
  // TODO: Restore Supabase auth when credentials are renewed
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setUser(session?.user ?? null);
  //   });
  //
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null);
  //   });
  //
  //   return () => subscription?.unsubscribe();
  // }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        <Route path="/signin" element={<SignInPageWrapper />} />
        <Route path="/signup" element={<SignUpPageWrapper />} />
        
        {/* Dashboard - Auth temporarily bypassed for development */}
        <Route path="/dashboard" element={<DashboardPageWrapper user={{ email: 'dev@volosist.com', id: 'dev-user' }} />} />
        
        {/* Solution Pages */}
        <Route path="/workflows" element={<Layout><SolutionPage title="AI Workflows" subtitle="Neural Orchestration" description="Automate complex business logic with autonomous agent swarms." /></Layout>} />
        <Route path="/infrastructure" element={<Layout><SolutionPage title="Infrastructure" subtitle="Cloud Core" description="Enterprise-grade data backbones built for high-throughput AI inference." /></Layout>} />
        <Route path="/audits" element={<Layout><SolutionPage title="System Audits" subtitle="Performance Benchmarking" description="Deep-dive analysis into your current technology stack and AI readiness." /></Layout>} />
        
        {/* Services Page - All Services in One */}
        <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
        
        {/* Company Page - About, Process, Case Studies, Careers */}
        <Route path="/company" element={<Layout><CompanyPage /></Layout>} />
        
        {/* Info Pages */}
        <Route path="/about" element={<Navigate to="/company" replace />} />
        <Route path="/privacy" element={<Layout><InfoPage title="Privacy Policy" content="Your data integrity is our highest priority. We operate with zero-retention policies and enterprise-grade encryption standard across all systems." /></Layout>} />
        <Route path="/terms" element={<Layout><InfoPage title="Terms & Conditions" content="Standard enterprise software agreement terms apply to all Volosist deployments and consultancy engagements." /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/pricing" element={<Layout><PricingSection plans={PLANS} heading="Plans that Scale with You" description="Whether you're just starting out or growing fast, our flexible pricing has you covered — with no hidden costs." /><FAQ /></Layout>} />
        
        {/* Blog & Resources */}
        <Route path="/blog" element={<Layout><InfoPage title="Blog & Insights" content="Stay updated with the latest trends in AI automation, lead generation strategies, and business optimization techniques. Coming soon." /></Layout>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminSignIn />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Redirect old service routes to main services page */}
        <Route path="/services/*" element={<Navigate to="/services" replace />} />
        <Route path="/careers" element={<Navigate to="/company" replace />} />
        <Route path="/cases" element={<Navigate to="/company" replace />} />
        <Route path="/help" element={<Layout><InfoPage title="Help Center" content="Need assistance? Our support team is ready to help. Contact us at support@volosist.com for any questions." /></Layout>} />
        <Route path="/community" element={<Layout><InfoPage title="Community" content="Join our growing community of automation enthusiasts and business owners. Coming soon." /></Layout>} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
