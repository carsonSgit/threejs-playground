"use client";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
	useUser,
} from "@clerk/nextjs";
import {
	ArrowLeft,
	Bot,
	ChevronDown,
	Code2,
	Database,
	LayoutDashboard,
	RotateCcw,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MockWebchat } from "@/components/mock-webchat";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";

declare global {
	interface Window {
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
	const [isRetrying, setIsRetrying] = useState(false);
	const [isRefreshingKnowledge, setIsRefreshingKnowledge] = useState(false);
	const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
	const { state, toggleSidebar } = useSidebar();
	const pathname = usePathname();
	const isExamplePage = pathname.startsWith("/examples");
	const { user } = useUser();

	const handleRetryConnection = () => {
		setIsRetrying(true);
		setBotpressStatus("loading");
		setHasQuotaError(false);

		setTimeout(() => {
			setBotpressStatus(window.botpress ? "ready" : "error");
			setHasQuotaError(!window.botpress);
			setIsRetrying(false);
		}, 2000);
	};

	const handleRefreshKnowledge = async () => {
		setIsRefreshingKnowledge(true);
		setRefreshMessage(null);

		try {
			const response = await fetch("/api/refresh-knowledge", {
				method: "POST",
			});
			const data = await response.json();
			setRefreshMessage(data.message);
		} catch {
			setRefreshMessage("Failed to refresh knowledge base");
		} finally {
			setIsRefreshingKnowledge(false);
			setTimeout(() => setRefreshMessage(null), 5000);
		}
	};

	useEffect(() => {
		onWebchatStateChange(chatVisible, hasQuotaError);
	}, [chatVisible, hasQuotaError, onWebchatStateChange]);

	useEffect(() => {
		let unsubscribeError: (() => void) | null = null;
		let checkInterval: NodeJS.Timeout | null = null;
		let timeoutId: NodeJS.Timeout | null = null;
		let isMounted = true;

		const setupListeners = () => {
			if (window.botpress && isMounted) {
				setBotpressStatus("ready");
				setHasQuotaError(false);

				unsubscribeError = window.botpress.on("error", (data: unknown) => {
					const errorStr = JSON.stringify(data).toLowerCase();
					if (errorStr.includes("quota") || errorStr.includes("limit")) {
						setBotpressStatus("error");
						setHasQuotaError(true);
					}
				});
			}
		};

		if (window.botpress) {
			setupListeners();
		} else {
			checkInterval = setInterval(() => {
				if (window.botpress) {
					setupListeners();
					if (checkInterval) clearInterval(checkInterval);
					if (timeoutId) clearTimeout(timeoutId);
				}
			}, 100);

			timeoutId = setTimeout(() => {
				if (checkInterval) clearInterval(checkInterval);
				if (!window.botpress && isMounted) {
					setBotpressStatus("error");
					setHasQuotaError(true);
				}
			}, 10000);
		}

		return () => {
			isMounted = false;
			if (unsubscribeError) unsubscribeError();
			if (checkInterval) clearInterval(checkInterval);
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, []);

	const toggleChat = () => {
		if (window.botpress && !hasQuotaError) {
			window.botpress.toggle();
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
		<>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu className="gap-0">
						{isExamplePage && (
							<SidebarMenuItem>
								<div className="flex items-center">
									<SidebarMenuButton
										asChild
										tooltip="Back to Examples"
										className="font-mono text-xs border-0 hover:bg-sidebar-accent/30 flex-1"
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
										className="h-8 w-8 shrink-0 hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hidden"
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
									className="font-mono text-xs border-0 hover:bg-sidebar-accent/30 flex-1 justify-between pr-0"
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
										className="h-8 w-8 shrink-0 hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hidden"
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

								{botpressStatus === "error" && hasQuotaError && (
									<MockWebchat
										onRetry={handleRetryConnection}
										isRetrying={isRetrying}
									/>
								)}

								{botpressStatus === "ready" && !hasQuotaError && (
									<div className="border-t border-sidebar-border bg-sidebar-accent/30 px-2 py-2">
										<div className="text-xs text-muted-foreground font-mono">
											<span className="text-green-400">●</span> webchat active
										</div>
										<p className="mt-1 text-[10px] text-sidebar-foreground/50 font-mono">
											chat widget appears in bottom-right corner.
										</p>
									</div>
								)}
							</div>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip="Examples"
								className="font-mono text-xs border-0 hover:bg-sidebar-accent/30"
							>
								<Link href="/">
									<LayoutDashboard className="h-4 w-4 shrink-0" />
									<span>examples</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip="Code Sandbox"
								className="font-mono text-xs border-0 hover:bg-sidebar-accent/30"
							>
								<Link href="/code-sandbox">
									<Code2 className="h-4 w-4 shrink-0" />
									<span>code_sandbox</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<div id="sidebar-controls" className="w-full" />
			</SidebarContent>
			<SidebarSeparator />
			<SidebarFooter className="py-2">
				<SignedIn>
					<SidebarGroup className="gap-2">
						<SidebarMenu className="gap-0">
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={handleRefreshKnowledge}
									disabled={isRefreshingKnowledge}
									tooltip="Refresh Knowledge Base"
									className="font-mono text-xs border-0 bg-sidebar-background hover:bg-sidebar-accent hover:border-sidebar-accent-foreground/20 transition-all group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
								>
									<Database
										className={`h-4 w-4 shrink-0 ${isRefreshingKnowledge ? "animate-pulse" : ""}`}
									/>
									<span className="group-data-[collapsible=icon]:hidden">
										{isRefreshingKnowledge
											? "refreshing..."
											: "refresh_knowledge"}
									</span>
									{isRefreshingKnowledge && (
										<RotateCcw className="h-3 w-3 ml-auto animate-spin group-data-[collapsible=icon]:ml-0" />
									)}
								</SidebarMenuButton>
								{refreshMessage && (
									<div className="px-2 py-1 text-[10px] font-mono text-muted-foreground border-l-2 border-sidebar-accent ml-2 mt-1 group-data-[collapsible=icon]:hidden">
										{refreshMessage}
									</div>
								)}
							</SidebarMenuItem>
						</SidebarMenu>

						<div className="flex items-center gap-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
							<div className="flex items-center justify-center shrink-0">
								<UserButton
									appearance={{
										elements: {
											avatarBox: "h-8 w-8",
										},
									}}
								/>
							</div>
							<div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
								<span className="text-sm font-medium text-sidebar-foreground truncate">
									{user?.fullName ||
										user?.primaryEmailAddress?.emailAddress ||
										"User"}
								</span>
								{user?.primaryEmailAddress?.emailAddress && user?.fullName && (
									<span className="text-xs text-sidebar-foreground/60 truncate">
										{user.primaryEmailAddress.emailAddress}
									</span>
								)}
							</div>
						</div>
					</SidebarGroup>
				</SignedIn>
				<SignedOut>
					<SidebarGroup className="gap-3 group-data-[collapsible=icon]:hidden font-mono">
						<div className="flex flex-col gap-2 px-2">
							<h3 className="text-xs font-semibold text-sidebar-foreground flex items-center gap-2">
								<span className="text-primary/50">{">"}</span> auth_required
							</h3>
							<p className="text-[10px] text-sidebar-foreground/60 leading-relaxed border-l border-border/50 pl-2 ml-1">
								create an account to access features and save progress.
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<SignInButton mode="modal">
								<Button variant="outline" className="w-full text-xs font-mono justify-start border-border/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all h-8">
									<span className="text-sidebar-foreground/40 mr-2">[1]</span> sign_in
								</Button>
							</SignInButton>
							<SignUpButton mode="modal">
								<Button variant="outline" className="w-full text-xs font-mono justify-start border-border/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all h-8">
									<span className="text-sidebar-foreground/40 mr-2">[2]</span> create_account
								</Button>
							</SignUpButton>
						</div>
					</SidebarGroup>
					<SidebarGroup className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center hidden">
						<SignUpButton mode="modal">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all font-mono text-xs"
							>
								{">_"}
							</Button>
						</SignUpButton>
					</SidebarGroup>
				</SignedOut>
			</SidebarFooter>
		</>
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
