"use client";

import { usePathname } from "next/navigation";
import {
	SidebarProvider as ShadcnSidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isExamplePage = pathname.startsWith("/examples");

	if (isExamplePage) {
		return (
			<ShadcnSidebarProvider defaultOpen={false}>
				<main className="absolute inset-0 overflow-auto">{children}</main>
				<AppSidebar />
			</ShadcnSidebarProvider>
		);
	}

	return (
		<ShadcnSidebarProvider defaultOpen={true}>
			<AppSidebar />
			<main className="flex-1 overflow-auto px-12">{children}</main>
		</ShadcnSidebarProvider>
	);
}
