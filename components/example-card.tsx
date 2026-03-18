"use client";

import Link from "next/link";
import { useState } from "react";

interface ExampleCardProps {
	id: string;
	href: string;
	title: string;
	description: string;
	tags: string[];
	type: string;
	number: string;
	children: (
		mousePosition: { x: number; y: number },
		isHovered: boolean,
	) => React.ReactNode;
}

export function ExampleCard({
	href,
	title,
	description,
	tags,
	type,
	number,
	children,
}: ExampleCardProps) {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setMousePosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
		setIsHovered(true);
	};

	return (
		<Link
			href={href}
			className="group border border-border bg-black/40 backdrop-blur-sm overflow-hidden hover:border-foreground/40 hover:bg-black/60 transition-all duration-200 h-full flex flex-col"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="h-48 relative overflow-hidden border-b border-border">
				{children(mousePosition, isHovered)}
				<div className="absolute top-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-[10px] border border-white/20 font-mono tracking-wider z-10">
					{type}
				</div>
				<div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/60 z-10">
					{number}
				</div>
			</div>

			<div className="p-5 space-y-3 flex-1 flex flex-col">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold font-mono tracking-tight group-hover:text-white transition-colors">
						{title}
					</h3>
					<span className="text-xs text-muted-foreground font-mono">▸</span>
				</div>

				<p className="text-xs text-muted-foreground leading-relaxed font-mono">
					{description}
				</p>

				<div className="flex flex-wrap gap-2 pt-2">
					{tags.map((tag) => (
						<span
							key={tag}
							className="text-[10px] px-2 py-0.5 bg-black/60 text-white/60 border border-white/10 font-mono"
						>
							{tag}
						</span>
					))}
				</div>

				<div className="pt-2 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors font-mono">
					<span>view_example</span>
					<span className="ml-2 group-hover:translate-x-1 transition-transform">
						→
					</span>
				</div>
			</div>
		</Link>
	);
}
