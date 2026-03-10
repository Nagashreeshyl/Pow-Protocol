import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        try {
            const q = query(
                collection(db, "verifications"),
                where("user_id", "==", userId),
                orderBy("created_at", "desc")
            );

            const querySnapshot = await getDocs(q);
            const verifications = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return NextResponse.json({ verifications });
        } catch (err: any) {
            console.error("List error (primary query):", err);

            // Fallback for missing index: try without orderBy
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

                // Sort client-side as fallback
                verifications.sort((a: any, b: any) =>
                    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                );

                return NextResponse.json({ verifications });
            } catch (fallbackErr) {
                console.error("List error (fallback query):", fallbackErr);
                return NextResponse.json({ verifications: [] });
            }
        }
    } catch (outerErr) {
        console.error("Outer List error:", outerErr);
        return NextResponse.json({ verifications: [] }, { status: 500 });
    }
}
