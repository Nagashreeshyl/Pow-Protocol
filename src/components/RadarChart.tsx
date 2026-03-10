"use client";

import React from "react";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface RadarChartProps {
    scores: {
        performance: number;
        scalability: number;
        security: number;
        code_quality: number;
        authenticity: number;
    };
}

export default function RadarChart({ scores }: RadarChartProps) {
    const data = {
        labels: [
            "PERFORMANCE",
            "SCALABILITY",
            "SECURITY",
            "CODE_QUALITY",
            "AUTHENTICITY",
        ],
        datasets: [
            {
                label: "VERIFICATION_VECTOR",
                data: [
                    scores.performance,
                    scores.scalability,
                    scores.security,
                    scores.code_quality,
                    scores.authenticity,
                ],
                backgroundColor: "rgba(102, 126, 234, 0.15)", // Acccent color with low opacity
                borderColor: "#667EEA", // Accent color
                borderWidth: 3,
                pointBackgroundColor: "#667EEA",
                pointBorderColor: "#E2E8F0",
                pointHoverBackgroundColor: "#FFFFFF",
                pointHoverBorderColor: "#667EEA",
                pointRadius: 4,
                showLine: true,
            },
        ],
    };

    const options = {
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: "rgba(148, 163, 184, 0.2)",
                    lineWidth: 1,
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.2)",
                    lineWidth: 1,
                },
                pointLabels: {
                    color: "#64748B",
                    font: {
                        family: "'Plus Jakarta Sans', sans-serif",
                        size: 9,
                        weight: "bold" as const,
                    },
                    padding: 15,
                },
                ticks: {
                    display: false,
                    maxTicksLimit: 5,
                },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#E2E8F0",
                titleColor: "#1E293B",
                bodyColor: "#1E293B",
                titleFont: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    size: 12,
                    weight: "bold" as const,
                },
                bodyFont: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    size: 12,
                },
                cornerRadius: 12,
                padding: 12,
                borderColor: "rgba(255,255,255,0.4)",
                borderWidth: 1,
                displayColors: false,
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="w-full h-full p-8 flex items-center justify-center relative">
            <div className="w-full h-full relative z-10">
                <Radar data={data} options={options as any} />
            </div>

            {/* Decorative Details */}
            <div className="absolute top-6 left-6 text-[10px] font-bold text-nm-muted/40 uppercase tracking-widest">
                Vector_Analysis_v2.0
            </div>
            <div className="absolute bottom-6 right-6 text-[10px] font-bold text-nm-muted/40 uppercase tracking-widest">
                Multi_Dimensional_Scan
            </div>
        </div>
    );
}
