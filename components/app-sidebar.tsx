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
			on: (event: string, handler: (data: unknown) => void) => () => void;
			open: () => void;
			close: () => void;
			toggle: () => void;
		};
	}
}

function SidebarInner({
	onWebchatStateChange,
}: {
	onWebchatStateChange: (visible: boolean, hasError: boolean) => void;
}) {
	const [chatVisible, setChatVisible] = useState(false);
	const [botpressStatus, setBotpressStatus] = useState<
		"loading" | "ready" | "error"
	>("loading");
	const [hasQuotaError, setHasQuotaError] = useState(false);
	const { state, toggleSidebar } = useSidebar();
	const pathname = usePathname();
	const isExamplePage = pathname.startsWith("/examples");

	useEffect(() => {
		onWebchatStateChange(chatVisible, hasQuotaError);
	}, [chatVisible, hasQuotaError, onWebchatStateChange]);

	useEffect(() => {
		let unsubscribeError: (() => void) | null = null;
		let unsubscribeReady: (() => void) | null = null;
		let timeoutId: NodeJS.Timeout;

		const setupListeners = () => {
			if (window.botpress) {
				unsubscribeError = window.botpress.on("error", () => {
					setBotpressStatus("error");
					setHasQuotaError(true);
				});

				unsubscribeReady = window.botpress.on("webchat:ready", () => {
					setBotpressStatus("ready");
					setHasQuotaError(false);
				});
			}
		};

		if (window.botpress) {
			setupListeners();
		} else {
			const checkInterval = setInterval(() => {
				if (window.botpress) {
					setupListeners();
					clearInterval(checkInterval);
				}
			}, 100);

			timeoutId = setTimeout(() => {
				clearInterval(checkInterval);
				if (botpressStatus === "loading") {
					setBotpressStatus("error");
					setHasQuotaError(true);
				}
			}, 5000);
		}

		return () => {
			if (unsubscribeError) unsubscribeError();
			if (unsubscribeReady) unsubscribeReady();
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [botpressStatus]);

	const toggleChat = () => {
		if (window.botpress && !hasQuotaError) {
			if (chatVisible) {
				window.botpress.close();
			} else {
				window.botpress.open();
			}
		}
		setChatVisible(!chatVisible);
	};

	useEffect(() => {
		const styleId = "botpress-hide-style";
		const style = document.getElementById(styleId);

		if (hasQuotaError) {
			let styleEl = style;
			if (!styleEl) {
				styleEl = document.createElement("style");
				styleEl.id = styleId;
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = `
				#bp-web-widget { display: none !important; }
				.bpFab { display: none !important; }
				.bpWidget { display: none !important; }
			`;
		} else {
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
								chatVisible
									? hasQuotaError
										? "max-h-[550px] opacity-100"
										: "max-h-96 opacity-100"
									: "max-h-0 opacity-0"
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
}: {
	collapsible?: "icon" | "offcanvas" | "none";
}) {
	const [webchatVisible, setWebchatVisible] = useState(false);
	const [hasQuotaError, setHasQuotaError] = useState(false);

	const handleWebchatStateChange = (visible: boolean, hasError: boolean) => {
		setWebchatVisible(visible);
		setHasQuotaError(hasError);
	};

	const shouldWiden = webchatVisible && hasQuotaError;

	return (
		<Sidebar
			side="left"
			variant="sidebar"
			collapsible={collapsible}
			style={
				shouldWiden
					? ({
							"--sidebar-width": "350px",
						} as React.CSSProperties)
					: undefined
			}
		>
			<SidebarInner onWebchatStateChange={handleWebchatStateChange} />
		</Sidebar>
	);
}
