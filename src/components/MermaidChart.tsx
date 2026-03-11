"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [renderError, setRenderError] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });

        // Unique ID for mermaid to target
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        ref.current.id = id;

        // Try to heavily sanitize/clean LLM output
        let cleanChart = chart.replace(/```mermaid/gi, '').replace(/```/g, '').trim();

        mermaid.render(id + '-svg', cleanChart).then((result) => {
            if (ref.current) {
                ref.current.innerHTML = result.svg;
                setRenderError(false);
            }
        }).catch((err) => {
            console.error("Mermaid Render Error:", err);
            setRenderError(true);
            // Must clear the DOM node when render fails or mermaid gets stuck
            if (ref.current) ref.current.innerHTML = `<div class="text-red-500 font-mono text-xs">Failed to render diagram structure.</div>`;
        });

    }, [chart]);

    if (renderError) {
        return (
            <div className="bg-black/20 p-4 rounded-lg border border-red-500/20 text-red-400 font-mono text-sm whitespace-pre-wrap">
                {chart}
            </div>
        );
    }

    return <div ref={ref} className="overflow-x-auto flex justify-center w-full min-h-[150px]" />;
}
