import Groq from 'groq-sdk';

function getGroqClient() {
    return new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
}

export interface CodeAnalysisResult {
    overall_score: number;
    scalability: {
        score: number;
        details: string;
    };
    security: {
        score: number;
        details: string;
    };
    code_quality: {
        score: number;
        details: string;
    };
    best_practices: {
        score: number;
        details: string;
    };
    architecture: {
        score: number;
        details: string;
    };
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    summary: string;
}

export async function analyzeCode(
    repoName: string,
    languages: Record<string, number>,
    fileContents: { path: string; content: string }[],
    projectType: string
): Promise<CodeAnalysisResult> {
    const groq = getGroqClient();

    const languagesSummary = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, bytes]) => `${lang}: ${bytes} bytes`)
        .join(', ');

    const codeContext = fileContents
        .map((f) => `--- File: ${f.path} ---\n${f.content.slice(0, 3000)}`)
        .join('\n\n');

    const prompt = `Provide a deep technical audit of this repository. This project could use ANY technology stack (Web, Mobile, AI, Systems, etc.). Evaluate the code through the lens of a Senior Architect. 

Specific instructions:
1. Identify the core technology stack and architecture patterns used.
2. Look for specific implementation details, trade-offs, and flaws relevant to that specific stack.
3. Be exceptionally specific - move beyond generic praise or criticism. 
4. Evaluate:
   - Scalability: How well does this handle load/growth in its specific domain?
   - Security: Domain-specific vulnerabilities (Web, Smart Contracts, Native, etc.).
   - Code Quality: Maintainability, documentation, and testing approach.
   - Best Practices: Adherence to modern conventions for the identified stack.
   - Architecture: Separation of concerns and structural integrity.

Be fair but thorough. Score realistically. A 90+ score should be reserved for truly exceptional, production-grade code.`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    try {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as CodeAnalysisResult;
            // Clamp scores between 0-100
            parsed.overall_score = Math.min(100, Math.max(0, parsed.overall_score));
            parsed.scalability.score = Math.min(100, Math.max(0, parsed.scalability.score));
            parsed.security.score = Math.min(100, Math.max(0, parsed.security.score));
            parsed.code_quality.score = Math.min(100, Math.max(0, parsed.code_quality.score));
            parsed.best_practices.score = Math.min(100, Math.max(0, parsed.best_practices.score));
            parsed.architecture.score = Math.min(100, Math.max(0, parsed.architecture.score));
            return parsed;
        }
    } catch (e) {
        console.error('Failed to parse AI response:', e);
    }

    // Fallback response if parsing fails
    return {
        overall_score: 65,
        scalability: { score: 60, details: 'Analysis could not be fully parsed.' },
        security: { score: 60, details: 'Analysis could not be fully parsed.' },
        code_quality: { score: 65, details: 'Analysis could not be fully parsed.' },
        best_practices: { score: 65, details: 'Analysis could not be fully parsed.' },
        architecture: { score: 65, details: 'Analysis could not be fully parsed.' },
        strengths: ['Code structure present', 'Project runs'],
        weaknesses: ['Full analysis unavailable'],
        recommendations: ['Retry analysis for detailed insights'],
        summary: 'Partial analysis completed. The code appears functional but detailed insights require re-analysis.',
    };
}
