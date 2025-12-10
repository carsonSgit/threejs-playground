import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const response = await fetch(`${request.nextUrl.origin}/api/code-samples`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (data.success) {
			return NextResponse.json({
				success: true,
				sample: data.sample,
				message: "Code sample generated and saved successfully!",
			});
		}

		return NextResponse.json(
			{ success: false, error: "Failed to save generated code" },
			{ status: 500 },
		);
	} catch (error) {
		console.error("Error generating sample:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to generate code sample" },
			{ status: 500 },
		);
	}
}
