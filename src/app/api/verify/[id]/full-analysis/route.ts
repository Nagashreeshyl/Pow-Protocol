import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import { getRepoInfo, cloneRepository } from "@/lib/github";
import { franc } from "franc-min";

const execAsync = util.promisify(exec);
export const maxDuration = 120; // 2 minutes to clone and run ESLint

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: jobId } = await params;
        const body = await req.json();
        const { repoUrl, previewUrl } = body;

        if (!repoUrl) {
            return NextResponse.json({ error: "Missing repoUrl" }, { status: 400 });
        }

        // Parse owner/repo from URL
        const githubMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#\.]+)/);
        if (!githubMatch) {
            return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
        }
        const [, owner, repo] = githubMatch;

        // 1. Clone Repo
        let tmpDir;
        try {
            tmpDir = await cloneRepository(repoUrl, jobId);
        } catch (err: any) {
            return NextResponse.json({ error: "Insufficient data (private repo?)" }, { status: 400 });
        }

        // 2. Fetch GitHub API Data
        const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;
        const langsUrl = `https://api.github.com/repos/${owner}/${repo}/languages`;

        const headers: any = { "User-Agent": "Verification-Scanner" };
        if (process.env.GITHUB_PAT) headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;

        const [repoRes, commitsRes, langsRes] = await Promise.all([
            fetch(repoInfoUrl, { headers }).then(r => r.json()),
            fetch(commitsUrl, { headers }).then(r => r.json()),
            fetch(langsUrl, { headers }).then(r => r.json())
        ]);

        if (repoRes.message && repoRes.message.includes("Not Found")) {
            return NextResponse.json({ error: "Insufficient data (private repo?)" }, { status: 400 });
        }

        // Calculate Authenticity
        const commitCount = Array.isArray(commitsRes) ? commitsRes.length : 0;
        let humanScore = 50;
        let evidence: string[] = [];

        if (commitCount > 0) {
            humanScore = Math.min(100, Math.floor(commitCount * 0.4 + 30));
            evidence.push(`${commitCount} commits found`);
        } else {
            evidence.push("0 commits accessible");
        }

        // 3. Scan File System
        const getAllFiles = (dir: string): string[] => {
            let results: string[] = [];
            const list = fs.readdirSync(dir);
            list.forEach((file) => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat && stat.isDirectory()) {
                    if (!['node_modules', '.git', 'dist', '.next'].includes(file)) {
                        results = results.concat(getAllFiles(fullPath));
                    }
                } else {
                    results.push(fullPath);
                }
            });
            return results;
        };

        const allFiles = getAllFiles(tmpDir);
        const codeFiles = allFiles.filter(f => f.match(/\.(js|ts|jsx|tsx|py|java|go|rs|c|cpp)$/));

        let sqlBugsFound: any[] = [];
        let styleVariance = 0;
        let authEvidenceCount = 0;

        let totalTabs = 0;
        let totalSpaces = 0;

        // Setup TruffleHog patterns
        const credPatterns = [
            /(?:api|access|secret)[_]?key[=:].{10,40}/i,
            /password[=:]\s*["'][^"']{5,}["']/i,
            /AKIA[0-9A-Z]{16}/,
            /xox[baprs]-[0-9a-zA-Z]{10,48}/
        ];
        let credentialsFound: any[] = [];

        for (const file of codeFiles) {
            const relPath = file.replace(`${tmpDir}/`, '');
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Bug: SQLi check
                if (line.match(/SELECT.*?FROM/i) && line.match(/\+.*req\./) && !line.match(/bind|param|\$/)) {
                    sqlBugsFound.push({ file: relPath, line: index + 1, desc: 'SQLi risk', commit: 'unknown' });
                }

                if (line.match(/const\s+\[[a-zA-Z]+\]\s+=/)) { // Extremely naive unused var detection logic for speed
                    // We'll let ESLint provide the real unused vars later
                }

                // Credential check
                for (const p of credPatterns) {
                    if (p.test(line)) {
                        credentialsFound.push({ type: 'Potential Secret', file: relPath, line: index + 1 });
                        break;
                    }
                }

                // Professionalism metrics
                if (line.startsWith('\t')) totalTabs++;
                if (line.startsWith('  ')) totalSpaces++;
            });
        }

        if (totalTabs > 0 && totalSpaces > 0) {
            styleVariance = 0.8;
            evidence.push('Mixed indentation styles detected');
        } else if (totalTabs > 0 || totalSpaces > 0) {
            styleVariance = 0.2;
            evidence.push('Consistent indentation detected');
            humanScore += 15; // consistent humans!
        }

        // ESLint headless scan
        try {
            const eslintOut = await execAsync(`npx eslint "${tmpDir}/**/*.{js,ts,jsx,tsx}" --format json`, { cwd: tmpDir }).catch((e) => e.stdout);
            if (eslintOut && eslintOut.startsWith('[')) {
                const eslintBugs = JSON.parse(eslintOut);
                eslintBugs.forEach((fileRep: any) => {
                    fileRep.messages.forEach((msg: any) => {
                        sqlBugsFound.push({ file: fileRep.filePath.replace(`${tmpDir}/`, ''), line: msg.line, desc: msg.message, commit: 'unknown' });
                    });
                });
            }
        } catch (e) {
            // Eslint might not be installed or parseable
        }

        // Language Extraction (cld3/franc-min fallback + GH)
        let primaryLang = "Unknown";
        let langConfidence = 1.0;
        let deps: string[] = [];

        if (langsRes && typeof langsRes === 'object' && !langsRes.message) {
            const sortedLangs = Object.entries(langsRes).sort((a: any, b: any) => b[1] - a[1]);
            if (sortedLangs.length > 0) {
                primaryLang = sortedLangs[0][0];
                const totalBytes = sortedLangs.reduce((acc: number, [_, val]: any) => acc + val, 0);
                langConfidence = Number(((sortedLangs[0][1] as number) / totalBytes).toFixed(2));
            }
        } else if (allFiles.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
            primaryLang = 'TypeScript';
        }

        // package.json parsing
        const packageJsonPath = path.join(tmpDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (pkg.dependencies) {
                    deps = Object.keys(pkg.dependencies).slice(0, 5);
                }
            } catch (e) { }
        }

        // Vercel / Action checks
        let deployStatus = { status: 'unknown', duration: 'N/A', errors: 0 };
        if (previewUrl && process.env.VERCEL_API_TOKEN) {
            try {
                const deploys = await fetch(`https://api.vercel.com/v6/deployments?app=${repo}`, {
                    headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` }
                }).then(r => r.json());
                if (deploys.deployments && deploys.deployments.length > 0) {
                    const last = deploys.deployments[0];
                    deployStatus = {
                        status: last.state === 'READY' ? 'success' : 'failed',
                        duration: `${Math.floor((last.ready - last.created) / 1000)}s`,
                        errors: last.state === 'ERROR' ? 1 : 0
                    };
                }
            } catch (e) { }
        }

        // Professionalism / Prettier
        let prettierScore = 50;
        try {
            const prettierOut = await execAsync(`npx prettier --list-different "${tmpDir}/**/*.{js,ts,jsx,tsx,css,json}"`, { cwd: tmpDir }).catch((e) => e.stdout);
            const badFiles = prettierOut ? prettierOut.split('\n').filter((l: string) => l.trim().length > 0).length : 0;
            const total = codeFiles.length;
            if (total > 0) {
                prettierScore = Math.floor(Math.max(0, 100 - (badFiles / total) * 100));
            } else {
                prettierScore = 100;
            }
        } catch (e) { }

        const professionalismScore = Math.floor((prettierScore + (styleVariance === 0.2 ? 100 : 50)) / 2);

        // Final Output
        const finalResults = {
            authenticity: { human: Math.min(100, humanScore), evidence },
            bugs: sqlBugsFound.slice(0, 10), // Take top 10 to avoid payload bloat
            language: { primary: primaryLang, confidence: langConfidence, deps },
            deploy: deployStatus,
            professionalism: { score: professionalismScore, prettier: prettierScore, indent_consistent: styleVariance === 0.2 },
            credentials: credentialsFound.slice(0, 5)
        };

        // Cleanup
        try {
            await execAsync(`rm -rf ${tmpDir}`);
        } catch (e) { }

        return NextResponse.json(finalResults);
    } catch (err: any) {
        console.error("Full analysis failed:", err);
        return NextResponse.json({ error: "Insufficient data (private repo?)" }, { status: 500 });
    }
}
