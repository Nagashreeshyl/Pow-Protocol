export interface Verification {
    id: string;
    user_id: string;
    repo_url: string;
    repo_name: string;
    project_type: 'web_app' | 'api' | 'full_stack';
    status: 'pending' | 'cloning' | 'analyzing' | 'scoring' | 'completed' | 'failed';
    scores: {
        overall: number;
        performance: number;
        scalability: number;
        security: number;
        code_quality: number;
        authenticity: number;
    } | null;
    metrics: {
        languages: Record<string, number>;
        total_commits: number;
        contributors: number;
        files_analyzed: number;
        lines_of_code: number;
        ai_analysis: string;
        authenticity_details: {
            commit_regularity: number;
            ai_detection: number;
            style_consistency: number;
            originality: number;
        };
        code_insights: {
            strengths: string[];
            weaknesses: string[];
            recommendations: string[];
        };
    } | null;
    created_at: string;
    completed_at: string | null;
}
