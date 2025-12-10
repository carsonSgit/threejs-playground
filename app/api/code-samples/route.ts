import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export interface CodeSample {
	id: string;
	title: string;
	code: string;
	language: string;
	concept: string;
	explanation: string;
	createdAt: string;
	userId: string;
}

const codeSamplesStorage = new Map<string, CodeSample[]>();

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		const userKey = userId || "anonymous";

		const samples = codeSamplesStorage.get(userKey) || [];

		return NextResponse.json({ samples });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch code samples" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId: authUserId } = await auth();
		const body = await request.json();
		const {
			title,
			code,
			language,
			concept,
			explanation,
			sampleId,
			userId: bodyUserId,
		} = body;

		const userKey = authUserId || bodyUserId || "anonymous";

		if (!code || !language) {
			return NextResponse.json(
				{ error: "Code and language are required" },
				{ status: 400 },
			);
		}

		const userSamples = codeSamplesStorage.get(userKey) || [];
		const existingIndex = sampleId
			? userSamples.findIndex((s) => s.id === sampleId)
			: -1;

		let sample: CodeSample;
		if (existingIndex >= 0) {
			sample = {
				...userSamples[existingIndex],
				title: title || userSamples[existingIndex].title,
				code,
				language,
				concept:
					concept !== undefined ? concept : userSamples[existingIndex].concept,
				explanation:
					explanation !== undefined
						? explanation
						: userSamples[existingIndex].explanation,
			};
			userSamples[existingIndex] = sample;
		} else {
			sample = {
				id:
					sampleId ||
					`sample_${Date.now()}_${Math.random().toString(36).substring(7)}`,
				title: title || `Code Sample: ${concept || "Untitled"}`,
				code,
				language,
				concept: concept || "",
				explanation: explanation || "",
				createdAt: new Date().toISOString(),
				userId: userKey,
			};
			userSamples.push(sample);
		}

		codeSamplesStorage.set(userKey, userSamples);

		return NextResponse.json({ success: true, sample });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to save code sample" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { userId } = await auth();
		const userKey = userId || "anonymous";

		const { searchParams } = new URL(request.url);
		const sampleId = searchParams.get("id");

		if (!sampleId) {
			return NextResponse.json(
				{ error: "Sample ID is required" },
				{ status: 400 },
			);
		}

		const userSamples = codeSamplesStorage.get(userKey) || [];
		const filtered = userSamples.filter((s) => s.id !== sampleId);
		codeSamplesStorage.set(userKey, filtered);

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to delete code sample" },
			{ status: 500 },
		);
	}
}
