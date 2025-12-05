import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 }
		);
	}

	// Knowledge refresh happens automatically when you redeploy the agent.
	// This button provides a reminder and link to the dashboard.
	return NextResponse.json({
		success: true,
		message:
			"To refresh knowledge: run 'cd core && pnpm deploy' or sync in Botpress dashboard",
	});
}
