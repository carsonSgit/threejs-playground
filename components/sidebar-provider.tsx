"use client";

import {
	SidebarProvider as ShadcnSidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
	return (
		<ShadcnSidebarProvider defaultOpen={true}>
			<AppSidebar />
			<main className="flex-1 overflow-auto px-12">{children}</main>
		</ShadcnSidebarProvider>
	);
}
