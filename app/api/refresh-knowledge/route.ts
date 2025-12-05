import { NextResponse } from "next/server";

export async function POST() {
	// Knowledge refresh happens automatically when you redeploy the agent.
	// This button provides a reminder and link to the dashboard.
	return NextResponse.json({
		success: true,
		message:
			"To refresh knowledge: run 'cd core && pnpm deploy' or sync in Botpress dashboard",
	});
}
