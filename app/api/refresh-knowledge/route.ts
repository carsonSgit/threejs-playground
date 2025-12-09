import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 },
		);
	}

	// This endpoint is a reminder that knowledge refresh happens on redeployment.
	return NextResponse.json({
		success: true,
		message:
			"To refresh knowledge: run 'cd core && pnpm deploy' or sync in Botpress dashboard",
	});
}
