import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { generateBadgeSVG } from "@/lib/badge";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const docRef = doc(db, "verifications", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return new NextResponse("Badge not found", { status: 404 });
        }

        const data = docSnap.data();

        if (!data || !data.scores) {
            return new NextResponse("Badge not found", { status: 404 });
        }

        const svg = generateBadgeSVG(
            data.repo_name,
            data.scores.overall,
            id,
            data.created_at ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString()
        );

        return new NextResponse(svg, {
            headers: {
                "Content-Type": "image/svg+xml",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (err) {
        console.error("Badge error:", err);
        return new NextResponse("Error generating badge", { status: 500 });
    }
}
