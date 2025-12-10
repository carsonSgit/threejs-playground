"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider as ShadcnSidebarProvider } from "@/components/ui/sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
	return (
		<ShadcnSidebarProvider defaultOpen={true}>
			<AppSidebar />
			<main className="flex-1 overflow-auto px-12">{children}</main>
		</ShadcnSidebarProvider>
	);
}
