"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MockWebchat() {
	return (
		<div className="border-t border-white/10 bg-[#101010] flex flex-col h-[550px] font-mono">
			<div className="flex items-center gap-3 p-4 border-b border-white/10 cursor-default">
				<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
					<span className="text-sm font-medium text-white">c</span>
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-sm font-medium text-white">core</div>
					<div className="text-xs text-gray-400 truncate">
						chat about the threejs playground
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					disabled
					className="h-8 w-8 shrink-0 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto p-2 space-y-3 cursor-default">
				<div className="bg-yellow-400/10 border border-yellow-400/20 rounded-none p-3">
					<div className="flex items-start gap-2 mb-2">
						<AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
						<span className="text-xs font-medium text-yellow-400">
							Assistant Temporarily Unavailable
						</span>
					</div>
					<p className="text-xs text-gray-300 leading-relaxed">
						The AI assistant has reached its usage limit for invocations. The
						service will be restored once the quota resets. Thank you for your
						patience!
					</p>
				</div>
			</div>

			<div className="border-t border-white/10 p-4 space-y-2 bg-[#101010]">
				<div className="flex gap-2">
					<Input
						placeholder="what kind of math do these use?"
						disabled
						className="flex-1 h-10 bg-[#202020] border-[#2f2f2f] text-[#525355] placeholder:text-[#F0F0F0] text-sm rounded-sm disabled:cursor-not-allowed font-mono"
					/>
				</div>
				<div className="text-center">
					<a
						href="https://botpress.com/?from=webchat"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
					>
						<span className="text-orange-400">⚡</span> by Botpress
					</a>
				</div>
			</div>
		</div>
	);
}
