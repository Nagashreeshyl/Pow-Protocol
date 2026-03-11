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
        authenticity: {
            human: number;
            evidence: string[];
            // Backward compatibility
            human_percent?: number;
            reasoning?: string;
        };
        bugs: {
            file: string;
            line: number;
            desc: string;
            commit: string;
            // Backward compatibility
            count?: number;
            summary?: string;
            details?: any[];
        } | any;
        language: {
            primary: string;
            confidence: number;
            deps: string[];
        };
        deploy: {
            status: string;
            duration: string;
            errors: number;
        };
        professionalism: {
            score: number;
            prettier: number;
            indent_consistent: boolean;
            // Backward compatibility
            details?: string;
            syntax?: number;
            indentation?: number;
            spacing?: number;
            structure?: number;
        };
        credentials: {
            type: string;
            file: string;
            line: number;
            // Backward compatibility
            count?: number;
            details?: string[];
        } | any;
        impact: {
            score: number;
            metrics: {
                stars: number;
                forks: number;
                deployments: number;
                contributors: number;
            };
        };
        skills: string[];
        architecture: string;
        legacy_data: {
            total_commits: number;
            files_analyzed: number;
            lines_of_code: number;
        };
        // Legacy UI slots
        total_commits?: number;
        contributors?: number;
        files_analyzed?: number;
        lines_of_code?: number;
        code_insights?: {
            strengths: string[];
            weaknesses: string[];
            recommendations: string[];
        };
        authenticity_details?: {
            score: number;
            details: string;
            commit_regularity: number;
            ai_detection: number;
            style_consistency: number;
            originality: number;
        };
        build_status?: {
            status: string;
            errors: any[];
        };
        timeline?: {
            type: 'commit' | 'pr' | 'action';
            label: string;
            date: string;
            message?: string;
        }[];
    } | any;
    created_at: string;
    completed_at: string | null;
}
