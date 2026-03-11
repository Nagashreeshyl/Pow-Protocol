import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

function getOctokit() {
    return new Octokit({
        auth: process.env.GITHUB_PAT,
    });
}

export interface RepoInfo {
    name: string;
    fullName: string;
    description: string | null;
    languages: Record<string, number>;
    stars: number;
    forks: number;
    openIssues: number;
    defaultBranch: string;
    createdAt: string;
    updatedAt: string;
    size: number;
    hasTests: boolean;
    hasCI: boolean;
    license: string | null;
}

export interface CommitInfo {
    totalCommits: number;
    recentCommits: {
        sha: string;
        message: string;
        date: string;
        author: string;
        additions: number;
        deletions: number;
    }[];
    commitFrequency: number; // avg commits per week
    contributors: string[];
    firstCommitDate: string;
    lastCommitDate: string;
}

export interface IssueInfo {
    total: number;
    closed: number;
}

export interface TimelineNode {
    type: 'commit' | 'pr' | 'action';
    label: string;
    date: string;
    message?: string;
}

export interface FileContent {
    path: string;
    content: string;
    size: number;
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/\?\#]+)/i,
        /^([^\/]+)\/([^\/]+)$/i,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
        }
    }
    return null;
}

export async function getRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
    const octokit = getOctokit();

    const { data: repoData } = await octokit.repos.get({ owner, repo });

    // Get languages
    const { data: languages } = await octokit.repos.listLanguages({ owner, repo });

    // Check for tests and CI
    let hasTests = false;
    let hasCI = false;
    try {
        const { data: contents } = await octokit.repos.getContent({ owner, repo, path: '' });
        if (Array.isArray(contents)) {
            const names = contents.map((f) => f.name.toLowerCase());
            hasTests = names.some((n) =>
                ['test', 'tests', '__tests__', 'spec', 'specs', 'jest.config.js', 'jest.config.ts', 'vitest.config.ts'].includes(n)
            );
            hasCI = names.some((n) => ['.github', '.circleci', '.travis.yml', 'Jenkinsfile'].includes(n));
        }
    } catch {
        // ignore
    }

    return {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        languages,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        defaultBranch: repoData.default_branch,
        createdAt: repoData.created_at!,
        updatedAt: repoData.updated_at!,
        size: repoData.size,
        hasTests,
        hasCI,
        license: repoData.license?.name || null,
    };
}

export async function getIssueInfo(owner: string, repo: string): Promise<IssueInfo> {
    const octokit = getOctokit();
    try {
        const { data: issues } = await octokit.issues.listForRepo({
            owner,
            repo,
            state: 'all',
            per_page: 100,
        });

        return {
            total: issues.length,
            closed: issues.filter((i) => i.state === 'closed').length,
        };
    } catch {
        return { total: 0, closed: 0 };
    }
}

export async function getRepoTimeline(owner: string, repo: string): Promise<TimelineNode[]> {
    const octokit = getOctokit();
    const timeline: TimelineNode[] = [];

    try {
        // Commits
        const { data: commits } = await octokit.repos.listCommits({ owner, repo, per_page: 15 });
        commits.forEach((c) => {
            timeline.push({
                type: 'commit',
                label: `Commit by ${c.commit.author?.name || 'Unknown'}`,
                date: c.commit.author?.date || '',
                message: c.commit.message,
            });
        });

        // PRs
        const { data: pulls } = await octokit.pulls.list({ owner, repo, state: 'all', per_page: 10 });
        pulls.forEach((p) => {
            timeline.push({
                type: 'pr',
                label: `PR #${p.number}: ${p.state}`,
                date: p.created_at || '',
                message: p.title,
            });
        });

        // Sort by date descending
        return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
        return timeline;
    }
}

