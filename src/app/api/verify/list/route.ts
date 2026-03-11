import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // To avoid Firebase index errors during hackathon, we fetch and sort client-side
        // until the user manually creates the index via the link in the logs.
        try {
            const q = query(
                collection(db, "verifications"),
                where("user_id", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const verifications = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side by created_at desc
            verifications.sort((a: any, b: any) => {
                const dateA = new Date(a.created_at || a.updated_at?.toDate?.() || 0).getTime();
                const dateB = new Date(b.created_at || b.updated_at?.toDate?.() || 0).getTime();
                return dateB - dateA;
            });

            return NextResponse.json({ verifications });
        } catch (err: any) {
            console.error("List error:", err);
            return NextResponse.json({ verifications: [] });
        }
    } catch (outerErr) {
        console.error("Outer List error:", outerErr);
        return NextResponse.json({ verifications: [] }, { status: 500 });
    }
}
