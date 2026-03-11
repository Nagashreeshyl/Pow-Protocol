import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        const docRef = doc(db, "verifications", jobId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: "Verification not found" }, { status: 404 });
        }

        const data = docSnap.data();

        const statusMessages: Record<string, string> = {
            pending: "QUEUED_FOR_VERIFICATION",
            cloning: "FETCHING_GH_PIPELINE_DATA",
            analyzing: "AI_CODE_ANALYSIS_IN_PROGRESS",
            scoring: "CALCULATING_FINAL_KINETIC_SCORES",
            completed: "PROTOCOL_VERIFICATION_COMPLETE",
            failed: "PROTOCOL_VERIFICATION_FAILED",
        };

        return NextResponse.json({
            status: data.status,
            message: statusMessages[data.status] || data.status.toUpperCase(),
            error: data.error || null,
            details: data.details || null
        });
    } catch (err) {
        console.error("Status error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
