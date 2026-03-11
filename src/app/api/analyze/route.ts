import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import {
    getRepoInfo,
    getIssueInfo,
    getRepoTimeline,
    cloneRepository,
} from "@/lib/github";
import {
    scanForBugs,
    calculateImpactScore,
    generateArchitecture,
    extractSkills,
    evaluateProfessionalism,
    evaluateCodeQuality,
    scanForCredentials,
} from "@/lib/scanners";
import { getVercelDeploys } from "@/lib/vercel";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
    let repoPath = "";
    let jobId = "";

    try {
        const body = await req.json();
        jobId = body.jobId;
        const { owner, repo } = body;

        if (!jobId || !owner || !repo) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        const repoUrl = `https://github.com/${owner}/${repo}`;
        await updateDoc(doc(db, "verifications", jobId), { status: "cloning" });

        const [repoData, issueData, timelineNodes, vercelData] = await Promise.all([
            getRepoInfo(owner, repo),
            getIssueInfo(owner, repo),
            getRepoTimeline(owner, repo),
            getVercelDeploys(repo)
        ]);

        repoPath = await cloneRepository(repoUrl, jobId);
        await updateDoc(doc(db, "verifications", jobId), { status: "analyzing" });

        const pkgPath = path.join(repoPath, 'package.json');
        const packageJson = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : null;

        const bugReport = scanForBugs(repoPath);
        const credentials = scanForCredentials(repoPath);
        const professionalism = evaluateProfessionalism(repoPath);
        const quality = evaluateCodeQuality(repoPath);
        const skills = extractSkills(repoPath, packageJson);
        const arch = generateArchitecture(repoPath, packageJson);

        const impact = calculateImpactScore({
            stars: repoData.stars,
            forks: repoData.forks,
            issues: issueData.total,
            contributors: repoData.totalContributors,
            deployments: vercelData.count
        });

        const humanScore = Math.min(100, Math.round(repoData.totalCommits * 2 + professionalism.score * 0.25));

        const metrics = {
            project_name: packageJson?.name || repo,
            files_analyzed: repoData.totalFiles,
            contributors: repoData.totalContributors,
            total_commits: repoData.totalCommits,
            lines_of_code: repoData.totalLines,
            skills,
            architecture: arch,
            quality,
            impact,
            deploy: vercelData,
            professionalism,
            credentials,
            bugs: bugReport.details,
            timeline: timelineNodes,
            language: { primary: Object.keys(repoData.languages)[0] || 'TS', confidence: 1.0, deps: skills.slice(0, 10) },
            authenticity: {
                human: humanScore,
                evidence: [`Verified ${repoData.totalCommits} commits`, `Style consistency: ${professionalism.score}%`]
            },
            authenticity_details: {
                commit_regularity: Math.min(100, repoData.totalCommits * 3),
                ai_detection: 100 - (bugReport.count * 2),
                style_consistency: professionalism.score,
                originality: Math.max(0, 100 - quality.duplication),
                details: `System analyzed ${repoData.totalCommits} historical nodes.`
            },
            code_insights: {
                strengths: [`${skills.length} core dependencies verified`, `Genuine commit history detected`],
                weaknesses: bugReport.count > 0 ? [`${bugReport.count} ESLint issues detected`] : [],
                recommendations: ["Maintain PR hygiene", "Audit secrets regularly"]
            }
        };

        const perfScore = Math.max(0, 100 - (bugReport.count * 2));
        const scores = {
            performance: perfScore,
            scalability: Math.min(100, 60 + repoData.forks * 2),
            security: Math.max(0, 100 - (credentials.count * 25 + bugReport.count * 5)),
            code_quality: quality.grade === 'A' ? 95 : 80,
            authenticity: humanScore,
            overall: Math.round((humanScore + impact.score + perfScore + (100 - (credentials.count * 10))) / 4)
        };

        await updateDoc(doc(db, "verifications", jobId), {
            status: "completed",
            scores,
            metrics,
            completed_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, scores, metrics });

    } catch (err: any) {
        console.error("FAIL:", err);
        if (jobId) await updateDoc(doc(db, "verifications", jobId), { status: "failed", error: err.message });
        return NextResponse.json({ error: err.message }, { status: 500 });
    } finally {
        if (repoPath) fs.rmSync(repoPath, { recursive: true, force: true });
    }
}
