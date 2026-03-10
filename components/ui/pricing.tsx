
'use client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './tooltip';
import { cn } from '../../lib/utils';
import {
	Check,
	CheckCircle2,
	Star,
	Zap,
	ShieldCheck,
	Crown,
	ArrowRight,
	Info,
	Layers,
	Cpu,
	Shield,
	Zap as ZapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

export interface BenefitItem {
	icon: React.ReactNode;
	title: string;
	description: string;
}

export interface Plan {
	name: string;
	info: string;
	price: {
		monthly: number | string;
		yearly: number | string;
	};
	features: {
		text: string;
		tooltip?: string;
		included?: boolean;
	}[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
	enterprise?: boolean;
}

export type PricingSectionProps = React.HTMLAttributes<HTMLDivElement> & {
	plans: Plan[];
	heading: string;
	description?: string;
	isDetailed?: boolean;
	benefits?: BenefitItem[];
	variant?: 'default' | 'home-glow' | 'home-light';
};

const DEFAULT_BENEFITS: BenefitItem[] = [
	{
		icon: <Cpu className="size-5 text-blue-600" />,
		title: "Neural Orchestration",
		description: "Coordinate complex AI workflows across multiple agents with zero-latency synchronization."
	},
	{
		icon: <Layers className="size-5 text-blue-600" />,
		title: "Infrastructure as Code",
		description: "Your entire AI backbone is versioned and deployable across any VPC within minutes."
	},
	{
		icon: <Shield className="size-5 text-blue-600" />,
		title: "Isolated Data Layers",
		description: "Enterprise-grade security with physical and logical separation for every model training set."
	}
];

export function PricingSection({
	plans,
	heading,
	description,
	className,
	isDetailed = false,
	benefits = DEFAULT_BENEFITS,
	variant = 'default',
	...props
}: PricingSectionProps) {
	const [frequency, setFrequency] = React.useState<FREQUENCY>('monthly');

	if (variant === 'home-light') {
		return (
			<section className={cn('w-full py-20 px-4 relative overflow-hidden', className)} {...props}>
				<div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[560px] h-[260px] rounded-full bg-blue-200/25 blur-[80px] pointer-events-none" />
				<div className="absolute bottom-[-120px] right-0 w-[420px] h-[220px] rounded-full bg-violet-200/20 blur-[80px] pointer-events-none" />

				<div className="container mx-auto max-w-7xl relative z-10">
					<div className="text-center mb-10">
						<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
							{heading}
						</h2>
						{description && (
							<p className="mt-2 text-sm md:text-base text-slate-500 font-medium">
								{description}
							</p>
						)}
					</div>

					<div className="flex justify-center mb-10">
						<PricingFrequencyToggle frequency={frequency} setFrequency={setFrequency} />
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
						{plans.map((plan, idx) => (
							<HomeLightPricingCard key={plan.name} plan={plan} frequency={frequency} delay={idx * 0.06} />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (variant === 'home-glow') {
		return (
			<section
				className={cn('w-full py-20 px-4 relative overflow-hidden', className)}
				{...props}
			>
				<div className="container mx-auto max-w-7xl relative z-10">
					<div className="rounded-[2rem] border border-white/10 bg-[#070b1d] p-8 md:p-12 lg:p-14 shadow-[0_20px_80px_rgba(2,8,30,0.45)]">
						<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
							<div>
								<span className="inline-block rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-bold text-emerald-300 mb-6">
									Pricing
								</span>
								<h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">
									{heading}
								</h2>
							</div>
							{description && (
								<p className="max-w-md text-lg text-slate-300 font-medium leading-relaxed lg:text-right">
									{description}
								</p>
							)}
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
							{plans.map((plan, idx) => (
								<HomeGlowPricingCard
									key={plan.name}
									plan={plan}
									delay={idx * 0.08}
									frequency={frequency}
								/>
							))}
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			className={cn(
				'w-full py-24 px-4 relative overflow-hidden',
				className,
			)}
			{...props}
		>
			{/* Background stays subtle as requested */}
			<div className="absolute top-0 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
			<div className="absolute bottom-0 left-0 translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

			<div className="container mx-auto max-w-7xl relative z-10">
				<div
					className={cn(
						'gap-12',
						isDetailed ? 'flex flex-col' : 'flex flex-col items-center gap-16'
					)}
				>
					{/* Left Column: Heading & Benefits */}
					<div
						className={cn(
							'flex flex-col',
							isDetailed
								? 'text-center items-center max-w-4xl mx-auto'
								: 'text-center items-center max-w-3xl'
						)}
					>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
						>
							<span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-8 border border-blue-100">
								Pricing
							</span>
							<h2 className={cn(
								'text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-[0.95]',
								isDetailed ? 'lg:text-6xl' : 'lg:text-7xl uppercase leading-[0.85]'
							)}>
								{heading}
							</h2>
							{description && (
								<p className={cn(
									'text-slate-500 font-medium leading-relaxed',
									isDetailed ? 'text-base md:text-lg mb-8 max-w-2xl mx-auto' : 'text-lg mb-12'
								)}>
									{description}
								</p>
							)}
						</motion.div>

						{isDetailed && (
							<motion.p
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.45 }}
								className="mt-2 max-w-5xl text-center text-slate-600 text-base md:text-lg leading-relaxed"
							>
								Neural Orchestration: Coordinate complex AI workflows across multiple agents with zero-latency synchronization. Infrastructure as Code: Your entire AI backbone is versioned and deployable across any VPC within minutes. Isolated Data Layers: Enterprise-grade security with physical and logical separation for every model training set.
							</motion.p>
						)}
					</div>

					{/* Right Column: Toggle & Cards */}
					<div className="flex flex-col gap-8">
						{/* Toggle positioned top right of cards area for high density */}
						<div className={cn('flex items-center', isDetailed ? 'justify-center' : 'justify-between items-end')}>
							{!isDetailed && <div className="hidden lg:block" />} {/* Spacer */}
							<div className="flex items-center gap-4">
								<PricingFrequencyToggle
									frequency={frequency}
									setFrequency={setFrequency}
								/>
								<div className="hidden sm:block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
									Save 20% Annually
								</div>
							</div>
						</div>

						<div className={cn(
							'grid gap-6 items-stretch',
							isDetailed ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
						)}>
							{plans.map((plan, idx) => (
								<PricingCard
									plan={plan}
									key={plan.name}
									frequency={frequency}
									delay={idx * 0.1}
								/>
							))}
						</div>
					</div>
				</div>

				{isDetailed && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mt-14 p-8 lg:p-10 rounded-[2rem] bg-white text-slate-900 relative overflow-hidden border border-slate-200 shadow-sm"
					>
						<div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/70 blur-[90px] rounded-full" />
						<div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
							<div className="flex-1">
								<h3 className="text-3xl lg:text-4xl font-black mb-4 uppercase leading-none">Custom Enterprise Audit</h3>
								<p className="text-slate-600 font-medium text-lg max-w-xl">
									Need a custom solution? We build bespoke architectures tailored to your enterprise infrastructure.
								</p>
							</div>
							<Button asChild size="xl" className="rounded-full bg-slate-900 hover:bg-slate-800 font-black h-14 px-10 uppercase tracking-widest text-[11px] gap-3">
								<a href="/contact">Talk to Sales <ArrowRight className="size-4" /></a>
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</section>
	);
}

function HomeLightPricingCard({
	plan,
	frequency,
	delay = 0,
}: {
	plan: Plan;
	frequency: FREQUENCY;
	delay?: number;
}) {
	const navigate = useNavigate();
	const isHighlighted = !!plan.highlighted;

	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.35 }}
			className={cn(
				'relative rounded-xl border p-5 bg-white transition-all duration-300',
				isHighlighted
					? 'border-slate-300 shadow-[0_8px_28px_rgba(15,23,42,0.08)]'
					: 'border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
			)}
			style={{
				backgroundImage: isHighlighted
					? 'radial-gradient(at 100% 0%, rgba(251,191,36,0.10) 0px, transparent 48%), radial-gradient(at 0% 100%, rgba(59,130,246,0.08) 0px, transparent 55%)'
					: 'radial-gradient(at 100% 0%, rgba(99,102,241,0.06) 0px, transparent 42%)',
			}}
		>
			<div className="flex items-start justify-between gap-3 mb-4">
				<div>
					<p className="text-sm font-medium text-slate-700">{plan.name}</p>
					{isHighlighted && (
						<p className="text-[10px] font-semibold text-amber-600 mt-0.5">▲ Most Popular</p>
					)}
				</div>
			</div>

			<div className="mb-4">
				<div className="flex items-end gap-1.5">
					<span className="text-4xl font-bold tracking-tight text-slate-900">
						{typeof plan.price[frequency] === 'number' ? `$${plan.price[frequency]}` : plan.price[frequency]}
					</span>
					{typeof plan.price[frequency] === 'number' && (
						<span className="text-xs text-slate-500 mb-1.5">Per month</span>
					)}
				</div>
				<p className="text-xs text-slate-500 mt-1">{plan.info}</p>
			</div>

			<div className="space-y-2.5 mb-5">
				{plan.features.slice(0, 6).map((feature, index) => (
					<div key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
						<Check className="size-3.5 mt-1 text-slate-500" />
						<span>{feature.text}</span>
					</div>
				))}
			</div>

			<Button
				className={cn(
					'w-full h-10 rounded-md text-sm font-semibold',
					isHighlighted ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
				)}
				onClick={() => {
					if (plan.enterprise) {
						navigate('/contact');
					} else {
						const planId = `${plan.name.toLowerCase()}_${frequency}`;
						navigate(`/checkout?plan=${planId}`);
					}
				}}
			>
				{plan.btn.text}
			</Button>
		</motion.div>
	);
}

function HomeGlowPricingCard({
	plan,
	frequency,
	delay = 0,
}: {
	plan: Plan;
	frequency: FREQUENCY;
	delay?: number;
}) {
	const navigate = useNavigate();
	const isHighlighted = !!plan.highlighted;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.45 }}
			className={cn(
				'relative group rounded-3xl p-6 transition-all duration-300 border',
				isHighlighted
					? 'border-emerald-400/60 bg-[#09170b] shadow-[0_0_40px_rgba(16,185,129,0.2)]'
					: 'border-white/10 bg-[#07112a] hover:bg-white/[0.03]'
			)}
			style={{
				backgroundImage: isHighlighted
					? 'radial-gradient(at 85% 35%, rgba(16,185,129,0.22) 0px, transparent 60%), radial-gradient(at 15% 85%, rgba(132,204,22,0.14) 0px, transparent 55%)'
					: 'radial-gradient(at 88% 40%, rgba(9,14,35,0.9) 0px, transparent 70%), radial-gradient(at 0% 85%, rgba(99,102,241,0.26) 0px, transparent 65%), radial-gradient(at 100% 95%, rgba(168,85,247,0.2) 0px, transparent 60%)',
			}}
		>
			{isHighlighted && (
				<div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-4 py-1 text-xs font-bold text-emerald-200">
					● Most popular
				</div>
			)}

			<div className="mb-6">
				<h3 className="text-3xl font-bold text-white tracking-tight mb-1">{plan.name}</h3>
				<p className="text-slate-300 text-sm">{plan.info}</p>
			</div>

			<div className="mb-6">
				<div className="flex items-end gap-2">
					<span className="text-5xl font-black tracking-tight text-white">
						{typeof plan.price[frequency] === 'number' ? `$${plan.price[frequency]}` : plan.price[frequency]}
					</span>
					{typeof plan.price[frequency] === 'number' && (
						<span className="text-slate-300 mb-2">/month</span>
					)}
				</div>
			</div>

			<div className="space-y-3 mb-7">
				{plan.features.map((feature, index) => (
					<div key={index} className="flex items-start gap-3 text-slate-200 text-sm leading-relaxed">
						<Check className={cn('size-4 mt-0.5 flex-shrink-0', isHighlighted ? 'text-emerald-300' : 'text-violet-300')} />
						<span>{feature.text}</span>
					</div>
				))}
			</div>

			<Button
				className={cn(
					'w-full h-14 rounded-full font-bold text-xl tracking-tight',
					isHighlighted
						? 'bg-emerald-500 hover:bg-emerald-400 text-white'
						: 'bg-slate-700/60 hover:bg-slate-600 text-white'
				)}
				onClick={() => {
					if (plan.enterprise) {
						navigate('/contact');
					} else {
						const planId = `${plan.name.toLowerCase()}_${frequency}`;
						navigate(`/checkout?plan=${planId}`);
					}
				}}
			>
				{plan.btn.text}
			</Button>
		</motion.div>
	);
}

function PricingFrequencyToggle({
	frequency,
	setFrequency,
	className,
	...props
}: {
	frequency: FREQUENCY;
	setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'bg-white rounded-[1.25rem] border border-slate-100 p-1.5 shadow-xl shadow-slate-200/50 flex w-fit relative',
				className,
			)}
			{...props}
		>
			{frequencies.map((freq) => (
				<button
					key={freq}
					onClick={() => setFrequency(freq)}
					className={cn(
						"relative px-6 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all rounded-xl z-10",
						frequency === freq ? "text-white" : "text-slate-400 hover:text-slate-600"
					)}
				>
					{freq === 'monthly' ? 'Monthly' : 'Annual'}
					{frequency === freq && (
						<motion.span
							layoutId="frequency-pill-detailed"
							className="absolute inset-0 bg-slate-900 rounded-xl -z-10"
							transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
						/>
					)}
				</button>
			))}
		</div>
	);
}

