import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const userId = searchParams.get("userId");

        if (!id || !userId) {
            return NextResponse.json({ error: "Missing id or userId" }, { status: 400 });
        }

        const docRef = doc(db, "verifications", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        // Basic security check to ensure user owns the report
        if (docSnap.data().user_id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await deleteDoc(docRef);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
