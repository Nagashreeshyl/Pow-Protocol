export function generateBadgeSVG(
    repoName: string,
    overallScore: number,
    verificationId: string,
    date: string
): string {
    const getColor = (score: number) => {
        if (score >= 90) return '#22c55e';
        if (score >= 75) return '#84cc16';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const getLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 40) return 'Needs Work';
        return 'Poor';
    };

    const color = getColor(overallScore);
    const label = getLabel(overallScore);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="60" viewBox="0 0 280 60">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
    <linearGradient id="scoreBg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${color}22"/>
      <stop offset="100%" stop-color="${color}44"/>
    </linearGradient>
  </defs>
  <rect width="280" height="60" rx="8" fill="url(#bg)"/>
  <rect x="200" width="80" height="60" rx="0 8 8 0" fill="url(#scoreBg)"/>
  <rect x="200" width="80" height="60" rx="0" fill="${color}" opacity="0.15"/>
  <text x="12" y="22" fill="#a78bfa" font-family="sans-serif" font-size="10" font-weight="600">⚡ PROOF OF WORK</text>
  <text x="12" y="38" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="700">${repoName.slice(0, 22)}</text>
  <text x="12" y="52" fill="#94a3b8" font-family="sans-serif" font-size="9">${date}</text>
  <text x="240" y="30" fill="${color}" font-family="sans-serif" font-size="24" font-weight="800" text-anchor="middle">${overallScore}</text>
  <text x="240" y="46" fill="${color}" font-family="sans-serif" font-size="10" font-weight="500" text-anchor="middle">${label}</text>
</svg>`;
}
