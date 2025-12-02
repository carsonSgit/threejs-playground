import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SidebarWrapper } from "@/components/sidebar-provider";

export const metadata: Metadata = {
	title: "Three.js Playground",
	description: "A collection of Three.js effects and examples",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body>
				<SidebarWrapper>{children}</SidebarWrapper>
				{/* Botpress Webchat Scripts */}
				<Script
					src="https://cdn.botpress.cloud/webchat/v3.4/inject.js"
					strategy="afterInteractive"
				/>
				<Script
					src="https://files.bpcontent.cloud/2025/11/30/01/20251130014538-Y1MPZGL0.js"
					strategy="afterInteractive"
				/>
			</body>
		</html>
	);
}