function PricingCard({
	plan,
	className,
	frequency,
	delay = 0,
	...props
}: {
	plan: Plan;
	className?: string;
	frequency: FREQUENCY;
	delay?: number;
	key?: React.Key;
}) {
	const navigate = useNavigate();
	const isPro = plan.highlighted;
	const isEnterprise = plan.enterprise;

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.5 }}
			className={cn(
				'relative flex flex-col rounded-[2.5rem] transition-all duration-500 overflow-hidden',
				isPro
					? 'bg-white border-2 border-blue-600 text-slate-900 shadow-xl z-20'
					: 'bg-white border border-slate-200 text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300',
				className,
			)}
			{...props}
		>
			{/* Header */}
			<div className="p-7 lg:p-8 border-b border-slate-100">
				<div className="flex justify-between items-start mb-6">
					<span className={cn(
						"text-[11px] font-black uppercase tracking-[0.2em]",
						isPro ? 'text-blue-700' : 'text-slate-500'
					)}>
						{plan.name}
					</span>
					{isPro && (
						<span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
							Popular
						</span>
					)}
				</div>

				<div className="flex items-end gap-1 mb-2">
					<span className="text-4xl font-black tracking-tighter">
						{typeof plan.price[frequency] === 'number' ? `$${plan.price[frequency]}` : plan.price[frequency]}
					</span>
					{typeof plan.price[frequency] === 'number' && (
						<span className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-slate-500">
							/{frequency === 'monthly' ? 'mo' : 'yr'}
						</span>
					)}
				</div>

				<p className="text-sm font-medium leading-relaxed text-slate-500 min-h-[42px]">
					{plan.info}
				</p>
			</div>

			{/* Action Buttons: Following reference image format */}
			<div className="px-7 lg:px-8 pt-6 flex flex-col gap-2.5">
				<Button
					className={cn(
						"w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98]",
						isPro
							? 'bg-blue-600 text-white hover:bg-blue-700'
							: 'bg-slate-900 text-white hover:bg-slate-800'
					)}
					onClick={() => {
						if (plan.enterprise) {
							navigate('/contact');
						} else {
							const planId = `${plan.name.toLowerCase()}_${frequency}`;
							navigate(`/checkout?plan=${planId}`);
						}
					}}
				>
					{plan.btn.text}
				</Button>
				<Button
					variant="outline"
					className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-transparent border-slate-200 text-slate-900 hover:bg-slate-50"
				>
					Compare Features
				</Button>
			</div>

			{/* Features List */}
			<div className="p-7 lg:p-8 flex-1 flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">
						Includes:
					</p>
					{plan.features.slice(0, 5).map((feature, featureIdx) => (
						<div key={featureIdx} className="flex items-start gap-3">
							<Check className={cn(
								"mt-0.5 size-3.5",
								isPro ? 'text-blue-600' : 'text-emerald-600'
							)} />
							<span className="text-sm font-semibold leading-5 text-slate-700">
								{feature.text}
							</span>
						</div>
					))}
				</div>
			</div>
		</motion.div>
	);
}
