import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function scanForBugs(repoPath: string) {
    try {
        // Real ESLint scan
        const output = execSync(`npx eslint "${repoPath}/**/*.{js,ts,jsx,tsx}" --format=json`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
        const results = JSON.parse(output);

        const details: any[] = [];
        results.forEach((file: any) => {
            file.messages.forEach((msg: any) => {
                details.push({
                    file: path.relative(repoPath, file.filePath),
                    line: msg.line,
                    desc: msg.message
                });
            });
        });

        return {
            count: details.length,
            summary: details.length > 0 ? `Found ${details.length} ESLint issues.` : 'No ESLint issues found.',
            details: details.slice(0, 15)
        };
    } catch (e: any) {
        if (e.stdout) {
            try {
                const results = JSON.parse(e.stdout.toString());
                const details: any[] = [];
                results.forEach((file: any) => {
                    file.messages.forEach((msg: any) => {
                        details.push({
                            file: path.relative(repoPath, file.filePath),
                            line: msg.line,
                            desc: msg.message
                        });
                    });
                });
                return { count: details.length, summary: `Found ${details.length} ESLint issues.`, details: details.slice(0, 15) };
            } catch (inner) { }
        }
        return { count: 0, summary: 'Data unavailable', details: [] };
    }
}

export function scanForDuplicates(repoPath: string) {
    try {
        // Real jscpd scan
        execSync(`npx jscpd "${repoPath}" --reporter json --output /tmp/jscpd-${path.basename(repoPath)} --silent`, { encoding: 'utf-8' });
        const reportPath = `/tmp/jscpd-${path.basename(repoPath)}/jscpd-report.json`;
        if (fs.existsSync(reportPath)) {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
            return Math.round(report.statistics.total.percentage || 0);
        }
    } catch (e) { }
    return 0;
}

export function analyzeIndentationConsistency(repoPath: string) {
    let totalFiles = 0;
    let consistentFiles = 0;

    const walk = (dir: string) => {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            if (fs.statSync(p).isDirectory()) {
                if (!['node_modules', '.git', '.next', 'dist'].includes(f)) walk(p);
            } else if (/\.(js|ts|jsx|tsx|css|html)$/.test(f)) {
                totalFiles++;
                const content = fs.readFileSync(p, 'utf-8');
                const hasTabs = /\t/.test(content);
                const hasSpaces = /  /.test(content);
                if (!(hasTabs && hasSpaces)) consistentFiles++;
            }
        });
    };

    try { walk(repoPath); } catch (e) { }
    return totalFiles > 0 ? consistentFiles / totalFiles : 1;
}

export function scanForCredentials(repoPath: string) {
    const credPatterns = [
        /api[-]?key[s]?[:=]\s*[a-zA-Z0-9]{20,}/,
        /password[:=]\s*['"][^'"]{5,}['"]/,
        /aws[-]?access[_-]?key/i,
        /sk-[a-zA-Z0-9]{20,}/,
        /ghp_[a-zA-Z0-9]{36}/
    ];
    let count = 0;
    const details: any[] = [];

    const walk = (dir: string) => {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            if (fs.statSync(p).isDirectory()) {
                if (!['node_modules', '.git', '.next'].includes(f)) walk(p);
            } else if (/\.(js|ts|jsx|tsx|json|env|md)$/.test(f)) {
                const content = fs.readFileSync(p, 'utf-8');
                content.split('\n').forEach((line, idx) => {
                    credPatterns.forEach(pat => {
                        if (pat.test(line)) {
                            count++;
                            if (details.length < 10) {
                                details.push({
                                    file: path.relative(repoPath, p),
                                    line: idx + 1,
                                    preview: line.trim().substring(0, 50) + (line.length > 50 ? '...' : '')
                                });
                            }
                        }
                    });
                });
            }
        });
    };

    try { walk(repoPath); } catch (e) { }
    return { count, details };
}

