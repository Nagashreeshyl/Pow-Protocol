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

        if (data.status !== "completed") {
            return NextResponse.json({ error: "Verification not yet completed" }, { status: 400 });
        }

        return NextResponse.json({
            id: docSnap.id,
            ...data
        });
    } catch (err) {
        console.error("Results error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
