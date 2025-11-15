import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement } from "chart.js";


ChartJS.register(ArcElement);

export default function FeedbackGaugeChart({ feedback }) { 

    const avg = Number(feedback?.averageRating ?? 0);
    const total = Number(feedback?.totalRatings ?? feedback?.feedbacks?.length ?? 0); 
    const pct = Math.max(0, Math.min(100, (avg / 5) * 100));
    const remaining = 100 - pct;

    const data = {
        datasets: [
            {
                data: [pct, remaining],
                backgroundColor: ["rgba(250,204,21,0.95)", "rgba(229,231,235,0.8)"],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
                cutout: "75%",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
    };

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 360,
                margin: "0 auto",
                height: 220,
                position: "relative",
            }}
        >
            <Doughnut data={data} options={options} />
            <div
                style={{
                    position: "absolute",
                    top: "55%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                }}
            >
                <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#f59e0b" }}>
                    {avg.toFixed(3)}
                </div>
            </div>
        </div>
    );
}