export function evaluateProfessionalism(repoPath: string) {
    const consistency = analyzeIndentationConsistency(repoPath);
    const score = Math.round(consistency * 100);

    const files = fs.readdirSync(repoPath);
    const hasStandardDirs = ['src', 'app', 'components', 'lib', 'pages'].some(d => files.includes(d));
    const structure = hasStandardDirs ? 95 : 70;

    return {
        score,
        prettier: score,
        indentation: score,
        syntax: score,
        spacing: score,
        structure
    };
}

export function evaluateCodeQuality(repoPath: string) {
    const duplication = scanForDuplicates(repoPath);
    let complexity = 1.0;
    let testFiles = 0;
    let sourceFiles = 0;

    const walk = (dir: string) => {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            if (fs.statSync(p).isDirectory()) {
                if (!['node_modules', '.git', '.next'].includes(f)) walk(p);
            } else if (/\.(js|ts|jsx|tsx)$/.test(f)) {
                sourceFiles++;
                if (f.includes('.test.') || f.includes('.spec.') || dir.includes('test')) testFiles++;
            }
        });
    };
    try { walk(repoPath); } catch { }

    try {
        const out = execSync(`grep -rE "if|for|while|switch" "${repoPath}" | wc -l`).toString();
        complexity = Math.min(10, 1 + (parseInt(out) / 100));
    } catch { }

    const coverage = sourceFiles > 0 ? Math.round((testFiles / sourceFiles) * 100) : 0;
    const grade = (duplication < 5 && coverage > 20) ? 'A' : (duplication < 15) ? 'B' : 'C';

    return {
        grade,
        maintainability: grade,
        complexity: parseFloat(complexity.toFixed(1)),
        duplication,
        coverage
    };
}

export function calculateImpactScore(stats: { stars: number; forks: number; issues: number; contributors: number; deployments: number }) {
    const score = Math.round(
        (stats.stars * 0.3) +
        (stats.forks * 0.2) +
        (stats.issues * 0.15) +
        (stats.contributors * 0.2) +
        (stats.deployments * 0.15)
    );
    return { score: Math.min(100, score), metrics: stats };
}

export function generateArchitecture(repoPath: string, packageJson: any) {
    const files = fs.readdirSync(repoPath);
    const frontend = files.includes('src/app') || files.includes('app') ? 'App' : 'UI';
    const api = files.includes('api') || files.includes('server') ? 'API' : 'Logic';

    const deps = JSON.stringify(packageJson?.dependencies || {});
    let db = 'DB';
    if (deps.includes('prisma')) db = 'Prisma';
    else if (deps.includes('firebase')) db = 'Firestore';
    else if (deps.includes('mongodb')) db = 'MongoDB';
    else if (deps.includes('pg')) db = 'PostgreSQL';

    return `graph LR
  ${frontend} --> ${api}
  ${api} --> ${db}`;
}

export function extractSkills(repoPath: string, packageJson: any) {
    const skills = new Set<string>();
    if (packageJson) {
        Object.keys(packageJson.dependencies || {}).forEach(d => {
            if (!['react-dom', 'next', 'react'].includes(d)) skills.add(d);
        });
    }

    const walk = (dir: string) => {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            if (fs.statSync(p).isDirectory()) {
                if (!['node_modules', '.git', '.next'].includes(f)) walk(p);
            } else if (/\.(js|ts|jsx|tsx)$/.test(f)) {
                const content = fs.readFileSync(p, 'utf-8');
                const matches = content.match(/from ['"]([^'"]+)['"]/g);
                if (matches) {
                    matches.forEach(m => {
                        const lib = m.replace(/from ['"]/, '').replace(/['"]/, '');
                        if (!lib.startsWith('.') && !lib.startsWith('@/')) skills.add(lib);
                    });
                }
            }
        });
    };

    try { walk(repoPath); } catch (e) { }
    return Array.from(skills).slice(0, 15).sort();
}
