"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Bot, AlertCircle, X, ArrowLeft } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

declare global {
	interface Window {
		botpressWebChat?: {
			open: () => void;
			close: () => void;
			toggle: () => void;
		};
	}
}

function SidebarInner() {
	const [chatVisible, setChatVisible] = useState(true);
	const [botpressStatus, setBotpressStatus] = useState<
		"loading" | "ready" | "error"
	>("loading");
	const { state, toggleSidebar } = useSidebar();
	const pathname = usePathname();
	const isExamplePage = pathname.startsWith("/examples");

	useEffect(() => {
		let attempts = 0;
		const maxAttempts = 30; // 6 seconds total

		const checkBotpress = setInterval(() => {
			attempts++;

			if (window.botpressWebChat) {
				setBotpressStatus("ready");
				window.botpressWebChat.open();
				clearInterval(checkBotpress);
			} else if (attempts >= maxAttempts) {
				setBotpressStatus("error");
				clearInterval(checkBotpress);
			}
		}, 200);

		return () => clearInterval(checkBotpress);
	}, []);

	const toggleChat = () => {
		if (window.botpressWebChat) {
			if (chatVisible) {
				window.botpressWebChat.close();
			} else {
				window.botpressWebChat.open();
			}
		}
		setChatVisible(!chatVisible);
	};

	const handleBotClick = () => {
		if (state === "collapsed") {
			toggleSidebar();
		} else {
			toggleChat();
		}
	};

	return (
		<SidebarContent>
			<SidebarGroup>
				<SidebarMenu className="gap-0">
					{isExamplePage && (
						<SidebarMenuItem>
							<div className="flex items-center">
								<SidebarMenuButton
									asChild
									tooltip="Back to Examples"
									className="font-mono text-xs rounded-none border-0 hover:bg-sidebar-accent/30 flex-1"
								>
									<Link href="/">
										<ArrowLeft className="h-4 w-4 shrink-0" />
										<span>back_to_examples</span>
									</Link>
								</SidebarMenuButton>

								<Button
									variant="ghost"
									size="icon"
									onClick={toggleSidebar}
									className="h-8 w-8 shrink-0 rounded-none hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hidden"
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Close Sidebar</span>
								</Button>
							</div>
						</SidebarMenuItem>
					)}

					<SidebarMenuItem>
						<div className="flex items-center">
							<SidebarMenuButton
								onClick={handleBotClick}
								tooltip={
									state === "collapsed" ? "Open Sidebar" : "Toggle Assistant"
								}
								className="font-mono text-xs rounded-none border-0 hover:bg-sidebar-accent/30 flex-1 justify-between pr-0"
							>
								<div className="flex items-center gap-2">
									<Bot className="h-4 w-4 shrink-0" />
									<span>{chatVisible ? "hide_webchat" : "show_webchat"}</span>
								</div>
								<div className="h-8 w-8 flex items-center justify-center shrink-0 group-data-[collapsible=icon]:hidden">
									<ChevronDown
										className={`h-4 w-4 transition-transform duration-200 ${
											chatVisible ? "rotate-180" : "rotate-0"
										}`}
									/>
								</div>
							</SidebarMenuButton>

							{!isExamplePage && (
								<Button
									variant="ghost"
									size="icon"
									onClick={toggleSidebar}
									className="h-8 w-8 shrink-0 rounded-none hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hidden"
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Close Sidebar</span>
								</Button>
							)}
						</div>

						<div
							className={`overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden ${
								chatVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
							}`}
						>
							{botpressStatus === "loading" && (
								<div className="border-t border-sidebar-border bg-sidebar-accent/30 px-2 py-2">
									<div className="text-xs text-muted-foreground font-mono text-center animate-pulse">
										loading assistant...
									</div>
								</div>
							)}

							{botpressStatus === "error" && (
								<div className="border-t border-red-400/20 bg-red-400/5 px-2 py-2">
									<div className="flex items-center gap-2 text-red-400">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span className="text-xs font-mono font-medium">
											webchat unavailable
										</span>
									</div>
									<div className="mt-1 text-[10px] text-muted-foreground font-mono">
										the assistant may have reached its usage limit. please try
										again later.
									</div>
								</div>
							)}

							{botpressStatus === "ready" && (
								<div className="border-t border-sidebar-border bg-sidebar-accent/30 px-2 py-2">
									<div className="text-xs text-muted-foreground font-mono">
										<span className="text-green-400">●</span> webchat active
									</div>
									<p className="mt-1 text-[10px] text-sidebar-foreground/50 font-mono">
										ask about three.js demos, webgl, or creative coding.
									</p>
								</div>
							)}
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		</SidebarContent>
	);
}

export function AppSidebar() {
	return (
		<Sidebar side="left" variant="sidebar" collapsible="icon">
			<SidebarInner />
		</Sidebar>
	);
}
