import { CommitInfo, RepoInfo } from './github';

export interface AuthenticityDetails {
    commit_regularity: number;
    ai_detection: number;
    style_consistency: number;
    originality: number;
}

export function calculateAuthenticityScore(
    commitInfo: CommitInfo,
    repoInfo: RepoInfo
): { score: number; details: AuthenticityDetails } {
    // 1. Commit Regularity (25%)
    // Higher score for regular, consistent commits
    let commitRegularity = 0;
    if (commitInfo.totalCommits >= 50) commitRegularity = 95;
    else if (commitInfo.totalCommits >= 20) commitRegularity = 85;
    else if (commitInfo.totalCommits >= 10) commitRegularity = 70;
    else if (commitInfo.totalCommits >= 5) commitRegularity = 55;
    else commitRegularity = 30;

    // Bonus for consistent frequency
    if (commitInfo.commitFrequency > 3) commitRegularity = Math.min(100, commitRegularity + 10);

    // 2. AI Detection Confidence (35%) - inverse (higher = more human)
    // Look at commit message patterns
    const commitMessages = commitInfo.recentCommits.map((c) => c.message);
    let aiDetection = 80; // Start with assumption of mostly human

    // Check for generic AI-like commit messages
    const genericMessages = commitMessages.filter(
        (m) =>
            m.length < 10 ||
            m === 'Initial commit' ||
            m === 'Update' ||
            m.startsWith('feat:') ||
            m.toLowerCase().includes('generated')
    );
    const genericRatio = genericMessages.length / Math.max(commitMessages.length, 1);
    if (genericRatio > 0.7) aiDetection -= 20;
    if (genericRatio > 0.5) aiDetection -= 10;

    // More contributors = more likely authentic
    if (commitInfo.contributors.length > 3) aiDetection = Math.min(100, aiDetection + 10);

    // 3. Style Consistency (20%)
    // Check if the same authors are consistent
    let styleConsistency = 75;
    if (commitInfo.contributors.length === 1) {
        styleConsistency = 90; // Single author = consistent style
    } else if (commitInfo.contributors.length <= 3) {
        styleConsistency = 80;
    }

    // Bonus for project age
    const firstDate = new Date(commitInfo.firstCommitDate);
    const lastDate = new Date(commitInfo.lastCommitDate);
    const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 90) styleConsistency = Math.min(100, styleConsistency + 10);
    if (daysDiff > 30) styleConsistency = Math.min(100, styleConsistency + 5);

    // 4. Originality (20%)
    let originality = 70;
    // Projects with good descriptions are more likely original
    if (repoInfo.description && repoInfo.description.length > 20) originality += 5;
    // Having a license shows intentional creation
    if (repoInfo.license) originality += 5;
    // Having tests shows depth
    if (repoInfo.hasTests) originality += 10;
    // Having CI shows professional setup
    if (repoInfo.hasCI) originality += 5;
    // Stars from others validate originality
    if (repoInfo.stars > 0) originality += 5;

    originality = Math.min(100, originality);

    const details: AuthenticityDetails = {
        commit_regularity: commitRegularity,
        ai_detection: aiDetection,
        style_consistency: styleConsistency,
        originality,
    };

    // Weighted average
    const score = Math.round(
        commitRegularity * 0.25 +
        aiDetection * 0.35 +
        styleConsistency * 0.2 +
        originality * 0.2
    );

    return { score: Math.min(100, Math.max(0, score)), details };
}

export function calculatePerformanceScore(repoInfo: RepoInfo, languages: Record<string, number>): number {
    let score = 60; // Base score

    // Modern frameworks boost performance expectations
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const primaryLanguage = Object.entries(languages).sort((a, b) => b[1] - a[1])[0];

    if (primaryLanguage) {
        const [lang] = primaryLanguage;
        // Modern, performant languages/frameworks
        if (['TypeScript', 'Rust', 'Go'].includes(lang)) score += 10;
        if (['JavaScript', 'Python'].includes(lang)) score += 5;
    }

    // Project size (moderate is good)
    if (repoInfo.size > 100 && repoInfo.size < 50000) score += 10;

    // Has tests
    if (repoInfo.hasTests) score += 10;

    // Has CI/CD
    if (repoInfo.hasCI) score += 5;

    // Not too many languages (focused is good)
    if (Object.keys(languages).length <= 5) score += 5;

    return Math.min(100, Math.max(0, score));
}

export function calculateOverallScore(scores: {
    performance: number;
    scalability: number;
    security: number;
    code_quality: number;
    authenticity: number;
}): number {
    return Math.round(
        scores.performance * 0.15 +
        scores.scalability * 0.2 +
        scores.security * 0.2 +
        scores.code_quality * 0.25 +
        scores.authenticity * 0.2
    );
}
