import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { parseRepoUrl } from "@/lib/github";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { repoUrl, projectType, userId } = body;

        if (!repoUrl || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate repo URL
        const parsed = parseRepoUrl(repoUrl);
        if (!parsed) {
            return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
        }

        // Create verification record in Firestore
        const docRef = await addDoc(collection(db, "verifications"), {
            user_id: userId,
            repo_url: repoUrl,
            repo_name: `${parsed.owner}/${parsed.repo}`,
            project_type: projectType || "web_app",
            status: "pending",
            created_at: new Date().toISOString(), // Using ISO string for consistency with previous schema
            updated_at: serverTimestamp(),
        });

        const jobId = docRef.id;

        // Trigger async analysis
        const baseUrl = req.nextUrl.origin;
        fetch(`${baseUrl}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jobId: jobId,
                repoUrl,
                projectType: projectType || "web_app",
                owner: parsed.owner,
                repo: parsed.repo,
            }),
        }).catch((err) => console.error("Failed to trigger analysis:", err));

        return NextResponse.json({ jobId: jobId, status: "pending" });
    } catch (err) {
        console.error("Submit error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
