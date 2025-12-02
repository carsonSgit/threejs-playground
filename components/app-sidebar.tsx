"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Bot, AlertCircle, X, ArrowLeft } from "lucide-react";
import { MockWebchat } from "@/components/mock-webchat";
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
		botpress?: {
			on: (event: string, handler: (data: any) => void) => () => void;
			open: () => void;
			close: () => void;
			toggle: () => void;
		};
	}
}

function SidebarInner() {
	const [chatVisible, setChatVisible] = useState(false);
	const [botpressStatus, setBotpressStatus] = useState<
		"loading" | "ready" | "error"
	>("loading");
	const [hasQuotaError, setHasQuotaError] = useState(false);
	const { state, toggleSidebar } = useSidebar();
	const pathname = usePathname();
	const isExamplePage = pathname.startsWith("/examples");

	useEffect(() => {
		let unsubscribeError: (() => void) | null = null;
		let unsubscribeInit: (() => void) | null = null;
		let unsubscribeReady: (() => void) | null = null;
		let timeoutId: NodeJS.Timeout;

		const setupListeners = () => {
			if (window.botpress) {
				// Listen for errors (like quota limits)
				unsubscribeError = window.botpress.on('error', (error) => {
					console.warn('Botpress error detected, falling back to mock');
					setBotpressStatus("error");
					setHasQuotaError(true);
				});

				// Listen for successful initialization
				unsubscribeInit = window.botpress.on('webchat:initialized', () => {
					console.log('Botpress initialized successfully');
				});

				// Listen for ready state (means it's working)
				unsubscribeReady = window.botpress.on('webchat:ready', () => {
					console.log('Botpress ready - no quota errors');
					setBotpressStatus("ready");
					setHasQuotaError(false);
				});
			}
		};

		// Check if botpress is already loaded
		if (window.botpress) {
			setupListeners();
		} else {
			// Wait for botpress to load
			const checkInterval = setInterval(() => {
				if (window.botpress) {
					setupListeners();
					clearInterval(checkInterval);
				}
			}, 100);

			// Timeout after 5 seconds - assume error
			timeoutId = setTimeout(() => {
				clearInterval(checkInterval);
				if (botpressStatus === "loading") {
					console.warn('Botpress load timeout, using mock');
					setBotpressStatus("error");
					setHasQuotaError(true);
				}
			}, 5000);
		}

		return () => {
			if (unsubscribeError) unsubscribeError();
			if (unsubscribeInit) unsubscribeInit();
			if (unsubscribeReady) unsubscribeReady();
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [botpressStatus]);

	const toggleChat = () => {
		if (window.botpress && !hasQuotaError) {
			// Use real Botpress
			if (chatVisible) {
				window.botpress.close();
			} else {
				window.botpress.open();
			}
		}
		// Toggle mock visibility
		setChatVisible(!chatVisible);
	};

	// Inject CSS to hide Botpress UI when there's a quota error
	useEffect(() => {
		const styleId = 'botpress-hide-style';
		let style = document.getElementById(styleId) as HTMLStyleElement;

		if (hasQuotaError) {
			if (!style) {
				style = document.createElement('style');
				style.id = styleId;
				document.head.appendChild(style);
			}
			style.textContent = `
				#bp-web-widget { display: none !important; }
				.bpFab { display: none !important; }
				.bpWidget { display: none !important; }
			`;
		} else {
			// Remove the style if no quota error
			if (style) {
				style.remove();
			}
		}

		return () => {
			const cleanupStyle = document.getElementById(styleId);
			if (cleanupStyle) cleanupStyle.remove();
		};
	}, [hasQuotaError]);

	const handleBotClick = () => {
		if (state === "collapsed") {
			toggleSidebar();
		} else {
			toggleChat();
		}
	};

	return (
		<SidebarContent 
			className={`border-r border-sidebar-border bg-sidebar overflow-hidden transition-all duration-500 ease-in-out ${
				chatVisible && hasQuotaError ? "min-w-[350px]" : ""
			}`}
		>
			<SidebarGroup className="px-0 py-0">
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
							className={`overflow-hidden transition-all duration-500 ease-in-out group-data-[collapsible=icon]:hidden ${
								chatVisible ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
							}`}
						>
							{botpressStatus === "loading" && (
								<div className="border-t border-sidebar-border bg-sidebar-accent/30 px-2 py-2">
									<div className="text-xs text-muted-foreground font-mono text-center animate-pulse">
										loading assistant...
									</div>
								</div>
							)}

							{botpressStatus === "error" && hasQuotaError && <MockWebchat />}

							{botpressStatus === "ready" && !hasQuotaError && (
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

export function AppSidebar({
	collapsible = "icon",
}: { collapsible?: "icon" | "offcanvas" | "none" }) {
	return (
		<Sidebar side="left" variant="sidebar" collapsible={collapsible}>
			<SidebarInner />
		</Sidebar>
	);
}
