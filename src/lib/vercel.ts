export interface VercelDeployInfo {
    status: string;
    duration: string;
    errors: number;
    count: number;
}

export async function getVercelDeploys(repoName: string): Promise<VercelDeployInfo> {
    const token = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
    if (!token) {
        console.warn("Missing VERCEL_TOKEN, returning empty deployments");
        return { status: 'Data unavailable', duration: '0s', errors: 0, count: 0 };
    }

    try {
        // We attempt to find the project by repo name first
        const appName = repoName.split('/').pop();
        const res = await fetch(`https://api.vercel.com/v6/deployments?app=${appName}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.deployments) {
            const count = data.pagination?.count || data.deployments.length;
            if (count > 0) {
                const last = data.deployments[0];
                const readyTime = last.ready || Date.now();
                const createdTime = last.created || Date.now();

                return {
                    status: last.state === 'READY' ? 'success' : 'failed',
                    duration: `${Math.floor((readyTime - createdTime) / 1000)}s`,
                    errors: data.deployments.filter((d: any) => d.state === 'ERROR').length,
                    count
                };
            }
        }
    } catch (e) {
        console.error('Vercel API error:', e);
    }

    return { status: 'Data unavailable', duration: '0s', errors: 0, count: 0 };
}
