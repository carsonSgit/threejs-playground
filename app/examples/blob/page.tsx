"use client";

import { useEffect } from "react";
import Blob from "@/components/blob";

export default function BlobPage() {
	useEffect(() => {
		document.body.style.margin = "0";
		document.body.style.overflow = "hidden";
		document.body.style.background = "#fff";

		return () => {
			document.body.style.margin = "";
			document.body.style.overflow = "";
			document.body.style.background = "";
		};
	}, []);

	return (
		<div className="relative -mx-12 h-screen">
			<Blob />
		</div>
	);
}