export async function getCommitInfo(owner: string, repo: string): Promise<CommitInfo> {
    const octokit = getOctokit();

    // Get recent commits (up to 100)
    const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 100,
    });

    const recentCommits = commits.slice(0, 20).map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        date: c.commit.author?.date || '',
        author: c.commit.author?.name || 'Unknown',
        additions: 0,
        deletions: 0,
    }));

    const contributors = [...new Set(commits.map((c) => c.commit.author?.name || 'Unknown'))];

    const dates = commits
        .map((c) => new Date(c.commit.author?.date || ''))
        .filter((d) => !isNaN(d.getTime()));

    const firstCommitDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString() : '';
    const lastCommitDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString() : '';

    // Calculate commit frequency (commits per week)
    const timeSpanWeeks = dates.length > 1
        ? (Math.max(...dates.map((d) => d.getTime())) - Math.min(...dates.map((d) => d.getTime()))) / (7 * 24 * 60 * 60 * 1000)
        : 1;
    const commitFrequency = Math.round((commits.length / Math.max(timeSpanWeeks, 1)) * 10) / 10;

    return {
        totalCommits: commits.length,
        recentCommits,
        commitFrequency,
        contributors,
        firstCommitDate,
        lastCommitDate,
    };
}

export async function getRepoFiles(
    owner: string,
    repo: string,
    maxFiles: number = 10,
    maxSizePerFile: number = 8000
): Promise<FileContent[]> {
    const octokit = getOctokit();
    const files: FileContent[] = [];

    // Prioritize important files
    const priorityPaths = [
        'README.md',
        'package.json',
        'index.html',
        'about.html',
        'src/app/page.tsx',
        'src/app/layout.tsx',
        'app/page.tsx',
        'app/layout.tsx',
        'src/index.ts',
        'src/index.js',
        'index.ts',
        'index.js',
        'src/main.ts',
        'src/main.js',
        'main.py',
        'app.py',
        'server.js',
        'server.ts',
        'go.mod',
        'Cargo.toml',
    ];

    for (const path of priorityPaths) {
        if (files.length >= maxFiles) break;
        try {
            const { data } = await octokit.repos.getContent({ owner, repo, path });
            if (!Array.isArray(data) && data.type === 'file' && data.content) {
                const content = Buffer.from(data.content, 'base64').toString('utf-8');
                if (content.length <= maxSizePerFile) {
                    files.push({ path, content, size: data.size });
                }
            }
        } catch {
            // File doesn't exist, skip
        }
    }

    // If we still need more files, get from tree
    if (files.length < maxFiles) {
        try {
            const { data: treeData } = await octokit.git.getTree({
                owner,
                repo,
                tree_sha: 'HEAD',
                recursive: 'true',
            });

            const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.css', '.html'];
            const codeFiles = treeData.tree
                .filter(
                    (f) =>
                        f.type === 'blob' &&
                        f.path &&
                        codeExtensions.some((ext) => f.path!.endsWith(ext)) &&
                        !f.path!.includes('node_modules') &&
                        !f.path!.includes('.next') &&
                        !f.path!.includes('dist') &&
                        (f.size || 0) < maxSizePerFile &&
                        !files.some((ef) => ef.path === f.path)
                )
                .slice(0, maxFiles - files.length);

            for (const file of codeFiles) {
                try {
                    const { data } = await octokit.repos.getContent({
                        owner,
                        repo,
                        path: file.path!,
                    });
                    if (!Array.isArray(data) && data.type === 'file' && data.content) {
                        const content = Buffer.from(data.content, 'base64').toString('utf-8');
                        files.push({ path: file.path!, content, size: data.size });
                    }
                } catch {
                    // Skip
                }
            }
        } catch {
            // Skip tree fetching if it fails
        }
    }

    return files;
}

export async function cloneRepository(repoUrl: string, jobId: string): Promise<string> {
    const tmpDir = `/tmp/${jobId}`;
    try {
        await execAsync(`rm -rf ${tmpDir}`);
        const cloneUrl = repoUrl.toLocaleLowerCase().startsWith('http') ? repoUrl : `https://github.com/${repoUrl}`;
        await execAsync(`git clone --depth 1 ${cloneUrl} ${tmpDir}`);
        return tmpDir;
    } catch (e: any) {
        throw new Error(`Failed to clone repository: ${e.message}`);
    }
}
