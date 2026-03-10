import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { getRepoInfo, getCommitInfo, getRepoFiles } from "@/lib/github";
import { analyzeCode } from "@/lib/groq";
import { calculateAuthenticityScore, calculatePerformanceScore, calculateOverallScore } from "@/lib/scoring";

export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { jobId, owner, repo, projectType } = body;

        if (!jobId || !owner || !repo) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Step 1: Cloning - Fetch repo info
        await updateDoc(doc(db, "verifications", jobId), { status: "cloning" });

        let repoInfo, commitInfo, files;
        try {
            [repoInfo, commitInfo, files] = await Promise.all([
                getRepoInfo(owner, repo),
                getCommitInfo(owner, repo),
                getRepoFiles(owner, repo, 20, 10000),
            ]);
        } catch (err) {
            console.error("GitHub fetch error:", err);
            await updateDoc(doc(db, "verifications", jobId), { status: "failed" });
            return NextResponse.json({ error: "Failed to fetch repository data" }, { status: 500 });
        }

        // Step 2: Analyzing - AI code analysis
        await updateDoc(doc(db, "verifications", jobId), { status: "analyzing" });

        let codeAnalysis;
        try {
            codeAnalysis = await analyzeCode(
                repoInfo.fullName,
                repoInfo.languages,
                files.map((f) => ({ path: f.path, content: f.content })),
                projectType,
                commitInfo
            );
        } catch (err) {
            console.error("AI analysis error:", err);
            // Use fallback scores
            codeAnalysis = {
                overall_score: 65,
                authenticity: { score: 60, details: "Analysis unavailable" },
                scalability: { score: 60, details: "Analysis unavailable" },
                security: { score: 60, details: "Analysis unavailable" },
                code_quality: { score: 65, details: "Analysis unavailable" },
                best_practices: { score: 65, details: "Analysis unavailable" },
                architecture: { score: 65, details: "Analysis unavailable" },
                strengths: ["Repository accessible", "Code structure present"],
                weaknesses: ["Detailed analysis unavailable"],
                recommendations: ["Re-run analysis for detailed insights"],
                summary: "Partial analysis completed.",
            };
        }

        // Step 3: Scoring
        await updateDoc(doc(db, "verifications", jobId), { status: "scoring" });

        // Calculate authenticity
        const authenticity = calculateAuthenticityScore(commitInfo, repoInfo);

        // Calculate performance
        const performanceScore = calculatePerformanceScore(repoInfo, repoInfo.languages);

        // Build final scores. Prefer Groq AI score for authenticity, but keep legacy calculation as details backup.
        const scores = {
            performance: performanceScore,
            scalability: codeAnalysis.scalability.score,
            security: codeAnalysis.security.score,
            code_quality: codeAnalysis.code_quality.score,
            authenticity: codeAnalysis.authenticity.score,
            overall: 0,
        };
        scores.overall = calculateOverallScore(scores);

        // Build metrics
        const totalLinesEstimate = files.reduce((acc, f) => acc + f.content.split("\n").length, 0);
        const metrics = {
            languages: repoInfo.languages,
            total_commits: commitInfo.totalCommits,
            contributors: commitInfo.contributors.length,
            files_analyzed: files.length,
            lines_of_code: totalLinesEstimate,
            ai_analysis: codeAnalysis.summary,
            authenticity_details: {
                score: codeAnalysis.authenticity.score,
                details: codeAnalysis.authenticity.details,
                ...authenticity.details
            },
            code_insights: {
                strengths: codeAnalysis.strengths,
                weaknesses: codeAnalysis.weaknesses,
                recommendations: codeAnalysis.recommendations,
            },
        };

        // Step 4: Complete - Update database
        try {
            await updateDoc(doc(db, "verifications", jobId), {
                status: "completed",
                scores,
                metrics,
                completed_at: new Date().toISOString(),
            });
        } catch (updateError) {
            console.error("Update error:", updateError);
            await updateDoc(doc(db, "verifications", jobId), { status: "failed" });
            return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
        }

        return NextResponse.json({ success: true, scores });
    } catch (err) {
        console.error("Analysis pipeline error:", err);
        const { jobId } = await req.json().catch(() => ({ jobId: null }));
        if (jobId) {
            await updateDoc(doc(db, "verifications", jobId), { status: "failed" });
        }
        return NextResponse.json({ error: "Analysis pipeline failed" }, { status: 500 });
    }
}
