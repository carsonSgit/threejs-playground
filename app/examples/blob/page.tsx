"use client";

import { useEffect } from "react";
import Blob from "@/components/blob";

export default function BlobPage() {
	useEffect(() => {
		document.body.style.margin = "0";
		document.body.style.overflow = "hidden";
		document.body.style.background = "#fff";

		// Hide the sidebar on this page for fullscreen effect
		const sidebar = document.querySelector('[data-sidebar="sidebar"]');
		const mainEl = document.querySelector("main");

		if (sidebar) {
			(sidebar as HTMLElement).style.display = "none";
		}
		if (mainEl) {
			(mainEl as HTMLElement).style.padding = "0";
			(mainEl as HTMLElement).style.margin = "0";
		}

		return () => {
			document.body.style.margin = "";
			document.body.style.overflow = "";
			document.body.style.background = "";

			if (sidebar) {
				(sidebar as HTMLElement).style.display = "";
			}
			if (mainEl) {
				(mainEl as HTMLElement).style.padding = "";
				(mainEl as HTMLElement).style.margin = "";
			}
		};
	}, []);

	return (
		<div className="fixed inset-0 w-screen h-screen z-50">
			<Blob />
		</div>
	);
}
