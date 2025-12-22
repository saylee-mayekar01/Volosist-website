'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { cn } from '../../lib/utils';

interface Image {
	src: string;
	alt?: string;
}

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
	const container = useRef<HTMLDivElement>(null);
	
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
	const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
	const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
	const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
	const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

	const scales = useMemo(() => [scale4, scale5, scale6, scale8, scale5, scale6, scale9], [scale4, scale5, scale6, scale8, scale9]);

	// Explicit layout definitions for positioning images spread across the viewport
	const imageLayouts = [
		{ width: "25vw", height: "25vh", top: "37.5%", left: "37.5%", zIndex: 10 }, // Center
		{ width: "30vw", height: "25vh", top: "5%", left: "55%", zIndex: 5 },       // Top Mid-Right
		{ width: "22vw", height: "35vh", top: "10%", left: "12%", zIndex: 5 },      // Top Left
		{ width: "25vw", height: "30vh", top: "35%", left: "72%", zIndex: 5 },      // Mid Right
		{ width: "20vw", height: "25vh", top: "68%", left: "15%", zIndex: 5 },      // Bottom Left
		{ width: "35vw", height: "20vh", top: "78%", left: "32.5%", zIndex: 5 },    // Bottom Mid
		{ width: "20vw", height: "20vh", top: "65%", left: "80%", zIndex: 5 },      // Bottom Right
	];

	return (
		<div ref={container} className="relative h-[300vh] w-full bg-white">
			<div className="sticky top-0 h-screen overflow-hidden bg-white">
				{images.map(({ src, alt }, index) => {
					const scale = scales[index % scales.length];
					const layout = imageLayouts[index % imageLayouts.length];

					return (
						<motion.div
							key={index}
							style={{ 
                scale,
                width: layout.width,
                height: layout.height,
                top: layout.top,
                left: layout.left,
                zIndex: layout.zIndex
              }}
							className="absolute flex items-center justify-center"
						>
							<div className="relative h-full w-full overflow-hidden rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] bg-neutral-100 border border-white/40">
								<img
									src={src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'}
									alt={alt || `Parallax image ${index + 1}`}
									className="h-full w-full object-cover"
								/>
                <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors duration-500" />
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}